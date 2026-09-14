import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame, getWeeklyRewardWeekKey } from '../store/GameContext';
import {
  Home,
  Trophy,
  Play,
  Award,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Gift,
  X,
  Swords,
  Edit3,
  RefreshCw,
  Flame
} from 'lucide-react';
import {
  subscribeToOnlineLeaderboard,
  subscribeToMyScoreAttackRecord,
  fetchMyScoreAttackRecord,
  getPlayerDisplayName,
  setPlayerDisplayName,
  getPlayerUserId,
  saveScoreAttackToFirebase,
  type OnlineLeaderboardEntry
} from '../firebase';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { CHARACTERS } from '../data/characters';
import { formatLargeScore } from '../utils/format';

interface RewardInfo {
  rankRange: string;
  tierName: string;
  badgeColor: string;
  rewards: string[];
}

interface ScoreRewardInfo {
  scoreReq: string;
  rewards: string[];
}

const RANK_REWARDS: RewardInfo[] = [
  {
    rankRange: '1位',
    tierName: '神覇者 (ZZZ級)',
    badgeColor: '#f59e0b',
    rewards: ['💎 神昇の秘石 x2', 'Yポイント x10,000', '神ひっさつの秘伝書 x5', '超限界突破の書 x3', '特別称号「神覇者」']
  },
  {
    rankRange: '2位 ～ 3位',
    tierName: '超神エリート (ZZ級)',
    badgeColor: '#ef4444',
    rewards: ['💎 神昇の秘石 x1', 'Yポイント x5,000', '神ひっさつの秘伝書 x3', '超限界突破の書 x1']
  },
  {
    rankRange: '4位 ～ 5位',
    tierName: '超マスター (Z級)',
    badgeColor: '#a855f7',
    rewards: ['💎 神昇の秘石 x1', 'Yポイント x3,000', 'ひっさつの秘伝書 x3', '大けいけんちだま x10']
  },
  {
    rankRange: '6位 ～ 8位',
    tierName: 'エキスパート (SSS級)',
    badgeColor: '#3b82f6',
    rewards: ['Yポイント x1,500', 'ひっさつの秘伝書 x2', '大けいけんちだま x5']
  },
  {
    rankRange: '9位 ～ 10位',
    tierName: 'チャレンジャー (SS級)',
    badgeColor: '#10b981',
    rewards: ['Yポイント x800', 'ひっさつの秘伝書 x1', '小けいけんちだま x5']
  },
  {
    rankRange: '11位以下（記録あり）',
    tierName: '参加賞',
    badgeColor: '#6b7280',
    rewards: ['Yポイント x300', '小けいけんちだま x3']
  }
];

const SCORE_MILESTONE_REWARDS: ScoreRewardInfo[] = [
  { scoreReq: '10万 pt', rewards: ['Yポイント x100'] },
  { scoreReq: '100万 pt', rewards: ['Yポイント x300', '小けいけんちだま x1'] },
  { scoreReq: '1億 pt', rewards: ['Yポイント x500', 'ひっさつの秘伝書 x1'] },
  { scoreReq: '1000億 pt', rewards: ['Yポイント x1,000', '神ひっさつの秘伝書 x1'] },
  { scoreReq: '10兆 pt', rewards: ['💎 神昇の秘石 x1', 'Yポイント x3,000', '神ひっさつの秘伝書 x2'] },
  { scoreReq: '1000兆 pt', rewards: ['💎 神昇の秘石 x2', 'Yポイント x5,000', '超限界突破の書 x1'] },
  { scoreReq: '100京 pt', rewards: ['👑【UZ+++】神創絶神・天照極エンマ王UZ+++ (Lv.300 / 技MAX / 限凸+10 / 全スキル1000倍)', '特別称号「百京神話の創世神」', '💎神昇の秘石 x5', '超限界突破の書 x5', 'Yポイント x50,000'] },
  { scoreReq: '100垓 pt', rewards: ['特別称号「百垓無双の覇王」', '💎神昇の秘石 x10', '神ひっさつの秘伝書 x10', '超限界突破の書 x10', 'Yポイント x100,000'] },
  { scoreReq: '100穣 pt', rewards: ['特別称号「百穣銀河の支配者」', '💎神昇の秘石 x20', '超限界突破の書 x20', 'Yポイント x300,000'] },
  { scoreReq: '100極 pt', rewards: ['特別称号「百極次元の超越神」', '💎神昇の秘石 x50', '超限界突破の書 x50', 'Yポイント x500,000'] },
  { scoreReq: '1無量大数 pt', rewards: ['特別称号「無量大数の絶対全能神」', '💎神昇の秘石 x99', '神ひっさつの秘伝書 x99', '超限界突破の書 x99', 'Yポイント x1,000,000'] },
];

