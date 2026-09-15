import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAndGetData, savePlayerData, saveToLocalStorageDirectly } from '../storage';
import { CHARACTERS, getCharacterMaxLevel, migrateCharId } from '../data/characters';
import type { Rank, Character } from '../data/characters';
import { CURRENT_EVENTS } from '../data/events';
import { STAGES, EVENT_SNOW_STAGES } from '../data/stages';
import { decodeSerialCode } from '../utils/serialCode';
import type { PlayerData } from '../storage';
import { DAILY_MISSIONS_POOL, getTodayDailyMissions } from '../data/dailyMissions';
import { saveScoreAttackToFirebase, resetPlayerScoreAttackInFirebase, saveTowerRecordToFirebase, saveSpeedrunRecordToFirebase, fetchMyScoreAttackRecord } from '../firebase';
import { getScoreAttackWeekKey } from '../utils/scoreAttackCycle';
import { TOWER_MILESTONES } from '../data/towerData';
import { SPEEDRUN_COURSES, getSpeedrunRank } from '../data/speedrunData';
import { GATE_ROOM_TYPES, GATE_LEVEL_REWARDS, getGateRoomTotalWaves } from '../data/gateData';
import { RAID_BOSSES } from '../data/raidData';



export const getWeeklyRewardWeekKey = (): string => {
  const d = new Date();
  const day = d.getDay(); // 0 = Sunday
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, '0');
  const date = String(sunday.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

export const computeUnlockedTitles = (playerData: PlayerData): string[] => {
  const currentUnlocked = new Set<string>(playerData.unlockedTitles || ['新米妖怪レーサー']);
  const ownedCharList = CHARACTERS.filter(c => playerData.characters?.[c.id]);
  const ownedCharCount = ownedCharList.length;
  const clearedStages = playerData.clearedStages || [];
  const items = playerData.items || { expSmall: 0, expLarge: 0, skillBook: 0, godSkillBook: 0, superLimitBreakBook: 0 };
  const yPoints = playerData.yPoints || 0;

  currentUnlocked.add('新米妖怪レーサー');

  if (clearedStages.includes('st_1')) currentUnlocked.add('ぷにぷに駆け出し');
  if (clearedStages.includes('st_5')) currentUnlocked.add('さくらニュータウンの英雄');
  if (clearedStages.some(s => s.startsWith('event_'))) currentUnlocked.add('サマービーチの思い出');
  if (clearedStages.includes('event_st_5')) currentUnlocked.add('常夏の支配者');

  if (yPoints >= 1000) currentUnlocked.add('貯金家');
  if (yPoints >= 50000) currentUnlocked.add('Yポイント大富豪');
  if (Object.values(playerData.characters || {}).some(c => (c?.limitBreak || 0) > 0)) currentUnlocked.add('限界を超えし者');
  if (Object.values(playerData.characters || {}).some(c => (c?.skillLevel || 0) >= 7)) currentUnlocked.add('ひっさつ極めし者');
  if (Object.values(playerData.characters || {}).some(c => (c?.level || 0) >= 50)) currentUnlocked.add('覚醒の刻');
  if ((items.skillBook || 0) >= 3 || (items.godSkillBook || 0) >= 1) currentUnlocked.add('秘伝書マニア');

  if ((playerData.gachaHistory?.length || 0) >= 30) currentUnlocked.add('ラッキーガチャマン');
  if (ownedCharList.some(c => c.rank === 'Z' || c.rank === 'SSS')) currentUnlocked.add('虹カプセルの奇跡');
  if (ownedCharCount >= 20) currentUnlocked.add('妖怪大百科の完成者');

  const tribeCounts: Record<string, number> = {};
  ownedCharList.forEach(c => {
    tribeCounts[c.tribe] = (tribeCounts[c.tribe] || 0) + 1;
  });
  if ((tribeCounts['イサマシ'] || 0) >= 3) currentUnlocked.add('勇猛なる獅子');
  if ((tribeCounts['フシギ'] || 0) >= 3) currentUnlocked.add('知恵の探求者');
  if ((tribeCounts['ゴウケツ'] || 0) >= 3) currentUnlocked.add('金剛の盾');
  if ((tribeCounts['プリチー'] || 0) >= 3) currentUnlocked.add('キュートなアイドル');
  if ((tribeCounts['ポカポカ'] || 0) >= 3) currentUnlocked.add('太陽の祝福');
  if ((tribeCounts['ウスラカゲ'] || 0) >= 3) currentUnlocked.add('宵闇の支配者');
  if ((tribeCounts['ブキミー'] || 0) >= 3) currentUnlocked.add('怪異の怪導');
  if ((tribeCounts['ニョロロン'] || 0) >= 3) currentUnlocked.add('流天の龍神');
  if ((tribeCounts['エンマ'] || 0) >= 1) currentUnlocked.add('エンマ親衛隊');
  if (ownedCharList.some(c => c.id === 'char_z_2' || c.name.includes('ハグキ'))) currentUnlocked.add('ハグキ党名誉党員');
  if (ownedCharList.filter(c => c.name.includes('ジバニャン')).length >= 2) currentUnlocked.add('ジバニャン親衛隊');

  if ((playerData.scoreAttackHighScore || 0) >= 5000000) currentUnlocked.add('スコアタ王者');
  if ((playerData.scoreAttackHighScore || 0) >= 5000000000000000 || playerData.unlockedTitles?.includes('神覇者')) currentUnlocked.add('神覇者');

  const missionProg = playerData.missionProgress || {};
  if ((missionProg['m_fever_1'] || 0) >= 1 || (missionProg['m_fever_2'] || 0) >= 5) currentUnlocked.add('でかぷに職人');
  if ((missionProg['m_deka_1'] || 0) >= 10) currentUnlocked.add('ぷにぷにマスター');
  if ((missionProg['m_fever_2'] || 0) >= 5) currentUnlocked.add('フィーバーロード');
  if ((missionProg['m_fever_2'] || 0) >= 1 || (missionProg['m_deka_1'] || 0) >= 1) currentUnlocked.add('連鎖の鬼');
  if (clearedStages.length >= 10) currentUnlocked.add('百戦錬磨の勇士');

  // --- コラボ・神昇・UZ解禁条件 ---
  if (ownedCharList.some(c => c.id === 'char_uz_god_supreme')) {
    currentUnlocked.add('【UZ+++降臨】神創絶神・天照極エンマ王');
  }
  if (ownedCharList.some(c => c.rank === 'ZZ')) {
    currentUnlocked.add('神昇せし超越者');
  }
  if (ownedCharList.some(c => c.id?.startsWith('char_bleach_'))) {
    currentUnlocked.add('死神代行');
  }
  if (ownedCharList.some(c => c.id === 'char_bleach_ichigo_bankai')) {
    currentUnlocked.add('卍解の極致');
  }
  if (ownedCharList.some(c => c.id === 'char_bleach_aizen')) {
    currentUnlocked.add('虚圏の統括者');
  }
  if (ownedCharList.some(c => c.id === 'char_bleach_aizen_hogyoku' || c.id === 'char_bleach_aizen_transcended')) {
    currentUnlocked.add('崩玉との融合');
  }
  if (ownedCharList.some(c => c.id === 'char_bleach_yamamoto')) {
    currentUnlocked.add('護廷十三隊総隊長');
  }

  if (currentUnlocked.size >= 15) currentUnlocked.add('ぷにぷに神');

  // --- 超難関LEGEND称号解禁条件 ---
  if ((playerData.scoreAttackHighScore || 0) >= 1000000000000000000 || playerData.unlockedTitles?.includes('百京神話の創世神')) currentUnlocked.add('百京神話の創世神');
  if ((playerData.scoreAttackHighScore || 0) >= 100000000) currentUnlocked.add('一億突破の絶対神');
  if (yPoints >= 100000) currentUnlocked.add('Ypt兆万長者');
  if ((playerData.gachaHistory?.length || 0) >= 100) currentUnlocked.add('神引きの覇王');
  if (clearedStages.length >= 10 && clearedStages.some(s => s.startsWith('ura_'))) currentUnlocked.add('全界の超征服者');
  if (Object.values(playerData.characters || {}).some(c => (c?.limitBreak || 0) >= 3)) currentUnlocked.add('限界突破の極意');
  if ((items.godSkillBook || 0) >= 2 && (items.superLimitBreakBook || 0) >= 2) currentUnlocked.add('神技の体得者');
  if (ownedCharList.filter(c => c.rank === 'Z').length >= 2) currentUnlocked.add('Zランク絶神軍団');
  if ((missionProg['m_fever_2'] || 0) >= 25) currentUnlocked.add('神速の千連鎖');
  if ((missionProg['m_fever_2'] || 0) >= 100) currentUnlocked.add('永劫のフィーバー');

  // --- 塔＆タイムアタック称号解禁 ---
  if ((playerData.towerHighestFloor || 0) >= 20) currentUnlocked.add('塔の覇王');
  if ((playerData.towerHighestFloor || 0) >= 30) currentUnlocked.add('試練を統べし者');
  if ((playerData.towerHighestFloor || 0) >= 50) currentUnlocked.add('無限の超越神');
  if ((playerData.towerHighestFloor || 0) >= 100) currentUnlocked.add('百界の制覇神');
  if (playerData.speedrunRecords?.['speedrun_novice']) currentUnlocked.add('疾風の抜刀手');
  if (playerData.speedrunRecords?.['speedrun_expert']) currentUnlocked.add('音速の撃墜神');
  if (playerData.speedrunRecords?.['speedrun_master']) currentUnlocked.add('光速の神罰');
  if (playerData.speedrunRecords?.['speedrun_god']) currentUnlocked.add('時空の支配者');

  if (currentUnlocked.size >= 25) currentUnlocked.add('ぷにぷに界の創造主');

  return Array.from(currentUnlocked);
};

export interface StageDropReward {
  expSmallCount: number;
  expLargeCount: number;
  skillBookCount: number;
  bleachRingCount?: number;
  godAscensionStoneCount?: number; // 虚圏高難度ボス初クリア報酬
  droppedCharacter?: {
    id: string;
    name: string;
    rank: string;
    emoji: string;
    isNew: boolean;
  };
}

export interface BleachShopItem {
  id: string;
  name: string;
  icon: string;
  cost: number;
  limit: number;
  description: string;
}

export const BLEACH_SHOP_ITEMS: BleachShopItem[] = [
  {
    id: 'godAscensionStone',
    name: '神昇の秘石',
    icon: '💎',
    cost: 500,
    limit: 5,
    description: "ブリーチリング500個で『神昇の秘石』1個と交換できる至高の秘石。"
  },
  {
    id: 'superLimitBreakBook',
    name: '超限界突破の書',
    icon: '📕',
    cost: 40,
    limit: 5,
    description: 'キャラクターの限界突破段階を+1アップさせる貴重な指南書。'
  },
  {
    id: 'godSkillBook',
    name: '神・ひっさつの秘伝書',
    icon: '📖',
    cost: 25,
    limit: 10,
    description: 'キャラクターの必殺技レベルを一気にMAXまで強化する神代の書。'
  },
  {
    id: 'skillBook',
    name: 'ひっさつの秘伝書',
    icon: '📜',
    cost: 10,
    limit: 20,
    description: 'キャラクターの必殺技レベルを+1強化する秘伝書。'
  },
  {
    id: 'expLarge',
    name: '超けいけんちだま (5個)',
    icon: '🍡',
    cost: 5,
    limit: 999,
    description: '経験値を大量に獲得できる超けいけんちだまの5個セット。'
  },
  {
    id: 'money_100k',
    name: 'マネー 100,000',
    icon: '💰',
    cost: 5,
    limit: 999,
    description: '妖怪ぷにの育成やレベル上限解放に使えるマネー100,000。'
  },
  {
    id: 'ypoints_3k',
    name: 'Yポイント 3,000 pt',
    icon: '🌟',
    cost: 15,
    limit: 999,
    description: 'ガシャや各種解放に使えるYポイント3,000pt。'
  }
];

interface GameState extends PlayerData {
  uid: string | null;
  loading: boolean;
  addMoney: (amount: number) => void;
  addYPoints: (amount: number) => void;
  setMoney: (amount: number) => void;
  setYPoints: (amount: number) => void;
  addBleachRings: (amount: number) => void;
  unlockCharacter: (charId: string) => void;
  unlockKDeveloper: () => void;
  unlockAllCharacters: () => void;
  unlockAllStages: () => void;
  unlockEventStages: () => void;
  addMaxItems: () => void;
  addItem: (itemId: string, count: number) => void;
  upgradeCharacter: (charId: string, moneyCost: number) => void;
  consumeExpItem: (charId: string, itemType: 'expSmall' | 'expLarge') => void;
  consumeSkillBook: (charId: string) => void;
  consumeGodSkillBook: (charId: string) => void;
  consumeSuperLimitBreakBook: (charId: string) => void;
  ascendToZZ: (baseCharId: string) => { success: boolean; message: string; targetCharId?: string; isNewUnlock?: boolean };
  setSelectedTitle: (titleName: string) => void;
  unlockTitle: (titleName: string) => void;
  acknowledgeTitle: (titleName: string) => void;
  setTeam: (newTeam: string[]) => void;
  setActiveTeamIndex: (index: number) => void;
  updateSavedTeamName: (index: number, name: string) => void;
  getTeamSlotAddCost: () => number;
  addTeamSlot: () => { success: boolean; message: string };
  unlockMinRequiredTeamSize: () => { success: boolean; message: string };
  clearStage: (stageId: string, moneyReward: number, yPointReward: number) => StageDropReward;
  trackMission: (type: string, amount?: number) => void;
  claimMission: (missionId: string) => void;
  trackDailyMission: (type: string, amount?: number) => void;
  claimDailyMission: (missionId: string) => void;
  submitScoreAttackScore: (score: number, timeLimit?: number) => { isNewHighScore: boolean; previousHighScore: number; unlockedUzGod?: boolean };
  setScoreAttackConfiguredTime: (seconds: number) => void;
  recordGachaResult: (charIds: string[], newPityCount: number, newStepUpCount: number) => void;
  redeemSerialCode: (code: string) => { success: boolean; message: string; rewardsSummary?: string };
  convertYPointsToBleachRings: (amount: number) => { success: boolean; message: string };
  exchangeBleachRing: (itemId: string) => { success: boolean; message: string };
  claimScoreMilestone: (milestoneReq: string) => { success: boolean; message: string };
  claimWeeklyReward: (weekKey: string) => void;
  advanceTowerFloor: (floor: number, newArtifactId?: string) => void;
  setTowerCurrentFloor: (floor: number) => void;
  claimTowerReward: (floor: number) => { success: boolean; message: string };
  claimAllTowerRewards: () => { success: boolean; message: string; count: number };
  submitSpeedrunTime: (courseId: string, timeMs: number) => { isNewBest: boolean; previousBestMs?: number; rank: string };
  // きまぐれゲート（Gate of Caprice）
  openGateRoom: (roomId: string) => void;
  completeGateWave: (roomId: string, wave: number, remainingHp: number) => {
    isRoomCleared: boolean;
    nextWave?: number;
    specialRoomAppeared?: 'boss' | 'reward' | null;
    specialRoomLevel?: number;
    specialAppearance?: { type: 'boss' | 'reward'; level: number };
    clearedRoomType?: 'normal' | 'boss' | 'reward';
    clearedLevel?: number;
    rewards?: { yPoints: number; money: number; bonusDrops?: { name: string; count: number; icon: string }[] };
  };
  consumeKampoItem: () => { success: boolean; message: string };
  useKampoItem?: () => { success: boolean; message: string };
  claimGateReward: (rewardKey: string | number) => { success: boolean; message: string; reward?: any };

  claimFriendKampo: (friendId: string) => { success: boolean; message: string };
  resetGateRoom: () => void;
  // 超大型レイドボス（Raid Boss）

  damageRaidBoss: (bossId: string, damage: number) => { currentHp: number; maxHp: number; isCleared: boolean; rewardYPoints: number; rewardItemName?: string; rewardItemCount?: number };
  syncScoreAttackWithFirebase: () => Promise<void>;
  exportRawPlayerData: () => PlayerData;
  importAllPlayerData: (importedData: Partial<PlayerData>) => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};

const DEFAULT_ITEMS = { expSmall: 3, expLarge: 1, skillBook: 0 };

// eslint-disable-next-line react-refresh/only-export-components
export const MIN_TEAM_SIZE_UNLOCK_COSTS: Record<number, number> = {
  4: 10000,  // 4体での出撃を許可 (5体必須 → 4体へ): 10,000 pt (1万)
  3: 20000,  // 3体での出撃を許可 (4体必須 → 3体へ): 20,000 pt (2万)
  2: 40000,  // 2体での出撃を許可 (3体必須 → 2体へ): 40,000 pt (4万)
  1: 80000,  // 1体での出撃を許可 (2体必須 → 1体へ): 80,000 pt (8万)
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PlayerData>({
    money: 0,
    yPoints: 0,
    characters: {},
    team: [],
    maxClearedStageId: '',
    clearedStages: [],
    items: DEFAULT_ITEMS,
    missionProgress: {},
    completedMissions: [],
    pityCount: 100,
    stepUpCount: 0,
    maxTeamSlots: 5,
    minRequiredTeamSize: 5,
    gachaHistory: [],
  });

  useEffect(() => {
    loginAndGetData((playerData, uid) => {
      if (playerData.bleachRings === undefined) playerData.bleachRings = 10;
      if (!playerData.clearedStages) playerData.clearedStages = [];
      if (!playerData.items) playerData.items = DEFAULT_ITEMS;
      if (!playerData.missionProgress) playerData.missionProgress = {};
      if (!playerData.completedMissions) playerData.completedMissions = [];
      if (playerData.pityCount === undefined) playerData.pityCount = 100;
      if (playerData.stepUpCount === undefined) playerData.stepUpCount = 0;
      if (playerData.maxTeamSlots === undefined) playerData.maxTeamSlots = 5;
      if (playerData.minRequiredTeamSize === undefined) playerData.minRequiredTeamSize = 5;
      if (!playerData.gachaHistory) playerData.gachaHistory = [];

      if (!playerData.savedTeams || playerData.savedTeams.length === 0) {
        playerData.savedTeams = [
          { id: 'team_1', name: 'デッキ1', team: playerData.team && playerData.team.length > 0 ? [...playerData.team] : ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'] },
          { id: 'team_2', name: 'デッキ2', team: ['char_e_1', 'char_e_2', 'char_e_3'] },
          { id: 'team_3', name: 'デッキ3', team: [] },
        ];
      }
      if (playerData.activeTeamIndex === undefined || playerData.activeTeamIndex >= playerData.savedTeams.length) {
        playerData.activeTeamIndex = 0;
      }
      // Ensure active team is loaded into team property
      playerData.team = playerData.savedTeams[playerData.activeTeamIndex]?.team || playerData.team || [];

      // Score Attack & Daily Missions Initialization / Reset
      if (playerData.scoreAttackHighScore === undefined) playerData.scoreAttackHighScore = 0;
      if (!playerData.dailyMissionsProgress) playerData.dailyMissionsProgress = {};
      if (!playerData.dailyMissionsCompleted) playerData.dailyMissionsCompleted = [];
      if (playerData.lastDailyResetTime === undefined) playerData.lastDailyResetTime = 0;

      // 毎週日曜日の夜 23:59 にスコアタ記録をリセット
      const currentScoreAttackWeekKey = getScoreAttackWeekKey();
      if (!playerData.lastScoreAttackWeekKey) {
        playerData.lastScoreAttackWeekKey = currentScoreAttackWeekKey;
      } else if (playerData.lastScoreAttackWeekKey !== currentScoreAttackWeekKey) {
        playerData.scoreAttackHighScore = 0;
        playerData.lastScoreAttackWeekKey = currentScoreAttackWeekKey;
        resetPlayerScoreAttackInFirebase().catch((err) => {
          console.warn('Failed to reset score attack in Firebase on week rollover:', err);
        });
      }

      const currentDayIndex = Math.floor(Date.now() / (24 * 3600 * 1000));
      if (playerData.lastDailyResetTime < currentDayIndex) {
        playerData.dailyMissionsProgress = {};
        playerData.dailyMissionsCompleted = [];
        playerData.lastDailyResetTime = currentDayIndex;
      }

      // Migrate old character saves (add missing fields and convert legacy IDs)
      const migratedChars: PlayerData['characters'] = {};
      Object.entries(playerData.characters || {}).forEach(([rawId, c]) => {
        const newId = migrateCharId(rawId);
        migratedChars[newId] = {
          level: c.level || 1,
          skillLevel: (c as any).skillLevel || 1,
          limitBreak: (c as any).limitBreak || 0,
          duplicates: (c as any).duplicates || 0,
        };
      });
      playerData.characters = migratedChars;

      // Ensure initial starter characters exist
      const starterIds = ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'];
      starterIds.forEach(id => {
        if (!playerData.characters[id]) {
          playerData.characters[id] = { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 };
        }
      });

      let validTeam = (playerData.team || [])
        .map(id => migrateCharId(id))
        .filter(id => CHARACTERS.some(c => c.id === id));
      if (validTeam.length === 0) {
        validTeam = ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'];
      }
      if (validTeam.length > 5) {
        validTeam = validTeam.slice(0, 5);
      }
      playerData.team = validTeam;
      playerData.unlockedTitles = computeUnlockedTitles(playerData);
      savePlayerData(uid, { characters: playerData.characters, team: validTeam, minRequiredTeamSize: playerData.minRequiredTeamSize, unlockedTitles: playerData.unlockedTitles });
      setData(playerData);
      setUid(uid);
      setLoading(false);

      // 🌟 Firebaseから最新のスコアタ歴代最高スコアを取得して同期
      fetchMyScoreAttackRecord().then((fbRecord) => {
        if (fbRecord) {
          const currentWeekKey = getScoreAttackWeekKey();
          setData(prev => {
            const currentAllTime = prev.allTimeScoreAttackHighScore || 0;
            const fbAllTime = fbRecord.allTimeScore || 0;
            const currentWeekly = prev.scoreAttackHighScore || 0;
            const fbWeekly = fbRecord.score || 0;

            const updates: Partial<PlayerData> = {};
            if (fbAllTime > currentAllTime) {
              updates.allTimeScoreAttackHighScore = fbAllTime;
              if (fbRecord.allTimeLimit) {
                updates.allTimeScoreAttackTimeLimit = fbRecord.allTimeLimit;
              }
            }
            if (fbWeekly > currentWeekly && fbRecord.weekKey === currentWeekKey) {
              updates.scoreAttackHighScore = fbWeekly;
              if (fbRecord.timeLimit) {
                updates.scoreAttackHighScoreTimeLimit = fbRecord.timeLimit;
              }
            }

            // 100京突破報酬
            const maxAllTime = Math.max(currentAllTime, fbAllTime);
            if (maxAllTime >= 1000000000000000000) {
              const newChars = { ...prev.characters };
              if (!newChars['char_uz_god_supreme']) {
                newChars['char_uz_god_supreme'] = {
                  level: 300,
                  skillLevel: 7,
                  limitBreak: 10,
                  duplicates: 1,
                };
                updates.characters = newChars;
              }
              const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
              if (!unlocked.includes('百京神話の創世神')) {
                updates.unlockedTitles = [...unlocked, '百京神話の創世神'];
              }
            }

            if (Object.keys(updates).length > 0) {
              const merged = { ...prev, ...updates };
              savePlayerData(uid, merged);
              return merged;
            }
            return prev;
          });
        }
      }).catch(err => {
        console.warn('Failed to fetch initial score attack record from Firebase:', err);
      });
    });
  }, []);

  const mutateAndSave = (updater: Partial<PlayerData> | ((prev: PlayerData) => Partial<PlayerData>)) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      const baseUpdated = { ...prev, ...newData };
      const autoUnlocked = computeUnlockedTitles(baseUpdated);
      const updated = { ...baseUpdated, unlockedTitles: autoUnlocked };
      // Save entire state directly into localStorage to prevent any stale state loss
      if (uid) {
        savePlayerData(uid, updated);
      }
      return updated;
    });
  };

  // Synchronize save to localStorage on window close / page hide
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (uid && data) {
        try {
          saveToLocalStorageDirectly(data);
        } catch (e) {
          console.error("Failed to save on beforeunload", e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [uid, data]);

  // 毎週日曜日の夜 23:59:59 の週替わりリセットを監視
  useEffect(() => {
    const interval = setInterval(() => {
      const currentWeekKey = getScoreAttackWeekKey();
      if (data.lastScoreAttackWeekKey && data.lastScoreAttackWeekKey !== currentWeekKey) {
        mutateAndSave({
          scoreAttackHighScore: 0,
          lastScoreAttackWeekKey: currentWeekKey,
        });
        resetPlayerScoreAttackInFirebase().catch((err) => {
          console.warn('Periodic weekly reset score attack failed:', err);
        });
      }
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.lastScoreAttackWeekKey]);

  const unlockKDeveloper = () => {
    mutateAndSave(prev => {
      const existing = prev.characters['char_k_developer'];
      return {
        characters: {
          ...prev.characters,
          'char_k_developer': {
            level: 300,
            skillLevel: 7,
            limitBreak: 10,
            duplicates: (existing?.duplicates || 0) + 1,
          }
        },
        unlockedTitles: prev.unlockedTitles?.includes('最高位開発神・Kの主')
          ? prev.unlockedTitles
          : [...(prev.unlockedTitles || ['新米妖怪レーサー']), '最高位開発神・Kの主']
      };
    });
  };

  const unlockAllCharacters = () => {
    mutateAndSave(() => {
      const allChars: PlayerData['characters'] = {};
      CHARACTERS.forEach(c => {
        const limitBreak = 5;
        const maxLv = getCharacterMaxLevel(c.rank, limitBreak);
        allChars[c.id] = {
          level: maxLv,
          skillLevel: 5,
          limitBreak: limitBreak,
          duplicates: 10,
        };
      });
      return { characters: allChars };
    });
  };

  const unlockAllStages = () => {
    mutateAndSave(() => {
      const allStageIds = STAGES.map(s => s.id);
      const lastStageId = STAGES[STAGES.length - 1]?.id || 'stage_150';
      return {
        clearedStages: allStageIds,
        maxClearedStageId: lastStageId
      };
    });
  };

  const unlockEventStages = () => {
    mutateAndSave(prev => {
      const eventStageIds = EVENT_SNOW_STAGES.map(s => s.id);
      const existing = new Set(prev.clearedStages || []);
      eventStageIds.forEach(id => existing.add(id));
      return {
        clearedStages: Array.from(existing)
      };
    });
  };

  const addMaxItems = () => {
    mutateAndSave(() => ({
      items: {
        expSmall: 99,
        expLarge: 99,
        skillBook: 99,
        godSkillBook: 99,
        superLimitBreakBook: 99,
      }
    }));
  };

  const addItem = (itemId: string, count: number = 1) => {
    mutateAndSave(prev => {
      const currentItems = prev.items || {};
      const currentCount = (currentItems as Record<string, number>)[itemId] || 0;
      return {
        items: {
          ...currentItems,
          [itemId]: currentCount + count
        }
      };
    });
  };

  const claimWeeklyReward = (weekKey: string) => {
    mutateAndSave({ lastClaimedWeeklyRewardWeek: weekKey });
  };
  const addMoney = (amount: number) => mutateAndSave(prev => ({ money: prev.money + amount }));
  const setMoney = (amount: number) => mutateAndSave({ money: amount });
  const addYPoints = (amount: number) => mutateAndSave(prev => ({ yPoints: prev.yPoints + amount }));
  const setYPoints = (amount: number) => mutateAndSave({ yPoints: amount });
  const addBleachRings = (amount: number) => mutateAndSave(prev => ({ bleachRings: (prev.bleachRings || 0) + amount }));

  const unlockCharacter = (charId: string) => {
    mutateAndSave(prev => {
      const existing = prev.characters[charId];
      if (!existing) {
        return {
          characters: {
            ...prev.characters,
            [charId]: { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 1 }
          }
        };
      } else {
        const newDuplicates = (existing.duplicates || 0) + 1;
        const newLimitBreak = Math.min(5, Math.floor(newDuplicates / 1)); // 1体ごとに段階UP（最大5）
        return {
          characters: {
            ...prev.characters,
            [charId]: {
              ...existing,
              duplicates: newDuplicates,
              limitBreak: newLimitBreak,
              skillLevel: Math.min(5, (existing.skillLevel || 1) + (newDuplicates % 2 === 0 ? 1 : 0)),
            }
          }
        };
      }
    });
  };

  const upgradeCharacter = (charId: string, moneyCost: number) => {
    let leveledUp = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const charDef = CHARACTERS.find(c => c.id === charId);
      if (!charData || !charDef || prev.money < moneyCost) return {};

      const maxLv = getCharacterMaxLevel(charDef.rank, charData.limitBreak || 0);
      if (charData.level >= maxLv) return {};

      leveledUp = true;
      return {
        money: prev.money - moneyCost,
        characters: {
          ...prev.characters,
          [charId]: { ...charData, level: charData.level + 1 }
        }
      };
    });
    if (leveledUp) setTimeout(() => trackMission('level_up', 1), 0);
  };

  const consumeExpItem = (charId: string, itemType: 'expSmall' | 'expLarge') => {
    let levelsGained = 0;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const charDef = CHARACTERS.find(c => c.id === charId);
      if (!charData || !charDef || (prev.items[itemType] || 0) <= 0) return {};
      
      const levelGain = itemType === 'expSmall' ? 1 : 5;
      const maxLv = getCharacterMaxLevel(charDef.rank, charData.limitBreak || 0);
      const newLevel = Math.min(maxLv, charData.level + levelGain);
      
      if (newLevel <= charData.level) return {};
      
      levelsGained = newLevel - charData.level;
      return {
        items: { ...prev.items, [itemType]: prev.items[itemType] - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, level: newLevel } }
      };
    });
    if (levelsGained > 0) {
      setTimeout(() => {
        trackMission('level_up', levelsGained);
        trackMission('item_use', 1);
      }, 0);
    }
  };

  const consumeSkillBook = (charId: string) => {
    let skillIncreased = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      if (!charData || (prev.items.skillBook || 0) <= 0) return {};
      
      const currentSkillLv = charData.skillLevel || 1;
      if (currentSkillLv >= 5) return {};
      
      skillIncreased = true;
      return {
        items: { ...prev.items, skillBook: prev.items.skillBook - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, skillLevel: currentSkillLv + 1 } }
      };
    });
    if (skillIncreased) {
      setTimeout(() => trackMission('skill_up', 1), 0);
    }
  };

  const consumeGodSkillBook = (charId: string) => {
    let skillIncreased = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const count = prev.items.godSkillBook || 0;
      if (!charData || count <= 0) return {};
      
      const currentSkillLv = charData.skillLevel || 1;
      if (currentSkillLv >= 5) return {};
      
      skillIncreased = true;
      return {
        items: { ...prev.items, godSkillBook: count - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, skillLevel: 5 } }
      };
    });
    if (skillIncreased) {
      setTimeout(() => trackMission('skill_up', 1), 0);
    }
  };

  const consumeSuperLimitBreakBook = (charId: string) => {
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const count = prev.items.superLimitBreakBook || 0;
      if (!charData || count <= 0) return {};
      
      const currentLb = charData.limitBreak || 0;
      if (currentLb >= 10) return {};
      
      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      const newUnlocked = unlocked.includes('限界を超えし者') ? unlocked : [...unlocked, '限界を超えし者'];

      return {
        items: { ...prev.items, superLimitBreakBook: count - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, limitBreak: currentLb + 1 } },
        unlockedTitles: newUnlocked
      };
    });
  };

  const ascendToZZ = (baseCharId: string): { success: boolean; message: string; targetCharId?: string; isNewUnlock?: boolean } => {
    const baseChar = CHARACTERS.find(c => c.id === baseCharId);
    const baseCharData = data.characters[baseCharId];
    if (!baseChar || !baseCharData) {
      return { success: false, message: '神昇進化のベースとなるキャラクターを所持していません。' };
    }

    if (baseChar.rank !== "Z'" && baseChar.rank !== 'Z') {
      return { success: false, message: '神昇進化はZ\'ランクまたはZランクのキャラクターのみ実行可能です。' };
    }

    const stones = data.items.godAscensionStone || 0;
    if (stones < 1) {
      return { success: false, message: `『神昇の秘石』が足りません（必要数: 1個 / 所持: ${stones}個）` };
    }

    // 全13体のZZキャラクタープールからランダム選出
    const zzPool = CHARACTERS.filter(c => c.rank === 'ZZ');
    if (zzPool.length === 0) {
      return { success: false, message: 'ZZキャラクターデータが見つかりません。' };
    }

    // 未所持のZZキャラクターを優遇（70%で未所持から、30%または全員所持時は全プールから公平ランダム）
    const unownedZZ = zzPool.filter(c => !data.characters[c.id]);
    let targetChar: Character;
    if (unownedZZ.length > 0 && Math.random() < 0.7) {
      targetChar = unownedZZ[Math.floor(Math.random() * unownedZZ.length)];
    } else {
      targetChar = zzPool[Math.floor(Math.random() * zzPool.length)];
    }

    let successMsg = '';
    let isNewUnlock = false;

    mutateAndSave(prev => {
      const currentStones = prev.items.godAscensionStone || 0;
      const currentChars = { ...prev.characters };
      const baseInfo = currentChars[baseCharId] || { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 1 };
      
      const existingTarget = currentChars[targetChar.id];
      if (!existingTarget) {
        isNewUnlock = true;
        currentChars[targetChar.id] = {
          level: Math.max(1, baseInfo.level || 1),
          skillLevel: Math.max(1, baseInfo.skillLevel || 1),
          limitBreak: baseInfo.limitBreak || 0,
          duplicates: 1,
        };
      } else {
        // 重複時は限界突破+1（上限10）＆高レベル/スキル引き継ぎ
        const newLb = Math.min(10, (existingTarget.limitBreak || 0) + 1);
        currentChars[targetChar.id] = {
          level: Math.max(existingTarget.level || 1, baseInfo.level || 1),
          skillLevel: Math.max(existingTarget.skillLevel || 1, baseInfo.skillLevel || 1),
          limitBreak: newLb,
          duplicates: (existingTarget.duplicates || 0) + 1,
        };
      }

      // チーム編成：もしベースキャラが編成されていた場合、新たに獲得したZZキャラで更新
      const mappedTeam = (prev.team || []).map(id => id === baseCharId ? targetChar.id : id);
      const uniqueTeam: string[] = [];
      for (const id of mappedTeam) {
        if (!uniqueTeam.includes(id)) {
          uniqueTeam.push(id);
        }
      }
      if (uniqueTeam.length < (prev.team || []).length) {
        const otherOwned = Object.keys(currentChars).filter(id => !uniqueTeam.includes(id));
        for (const oId of otherOwned) {
          if (uniqueTeam.length >= 5) break;
          uniqueTeam.push(oId);
        }
      }

      const updatedSavedTeams = (prev.savedTeams || []).map(t => ({
        ...t,
        team: (t.team || []).map(id => id === baseCharId ? targetChar.id : id)
      }));

      // 進化元キャラクターはお別れ（融合で疲れ切って離脱）
      delete currentChars[baseCharId];

      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      const newUnlocked = unlocked.includes('神昇の到達者') ? unlocked : [...unlocked, '神昇の到達者'];

      successMsg = `『${baseChar.name}』は激しい融合で全力を捧げて疲れ切り、お別れとなりました…\nその魂と意志は『${targetChar.name}』へと受け継がれ、神昇降臨を果たしました！`;

      return {
        items: {
          ...prev.items,
          godAscensionStone: Math.max(0, currentStones - 1)
        },
        characters: currentChars,
        team: uniqueTeam.length > 0 ? uniqueTeam : mappedTeam,
        savedTeams: updatedSavedTeams,
        unlockedTitles: newUnlocked
      };
    });

    return { success: true, message: successMsg, targetCharId: targetChar.id, isNewUnlock };
  };

  const setSelectedTitle = (titleName: string) => {
    mutateAndSave({ selectedTitle: titleName });
  };

  const unlockTitle = (titleName: string) => {
    mutateAndSave(prev => {
      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      if (unlocked.includes(titleName)) return {};
      return { unlockedTitles: [...unlocked, titleName] };
    });
  };

  const acknowledgeTitle = (titleName: string) => {
    mutateAndSave(prev => {
      const notified = new Set(prev.notifiedUnlockedTitles || []);
      notified.add(titleName);
      return { notifiedUnlockedTitles: Array.from(notified) };
    });
  };

  const setTeam = (newTeam: string[]) => {
    const sliced = newTeam.slice(0, 5);
    mutateAndSave(prev => {
      const activeIdx = prev.activeTeamIndex ?? 0;
      const currentSaved = prev.savedTeams ? [...prev.savedTeams] : [
        { id: 'team_1', name: 'デッキ1', team: sliced }
      ];
      if (currentSaved[activeIdx]) {
        currentSaved[activeIdx] = {
          ...currentSaved[activeIdx],
          team: sliced
        };
      } else {
        currentSaved[activeIdx] = {
          id: `team_${activeIdx + 1}`,
          name: `デッキ${activeIdx + 1}`,
          team: sliced
        };
      }
      return {
        team: sliced,
        savedTeams: currentSaved
      };
    });
  };

  const setActiveTeamIndex = (index: number) => {
    mutateAndSave(prev => {
      const saved = prev.savedTeams || [];
      if (index < 0 || index >= saved.length) return {};
      const targetTeam = saved[index]?.team || [];
      return {
        activeTeamIndex: index,
        team: [...targetTeam]
      };
    });
  };

  const updateSavedTeamName = (index: number, newName: string) => {
    mutateAndSave(prev => {
      const saved = prev.savedTeams ? [...prev.savedTeams] : [];
      if (!saved[index]) return {};
      saved[index] = { ...saved[index], name: newName.trim() || `デッキ${index + 1}` };
      return { savedTeams: saved };
    });
  };

  const getTeamSlotAddCost = (): number => {
    const savedCount = data.savedTeams?.length || 3;
    const additionalSlots = Math.max(0, savedCount - 3);
    return 2000 + additionalSlots * 500;
  };

  const addTeamSlot = (): { success: boolean; message: string } => {
    const cost = getTeamSlotAddCost();
    if ((data.yPoints || 0) < cost) {
      return { success: false, message: `ワイポイントが足りません（必要: ${cost.toLocaleString()} Ypt）` };
    }

    let createdSlotMsg = '';
    mutateAndSave(prev => {
      const currentSaved = prev.savedTeams ? [...prev.savedTeams] : [];
      const newIndex = currentSaved.length;
      currentSaved.push({
        id: `team_${Date.now()}`,
        name: `デッキ${newIndex + 1}`,
        team: []
      });
      createdSlotMsg = `${cost.toLocaleString()} Yptを消費して『デッキ${newIndex + 1}』を新しく解放しました！`;
      return {
        yPoints: prev.yPoints - cost,
        savedTeams: currentSaved
      };
    });

    return { success: true, message: createdSlotMsg };
  };

  const unlockMinRequiredTeamSize = (): { success: boolean; message: string } => {
    const currentMin = data.minRequiredTeamSize ?? 5;
    if (currentMin <= 1) {
      return { success: false, message: '出撃の必須編成数はすでに最小（1体）です！' };
    }
    const targetMin = currentMin - 1;
    const cost = MIN_TEAM_SIZE_UNLOCK_COSTS[targetMin] || 10000;
    if ((data.yPoints || 0) < cost) {
      return { success: false, message: `ワイポイントが足りません（必要: ${cost.toLocaleString()} Ypt）` };
    }

    mutateAndSave(prev => ({
      yPoints: prev.yPoints - cost,
      minRequiredTeamSize: targetMin
    }));

    return { success: true, message: `出撃条件が緩和され、${targetMin}体編成で出撃可能になりました！` };
  };

  const calculateStageDrops = (stageId: string, currentChars: PlayerData['characters']): StageDropReward => {
    const stage = STAGES.find(s => s.id === stageId);
    const randBook = Math.random();
    const randExpLarge = Math.random();
    const randExpSmall = Math.random();
    const randChar = Math.random();

    // 1. 秘伝書 - 進行度に応じて確率上昇 (最序盤1.5% 〜 最深部10%)
    const stageIndex = STAGES.findIndex(s => s.id === stageId);
    const totalStages = STAGES.length;
    let bookRate = 0.015; // デフォルト/最序盤 1.5%
    if (stageIndex >= 0 && totalStages > 1) {
      // 進行度に応じて1.5%から10%まで直線的に増加
      const ratio = stageIndex / (totalStages - 1);
      bookRate = 0.015 + ratio * 0.085;
    }
    const skillBookCount = randBook < bookRate ? 1 : 0;

    // 2. 経験値玉 (大: 低確率15%, 小: 低確率35%)
    const expLargeCount = randExpLarge < 0.15 ? 1 : 0;
    const expSmallCount = randExpSmall < 0.35 ? 1 : 0;

    // 3. キャラクタードロップ - 低確率 (20%の確率)
    let droppedCharacter: StageDropReward['droppedCharacter'] = undefined;
    if (randChar < 0.20 && stage) {
      // 敵のHP・難易度に応じたドロップ可能ランクの設定（ZやSSSはガシャ限定のため絶対除外！）
      const hp = stage.enemyHp || 1000;
      let allowedRanks: Rank[] = ['E', 'D'];
      if (hp > 5000000) {
        allowedRanks = ['S', 'SS'];
      } else if (hp > 500000) {
        allowedRanks = ['A', 'S'];
      } else if (hp > 50000) {
        allowedRanks = ['B', 'A'];
      } else if (hp > 8000) {
        allowedRanks = ['C', 'B'];
      } else {
        allowedRanks = ['E', 'D'];
      }

      // ドロップ可能ランクのキャラクターのみ
      const candidateChars = CHARACTERS.filter(c => allowedRanks.includes(c.rank as Rank));

      if (candidateChars.length > 0) {
        const enemyEmoji = stage.enemyEmoji;
        const rawEnemyName = stage.enemyName.replace(/【.*?】/, '').trim();

        // 敵の絵文字や名前に一致・部分一致するキャラを最優先で探す
        let matchedChar = candidateChars.find(c =>
          c.emoji === enemyEmoji ||
          enemyEmoji.includes(c.emoji) ||
          c.emoji.includes(enemyEmoji) ||
          rawEnemyName.includes(c.name) ||
          c.name.includes(rawEnemyName)
        );

        // 一致するキャラがない場合、全キャラの中でZ/SSS以外の同絵文字・同名キャラを探す
        if (!matchedChar) {
          const exactMatchInAll = CHARACTERS.find(c =>
            (c.emoji === enemyEmoji || rawEnemyName.includes(c.name)) &&
            !['Z', 'SSS'].includes(c.rank)
          );
          if (exactMatchInAll) {
            matchedChar = exactMatchInAll;
          } else {
            // 一致するキャラがなければ難易度に応じた候補からランダムで選択
            const unowned = candidateChars.filter(c => !currentChars[c.id]);
            const pool = unowned.length > 0 && Math.random() < 0.7 ? unowned : candidateChars;
            matchedChar = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        if (matchedChar) {
          const isNew = !currentChars[matchedChar.id];
          droppedCharacter = {
            id: matchedChar.id,
            name: matchedChar.name,
            rank: matchedChar.rank,
            emoji: matchedChar.emoji,
            isNew,
          };
        }
      }
    }

    return {
      expSmallCount,
      expLargeCount,
      skillBookCount,
      droppedCharacter,
    };
  };

  const clearStage = (stageId: string, moneyReward: number, yPointReward: number): StageDropReward => {
    let didClear = false;
    let drops: StageDropReward = {
      expSmallCount: 0,
      expLargeCount: 0,
      skillBookCount: 0,
    };
    const isBleachStage = stageId.startsWith('bleach_st_') || stageId.startsWith('bleach_ura_');
    
    mutateAndSave(prev => {
      const newCleared = prev.clearedStages.includes(stageId)
        ? prev.clearedStages
        : [...prev.clearedStages, stageId];
      
      drops = calculateStageDrops(stageId, prev.characters);
      
      const newItems = { ...prev.items };
      if (drops.expSmallCount > 0) newItems.expSmall = (newItems.expSmall || 0) + drops.expSmallCount;
      if (drops.expLargeCount > 0) newItems.expLarge = (newItems.expLarge || 0) + drops.expLargeCount;
      if (drops.skillBookCount > 0) newItems.skillBook = (newItems.skillBook || 0) + drops.skillBookCount;

      const newChars = { ...prev.characters };
      if (drops.droppedCharacter) {
        const charId = drops.droppedCharacter.id;
        const existing = newChars[charId];
        if (!existing) {
          newChars[charId] = { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 1 };
        } else {
          const newDuplicates = (existing.duplicates || 0) + 1;
          const newLimitBreak = Math.min(5, Math.floor(newDuplicates / 1));
          newChars[charId] = {
            ...existing,
            duplicates: newDuplicates,
            limitBreak: newLimitBreak,
            skillLevel: Math.min(5, (existing.skillLevel || 1) + (newDuplicates % 2 === 0 ? 1 : 0)),
          };
        }
      }

      didClear = true;
      
      if (isBleachStage) {
        const bleachRingReward = 
          stageId === 'bleach_ura_3' ? 50 :
          stageId === 'bleach_ura_2' ? 30 :
          stageId === 'bleach_ura_1' ? 20 :
          stageId === 'bleach_st_8' ? 15 :
          stageId === 'bleach_st_7' ? 10 :
          stageId === 'bleach_st_6' ? 5 :
          stageId === 'bleach_st_5' ? 3 :
          stageId === 'bleach_st_4' ? 2 : 1;
        drops.bleachRingCount = bleachRingReward;

        // 虚圏特別マップ・裏ステージ 高難度ボスの初クリア報酬: 神昇の秘石
        const isFirstClear = !prev.clearedStages.includes(stageId);
        if (isFirstClear) {
          if (stageId === 'bleach_ura_3' || stageId === 'bleach_ura_2') {
            drops.godAscensionStoneCount = 1;
            newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 1;
          } else if (stageId === 'bleach_st_8') {
            drops.godAscensionStoneCount = 1;
            newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 1;
          }
        }

        return {
          money: prev.money + moneyReward,
          yPoints: prev.yPoints + yPointReward,
          bleachRings: (prev.bleachRings || 0) + bleachRingReward,
          maxClearedStageId: stageId,
          clearedStages: newCleared,
          items: newItems,
          characters: newChars,
        };
      } else {
        return {
          money: prev.money + moneyReward,
          yPoints: prev.yPoints + yPointReward,
          maxClearedStageId: stageId,
          clearedStages: newCleared,
          items: newItems,
          characters: newChars,
        };
      }
    });
    if (didClear) {
      setTimeout(() => {
        trackMission('complete_stage', 1);
        if (stageId.includes('event')) {
          trackMission('complete_event_stage', 1);
        }
        trackMission('kill_enemy', 1);
      }, 0);
    }
    return drops;
  };

  const trackDailyMission = (type: string, amount: number = 1) => {
    mutateAndSave(prev => {
      const todayMissions = getTodayDailyMissions();
      const relevantMissions = todayMissions.filter(m => m.type === type);
      if (relevantMissions.length === 0) return {};

      const progress = prev.dailyMissionsProgress ? { ...prev.dailyMissionsProgress } : {};
      const completed = prev.dailyMissionsCompleted || [];
      let changed = false;

      relevantMissions.forEach(m => {
        if (!completed.includes(m.id)) {
          if (type === 'score_attack_score') {
            const current = progress[m.id] || 0;
            if (amount > current) {
              progress[m.id] = amount;
              changed = true;
            }
          } else {
            progress[m.id] = (progress[m.id] || 0) + amount;
            changed = true;
          }
        }
      });

      return changed ? { dailyMissionsProgress: progress } : {};
    });
  };

  const claimDailyMission = (missionId: string) => {
    mutateAndSave(prev => {
      const mission = DAILY_MISSIONS_POOL.find(m => m.id === missionId);
      const completed = prev.dailyMissionsCompleted || [];
      if (!mission || completed.includes(missionId)) return {};

      const progress = (prev.dailyMissionsProgress || {})[missionId] || 0;
      if (progress < mission.goal) return {};

      const newItems = { ...prev.items };
      if (mission.rewardItems?.expSmall) newItems.expSmall += mission.rewardItems.expSmall;
      if (mission.rewardItems?.expLarge) newItems.expLarge += mission.rewardItems.expLarge;
      if (mission.rewardItems?.skillBook) newItems.skillBook += mission.rewardItems.skillBook;

      return {
        money: prev.money + (mission.rewardMoney || 0),
        yPoints: prev.yPoints + (mission.rewardYPoints || 0),
        items: newItems,
        dailyMissionsCompleted: [...completed, missionId],
      };
    });
  };

  const setScoreAttackConfiguredTime = (seconds: number) => {
    const clamped = Math.max(1, Math.min(600, Math.round(seconds)));
    localStorage.setItem('score_attack_custom_time', clamped.toString());
    mutateAndSave({ scoreAttackConfiguredTime: clamped });
  };

  const submitScoreAttackScore = (score: number, timeLimit: number = 60): { isNewHighScore: boolean; previousHighScore: number; unlockedUzGod?: boolean } => {
    const currentWeekKey = getScoreAttackWeekKey();
    let currentHighScore = data.scoreAttackHighScore || 0;
    if (data.lastScoreAttackWeekKey && data.lastScoreAttackWeekKey !== currentWeekKey) {
      currentHighScore = 0;
    }
    const isNewHighScore = score > currentHighScore;
    const newBestScore = Math.max(score, currentHighScore);
    const newBestTimeLimit = isNewHighScore ? timeLimit : (data.scoreAttackHighScoreTimeLimit || 60);

    const currentAllTime = data.allTimeScoreAttackHighScore || 0;
    const isNewAllTimeHighScore = score > currentAllTime;
    const newAllTimeScore = Math.max(score, currentAllTime);
    const newAllTimeLimit = isNewAllTimeHighScore ? timeLimit : (data.allTimeScoreAttackTimeLimit || 60);

    const UZ_GOD_SCORE_THRESHOLD = 1000000000000000000; // 100京 (10^18 pt)
    const isUzGodAchieved = score >= UZ_GOD_SCORE_THRESHOLD;
    
    mutateAndSave(prev => {
      const updates: Partial<PlayerData> = {
        yPoints: (prev.yPoints || 0) + 100,
        money: (prev.money || 0) + 300,
        lastScoreAttackWeekKey: currentWeekKey,
      };
      if (isNewHighScore) {
        updates.scoreAttackHighScore = score;
        updates.scoreAttackHighScoreTimeLimit = timeLimit;
      }
      if (isNewAllTimeHighScore) {
        updates.allTimeScoreAttackHighScore = score;
        updates.allTimeScoreAttackTimeLimit = timeLimit;
      }

      // 🌟 スコアタで100京ptを超えた場合、最強UZ+++キャラ「神創絶神・天照極エンマ王UZ+++」を即時獲得！
      if (isUzGodAchieved) {
        const newChars = { ...prev.characters };
        const existing = newChars['char_uz_god_supreme'];
        newChars['char_uz_god_supreme'] = {
          level: existing ? Math.max(existing.level, 300) : 300,
          skillLevel: 7, // Max skill level
          limitBreak: 10, // Max limit break
          duplicates: (existing?.duplicates || 0) + 1,
        };
        updates.characters = newChars;

        const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
        if (!unlocked.includes('百京神話の創世神')) {
          updates.unlockedTitles = [...unlocked, '百京神話の創世神'];
        }
      }

      return updates;
    });

    // Save to Firebase Real-time Firestore Leaderboard
    saveScoreAttackToFirebase(
      newBestScore,
      data.selectedTitle || '新米妖怪レーサー',
      data.team,
      newBestTimeLimit,
      newAllTimeScore,
      newAllTimeLimit
    ).catch((err) => {
      console.warn('Failed to sync score attack to Firebase:', err);
    });

    // Track Daily Mission for Score Attack play and score
    setTimeout(() => {
      trackDailyMission('score_attack_play', 1);
      trackDailyMission('score_attack_score', score);
    }, 0);

    return { isNewHighScore, previousHighScore: currentHighScore, unlockedUzGod: isUzGodAchieved };
  };

  const syncScoreAttackWithFirebase = async () => {
    try {
      const fbRecord = await fetchMyScoreAttackRecord();
      if (fbRecord) {
        const currentWeekKey = getScoreAttackWeekKey();
        mutateAndSave(prev => {
          const currentAllTime = prev.allTimeScoreAttackHighScore || 0;
          const fbAllTime = fbRecord.allTimeScore || 0;
          const currentWeekly = prev.scoreAttackHighScore || 0;
          const fbWeekly = fbRecord.score || 0;

          const updates: Partial<PlayerData> = {};
          if (fbAllTime > currentAllTime) {
            updates.allTimeScoreAttackHighScore = fbAllTime;
            if (fbRecord.allTimeLimit) {
              updates.allTimeScoreAttackTimeLimit = fbRecord.allTimeLimit;
            }
          }
          if (fbWeekly > currentWeekly && fbRecord.weekKey === currentWeekKey) {
            updates.scoreAttackHighScore = fbWeekly;
            if (fbRecord.timeLimit) {
              updates.scoreAttackHighScoreTimeLimit = fbRecord.timeLimit;
            }
          }

          const maxAllTime = Math.max(currentAllTime, fbAllTime);
          if (maxAllTime >= 1000000000000000000) {
            const newChars = { ...prev.characters };
            if (!newChars['char_uz_god_supreme']) {
              newChars['char_uz_god_supreme'] = {
                level: 300,
                skillLevel: 7,
                limitBreak: 10,
                duplicates: 1,
              };
              updates.characters = newChars;
            }
            const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
            if (!unlocked.includes('百京神話の創世神')) {
              updates.unlockedTitles = [...unlocked, '百京神話の創世神'];
            }
          }

          return Object.keys(updates).length > 0 ? updates : {};
        });
      }
    } catch (err) {
      console.warn('Failed to sync score attack from Firebase:', err);
    }
  };

  const trackMission = (type: string, amount: number = 1) => {
    // Automatically track for daily missions too
    trackDailyMission(type, amount);

    mutateAndSave(prev => {
      const allMissions = CURRENT_EVENTS.flatMap(e => e.missions);
      const relevantMissions = allMissions.filter(m => m.type === type);
      if (relevantMissions.length === 0) return {};
      
      const newProgress = { ...prev.missionProgress };
      let changed = false;
      relevantMissions.forEach(m => {
        if (!prev.completedMissions.includes(m.id)) {
          newProgress[m.id] = (newProgress[m.id] || 0) + amount;
          changed = true;
        }
      });
      return changed ? { missionProgress: newProgress } : {};
    });
  };

  const claimMission = (missionId: string) => {
    mutateAndSave(prev => {
      const allMissions = CURRENT_EVENTS.flatMap(e => e.missions);
      const mission = allMissions.find(m => m.id === missionId);
      if (!mission || prev.completedMissions.includes(missionId)) return {};
      
      const progress = prev.missionProgress[missionId] || 0;
      if (progress < mission.goal) return {};
      
      const newItems = { ...prev.items };
      if (mission.rewardItems?.expSmall) newItems.expSmall += mission.rewardItems.expSmall;
      if (mission.rewardItems?.expLarge) newItems.expLarge += mission.rewardItems.expLarge;
      if (mission.rewardItems?.skillBook) newItems.skillBook += mission.rewardItems.skillBook;
      
      return {
        money: prev.money + (mission.rewardMoney || 0),
        yPoints: prev.yPoints + (mission.rewardYPoints || 0),
        items: newItems,
        completedMissions: [...prev.completedMissions, missionId],
      };
    });
  };

  const recordGachaResult = (charIds: string[], newPityCount: number, newStepUpCount: number) => {
    mutateAndSave(prev => {
      const newHistory = [...(prev.gachaHistory || [])];
      const timestamp = Date.now();
      charIds.forEach(charId => {
        newHistory.unshift({ timestamp, charId }); // add to front
      });
      if (newHistory.length > 50) newHistory.length = 50;
      
      return {
        pityCount: newPityCount,
        stepUpCount: newStepUpCount,
        gachaHistory: newHistory,
      };
    });
  };

  const redeemSerialCode = (code: string): { success: boolean; message: string; rewardsSummary?: string } => {
    const cleanCode = code.trim();
    const used = data.usedSerialCodes || [];

    if (used.includes(cleanCode.toUpperCase()) || used.includes(cleanCode)) {
      return { success: false, message: 'このシリアルコードは既に使用されています。' };
    }

    const decoded = decodeSerialCode(cleanCode);
    if (!decoded.success || !decoded.payload) {
      return { success: false, message: decoded.error || '無効なシリアルコードです。' };
    }

    const { yPoints = 0, money = 0, items, unlockStagesCount = 0, characterId, title } = decoded.payload;

    const summaryParts: string[] = [];
    if (characterId) {
      const targetChar = CHARACTERS.find(c => c.id === characterId);
      if (targetChar) {
        summaryParts.unshift(`🌟【${targetChar.rank}】${targetChar.name} (Lv.MAX / 技Lv.MAX)`);
      }
    }
    if (yPoints > 0) summaryParts.push(`Yポイント +${yPoints.toLocaleString()}pt`);
    if (money > 0) summaryParts.push(`yマネー +${money.toLocaleString()}`);
    if (unlockStagesCount > 0) summaryParts.push(`通常ステージ +${unlockStagesCount}進展`);
    if (items) {
      if (items.expSmall) summaryParts.push(`小けいけんちだま x${items.expSmall}`);
      if (items.expLarge) summaryParts.push(`大けいけんちだま x${items.expLarge}`);
      if (items.skillBook) summaryParts.push(`ひっさつの秘伝書 x${items.skillBook}`);
    }

    const summaryText = summaryParts.length > 0 ? summaryParts.join(' / ') : '報酬なし';

    mutateAndSave(prev => {
      const newItems = { ...prev.items };
      if (items?.expSmall) newItems.expSmall = (newItems.expSmall || 0) + items.expSmall;
      if (items?.expLarge) newItems.expLarge = (newItems.expLarge || 0) + items.expLarge;
      if (items?.skillBook) newItems.skillBook = (newItems.skillBook || 0) + items.skillBook;

      const newChars = { ...prev.characters };
      if (characterId) {
        const existing = newChars[characterId];
        newChars[characterId] = {
          level: existing ? Math.max(existing.level, 300) : 300,
          skillLevel: 7, // Max skill level
          limitBreak: 10, // Max limit break
          duplicates: (existing?.duplicates || 0) + 1,
        };
      }

      // Title unlocking
      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      const newUnlocked = (title && !unlocked.includes(title)) ? [...unlocked, title] : unlocked;

      // 通常ステージ進展の計算
      let newClearedStages = [...(prev.clearedStages || [])];
      if (unlockStagesCount > 0) {
        // 現在の最大通常ステージIDを算出
        let maxStageNum = 0;
        newClearedStages.forEach(id => {
          if (id.startsWith('stage_') && !id.includes('hidden') && !id.includes('event')) {
            const num = parseInt(id.replace('stage_', ''), 10);
            if (!isNaN(num) && num > maxStageNum) {
              maxStageNum = num;
            }
          }
        });

        const targetStage = Math.min(150, maxStageNum + unlockStagesCount);
        for (let i = 1; i <= targetStage; i++) {
          const stId = `stage_${i}`;
          if (!newClearedStages.includes(stId)) {
            newClearedStages.push(stId);
          }
        }
      }

      return {
        yPoints: prev.yPoints + yPoints,
        money: prev.money + money,
        items: newItems,
        characters: newChars,
        unlockedTitles: newUnlocked,
        clearedStages: newClearedStages,
        usedSerialCodes: [...(prev.usedSerialCodes || []), cleanCode, cleanCode.toUpperCase(), cleanCode.replace(/[\s-]/g, '')],
      };
    });

    return {
      success: true,
      message: title ? `【${title}】の特典を獲得しました！` : 'シリアルコード特典を獲得しました！',
      rewardsSummary: summaryText,
    };
  };

  const convertYPointsToBleachRings = (amount: number): { success: boolean; message: string } => {
    // 5,000 YP = 1 Bleach Ring (または 50,000 YP = 10 Rings)
    const multiplier = Math.floor(amount / 5000);
    if (multiplier < 1) {
      return { success: false, message: '5,000 Yポイント以上からブリーチリングに変換可能です！' };
    }
    const cost = multiplier * 5000;
    const rings = multiplier;

    if ((data.yPoints || 0) < cost) {
      return { success: false, message: 'Yポイントが足りません！' };
    }

    mutateAndSave(prev => ({
      yPoints: prev.yPoints - cost,
      bleachRings: (prev.bleachRings || 0) + rings
    }));

    return { success: true, message: `${cost.toLocaleString()} Yポイントを消費して、${rings}個のブリーチリング 💍 に変換しました！` };
  };

  const exchangeBleachRing = (itemId: string): { success: boolean; message: string } => {
    const itemDef = BLEACH_SHOP_ITEMS.find(i => i.id === itemId);
    if (!itemDef) return { success: false, message: '指定された交換アイテムが見つかりません。' };

    const currentRings = data.bleachRings || 0;
    if (currentRings < itemDef.cost) {
      return { success: false, message: `ブリーチリング 💍 が不足しています（必要: ${itemDef.cost}個 / 所持: ${currentRings}個）` };
    }

    const currentPurchased = (data.bleachRingExchanges || {})[itemId] || 0;
    if (itemDef.limit < 999 && currentPurchased >= itemDef.limit) {
      return { success: false, message: `このアイテムは交換上限（${itemDef.limit}個）に達しています。` };
    }

    let itemAddedText = '';
    mutateAndSave(prev => {
      const prevExchanges = prev.bleachRingExchanges || {};
      const newExchanges = { ...prevExchanges, [itemId]: currentPurchased + 1 };
      const newItems = { ...prev.items };
      let newMoney = prev.money;
      let newYPoints = prev.yPoints;

      if (itemId === 'godAscensionStone') {
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 1;
        itemAddedText = '『💎 神昇の秘石』×1';
      } else if (itemId === 'superLimitBreakBook') {
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 1;
        itemAddedText = '『📕 超限界突破の書』×1';
      } else if (itemId === 'godSkillBook') {
        newItems.godSkillBook = (newItems.godSkillBook || 0) + 1;
        itemAddedText = '『📖 神・ひっさつの秘伝書』×1';
      } else if (itemId === 'skillBook') {
        newItems.skillBook = (newItems.skillBook || 0) + 1;
        itemAddedText = '『📜 ひっさつの秘伝書』×1';
      } else if (itemId === 'expLarge') {
        newItems.expLarge = (newItems.expLarge || 0) + 5;
        itemAddedText = '『🍡 超けいけんちだま』×5';
      } else if (itemId === 'money_100k') {
        newMoney += 100000;
        itemAddedText = '『💰 マネー 100,000』';
      } else if (itemId === 'ypoints_3k') {
        newYPoints += 3000;
        itemAddedText = '『🌟 Yポイント 3,000 pt』';
      }

      return {
        bleachRings: Math.max(0, (prev.bleachRings || 0) - itemDef.cost),
        bleachRingExchanges: newExchanges,
        items: newItems,
        money: newMoney,
        yPoints: newYPoints,
      };
    });

    return { success: true, message: `ブリーチリング 💍 ${itemDef.cost}個を消費して、${itemAddedText} を獲得しました！` };
  };

  const claimScoreMilestone = (milestoneReq: string): { success: boolean; message: string } => {
    const highScore = data.scoreAttackHighScore || 0;
    const claimedList = data.scoreAttackClaimedMilestones || [];

    if (claimedList.includes(milestoneReq)) {
      return { success: false, message: 'このスコア報酬は既に受け取り済みです。' };
    }

    const reqValues: Record<string, number> = {
      '10万 pt': 100000,
      '100万 pt': 1000000,
      '1億 pt': 100000000,
      '1000億 pt': 100000000000,
      '10兆 pt': 10000000000000,
      '1000兆 pt': 1000000000000000,
      '100京 pt': 1e18,
      '100垓 pt': 1e22,
      '100穣 pt': 1e30,
      '100極 pt': 1e50,
      '1無量大数 pt': 1e68,
    };

    const targetVal = reqValues[milestoneReq];
    if (targetVal === undefined) return { success: false, message: '無効なスコア報酬です。' };

    if (highScore < targetVal) {
      return { success: false, message: `スコアが目標に到達していません（必要: ${milestoneReq}）` };
    }

    let summaryText = '';
    mutateAndSave(prev => {
      const newClaimed = [...(prev.scoreAttackClaimedMilestones || []), milestoneReq];
      const newItems = { ...prev.items };
      const newChars = { ...prev.characters };
      let newYPoints = prev.yPoints;
      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      let newUnlocked = [...unlocked];

      if (milestoneReq === '10万 pt') {
        newYPoints += 100;
        summaryText = 'Yポイント x100';
      } else if (milestoneReq === '100万 pt') {
        newYPoints += 300;
        newItems.expSmall = (newItems.expSmall || 0) + 1;
        summaryText = 'Yポイント x300, 小けいけんちだま x1';
      } else if (milestoneReq === '1億 pt') {
        newYPoints += 500;
        newItems.skillBook = (newItems.skillBook || 0) + 1;
        summaryText = 'Yポイント x500, ひっさつの秘伝書 x1';
      } else if (milestoneReq === '1000億 pt') {
        newYPoints += 1000;
        newItems.godSkillBook = (newItems.godSkillBook || 0) + 1;
        summaryText = 'Yポイント x1,000, 神ひっさつの秘伝書 x1';
      } else if (milestoneReq === '10兆 pt') {
        newYPoints += 3000;
        newItems.godSkillBook = (newItems.godSkillBook || 0) + 2;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 1;
        summaryText = '💎神昇の秘石 x1, Yポイント x3,000, 神ひっさつの秘伝書 x2';
      } else if (milestoneReq === '1000兆 pt') {
        newYPoints += 5000;
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 1;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 2;
        summaryText = '💎神昇の秘石 x2, Yポイント x5,000, 超限界突破の書 x1';
      } else if (milestoneReq === '100京 pt') {
        newYPoints += 50000;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 5;
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 5;
        const existing = newChars['char_uz_god_supreme'];
        newChars['char_uz_god_supreme'] = {
          level: existing ? Math.max(existing.level, 300) : 300,
          skillLevel: 7,
          limitBreak: 10,
          duplicates: (existing?.duplicates || 0) + 1,
        };
        if (!newUnlocked.includes('百京神話の創世神')) {
          newUnlocked.push('百京神話の創世神');
        }
        summaryText = '👑【UZ+++】神創絶神・天照極エンマ王UZ+++, 称号「百京神話の創世神」, 💎神昇の秘石 x5, 超限界突破の書 x5, Yポイント x50,000';
      } else if (milestoneReq === '100垓 pt') {
        newYPoints += 100000;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 10;
        newItems.godSkillBook = (newItems.godSkillBook || 0) + 10;
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 10;
        if (!newUnlocked.includes('百垓無双の覇王')) {
          newUnlocked.push('百垓無双の覇王');
        }
        summaryText = '称号「百垓無双の覇王」, 💎神昇の秘石 x10, 神ひっさつの秘伝書 x10, 超限界突破の書 x10, Yポイント x100,000';
      } else if (milestoneReq === '100穣 pt') {
        newYPoints += 300000;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 20;
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 20;
        if (!newUnlocked.includes('百穣銀河の支配者')) {
          newUnlocked.push('百穣銀河の支配者');
        }
        summaryText = '称号「百穣銀河の支配者」, 💎神昇の秘石 x20, 超限界突破の書 x20, Yポイント x300,000';
      } else if (milestoneReq === '100極 pt') {
        newYPoints += 500000;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 50;
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 50;
        if (!newUnlocked.includes('百極次元の超越神')) {
          newUnlocked.push('百極次元の超越神');
        }
        summaryText = '称号「百極次元の超越神」, 💎神昇の秘石 x50, 超限界突破の書 x50, Yポイント x500,000';
      } else if (milestoneReq === '1無量大数 pt') {
        newYPoints += 1000000;
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 99;
        newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + 99;
        newItems.godSkillBook = (newItems.godSkillBook || 0) + 99;
        if (!newUnlocked.includes('無量大数の絶対全能神')) {
          newUnlocked.push('無量大数の絶対全能神');
        }
        summaryText = '称号「無量大数の絶対全能神」, 💎神昇の秘石 x99, 神ひっさつの秘伝書 x99, 超限界突破の書 x99, Yポイント x1,000,000';
      }

      return {
        scoreAttackClaimedMilestones: newClaimed,
        items: newItems,
        characters: newChars,
        yPoints: newYPoints,
        unlockedTitles: newUnlocked,
      };
    });

    return { success: true, message: `【${milestoneReq} 達成報酬】\n${summaryText} を獲得しました！` };
  };

  // 塔の階層クリア処理
  const advanceTowerFloor = (floor: number, newArtifactId?: string) => {
    let highestReached = floor;
    let currentTeam: string[] = [];
    let currentTitle = '新米妖怪レーサー';
    let totalArtifacts = 0;

    mutateAndSave(prev => {
      const currentHighest = prev.towerHighestFloor || 0;
      const nextHighest = Math.max(currentHighest, floor);
      highestReached = nextHighest;
      currentTeam = [...(prev.team || [])];
      currentTitle = prev.selectedTitle || '新米妖怪レーサー';

      const nextFloor = floor + 1;
      const artifacts = [...(prev.towerArtifacts || [])];
      if (newArtifactId && !artifacts.includes(newArtifactId)) {
        artifacts.push(newArtifactId);
      }
      totalArtifacts = artifacts.length;

      return {
        towerHighestFloor: nextHighest,
        towerCurrentFloor: nextFloor,
        towerArtifacts: artifacts,
      };
    });

    // オンラインリーダーボードへ自動送信
    saveTowerRecordToFirebase(highestReached, currentTitle, currentTeam, totalArtifacts).catch(() => {});
  };

  // 塔の挑戦階層セット
  const setTowerCurrentFloor = (floor: number) => {
    mutateAndSave({ towerCurrentFloor: Math.max(1, floor) });
  };

  // 塔の節目報酬受け取り
  const claimTowerReward = (floor: number): { success: boolean; message: string } => {
    const milestone = TOWER_MILESTONES.find(m => m.floor === floor);
    if (!milestone) return { success: false, message: '報酬が存在しません' };
    const claimed = data.towerClaimedRewards || [];
    if (claimed.includes(floor)) return { success: false, message: '既に受取済みです' };
    if ((data.towerHighestFloor || 0) < floor) return { success: false, message: 'まだ踏破していません' };

    mutateAndSave(prev => {
      const newClaimed = [...(prev.towerClaimedRewards || []), floor];
      const items = { ...prev.items };
      let yPoints = prev.yPoints;
      const titles = new Set(prev.unlockedTitles || []);

      if (milestone.rewardValue.itemKey) {
        const k = milestone.rewardValue.itemKey as keyof typeof items;
        items[k] = (items[k] || 0) + (milestone.rewardValue.amount || 1);
      }
      if (milestone.rewardValue.extraItem) {
        const ek = milestone.rewardValue.extraItem as keyof typeof items;
        items[ek] = (items[ek] || 0) + (milestone.rewardValue.extraAmount || 1);
      }
      if (milestone.rewardValue.yPoints) {
        yPoints += milestone.rewardValue.yPoints;
      }
      if (milestone.rewardValue.title) {
        titles.add(milestone.rewardValue.title);
      }

      return {
        towerClaimedRewards: newClaimed,
        items,
        yPoints,
        unlockedTitles: Array.from(titles),
      };
    });

    return { success: true, message: `【${floor}F報酬】${milestone.rewardDesc} を受け取りました！` };
  };

  // 塔の達成報酬一括受取
  const claimAllTowerRewards = (): { success: boolean; message: string; count: number } => {
    const highest = data.towerHighestFloor || 0;
    const claimed = data.towerClaimedRewards || [];
    const claimable = TOWER_MILESTONES.filter(m => m.floor <= highest && !claimed.includes(m.floor));

    if (claimable.length === 0) {
      return { success: false, message: '現在受け取り可能な未受取報酬はありません。', count: 0 };
    }

    let totalYpt = 0;
    mutateAndSave(prev => {
      const newClaimed = [...(prev.towerClaimedRewards || [])];
      const items = { ...prev.items };
      let yPoints = prev.yPoints;
      const titles = new Set(prev.unlockedTitles || []);

      claimable.forEach(m => {
        newClaimed.push(m.floor);
        if (m.rewardValue.itemKey) {
          const k = m.rewardValue.itemKey as keyof typeof items;
          items[k] = (items[k] || 0) + (m.rewardValue.amount || 1);
        }
        if (m.rewardValue.extraItem) {
          const ek = m.rewardValue.extraItem as keyof typeof items;
          items[ek] = (items[ek] || 0) + (m.rewardValue.extraAmount || 1);
        }
        if (m.rewardValue.yPoints) {
          yPoints += m.rewardValue.yPoints;
          totalYpt += m.rewardValue.yPoints;
        }
        if (m.rewardValue.title) {
          titles.add(m.rewardValue.title);
        }
      });

      return {
        towerClaimedRewards: Array.from(new Set(newClaimed)),
        items,
        yPoints,
        unlockedTitles: Array.from(titles),
      };
    });

    return {
      success: true,
      message: `${claimable.length}件の報酬を一括受取しました！ (合計 +${totalYpt.toLocaleString()} Ypt)`,
      count: claimable.length
    };
  };

  // スピードランタイム提出
  const submitSpeedrunTime = (courseId: string, timeMs: number): { isNewBest: boolean; previousBestMs?: number; rank: string } => {
    const course = SPEEDRUN_COURSES.find(c => c.id === courseId);
    const existing = data.speedrunRecords?.[courseId];
    const previousBestMs = existing?.timeMs;
    const isNewBest = !previousBestMs || timeMs < previousBestMs;

    const rankObj = course ? getSpeedrunRank(timeMs / 1000, course.targetTimes) : { rank: 'C', color: '#999', label: 'C' };

    mutateAndSave(prev => {
      const records = { ...(prev.speedrunRecords || {}) };
      if (isNewBest) {
        records[courseId] = {
          timeMs,
          clearedAt: Date.now(),
          team: [...prev.team],
        };
      }

      // 初回クリア報酬判定
      let yPoints = prev.yPoints;
      const titles = new Set(prev.unlockedTitles || []);
      const items = { ...prev.items };

      if (!existing && course?.firstClearReward) {
        if (course.firstClearReward.yPoints) yPoints += course.firstClearReward.yPoints;
        if (course.firstClearReward.title) titles.add(course.firstClearReward.title);
        if (course.firstClearReward.itemKey) {
          const k = course.firstClearReward.itemKey as keyof typeof items;
          items[k] = (items[k] || 0) + (course.firstClearReward.itemAmount || 1);
        }
      }

      return {
        speedrunRecords: records,
        yPoints,
        items,
        unlockedTitles: Array.from(titles),
      };
    });

    // オンラインリーダーボードへ自動送信
    saveSpeedrunRecordToFirebase(
      courseId,
      timeMs,
      data.selectedTitle || '新米妖怪レーサー',
      data.team || []
    ).catch(() => {});

    return { isNewBest, previousBestMs, rank: rankObj.rank };
  };

  // ---------- きまぐれゲート（異次元サバイバルパズル Gate of Caprice）ハンドラー ----------
  const openGateRoom = (roomId: string) => {
    mutateAndSave(prev => ({
      ...prev,
      gateActiveRoom: roomId,
      gateCurrentWave: 1,
      gatePlayerHp: null, // フルHPで開始
    }));
  };

  const completeGateWave = (roomId: string, wave: number, remainingHp: number) => {
    let result: {
      isRoomCleared: boolean;
      nextWave?: number;
      specialRoomAppeared?: 'boss' | 'reward' | null;
      specialRoomLevel?: number;
      specialAppearance?: { type: 'boss' | 'reward'; level: number };
      clearedRoomType?: 'normal' | 'boss' | 'reward';
      clearedLevel?: number;
      rewards?: { yPoints: number; money: number; bonusDrops?: { name: string; count: number; icon: string }[] };
    } = {
      isRoomCleared: false,
      nextWave: undefined,
      specialRoomAppeared: null,
      specialRoomLevel: undefined,
      specialAppearance: undefined,
      clearedRoomType: undefined,
      clearedLevel: undefined,
      rewards: undefined,
    };

    mutateAndSave(prev => {
      const room = GATE_ROOM_TYPES.find(r => r.id === roomId) || GATE_ROOM_TYPES[0];
      const roomType = room.roomType || 'normal';
      
      const normalLv = prev.gateNormalLevel || prev.gateLevel || 1;
      const bossLv = prev.gateBossLevel || 1;
      const rewardLv = prev.gateRewardLevel || 1;

      const currentRoomLevel = roomType === 'boss' ? bossLv : (roomType === 'reward' ? rewardLv : normalLv);
      const totalWaves = getGateRoomTotalWaves(roomType, currentRoomLevel);

      if (wave < totalWaves) {
        // 次のWaveへ進む（残りHPを引き継ぐ）
        result.isRoomCleared = false;
        result.nextWave = wave + 1;
        return {
          ...prev,
          gateActiveRoom: roomId,
          gateCurrentWave: wave + 1,
          gatePlayerHp: Math.max(1, remainingHp),
        };
      } else {
        // 間を完全制覇！
        result.isRoomCleared = true;
        result.clearedRoomType = roomType;
        result.clearedLevel = currentRoomLevel;

        const rewardScale = 1 + (currentRoomLevel - 1) * 0.25;
        const rewardYp = Math.floor(room.rewardYp * rewardScale);
        const rewardMoney = Math.floor(5000 * rewardScale);

        result.rewards = {
          yPoints: rewardYp,
          money: rewardMoney,
          bonusDrops: room.bonusDrops,
        };

        const newItems = { ...prev.items };
        if (room.bonusDrops) {
          room.bonusDrops.forEach(d => {
            if (d.name.includes('秘伝書')) newItems.skillBook = (newItems.skillBook || 0) + d.count;
            if (d.name.includes('大けいけんちだま') || d.name.includes('超けいけんちだま')) newItems.expLarge = (newItems.expLarge || 0) + d.count;
            if (d.name.includes('神昇の秘石')) newItems.godAscensionStone = (newItems.godAscensionStone || 0) + d.count;
          });
        }

        let newNormalLevel = normalLv;
        let newBossLevel = bossLv;
        let newRewardLevel = rewardLv;
        let newBossOpen = prev.gateBossOpen || false;
        let newRewardOpen = prev.gateRewardOpen || false;
        let specialAppeared: 'boss' | 'reward' | null = null;
        let specialLevel: number | undefined = undefined;

        if (roomType === 'normal') {
          // 通常の間クリア時：通常レベル+1
          newNormalLevel = normalLv + 1;

          // 確率判定: 10%でご褒美の間、35%で邪神の間
          const roll = Math.random();
          if (roll < 0.10) {
            newRewardOpen = true;
            specialAppeared = 'reward';
            specialLevel = rewardLv;
          } else if (roll < 0.10 + 0.35) { // 0.10 ~ 0.45 (35%)
            newBossOpen = true;
            specialAppeared = 'boss';
            specialLevel = bossLv;
          }
        } else if (roomType === 'boss') {
          // 邪神の間クリア時：邪神レベル+1 & 邪神の間消滅
          newBossLevel = bossLv + 1;
          newBossOpen = false;
        } else if (roomType === 'reward') {
          // ご褒美の間クリア時：ご褒美レベル+1 & ご褒美の間消滅
          newRewardLevel = rewardLv + 1;
          newRewardOpen = false;
        }

        result.specialRoomAppeared = specialAppeared;
        result.specialRoomLevel = specialLevel;
        result.specialAppearance = specialAppeared && specialLevel ? { type: specialAppeared, level: specialLevel } : undefined;

        const maxTotalLevel = Math.max(newNormalLevel, newBossLevel, prev.gateLevel || 1);

        return {
          ...prev,
          gateActiveRoom: null,
          gateCurrentWave: 1,
          gatePlayerHp: null,
          gateLevel: maxTotalLevel,
          gateNormalLevel: newNormalLevel,
          gateBossLevel: newBossLevel,
          gateRewardLevel: newRewardLevel,
          gateBossOpen: newBossOpen,
          gateRewardOpen: newRewardOpen,
          yPoints: prev.yPoints + rewardYp,
          money: prev.money + rewardMoney,
          items: newItems,
        };
      }
    });

    return result;
  };

  const consumeKampoItem = () => {
    let result = { success: false, message: '' };
    mutateAndSave(prev => {
      const currentKampo = prev.gateKampo || 0;
      if (currentKampo <= 0) {
        result = { success: false, message: '漢方がありません！' };
        return prev;
      }
      result = { success: true, message: '漢方を使用してチームHPを全回復しました！' };
      return {
        ...prev,
        gateKampo: currentKampo - 1,
        gatePlayerHp: null, // 全回復
      };
    });
    return result;
  };

  const claimGateReward = (rewardKey: string | number) => {
    const keyStr = String(rewardKey);
    let result = { success: false, message: '', reward: undefined as any };
    mutateAndSave(prev => {
      const claimed = new Set<string>((prev.gateClaimedRewards || []).map(r => String(r)));

      if (claimed.has(keyStr)) {
        result = { success: false, message: 'この報酬はすでに受取済みです。', reward: undefined };
        return prev;
      }

      const rewardDef = GATE_LEVEL_REWARDS.find(r => r.key === keyStr || String(r.level) === keyStr);
      if (!rewardDef) {
        result = { success: false, message: '報酬が存在しません。', reward: undefined };
        return prev;
      }

      const roomType = rewardDef.roomType || 'normal';
      const userLevel = roomType === 'boss'
        ? (prev.gateBossLevel || 1)
        : (roomType === 'reward' ? (prev.gateRewardLevel || 1) : (prev.gateNormalLevel || prev.gateLevel || 1));

      if (userLevel <= rewardDef.level) {
        const roomName = roomType === 'boss' ? '邪神の間' : (roomType === 'reward' ? 'ご褒美の間' : '通常の間');
        result = { success: false, message: `${roomName} Lv.${rewardDef.level}をクリアすると獲得できます！`, reward: undefined };
        return prev;
      }

      claimed.add(keyStr);
      result = { success: true, message: `Lv.${rewardDef.level}制覇報酬を獲得しました！`, reward: rewardDef };

      const newItems = { ...prev.items };
      if (rewardDef.specialReward?.name.includes('神昇の秘石')) {
        newItems.godAscensionStone = (newItems.godAscensionStone || 0) + 1;
      } else if (rewardDef.specialReward?.name.includes('秘伝書')) {
        newItems.skillBook = (newItems.skillBook || 0) + 1;
      } else if (rewardDef.specialReward?.name.includes('大けいけんちだま') || rewardDef.specialReward?.name.includes('超けいけんちだま')) {
        newItems.expLarge = (newItems.expLarge || 0) + 1;
      }

      let extraKampo = 0;
      if (rewardDef.specialReward?.name.includes('漢方')) {
        extraKampo += 2;
      }

      const newChars = { ...prev.characters };
      if (rewardDef.specialReward?.charId && !newChars[rewardDef.specialReward.charId]) {
        newChars[rewardDef.specialReward.charId] = { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 };
      }

      return {
        ...prev,
        yPoints: prev.yPoints + rewardDef.rewardYPoints,
        gateClaimedRewards: Array.from(claimed) as any,
        items: newItems,
        gateKampo: (prev.gateKampo || 0) + extraKampo,
        characters: newChars,
      };
    });
    return result;
  };

  const claimFriendKampo = (friendId: string) => {
    let result = { success: false, message: '' };
    mutateAndSave(prev => {
      const claimedFriends = new Set(prev.gateFriendGiftsClaimed || []);
      if (claimedFriends.has(friendId)) {
        result = { success: false, message: 'このフレンドからは本日すでに漢方を受け取っています。' };
        return prev;
      }
      claimedFriends.add(friendId);
      result = { success: true, message: 'フレンドから漢方（HP全回復薬）を1個受け取りました！' };
      return {
        ...prev,
        gateKampo: (prev.gateKampo || 0) + 1,
        gateFriendGiftsClaimed: Array.from(claimedFriends),
      };
    });
    return result;
  };

  const resetGateRoom = () => {
    mutateAndSave(prev => ({
      ...prev,
      gateActiveRoom: null,
      gateCurrentWave: 1,
      gatePlayerHp: null,
    }));
  };


  // ---------- 超大型レイドボス（Raid Boss）ハンドラー ----------
  const damageRaidBoss = (bossId: string, damage: number) => {
    let result = {
      currentHp: 0,
      maxHp: 0,
      isCleared: false,
      rewardYPoints: 0,
      rewardItemName: undefined as string | undefined,
      rewardItemCount: undefined as number | undefined,
    };

    mutateAndSave(prev => {
      const bossDef = RAID_BOSSES.find(b => b.id === bossId) || RAID_BOSSES[0];
      const raidMap = { ...(prev.raidBossHp || {}) };
      const currentHp = raidMap[bossId] ?? bossDef.maxHp;
      const newHp = Math.max(0, currentHp - damage);
      raidMap[bossId] = newHp;

      result.currentHp = newHp;
      result.maxHp = bossDef.maxHp;

      const clearedList = new Set(prev.raidClearedBosses || []);

      if (newHp <= 0 && !clearedList.has(bossId)) {
        // 初討伐！
        clearedList.add(bossId);
        result.isCleared = true;
        result.rewardYPoints = bossDef.rewardYPoints;
        result.rewardItemName = bossDef.rewardItemName;
        result.rewardItemCount = bossDef.rewardItemCount;

        const newItems = { ...prev.items };
        if (bossDef.rewardItemName === '超限界突破の書') {
          newItems.superLimitBreakBook = (newItems.superLimitBreakBook || 0) + (bossDef.rewardItemCount || 1);
        } else if (bossDef.rewardItemName === '神昇の秘石') {
          newItems.godAscensionStone = (newItems.godAscensionStone || 0) + (bossDef.rewardItemCount || 1);
        } else if (bossDef.rewardItemName === '神ひっさつの秘伝書') {
          newItems.godSkillBook = (newItems.godSkillBook || 0) + (bossDef.rewardItemCount || 1);
        }

        const titles = new Set(prev.unlockedTitles || []);
        if (bossId === 'raid_4') {
          titles.add('創世の絶対討伐神');
        }

        return {
          ...prev,
          raidBossHp: raidMap,
          raidClearedBosses: Array.from(clearedList),
          yPoints: prev.yPoints + bossDef.rewardYPoints,
          items: newItems,
          unlockedTitles: Array.from(titles),
        };
      }

      return {
        ...prev,
        raidBossHp: raidMap,
      };
    });

    return result;
  };

  const exportRawPlayerData = (): PlayerData => {
    return { ...data };
  };

  const importAllPlayerData = (importedData: Partial<PlayerData>) => {
    mutateAndSave(() => {
      // 全データを上書き＆必要な初期値補完
      return {
        ...importedData
      };
    });
  };

  return (
    <GameContext.Provider value={{
      ...data,
      uid,
      loading,
      addMoney,
      addYPoints,
      setMoney,
      setYPoints,
      addBleachRings,
      unlockCharacter,
      unlockKDeveloper,
      unlockAllCharacters,
      unlockAllStages,
      unlockEventStages,
      addMaxItems,
      addItem,
      upgradeCharacter,
      consumeExpItem,
      consumeSkillBook,
      consumeGodSkillBook,
      consumeSuperLimitBreakBook,
      ascendToZZ,
      setSelectedTitle,
      unlockTitle,
      acknowledgeTitle,
      setTeam,
      setActiveTeamIndex,
      updateSavedTeamName,
      getTeamSlotAddCost,
      addTeamSlot,
      unlockMinRequiredTeamSize,
      clearStage,
      trackMission,
      claimMission,
      trackDailyMission,
      claimDailyMission,
      submitScoreAttackScore,
      setScoreAttackConfiguredTime,
      recordGachaResult,
      redeemSerialCode,
      convertYPointsToBleachRings,
      exchangeBleachRing,
      claimScoreMilestone,
      claimWeeklyReward,
      advanceTowerFloor,
      setTowerCurrentFloor,
      claimTowerReward,
      claimAllTowerRewards,
      submitSpeedrunTime,
      openGateRoom,
      completeGateWave,
      consumeKampoItem,
      useKampoItem: consumeKampoItem,
      claimGateReward,

      claimFriendKampo,
      resetGateRoom,
      damageRaidBoss,
      syncScoreAttackWithFirebase,
      exportRawPlayerData,
      importAllPlayerData,

    }}>
      {children}
    </GameContext.Provider>
  );
};
