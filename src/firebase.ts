import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDoc,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

import { getScoreAttackWeekKey } from './utils/scoreAttackCycle';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app must specify the custom databaseId from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

// Connection test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'score_attack_scores', 'test_ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline, will retry when network is available.');
    }
    return false;
  }
}

export interface OnlineLeaderboardEntry {
  userId: string;
  playerName: string;
  title: string;
  score: number;
  timeLimit?: number; // 設定時間 (秒)
  allTimeScore?: number; // 歴代最高スコア
  allTimeLimit?: number; // 歴代最高スコア時の設定時間
  team?: string[];
  weekKey?: string;
  updatedAt: string;
  isPlayer?: boolean;
}

// Get or create unique player ID
export function getPlayerUserId(): string {
  const STORAGE_KEY = 'punipuni_player_uid';
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    uid = 'player_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
}

// Get or set Player display name
export function getPlayerDisplayName(): string {
  const STORAGE_KEY = 'punipuni_player_name';
  let name = localStorage.getItem(STORAGE_KEY);
  if (!name) {
    name = 'ぷにマスター' + Math.floor(100 + Math.random() * 900);
    localStorage.setItem(STORAGE_KEY, name);
  }
  return name;
}

export function setPlayerDisplayName(name: string): void {
  const cleanName = name.trim().slice(0, 30) || 'ぷにマスター';
  localStorage.setItem('punipuni_player_name', cleanName);
}