// Initial benchmark bosses if cloud collection is warming up
const DEFAULT_BOSS_RIVALS: OnlineLeaderboardEntry[] = [
  { userId: 'boss_enma', playerName: '👑 暴走エンマ (AIマスター)', score: 5084792301654829, allTimeScore: 5084792301654829, timeLimit: 60, allTimeLimit: 60, title: '神覇者', updatedAt: '' },
  { userId: 'boss_sousei', playerName: '⚔️ 創世神 (極伝承者)', score: 2714839205178392, allTimeScore: 2714839205178392, timeLimit: 60, allTimeLimit: 60, title: '神覇者', updatedAt: '' },
  { userId: 'boss_dragon', playerName: '🐉 覇邪の邪龍神 (極覇)', score: 1492083741592016, allTimeScore: 1492083741592016, timeLimit: 60, allTimeLimit: 60, title: '超神エリート', updatedAt: '' },
  { userId: 'boss_hades', playerName: '🌌 冥王神ハデス (冥界覇者)', score: 847912603485920, allTimeScore: 847912603485920, timeLimit: 60, allTimeLimit: 60, title: '超神エリート', updatedAt: '' },
  { userId: 'boss_fubuki', playerName: '❄️ 極ふぶき姫 (絶対零度)', score: 381940274815693, allTimeScore: 381940274815693, timeLimit: 60, allTimeLimit: 60, title: '超マスター', updatedAt: '' },
  { userId: 'boss_ultimate', playerName: '⚡ アルティメット龍神', score: 114893027561402, allTimeScore: 114893027561402, timeLimit: 60, allTimeLimit: 60, title: '超マスター', updatedAt: '' },
  { userId: 'boss_ashura', playerName: '🔥 阿修羅王 (修羅連撃)', score: 12849301756294, allTimeScore: 12849301756294, timeLimit: 60, allTimeLimit: 60, title: '超マスター', updatedAt: '' },
  { userId: 'boss_jibanyan', playerName: '🍫 ジバニャン神伝承', score: 1394820174930, allTimeScore: 1394820174930, timeLimit: 60, allTimeLimit: 60, title: 'エキスパート', updatedAt: '' },
  { userId: 'boss_orochi', playerName: '🐍 覚醒オロチ一門', score: 148930271840, allTimeScore: 148930271840, timeLimit: 60, allTimeLimit: 60, title: 'エキスパート', updatedAt: '' },
  { userId: 'boss_whisper', playerName: '👻 ウィスパー奇跡の一撃', score: 1849302751, allTimeScore: 1849302751, timeLimit: 60, allTimeLimit: 60, title: 'チャレンジャー', updatedAt: '' },
];

const ScoreAttack: React.FC = () => {
  const navigate = useNavigate();
  const {
    team,
    yPoints = 0,
    scoreAttackHighScore,
    scoreAttackHighScoreTimeLimit = 60,
    allTimeScoreAttackHighScore = 0,
    allTimeScoreAttackTimeLimit = 60,
    scoreAttackConfiguredTime = 60,
    setScoreAttackConfiguredTime,
    selectedTitle = '新米妖怪レーサー',
    addYPoints,
    addItem,
    lastClaimedWeeklyRewardWeek,
    claimWeeklyReward,
    scoreAttackClaimedMilestones = [],
    claimScoreMilestone,
    syncScoreAttackWithFirebase,
  } = useGame();

  const [fbMyRecord, setFbMyRecord] = useState<OnlineLeaderboardEntry | null>(null);
  const [isSyncingFirebase, setIsSyncingFirebase] = useState(false);

  const currentWeekKey = getWeeklyRewardWeekKey();
  const hasClaimedThisWeek = lastClaimedWeeklyRewardWeek === currentWeekKey;
  
  // Firebaseの歴代最高スコアとローカルの最高スコアを完全にマージ
  const effectiveWeeklyScore = Math.max(scoreAttackHighScore || 0, fbMyRecord?.score || 0);
  const effectiveAllTimeScore = Math.max(
    allTimeScoreAttackHighScore || 0,
    scoreAttackHighScore || 0,
    fbMyRecord?.allTimeScore || 0,
    fbMyRecord?.score || 0
  );
  const effectiveAllTimeLimit = fbMyRecord?.allTimeLimit || allTimeScoreAttackTimeLimit || scoreAttackHighScoreTimeLimit || 60;
  const playerHighScore = effectiveWeeklyScore;
  const playerAllTimeHighScore = effectiveAllTimeScore;

  // タイム設定機能（デフォルト60秒、1秒あたり10Ypt）
  const [configuredTime, setConfiguredTime] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('score_attack_custom_time');
      const val = saved ? parseInt(saved, 10) : (scoreAttackConfiguredTime || 60);
      return !isNaN(val) && val > 0 ? val : 60;
    } catch {
      return 60;
    }
  });

  // ランキング表示モード: 'weekly' (今週) or 'allTime' (歴代さいこうスコア)
  const [rankingTab, setRankingTab] = useState<'weekly' | 'allTime'>('weekly');

  // 1秒増やすのは10ワイポ、1秒減らすのは10ワイポ
  const timeDifference = Math.abs(configuredTime - 60);
  const requiredYPoints = timeDifference * 10;

  const handleAdjustTime = (delta: number) => {
    setConfiguredTime(prev => {
      const next = Math.max(1, Math.min(300, prev + delta));
      localStorage.setItem('score_attack_custom_time', next.toString());
      if (setScoreAttackConfiguredTime) {
        setScoreAttackConfiguredTime(next);
      }
      return next;
    });
  };

  const handleResetTime = () => {
    setConfiguredTime(60);
    localStorage.setItem('score_attack_custom_time', '60');
    if (setScoreAttackConfiguredTime) {
      setScoreAttackConfiguredTime(60);
    }
  };

  const [onlineEntries, setOnlineEntries] = useState<OnlineLeaderboardEntry[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [selectedRival, setSelectedRival] = useState<OnlineLeaderboardEntry | null>(() => {
    try {
      const saved = sessionStorage.getItem('activeScoreAttackRival');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [playerName, setPlayerNameState] = useState(getPlayerDisplayName());
  const [showNameModal, setShowNameModal] = useState(false);
  const [editNameInput, setEditNameInput] = useState(getPlayerDisplayName());

  const [showRules, setShowRules] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardTab, setRewardTab] = useState<'rank' | 'score'>('rank');
  const [claimedRewardMessage, setClaimedRewardMessage] = useState<string | null>(null);

  // 手動でFirebase最新データを再取得・同期する関数
  const handleManualSyncFirebase = async () => {
    setIsSyncingFirebase(true);
    try {
      if (syncScoreAttackWithFirebase) {
        await syncScoreAttackWithFirebase();
      }
      const rec = await fetchMyScoreAttackRecord();
      if (rec) {
        setFbMyRecord(rec);
      }
    } catch (err) {
      console.warn('Manual Firebase sync error:', err);
    } finally {
      setIsSyncingFirebase(false);
    }
  };

  // Firebase上の自分の記録をリアルタイム監視・同期
  useEffect(() => {
    const unsubMyRecord = subscribeToMyScoreAttackRecord((rec) => {
      if (rec) {
        setFbMyRecord(prev => {
          if (!prev) return rec;
          return {
            ...rec,
            allTimeScore: Math.max(prev.allTimeScore || 0, rec.allTimeScore || 0),
            score: Math.max(prev.score || 0, rec.score || 0),
          };
        });
      }
    });

    if (syncScoreAttackWithFirebase) {
      syncScoreAttackWithFirebase().catch(console.warn);
    }

    // 初回マウント時にも即座にfetchMyScoreAttackRecordを実行
    fetchMyScoreAttackRecord().then(rec => {
      if (rec) {
        setFbMyRecord(prev => {
          if (!prev) return rec;
          return {
            ...rec,
            allTimeScore: Math.max(prev.allTimeScore || 0, rec.allTimeScore || 0),
            score: Math.max(prev.score || 0, rec.score || 0),
          };
        });
      }
    }).catch(console.warn);

    return () => {
      unsubMyRecord();
    };
  }, [syncScoreAttackWithFirebase]);

  // Sync high score to Firebase on component mount if high score > 0
  useEffect(() => {
    if (playerHighScore > 0 || playerAllTimeHighScore > 0) {
      saveScoreAttackToFirebase(
        playerHighScore,
        selectedTitle,
        team,
        scoreAttackHighScoreTimeLimit || 60,
        playerAllTimeHighScore,
        effectiveAllTimeLimit
      ).catch((err) => {
        console.warn('Initial score sync failed:', err);
      });
    }
  }, [playerHighScore, selectedTitle, team, scoreAttackHighScoreTimeLimit, playerAllTimeHighScore, effectiveAllTimeLimit]);

  // Subscribe to real-time online leaderboard from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToOnlineLeaderboard((entries) => {
      setOnlineEntries(entries);
      setIsFirebaseConnected(true);

      const myUid = getPlayerUserId();
      const myDisplayName = getPlayerDisplayName();
      const myOnline = entries.find(e => e.userId === myUid || (myDisplayName && e.playerName === myDisplayName));
      if (myOnline) {
        setFbMyRecord(prev => {
          if (!prev) return myOnline;
          return {
            ...prev,
            allTimeScore: Math.max(prev.allTimeScore || 0, myOnline.allTimeScore || 0, myOnline.score || 0),
            score: Math.max(prev.score || 0, myOnline.score || 0),
            allTimeLimit: myOnline.allTimeLimit || prev.allTimeLimit || 60,
          };
        });
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const myUid = getPlayerUserId();

  // Combine online records with default boss records and current player
  // rankingTab ('weekly' vs 'allTime') に応じてスコアと設定時間を適切に切り替えてランキング構築
  // 歴代最高スコアランキングにはボットを入れず、実際のプレイヤーのみで構成
  const leaderboardList: OnlineLeaderboardEntry[] = React.useMemo(() => {
    const listMap = new Map<string, OnlineLeaderboardEntry>();

    // 今週のランキングの場合のみ、ベンチマークとしてボット（ボスライバル）を含める
    if (rankingTab === 'weekly') {
      DEFAULT_BOSS_RIVALS.forEach((r) => {
        const scoreVal = r.score;
        const timeVal = r.timeLimit || 60;
        listMap.set(r.userId, {
          ...r,
          score: scoreVal,
          timeLimit: timeVal,
          isPlayer: false
        });
      });
    }

    // Overlay real player records from Firebase
    onlineEntries.forEach((r) => {
      // 歴代最高ランキングの場合はボット（boss_で始まるIDまたはisPlayer===false）を除外
      if (rankingTab === 'allTime' && (r.userId.startsWith('boss_') || r.isPlayer === false)) {
        return;
      }

      const scoreVal = rankingTab === 'weekly' ? r.score : (r.allTimeScore || r.score);
      const timeVal = rankingTab === 'weekly' ? (r.timeLimit || 60) : (r.allTimeLimit || r.timeLimit || 60);
      listMap.set(r.userId, {
        ...r,
        score: scoreVal,
        timeLimit: timeVal,
        isPlayer: r.userId === myUid
      });
    });

    // Ensure current player is inserted
    const myCurrentScore = rankingTab === 'weekly' ? playerHighScore : playerAllTimeHighScore;
    const myCurrentTime = rankingTab === 'weekly'
      ? (scoreAttackHighScoreTimeLimit || 60)
      : (allTimeScoreAttackTimeLimit || scoreAttackHighScoreTimeLimit || 60);

    const myCurrentEntry: OnlineLeaderboardEntry = {
      userId: myUid,
      playerName: playerName || 'あなた',
      title: selectedTitle,
      score: myCurrentScore,
      timeLimit: myCurrentTime,
      allTimeScore: playerAllTimeHighScore,
      allTimeLimit: allTimeScoreAttackTimeLimit || 60,
      team,
      updatedAt: new Date().toISOString(),
      isPlayer: true
    };
    listMap.set(myUid, myCurrentEntry);

    // Convert to array and sort descending by score
    return Array.from(listMap.values()).sort((a, b) => b.score - a.score);
  }, [
    onlineEntries,
    myUid,
    playerName,
    selectedTitle,
    playerHighScore,
    playerAllTimeHighScore,
    scoreAttackHighScoreTimeLimit,
    allTimeScoreAttackTimeLimit,
    team,
    rankingTab
  ]);

  const playerRank = leaderboardList.findIndex((x) => x.isPlayer) + 1;

  // Calculate tier
  let tierName = '未参戦';
  let tierColor = '#888';

  if (playerHighScore > 0) {
    if (playerRank === 1) {
      tierName = '神覇者 (Tier ZZZ)';
      tierColor = '#f59e0b';
    } else if (playerRank <= 3) {
      tierName = '超神エリート (Tier ZZ)';
      tierColor = '#ef4444';
    } else if (playerRank <= 5) {
      tierName = '超マスター (Tier Z)';
      tierColor = '#a855f7';
    } else if (playerRank <= 8) {
      tierName = 'エキスパート (Tier SSS)';
      tierColor = '#3b82f6';
    } else if (playerRank <= 10) {
      tierName = 'チャレンジャー (Tier SS)';
      tierColor = '#10b981';
    } else {
      tierName = '一般挑戦者';
      tierColor = '#94a3b8';
    }
  }

  const handleClaimSundayWeeklyRewards = () => {
    if (hasClaimedThisWeek || playerHighScore <= 0) return;
    claimWeeklyReward(currentWeekKey);

    if (playerRank === 1) {
      addYPoints(10000);
      if (addItem) {
        addItem('godAscensionStone', 2);
        addItem('godSkillBook', 5);
        addItem('superLimitBreakBook', 3);
      }
      setClaimedRewardMessage(`👑【全国第1位 確定！】最高峰報酬を獲得！\n・💎 神昇の秘石 x2\n・Yポイント x10,000\n・神ひっさつの秘伝書 x5\n・超限界突破の書 x3\n※今週の報酬受取を完了しました！`);
    } else if (playerRank <= 3) {
      addYPoints(5000);
      if (addItem) {
        addItem('godAscensionStone', 1);
        addItem('godSkillBook', 3);
        addItem('superLimitBreakBook', 1);
      }
      setClaimedRewardMessage(`🥈【第${playerRank}位 確定！】超神エリート報酬を獲得！\n・💎 神昇の秘石 x1\n・Yポイント x5,000\n・神ひっさつの秘伝書 x3\n・超限界突破の書 x1\n※今週の報酬受取を完了しました！`);
    } else if (playerRank <= 5) {
      addYPoints(3000);
      if (addItem) {
        addItem('godAscensionStone', 1);
        addItem('skillBook', 3);
      }
      setClaimedRewardMessage(`🏅【第${playerRank}位 確定！】上位入賞報酬を獲得！\n・💎 神昇の秘石 x1\n・Yポイント x3,000\n・ひっさつの秘伝書 x3\n※今週の報酬受取を完了しました！`);
    } else if (playerRank <= 8) {
      addYPoints(1500);
      if (addItem) addItem('skillBook', 2);
      setClaimedRewardMessage(`🏅【第${playerRank}位 確定！】ランキング入賞報酬を獲得！\n・Yポイント x1,500\n・ひっさつの秘伝書 x2\n※今週の報酬受取を完了しました！`);
    } else {
      addYPoints(800);
      if (addItem) addItem('skillBook', 1);
      setClaimedRewardMessage(`🏅【第${playerRank}位 確定！】参加報酬を獲得！\n・Yポイント x800\n・ひっさつの秘伝書 x1\n※今週の報酬受取を完了しました！`);
    }
  };

  const handleClaimMilestone = (scoreReq: string) => {
    if (!claimScoreMilestone) return;
    const res = claimScoreMilestone(scoreReq);
    if (res.success) {
      setClaimedRewardMessage(res.message);
    }
  };

  const handleSavePlayerName = () => {
    const trimmed = editNameInput.trim();
    if (trimmed) {
      setPlayerDisplayName(trimmed);
      setPlayerNameState(trimmed);
      saveScoreAttackToFirebase(playerHighScore, selectedTitle, team);
    }
    setShowNameModal(false);
  };

  const handleSelectRival = (entry: OnlineLeaderboardEntry) => {
    if (entry.isPlayer) return;
    setSelectedRival(entry);
    sessionStorage.setItem('activeScoreAttackRival', JSON.stringify(entry));
  };

  const handleClearRival = () => {
    setSelectedRival(null);
    sessionStorage.removeItem('activeScoreAttackRival');
  };

  const handleRandomRival = () => {
    const candidates = leaderboardList.filter((x) => !x.isPlayer);
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      handleSelectRival(chosen);
    }
  };

  const [timeCostError, setTimeCostError] = useState<string | null>(null);

  const handleStartBattle = () => {
    // タイム設定に応じたワイポ消費チェック (1秒増減 = 10ワイポ)
    if (requiredYPoints > 0) {
      if ((yPoints || 0) < requiredYPoints) {
        setTimeCostError(`制限時間を${configuredTime}秒にするには ${requiredYPoints.toLocaleString()} Ypt が必要です！(所持: ${(yPoints || 0).toLocaleString()} Ypt)`);
        return;
      }
      addYPoints(-requiredYPoints);
    }
    setTimeCostError(null);

    // 設定時間を localStorage と Context に保存
    localStorage.setItem('score_attack_custom_time', configuredTime.toString());
    if (setScoreAttackConfiguredTime) {
      setScoreAttackConfiguredTime(configuredTime);
    }

    if (selectedRival) {
      sessionStorage.setItem('activeScoreAttackRival', JSON.stringify(selectedRival));
    } else {
      sessionStorage.removeItem('activeScoreAttackRival');
    }
    navigate('/game/score_attack');
  };

  return (
    <div
      className="view-container"
      style={{
        padding: '16px 16px 140px 16px',
        background: 'linear-gradient(180deg, #181534 0%, #080612 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        overflowY: 'auto'
      }}
    >
      {/* Header with clear Home / Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '8px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 800
            }}
          >
            <Home size={18} color="#ffd700" /> ホーム
          </button>
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '0.03em',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trophy size={20} color="#ffd700" /> スコアアタック (PvP対戦)
          </h1>
        </div>

        {/* Reward List Button */}
        <button
          onClick={() => setShowRewardsModal(true)}
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            border: 'none',
            borderRadius: '12px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 'bold',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(168,85,247,0.3)'
          }}
        >
          <Gift size={15} /> 報酬一覧
        </button>
      </div>

      {/* Online Status & Player Nickname Bar */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '8px 12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isFirebaseConnected ? '#22c55e' : '#eab308',
              boxShadow: isFirebaseConnected ? '0 0 8px #22c55e' : '0 0 8px #eab308'
            }}
          />
          <span style={{ color: isFirebaseConnected ? '#86efac' : '#fde047', fontWeight: 700 }}>
            {isFirebaseConnected ? 'Firebaseオンライン対戦 接続中' : '同期接続中...'}
          </span>
          <button
            onClick={handleManualSyncFirebase}
            disabled={isSyncingFirebase}
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              color: '#93c5fd',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Firebaseから最新スコアを再取得"
          >
            <RefreshCw size={11} className={isSyncingFirebase ? 'animate-spin' : ''} />
            {isSyncingFirebase ? '取得中...' : 'FB同期'}
          </button>
        </div>

        <button
          onClick={() => {
            setEditNameInput(playerName);
            setShowNameModal(true);
          }}
          style={{
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.4)',
            color: '#fef08a',
            padding: '4px 10px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.72rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Edit3 size={13} /> {playerName}
        </button>
      </div>

      {/* Main Scoring Card: 今週と歴代最高スコアのハイブリッド表示 */}
      <div
        className="glass-panel"
        style={{
          background: rankingTab === 'allTime' ? 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 12, 30, 0.6) 100%)' : 'rgba(0, 0, 0, 0.45)',
          border: rankingTab === 'allTime' ? '2px solid #ec4899' : '2px solid #eab308',
          borderRadius: '18px',
          padding: '14px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '12px',
          boxShadow: rankingTab === 'allTime' ? '0 8px 24px rgba(236, 72, 153, 0.25)' : '0 8px 24px rgba(234, 179, 8, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', color: rankingTab === 'allTime' ? '#f472b6' : '#a1a1aa', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {rankingTab === 'allTime' ? '👑 ALL-TIME BEST SCORE (歴代最高スコア)' : '📅 WEEKLY HIGH SCORE (今週の最高記録)'}
        </div>
        
        {/* メイン表示スコア */}
        <div
          style={{
            fontSize: '1.75rem',
            fontWeight: 950,
            color: rankingTab === 'allTime' ? '#f472b6' : '#00ffcc',
            fontFamily: 'monospace',
            textShadow: rankingTab === 'allTime' ? '0 0 14px rgba(236, 72, 153, 0.6)' : '0 0 12px rgba(0,255,200,0.4)',
            margin: '2px 0',
            wordBreak: 'break-all'
          }}
        >
          {formatLargeScore(rankingTab === 'allTime' ? playerAllTimeHighScore : playerHighScore)}
        </div>
        
        {((rankingTab === 'allTime' ? playerAllTimeHighScore : playerHighScore) > 0) && (
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginBottom: '6px' }}>
            ({(rankingTab === 'allTime' ? playerAllTimeHighScore : playerHighScore).toLocaleString()} pt)
          </div>
        )}

        {/* サブスコア表示（歴代と今週の両方を常に確認可能） */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            margin: '6px 0 8px 0',
            padding: '4px 10px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '10px',
            fontSize: '0.72rem'
          }}
        >
          <div style={{ color: '#9ca3af' }}>
            今週: <span style={{ color: '#00ffcc', fontWeight: 'bold' }}>{formatLargeScore(playerHighScore)}</span>
          </div>
          <div style={{ width: '1px', height: '10px', background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ color: '#9ca3af' }}>
            👑 歴代最高: <span style={{ color: '#f472b6', fontWeight: 'bold' }}>{formatLargeScore(playerAllTimeHighScore)}</span>
          </div>
        </div>

        {(playerHighScore > 0 || playerAllTimeHighScore > 0) ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.06)',
              padding: '5px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <span style={{ fontSize: '0.78rem', color: '#aaa' }}>{rankingTab === 'allTime' ? '歴代順位:' : '今週順位:'}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 900, color: tierColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Award size={15} /> {playerRank}位 / {tierName}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 'bold' }}>
            ⚠️ まだスコアタに参戦していません (プレイするとオンライン登録されます)
          </div>
        )}
      </div>

      {/* 🌟 100京突破報酬: UZ+++ 神創絶神・天照極エンマ王 案内バナー */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(147, 51, 234, 0.25) 100%)',
          border: '1.5px solid #ffd700',
          borderRadius: '16px',
          padding: '10px 14px',
          marginBottom: '12px',
          boxShadow: '0 4px 16px rgba(255, 215, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 0 10px #ffd700',
              flexShrink: 0
            }}
          >
            👑
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.68rem', color: '#fde047', fontWeight: 900 }}>
              【スコアタ100京pt突破で即時解放！】
            </div>
            <div style={{ fontSize: '0.86rem', fontWeight: 950, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🌟 UZ+++ 神創絶神・天照極エンマ王UZ+++
            </div>
            <div style={{ fontSize: '0.66rem', color: '#fbcfe8', fontWeight: 700 }}>
              全スキル1000倍・最強全能神 / 称号「百京神話の創世神」
            </div>
          </div>
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            padding: '4px 8px',
            borderRadius: '10px',
            background: playerHighScore >= 1e18 ? '#22c55e' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            fontWeight: 900,
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          {playerHighScore >= 1e18 ? '✅ 獲得済' : '目標: 100京pt'}
        </div>
      </div>

      {/* Rival Challenger HUD / Selection Banner */}
      {selectedRival ? (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.25) 0%, rgba(147, 51, 234, 0.3) 100%)',
            border: '2px solid #f87171',
            borderRadius: '16px',
            padding: '12px 14px',
            marginBottom: '12px',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 10px #f87171',
                flexShrink: 0
              }}
            >
              <Swords size={20} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={12} /> リアルタイム対戦相手 (ライバル指名中)
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedRival.playerName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#fde047', fontFamily: 'monospace', fontWeight: 800 }}>
                目標: {formatLargeScore(selectedRival.score)} ({selectedRival.score.toLocaleString()} pt)
              </div>
            </div>
          </div>

          <button
            onClick={handleClearRival}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            対戦解除
          </button>
        </div>
      ) : (
        <div
          style={{
            background: 'rgba(124, 58, 237, 0.15)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '14px',
            padding: '10px 14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Swords size={18} color="#c084fc" />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#e9d5ff' }}>
                ⚔️ プレイヤー対戦モード対応！
              </div>
              <div style={{ fontSize: '0.68rem', color: '#c4b5fd' }}>
                ランキングの他プレイヤーを指名してスコアバトル！
              </div>
            </div>
          </div>
          <button
            onClick={handleRandomRival}
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              border: 'none',
              color: '#fff',
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(147, 51, 234, 0.4)'
            }}
          >
            <RefreshCw size={12} /> ランダム指名
          </button>
        </div>
      )}

      {/* Leaderboard Mode Switcher: 今週のランキング / 歴代さいこうスコア */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <button
          onClick={() => setRankingTab('weekly')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '12px',
            border: rankingTab === 'weekly' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)',
            background: rankingTab === 'weekly' ? 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: rankingTab === 'weekly' ? '0 0 12px rgba(251, 191, 36, 0.4)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          📅 今週のランキング
        </button>

        <button
          onClick={() => setRankingTab('allTime')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '12px',
            border: rankingTab === 'allTime' ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.15)',
            background: rankingTab === 'allTime' ? 'linear-gradient(135deg, #be185d 0%, #831843 100%)' : 'rgba(255,255,255,0.05)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: rankingTab === 'allTime' ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'none',
            transition: 'all 0.15s'
          }}
        >
          👑 歴代さいこうスコア
        </button>
      </div>

      {/* Leaderboard Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 6px 4px' }}>
        <h2 style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f3f4f6', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Trophy size={16} color={rankingTab === 'allTime' ? '#ec4899' : '#fbbf24'} />
          {rankingTab === 'allTime' ? '👑 歴代さいこうスコアランキング' : '📅 今週の全国プレイヤーランキング'}
        </h2>
        <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>タップでライバル対戦</span>
      </div>
      {rankingTab === 'allTime' && (
        <div style={{ fontSize: '0.66rem', color: '#f472b6', fontWeight: 800, margin: '0 4px 8px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          🛡️ ボット除外・本物のプレイヤー同士による歴代最高峰の殿堂ランキング
        </div>
      )}

      {/* Expanded Leaderboard Box */}
      <div
        style={{
          background: 'rgba(15, 12, 30, 0.85)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '16px',
          padding: '8px',
          flex: '1 1 auto',
          minHeight: '180px',
          marginBottom: '12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {leaderboardList.map((user, idx) => {
          const rank = idx + 1;
          const isMe = user.isPlayer;
          const isSelectedTarget = selectedRival?.userId === user.userId;

          let rankBg = isMe
            ? 'linear-gradient(90deg, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0.08) 100%)'
            : 'rgba(255,255,255,0.02)';

          if (isSelectedTarget) {
            rankBg = 'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(147, 51, 234, 0.2) 100%)';
          } else if (rank === 1 && !isMe) {
            rankBg = 'linear-gradient(90deg, rgba(245,158,11,0.2) 0%, rgba(255,215,0,0.05) 100%)';
          }

          let medalEmoji = '';
          if (rank === 1) medalEmoji = '🥇';
          else if (rank === 2) medalEmoji = '🥈';
          else if (rank === 3) medalEmoji = '🥉';

          return (
            <div
              key={user.userId + idx}
              onClick={() => {
                if (!isMe) handleSelectRival(user);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '14px',
                background: rankBg,
                border: isSelectedTarget
                  ? '2px solid #ef4444'
                  : isMe
                  ? '1.5px solid #eab308'
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isSelectedTarget ? '0 0 12px rgba(239, 68, 68, 0.4)' : isMe ? '0 0 10px rgba(234, 179, 8, 0.3)' : 'none',
                cursor: isMe ? 'default' : 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {/* 上段：順位 + アバター + プレイヤー名・称号 + タイム設定バッジ + 対戦ボタン */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 900,
                      width: '26px',
                      textAlign: 'center',
                      color: rank <= 3 ? '#fbbf24' : '#9ca3af',
                      flexShrink: 0
                    }}
                  >
                    {medalEmoji || `${rank}`}
                  </span>

                  {/* Team Avatars Preview if available */}
                  {user.team && user.team.length > 0 && (
                    <div style={{ display: 'flex', gap: '-6px', flexShrink: 0 }}>
                      {user.team.slice(0, 3).map((cId, i) => {
                        const charObj = CHARACTERS.find((c) => c.id === cId);
                        return charObj ? (
                          <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: '1px solid #777' }}>
                            <CharacterAvatar character={charObj} size={24} />
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* プレイヤー名と称号（横幅を十分確保し絶対に縦潰れさせない） */}
                  <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        overflow: 'hidden'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.88rem',
                          fontWeight: isMe ? 950 : 800,
                          color: isMe ? '#fbbf24' : '#ffffff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {user.playerName}
                      </span>
                      {isMe && (
                        <span
                          style={{
                            fontSize: '0.6rem',
                            background: '#eab308',
                            color: '#000',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 900,
                            flexShrink: 0
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.64rem',
                        color: rank <= 3 ? '#fef08a' : '#9ca3af',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {user.title || '一般妖怪'}
                    </div>
                  </div>
                </div>

                {/* 右側：タイム設定バッジ & 対戦ボタン */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <div
                    style={{
                      background: 'rgba(56, 189, 248, 0.18)',
                      border: '1px solid rgba(56, 189, 248, 0.5)',
                      color: '#38bdf8',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace'
                    }}
                    title="スコアタ設定タイム"
                  >
                    ⏱️ {user.timeLimit || 60}秒
                  </div>

                  {!isMe && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRival(user);
                      }}
                      style={{
                        background: isSelectedTarget ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        border: isSelectedTarget ? 'none' : '1px solid rgba(255,255,255,0.25)',
                        color: '#ffffff',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {isSelectedTarget ? '対戦中' : '⚔️ 対戦'}
                    </button>
                  )}
                </div>
              </div>

              {/* 下段：スコア表示バー（余裕を持ってスコアを大きく表示） */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.25)',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}
              >
                <span style={{ fontSize: '0.66rem', color: '#94a3af', fontWeight: 'bold' }}>
                  {rankingTab === 'allTime' ? '👑 歴代最高スコア' : '獲得スコア'}
                </span>
                <div style={{ textAlign: 'right', fontFamily: 'monospace', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '0.98rem', fontWeight: 950, color: isMe ? '#00ffcc' : rank <= 3 ? '#fef08a' : '#f1f5f9' }}>
                    {formatLargeScore(user.score)}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: '#94a3af' }}>
                    ({user.score.toLocaleString()} pt)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules Accordion Block */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '8px 12px',
          marginBottom: '10px'
        }}
      >
        <button
          onClick={() => setShowRules(!showRules)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#fbbf24',
            fontSize: '0.78rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} /> スコアアタック・プレイヤー対戦の仕様
          </span>
          {showRules ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {showRules && (
          <ul
            style={{
              fontSize: '0.72rem',
              color: '#d1d5db',
              paddingLeft: '16px',
              margin: '8px 0 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <li>制限時間は<strong>60秒</strong>！</li>
            <li>ボスは<strong>無限HP</strong>。削ったダメージがそのままスコアになります。</li>
            <li><strong>全国プレイヤー対戦</strong>：指名したライバルのスコアを上回ると<strong>撃破ボーナス（+500 Ypt）</strong>を獲得！</li>
            <li>スコア結果は自動的にFirebaseに登録され、全国ランキングに反映されます。</li>
          </ul>
        )}
      </div>

      {/* Weekly Sunday Rewards Claim Button */}
      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={handleClaimSundayWeeklyRewards}
          disabled={hasClaimedThisWeek || playerHighScore <= 0}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '12px',
            border: hasClaimedThisWeek ? '1px solid #475569' : '1.5px solid #ffd700',
            background: hasClaimedThisWeek
              ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
              : playerHighScore <= 0
              ? '#475569'
              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: hasClaimedThisWeek ? '#94a3b8' : '#ffffff',
            fontWeight: 900,
            fontSize: '0.78rem',
            cursor: hasClaimedThisWeek || playerHighScore <= 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: hasClaimedThisWeek ? 'none' : '0 4px 12px rgba(245, 158, 11, 0.4)',
            opacity: hasClaimedThisWeek || playerHighScore <= 0 ? 0.8 : 1
          }}
        >
          <Gift size={15} />
          {hasClaimedThisWeek
            ? '✅ 今週のランキング報酬は受取済みです'
            : playerHighScore <= 0
            ? '※スコアタ未プレイ (プレイ後に受取可)'
            : '☀️ 毎週日曜日！ランキング集計＆報酬を受け取る！(週1回)'}
        </button>
      </div>

      {/* ⏱️ スコアタ 制限時間設定パネル (1秒増減 = 10ワイポ) */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '2px solid rgba(234, 179, 8, 0.4)',
          borderRadius: '16px',
          padding: '12px 14px',
          marginBottom: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 900, color: '#fbbf24' }}>
            <span>⏱️ スコアタ 制限時間設定</span>
            <span style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 'normal' }}>
              （1秒変更 = 10ワイポ）
            </span>
          </div>
          <button
            onClick={handleResetTime}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#94a3b8',
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            基準(60秒)に戻す
          </button>
        </div>

        {/* タイム増減コントロール (1秒単位 & 10秒単位) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '8px 0' }}>
          <button
            onClick={() => handleAdjustTime(-10)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.5)',
              color: '#fca5a5',
              padding: '6px 8px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            -10秒
          </button>
          <button
            onClick={() => handleAdjustTime(-1)}
            style={{
              background: 'rgba(239, 68, 68, 0.25)',
              border: '1px solid rgba(239, 68, 68, 0.6)',
              color: '#ef4444',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            -1秒
          </button>

          <div
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '6px 14px',
              textAlign: 'center',
              minWidth: '100px'
            }}
          >
            <div style={{ fontSize: '1.35rem', fontWeight: 950, color: '#fef08a', fontFamily: 'monospace' }}>
              {configuredTime} <span style={{ fontSize: '0.8rem' }}>秒</span>
            </div>
            {configuredTime !== 60 && (
              <div style={{ fontSize: '0.62rem', color: configuredTime > 60 ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                {configuredTime > 60 ? `+${configuredTime - 60}秒延長` : `${configuredTime - 60}秒短縮`}
              </div>
            )}
          </div>

          <button
            onClick={() => handleAdjustTime(1)}
            style={{
              background: 'rgba(34, 197, 94, 0.25)',
              border: '1px solid rgba(34, 197, 94, 0.6)',
              color: '#22c55e',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            +1秒
          </button>
          <button
            onClick={() => handleAdjustTime(10)}
            style={{
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.5)',
              color: '#86efac',
              padding: '6px 8px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            +10秒
          </button>
        </div>

        {/* コスト情報バー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.74rem'
          }}
        >
          <div>
            <span style={{ color: '#94a3b8' }}>出撃時消費: </span>
            <span style={{ color: requiredYPoints > 0 ? '#facc15' : '#4ade80', fontWeight: 900 }}>
              {requiredYPoints > 0 ? `${requiredYPoints.toLocaleString()} Ypt (${timeDifference}秒 × 10)` : '0 Ypt (無料)'}
            </span>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>所持: </span>
            <span style={{ color: (yPoints || 0) >= requiredYPoints ? '#38bdf8' : '#ef4444', fontWeight: 900 }}>
              {(yPoints || 0).toLocaleString()} Ypt
            </span>
          </div>
        </div>

        {timeCostError && (
          <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#f87171', fontWeight: 'bold', textAlign: 'center' }}>
            ⚠️ {timeCostError}
          </div>
        )}
      </div>

      {/* Launch Battle Button */}
      <button
        onClick={handleStartBattle}
        style={{
          width: '100%',
          background: selectedRival
            ? 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)'
            : 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
          border: 'none',
          borderRadius: '16px',
          padding: '14px',
          fontWeight: 950,
          fontSize: '1.02rem',
          color: selectedRival ? '#ffffff' : '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: selectedRival ? '0 4px 20px rgba(220, 38, 38, 0.5)' : '0 4px 20px rgba(234,179,8,0.35)',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        {selectedRival ? <Swords size={20} color="#fff" /> : <Play size={20} fill="#000" />}
        {selectedRival ? `⚔️ 【${selectedRival.playerName}】と対戦開始！` : '出撃！スコアタ特設ステージ'}
      </button>

      {/* Mobile Scroll Buffer Spacer (拡大率の大きなスマホでも出撃ボタンが隠れないよう十分な余白を確保) */}
      <div style={{ height: '140px', minHeight: '140px', flexShrink: 0 }} />

      {/* Edit Player Name Modal */}
      {showNameModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1f1a3a 0%, #0d0a1a 100%)',
              border: '2px solid #ffd700',
              borderRadius: '20px',
              padding: '20px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 0 25px rgba(255, 215, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffd700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit3 size={18} /> プレイヤー名変更
            </div>
            <div style={{ fontSize: '0.78rem', color: '#ccc' }}>
              全国ランキングで他のプレイヤーに表示される名前を設定します。
            </div>

            <input
              type="text"
              value={editNameInput}
              onChange={(e) => setEditNameInput(e.target.value)}
              maxLength={20}
              placeholder="プレイヤー名を入力"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid #a855f7',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 800,
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowNameModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleSavePlayerName}
                style={{
                  flex: 1.2,
                  padding: '10px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                決定・保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #1f1a3a 0%, #0d0a1a 100%)',
              border: '2px solid #a855f7',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(168,85,247,0.4)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(168,85,247,0.15)'
              }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fef08a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Gift size={20} color="#a855f7" /> スコアタ報酬一覧
              </div>
              <button
                onClick={() => setShowRewardsModal(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
              <button
                onClick={() => setRewardTab('rank')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: rewardTab === 'rank' ? 'rgba(168,85,247,0.25)' : 'transparent',
                  border: 'none',
                  borderBottom: rewardTab === 'rank' ? '2px solid #a855f7' : '2px solid transparent',
                  color: rewardTab === 'rank' ? '#fff' : '#9ca3af',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                👑 ランキング順位報酬
              </button>
              <button
                onClick={() => setRewardTab('score')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: rewardTab === 'score' ? 'rgba(168,85,247,0.25)' : 'transparent',
                  border: 'none',
                  borderBottom: rewardTab === 'score' ? '2px solid #a855f7' : '2px solid transparent',
                  color: rewardTab === 'score' ? '#fff' : '#9ca3af',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🎯 スコア達成報酬
              </button>
            </div>

            {/* Modal Content List */}
            <div style={{ padding: '14px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {rewardTab === 'rank'
                ? RANK_REWARDS.map((info, index) => (
                    <div
                      key={index}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '10px 12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#fff' }}>{info.rankRange}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 900,
                            color: info.badgeColor,
                            background: 'rgba(0,0,0,0.4)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            border: `1px solid ${info.badgeColor}`
                          }}
                        >
                          {info.tierName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {info.rewards.map((r, rIdx) => (
                          <span
                            key={rIdx}
                            style={{
                              fontSize: '0.75rem',
                              color: '#e2e8f0',
                              background: 'rgba(168,85,247,0.15)',
                              border: '1px solid rgba(168,85,247,0.3)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 600
                            }}
                          >
                            🎁 {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                : SCORE_MILESTONE_REWARDS.map((info, index) => {
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
                    const targetScore = reqValues[info.scoreReq] || 0;
                    const isReached = playerHighScore >= targetScore;
                    const isClaimed = scoreAttackClaimedMilestones.includes(info.scoreReq);

                    return (
                      <div
                        key={index}
                        style={{
                          background: isClaimed
                            ? 'rgba(255,255,255,0.02)'
                            : isReached
                            ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(147, 51, 234, 0.15) 100%)'
                            : 'rgba(255,255,255,0.04)',
                          border: isReached && !isClaimed ? '1.5px solid #ffd700' : '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: isReached ? '#fde047' : '#94a3b8' }}>
                              {info.scoreReq} 達成
                            </span>
                            {isReached && !isClaimed && (
                              <span style={{ fontSize: '0.65rem', background: '#ffd700', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 900 }}>
                                達成済！
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                            {info.rewards.map((r, rIdx) => (
                              <span
                                key={rIdx}
                                style={{
                                  fontSize: '0.72rem',
                                  color: r.includes('神昇の秘石') ? '#fef08a' : '#e2e8f0',
                                  background: r.includes('神昇の秘石') ? 'rgba(234, 179, 8, 0.25)' : 'rgba(59,130,246,0.15)',
                                  border: r.includes('神昇の秘石') ? '1px solid #ffd700' : '1px solid rgba(59,130,246,0.3)',
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  fontWeight: 600
                                }}
                              >
                                {r.includes('神昇の秘石') ? '💎 ' : '✨ '}{r}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          {isClaimed ? (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}>
                              受取済
                            </span>
                          ) : isReached ? (
                            <button
                              onClick={() => handleClaimMilestone(info.scoreReq)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
                                border: 'none',
                                color: '#000000',
                                fontWeight: 900,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(234, 179, 8, 0.4)'
                              }}
                            >
                              受取！
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                              未達成
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '12px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setShowRewardsModal(false)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claimed Reward Result Modal */}
      {claimedRewardMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
              border: '2px solid #ffd700',
              borderRadius: '24px',
              padding: '24px',
              maxWidth: '380px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffd700' }}>
              🎉 週間ランキング結果確定！
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: '#ffffff',
                whiteSpace: 'pre-line',
                textAlign: 'left',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                lineHeight: 1.6
              }}
            >
              {claimedRewardMessage}
            </div>
            <button
              onClick={() => setClaimedRewardMessage(null)}
              style={{
                padding: '12px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              受け取りを完了する
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreAttack;