// Save score to Firestore with weekly key and custom time limit
export async function saveScoreAttackToFirebase(
  score: number,
  title: string,
  team: string[],
  timeLimit: number = 60,
  allTimeScore?: number,
  allTimeLimit?: number
): Promise<boolean> {
  const userId = getPlayerUserId();
  const rawPlayerName = getPlayerDisplayName();
  const playerName = (rawPlayerName && rawPlayerName.trim().length > 0 ? rawPlayerName.trim() : 'ぷにマスター').slice(0, 50);
  const cleanTitle = (title && title.trim().length > 0 ? title.trim() : '新米妖怪レーサー').slice(0, 50);
  const safeTeam = Array.isArray(team) ? team.slice(0, 5) : [];
  const safeScore = Math.max(0, Math.floor(score || 0));
  const weekKey = getScoreAttackWeekKey();
  const path = `score_attack_scores/${userId}`;

  try {
    const docRef = doc(db, 'score_attack_scores', userId);
    
    // 既存のFirebaseデータを確認し、過去の歴代最高スコアを下回って上書きしないよう保護
    let calculatedAllTimeScore = Math.max(0, Math.floor(allTimeScore || safeScore));
    let calculatedAllTimeLimit = Math.max(1, Math.min(3600, Math.floor(allTimeLimit || timeLimit || 60)));
    try {
      const existingSnap = await getDoc(docRef);
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        const existingAllTime = typeof existingData.allTimeScore === 'number' ? existingData.allTimeScore : (typeof existingData.score === 'number' ? existingData.score : 0);
        if (existingAllTime > calculatedAllTimeScore) {
          calculatedAllTimeScore = existingAllTime;
          if (typeof existingData.allTimeLimit === 'number' && existingData.allTimeLimit > 0) {
            calculatedAllTimeLimit = existingData.allTimeLimit;
          }
        }
      }
    } catch {
      // 既存データの読み取り失敗時は計算値を使用
    }

    const docData: Record<string, unknown> = {
      userId,
      playerName,
      title: cleanTitle,
      score: safeScore,
      timeLimit: Math.max(1, Math.min(3600, Math.floor(timeLimit || 60))),
      team: safeTeam,
      weekKey,
      updatedAt: new Date().toISOString()
    };
    if (calculatedAllTimeScore > 0) {
      docData.allTimeScore = calculatedAllTimeScore;
      docData.allTimeLimit = calculatedAllTimeLimit;
    }

    await setDoc(docRef, docData, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// 自分のスコアタ記録（今週スコア & 歴代最高スコア）をFirebaseから直接取得
export async function fetchMyScoreAttackRecord(targetUserId?: string): Promise<OnlineLeaderboardEntry | null> {
  const actualUserId = (!targetUserId || targetUserId === 'local_user') ? getPlayerUserId() : targetUserId;
  const path = `score_attack_scores/${actualUserId}`;
  const currentWeekKey = getScoreAttackWeekKey();
  const currentDisplayName = getPlayerDisplayName();

  try {
    const docRef = doc(db, 'score_attack_scores', actualUserId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data) {
        const rawScore = typeof data.score === 'number' ? data.score : 0;
        const rawAllTime = typeof data.allTimeScore === 'number' ? data.allTimeScore : rawScore;
        const rawTime = typeof data.timeLimit === 'number' ? data.timeLimit : 60;
        const rawAllTimeLimit = typeof data.allTimeLimit === 'number' ? data.allTimeLimit : rawTime;

        return {
          userId: data.userId || actualUserId,
          playerName: data.playerName || currentDisplayName,
          title: data.title || '新米妖怪レーサー',
          score: data.weekKey === currentWeekKey ? rawScore : 0,
          timeLimit: rawTime,
          allTimeScore: Math.max(rawAllTime, rawScore),
          allTimeLimit: rawAllTimeLimit,
          team: Array.isArray(data.team) ? data.team : [],
          weekKey: data.weekKey || currentWeekKey,
          updatedAt: data.updatedAt || '',
          isPlayer: true
        };
      }
    }

    // フォールバック: 全体レコードからプレイヤー名一致またはUID一致の最高記録を探す
    try {
      const q = query(collection(db, 'score_attack_scores'), limit(200));
      const snap = await getDocs(q);
      let bestFound: OnlineLeaderboardEntry | null = null;
      snap.forEach((d) => {
        const item = d.data();
        if (item && (item.userId === actualUserId || (currentDisplayName && item.playerName === currentDisplayName))) {
          const rawScore = typeof item.score === 'number' ? item.score : 0;
          const rawAllTime = typeof item.allTimeScore === 'number' ? item.allTimeScore : rawScore;
          const allTimeMax = Math.max(rawAllTime, rawScore);
          if (!bestFound || allTimeMax > (bestFound.allTimeScore || 0)) {
            bestFound = {
              userId: item.userId || d.id,
              playerName: item.playerName || currentDisplayName,
              title: item.title || '新米妖怪レーサー',
              score: item.weekKey === currentWeekKey ? rawScore : 0,
              timeLimit: typeof item.timeLimit === 'number' ? item.timeLimit : 60,
              allTimeScore: allTimeMax,
              allTimeLimit: typeof item.allTimeLimit === 'number' ? item.allTimeLimit : 60,
              team: Array.isArray(item.team) ? item.team : [],
              weekKey: item.weekKey || currentWeekKey,
              updatedAt: item.updatedAt || '',
              isPlayer: true
            };
          }
        }
      });
      if (bestFound) return bestFound;
    } catch {
      // quiet fallback
    }

    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// 自分のスコアタ記録をリアルタイム監視
export function subscribeToMyScoreAttackRecord(
  onUpdate: (entry: OnlineLeaderboardEntry | null) => void,
  targetUserId?: string
): () => void {
  const actualUserId = (!targetUserId || targetUserId === 'local_user') ? getPlayerUserId() : targetUserId;
  const path = `score_attack_scores/${actualUserId}`;
  const currentWeekKey = getScoreAttackWeekKey();
  const currentDisplayName = getPlayerDisplayName();

  try {
    const docRef = doc(db, 'score_attack_scores', actualUserId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        onUpdate(null);
        return;
      }
      const data = docSnap.data();
      if (!data) {
        onUpdate(null);
        return;
      }
      const rawScore = typeof data.score === 'number' ? data.score : 0;
      const rawAllTime = typeof data.allTimeScore === 'number' ? data.allTimeScore : rawScore;
      const rawTime = typeof data.timeLimit === 'number' ? data.timeLimit : 60;
      const rawAllTimeLimit = typeof data.allTimeLimit === 'number' ? data.allTimeLimit : rawTime;

      onUpdate({
        userId: data.userId || actualUserId,
        playerName: data.playerName || currentDisplayName,
        title: data.title || '新米妖怪レーサー',
        score: data.weekKey === currentWeekKey ? rawScore : 0,
        timeLimit: rawTime,
        allTimeScore: Math.max(rawAllTime, rawScore),
        allTimeLimit: rawAllTimeLimit,
        team: Array.isArray(data.team) ? data.team : [],
        weekKey: data.weekKey || currentWeekKey,
        updatedAt: data.updatedAt || '',
        isPlayer: true
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return () => {};
  }
}

// Reset player score in Firestore when Sunday 23:59 arrives
export async function resetPlayerScoreAttackInFirebase(): Promise<boolean> {
  const userId = getPlayerUserId();
  const playerName = getPlayerDisplayName();
  const weekKey = getScoreAttackWeekKey();
  const path = `score_attack_scores/${userId}`;

  try {
    const docRef = doc(db, 'score_attack_scores', userId);
    await setDoc(docRef, {
      userId,
      playerName,
      score: 0,
      weekKey,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

// Real-time listener for leaderboard
export function subscribeToOnlineLeaderboard(
  onUpdate: (entries: OnlineLeaderboardEntry[]) => void
): () => void {
  const path = 'score_attack_scores';
  const currentWeekKey = getScoreAttackWeekKey();

  try {
    // 全プレイヤー（最大200件）を監視し、今週スコア・歴代最高スコアの両方を含むリーダーボードを構築
    const q = query(
      collection(db, path),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const myUid = getPlayerUserId();
        const entries: OnlineLeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data) {
            const rawScore = typeof data.score === 'number' ? data.score : 0;
            const rawAllTime = typeof data.allTimeScore === 'number' ? data.allTimeScore : rawScore;
            if (rawScore > 0 || rawAllTime > 0) {
              const rawTime = typeof data.timeLimit === 'number' ? data.timeLimit : 60;
              const rawAllTimeLimit = typeof data.allTimeLimit === 'number' ? data.allTimeLimit : rawTime;
              entries.push({
                userId: data.userId || docSnap.id,
                playerName: data.playerName || '名無しのぷに使い',
                title: data.title || '一般妖怪',
                score: data.weekKey === currentWeekKey ? rawScore : 0,
                timeLimit: rawTime,
                allTimeScore: Math.max(rawAllTime, rawScore),
                allTimeLimit: rawAllTimeLimit,
                team: Array.isArray(data.team) ? data.team : [],
                weekKey: data.weekKey || currentWeekKey,
                updatedAt: data.updatedAt || '',
                isPlayer: (data.userId || docSnap.id) === myUid
              });
            }
          }
        });
        onUpdate(entries);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// One-time fetch of leaderboard
export async function fetchOnlineLeaderboard(): Promise<OnlineLeaderboardEntry[]> {
  const path = 'score_attack_scores';
  const currentWeekKey = getScoreAttackWeekKey();

  try {
    const q = query(
      collection(db, path),
      limit(200)
    );
    const snap = await getDocs(q);
    const myUid = getPlayerUserId();
    const entries: OnlineLeaderboardEntry[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data) {
        const rawScore = typeof data.score === 'number' ? data.score : 0;
        const rawAllTime = typeof data.allTimeScore === 'number' ? data.allTimeScore : rawScore;
        if (rawScore > 0 || rawAllTime > 0) {
          const rawTime = typeof data.timeLimit === 'number' ? data.timeLimit : 60;
          const rawAllTimeLimit = typeof data.allTimeLimit === 'number' ? data.allTimeLimit : rawTime;
          entries.push({
            userId: data.userId || docSnap.id,
            playerName: data.playerName || '名無しのぷに使い',
            title: data.title || '一般妖怪',
            score: data.weekKey === currentWeekKey ? rawScore : 0,
            timeLimit: rawTime,
            allTimeScore: Math.max(rawAllTime, rawScore),
            allTimeLimit: rawAllTimeLimit,
            team: Array.isArray(data.team) ? data.team : [],
            weekKey: data.weekKey || currentWeekKey,
            updatedAt: data.updatedAt || '',
            isPlayer: (data.userId || docSnap.id) === myUid
          });
        }
      }
    });
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// 🗼 無限の試練の塔 オンラインリーダーボード
// ─────────────────────────────────────────────────────────────
export type OnlineTowerRecord = {
  userId: string;
  playerName: string;
  title: string;
  floor: number;
  team?: string[];
  artifactsCount?: number;
  updatedAt: string;
  isPlayer?: boolean;
};

export type TowerLeaderboardEntry = OnlineTowerRecord;

export async function saveTowerRecordToFirebase(
  floor: number,
  title: string,
  team: string[],
  artifactsCount: number = 0
): Promise<boolean> {
  const userId = getPlayerUserId();
  const rawPlayerName = getPlayerDisplayName();
  const playerName = (rawPlayerName && rawPlayerName.trim().length > 0 ? rawPlayerName.trim() : 'ぷにマスター').slice(0, 50);
  const cleanTitle = (title && title.trim().length > 0 ? title.trim() : '新米妖怪レーサー').slice(0, 50);
  const safeFloor = Math.max(0, Math.min(100000, Math.floor(floor || 0)));
  const safeTeam = Array.isArray(team) ? team.slice(0, 5) : [];
  const safeArtifactsCount = Math.max(0, Math.floor(artifactsCount || 0));
  const path = `tower_records/${userId}`;

  try {
    const docRef = doc(db, 'tower_records', userId);
    await setDoc(docRef, {
      userId,
      playerName,
      title: cleanTitle,
      floor: safeFloor,
      team: safeTeam,
      artifactsCount: safeArtifactsCount,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export function subscribeToTowerLeaderboard(
  onUpdate: (entries: OnlineTowerRecord[]) => void
): () => void {
  const path = 'tower_records';
  try {
    const q = query(
      collection(db, path),
      orderBy('floor', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const myUid = getPlayerUserId();
        const records: OnlineTowerRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.floor === 'number' && data.floor > 0) {
            records.push({
              userId: data.userId || docSnap.id,
              playerName: data.playerName || '名無しのぷに使い',
              title: data.title || '一般妖怪',
              floor: data.floor,
              team: data.team || [],
              artifactsCount: data.artifactsCount || 0,
              updatedAt: data.updatedAt || '',
              isPlayer: (data.userId || docSnap.id) === myUid
            });
          }
        });
        onUpdate(records);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// ─────────────────────────────────────────────────────────────
// ⏱️ 最速討伐スピードラン オンラインリーダーボード
// ─────────────────────────────────────────────────────────────
export type OnlineSpeedrunRecord = {
  id?: string;
  userId: string;
  courseId: string;
  playerName: string;
  title: string;
  timeMs: number;
  team?: string[];
  updatedAt: string;
  isPlayer?: boolean;
};

export type SpeedrunLeaderboardEntry = OnlineSpeedrunRecord;

export async function saveSpeedrunRecordToFirebase(
  courseId: string,
  timeMs: number,
  title: string,
  team: string[]
): Promise<boolean> {
  const userId = getPlayerUserId();
  const rawPlayerName = getPlayerDisplayName();
  const playerName = (rawPlayerName && rawPlayerName.trim().length > 0 ? rawPlayerName.trim() : 'ぷにマスター').slice(0, 50);
  const cleanTitle = (title && title.trim().length > 0 ? title.trim() : '新米妖怪レーサー').slice(0, 50);
  const safeTimeMs = Math.max(1, Math.floor(timeMs || 0));
  const safeTeam = Array.isArray(team) ? team.slice(0, 5) : [];
  const cleanCourseId = (courseId || 'course_1').slice(0, 64);
  const docId = `${cleanCourseId}_${userId}`;
  const path = `speedrun_records/${docId}`;

  try {
    const docRef = doc(db, 'speedrun_records', docId);
    await setDoc(docRef, {
      userId,
      courseId: cleanCourseId,
      playerName,
      title: cleanTitle,
      timeMs: safeTimeMs,
      team: safeTeam,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

export function subscribeToSpeedrunLeaderboard(
  courseId: string,
  onUpdate: (entries: OnlineSpeedrunRecord[]) => void
): () => void {
  const path = 'speedrun_records';
  try {
    const q = query(
      collection(db, path),
      orderBy('timeMs', 'asc'),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const myUid = getPlayerUserId();
        const records: OnlineSpeedrunRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && typeof data.timeMs === 'number' && data.timeMs > 0 && data.courseId === courseId) {
            records.push({
              id: docSnap.id,
              userId: data.userId || docSnap.id,
              courseId: data.courseId,
              playerName: data.playerName || '名無しのぷに使い',
              title: data.title || '一般妖怪',
              timeMs: data.timeMs,
              team: data.team || [],
              updatedAt: data.updatedAt || '',
              isPlayer: data.userId === myUid
            });
          }
        });
        records.sort((a, b) => a.timeMs - b.timeMs);
        onUpdate(records.slice(0, 100));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}
