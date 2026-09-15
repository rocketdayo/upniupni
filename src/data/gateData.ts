export interface GateRoom {
  id: string;
  name: string;
  type: 'normal' | 'reward' | 'boss';
  roomType?: 'normal' | 'reward' | 'boss';
  title: string;
  description: string;
  color: string;
  bgGradient: string;
  emoji: string;
  totalWaves: number;
  enemyNames: string[];
  enemyEmojis: string[];
  baseHp: number;
  baseAtk: number;
  rewardYp: number;
  bonusDrops?: { name: string; count: number; icon: string }[];
}

export interface GateLevelInfo {
  key?: string;
  level: number;
  roomType: 'normal' | 'reward' | 'boss';
  name: string;
  bossName: string;
  bossEmoji: string;
  rewardYPoints: number;
  specialReward?: {
    name: string;
    icon: string;
    description: string;
    charId?: string;
  };
}

export const getGateRoomTotalWaves = (roomType: 'normal' | 'reward' | 'boss', level: number): number => {
  if (roomType === 'boss') return 1; // 邪神の間は常に1ウェーブ
  if (roomType === 'reward') return 2; // ごほうびの間は常に2ウェーブ
  // 通常の間: Lv.1~20は1ウェーブ、Lv.21~40は2ウェーブ、Lv.41以上は3ウェーブ
  if (level <= 20) return 1;
  if (level <= 40) return 2;
  return 3;
};

export const GATE_ROOM_TYPES: GateRoom[] = [
  {
    id: 'room_normal',
    name: '通常の間',
    type: 'normal',
    roomType: 'normal',
    title: '異次元の迷宮',
    description: '基本の間。Lv1~20は1階層、Lv21~40は2階層！クリアで「邪神の間(35%)」「ご褒美の間(10%)」確率開放！',
    color: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    emoji: '🌀',
    totalWaves: 1, // 動的取得されるため代表値
    enemyNames: ['あまのじゃく', 'かげむら', 'ジバニャン(影)'],
    enemyEmojis: ['👺', '👤', '🐱'],
    baseHp: 16000,
    baseAtk: 120,
    rewardYp: 15,
  },
  {
    id: 'room_reward',
    name: 'ごほうびの間',
    type: 'reward',
    roomType: 'reward',
    title: '黄金の財宝空間',
    description: '【出現率10%】常に2階層！Ypt・ひっさつの秘伝書・超けいけんちだまが手に入る最大級ボーナス空間！',
    color: '#eab308',
    bgGradient: 'linear-gradient(135deg, #854d0e 0%, #713f12 50%, #451a03 100%)',
    emoji: '✨',
    totalWaves: 2,
    enemyNames: ['ツチノコパンダ', '黄金ジバニャン'],
    enemyEmojis: ['🐼', '✨'],
    baseHp: 22000,
    baseAtk: 90,
    rewardYp: 150,
    bonusDrops: [
      { name: 'ひっさつの秘伝書', count: 1, icon: '📜' },
      { name: '超けいけんちだま', count: 3, icon: '🔮' }
    ]
  },
  {
    id: 'room_boss',
    name: '極・邪神の間',
    type: 'boss',
    roomType: 'boss',
    title: '最凶の異界決戦',
    description: '【出現率35%】常に1階層一発決戦！Lv5以降は超火力超HP（UZ+++必須級）の邪神が降臨！',
    color: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #581c87 0%, #3b0764 50%, #1e1b4b 100%)',
    emoji: '👑',
    totalWaves: 1,
    enemyNames: ['極・邪神ゲートマスター'],
    enemyEmojis: ['⚡'],
    baseHp: 65000,
    baseAtk: 350,
    rewardYp: 60,
    bonusDrops: [
      { name: '漢方（全回復）', count: 1, icon: '🧪' },
      { name: '超けいけんちだま', count: 2, icon: '🔮' }
    ]
  }
];

export const GATE_LEVEL_REWARDS: GateLevelInfo[] = [
  {
    key: 'normal_1',
    level: 1,
    roomType: 'normal',
    name: '通常Lv.1 制覇',
    bossName: '影ジバニャン',
    bossEmoji: '🐱',
    rewardYPoints: 100,
    specialReward: { name: '超けいけんちだま', icon: '🔮', description: '経験値超アップ' }
  },
  {
    key: 'normal_3',
    level: 3,
    roomType: 'normal',
    name: '通常Lv.3 制覇',
    bossName: '百鬼姫(黒炎)',
    bossEmoji: '👸',
    rewardYPoints: 200,
    specialReward: { name: '漢方 2個', icon: '🧪', description: 'ゲートHP完全回復' }
  },
  {
    key: 'normal_5',
    level: 5,
    roomType: 'normal',
    name: '通常Lv.5 制覇',
    bossName: '深淵の魔王',
    bossEmoji: '👹',
    rewardYPoints: 400,
    specialReward: { name: 'ひっさつの秘伝書', icon: '📜', description: '技Lvアップ秘伝書' }
  },
  {
    key: 'boss_1',
    level: 1,
    roomType: 'boss',
    name: '邪神の間Lv.1 制覇',
    bossName: '極オロチの幻影',
    bossEmoji: '🐉',
    rewardYPoints: 300,
    specialReward: { name: '神昇の秘石 1個', icon: '💎', description: '神昇の祭壇用・超超超激レア秘石！' }
  },
  {
    key: 'boss_3',
    level: 3,
    roomType: 'boss',
    name: '邪神の間Lv.3 制覇',
    bossName: '邪神クシナダ',
    bossEmoji: '🐍',
    rewardYPoints: 600,
    specialReward: { name: '漢方 3個', icon: '🧪', description: 'ゲートHP完全回復' }
  },
  {
    key: 'boss_5',
    level: 5,
    roomType: 'boss',
    name: '邪神の間Lv.5 制覇（UZ+++解禁級）',
    bossName: '極・覚醒エンマ',
    bossEmoji: '👑',
    rewardYPoints: 1500,
    specialReward: { name: '神昇の秘石 1個', icon: '💎', description: '神昇の祭壇用・超超超激レア秘石！' }
  },
  {
    key: 'boss_7',
    level: 7,
    roomType: 'boss',
    name: '邪神の間Lv.7 制覇（超絶難度）',
    bossName: '終焉の邪神クシナダ',
    bossEmoji: '🐍',
    rewardYPoints: 3000,
    specialReward: { name: 'ひっさつの秘伝書 3個', icon: '📜', description: '技Lv一括強化' }
  },
  {
    key: 'boss_10',
    level: 10,
    roomType: 'boss',
    name: '邪神の間Lv.10 完全制覇',
    bossName: '極・邪神ゲートマスター',
    bossEmoji: '⚡',
    rewardYPoints: 10000,
    specialReward: {
      name: 'ZZZランク【極・邪神オロチ】',
      icon: '👑',
      description: 'ゲート10レベル制覇の証！最強クラスの極キャラが仲間に！',
      charId: 'orochi_shin'
    }
  },
  {
    key: 'boss_20',
    level: 20,
    roomType: 'boss',
    name: '邪神の間Lv.20 深層突破',
    bossName: '【深層】極・邪神ゲートマスター',
    bossEmoji: '⚡',
    rewardYPoints: 20000,
    specialReward: { name: '神昇の秘石 2個', icon: '💎', description: '超希少秘石！' }
  },
  {
    key: 'boss_50',
    level: 50,
    roomType: 'boss',
    name: '邪神の間Lv.50 半ばの絶対者',
    bossName: '【覚醒深層】極・邪神ゲートマスター',
    bossEmoji: '⚡🔥',
    rewardYPoints: 50000,
    specialReward: { name: '漢方 10個', icon: '🧪', description: '深層パズル用大量全回復漢方！' }
  },
  {
    key: 'boss_100',
    level: 100,
    roomType: 'boss',
    name: '邪神の間Lv.100 頂点極限制覇',
    bossName: '【全能超越】極・邪神創世皇ゲートマスター',
    bossEmoji: '⚡🔥👑👿',
    rewardYPoints: 200000,
    specialReward: {
      name: 'UZ+++ランク【極・邪神創世皇ゲートマスター】',
      icon: '👑⚡',
      description: '邪神の間Lv.100極限制覇者のみが得られる最高峰UZ+++限定キャラ！',
      charId: 'char_uz_jashin_master'
    }
  }
];

export interface GateHelpFriend {
  id: string;
  name: string;
  avatar: string;
  rank: string;
  message: string;
  hasGiftedKampo: boolean;
}

export const GATE_FRIENDS: GateHelpFriend[] = [
  { id: 'f1', name: 'ケータ', avatar: '👦', rank: 'ZZZ', message: '漢方送るね！一緒にゲート制覇しよう！', hasGiftedKampo: false },
  { id: 'f2', name: 'フミちゃん', avatar: '👧', rank: 'UZ', message: '応援してるよ！ピンチの時は回復使ってね！', hasGiftedKampo: false },
  { id: 'f3', name: '黒崎一護', avatar: '⚔️', rank: 'UZ+++', message: 'オレの霊圧で漢方届けてやるぜ！邪神Lv5以上はUZ+++の出番だ！', hasGiftedKampo: false },
  { id: 'f4', name: 'エンマ大王', avatar: '👑', rank: 'ZZZ', message: '余からの恩恵だ。最後まで諦めるな！', hasGiftedKampo: false },
];

export interface Stage {
  id: string;
  name: string;
  enemyName: string;
  enemyHp: number;
  enemyAtk: number;
  enemyColor: string;
  enemyEmoji: string;
  rewardMoney: number;
  rewardYPoints: number;
  areaName?: string;
}

export const getGateStage = (stageId: string): Stage => {
  // format: gate_room_{type}_lv_{level}_wave_{wave}
  const parts = stageId.split('_');
  const type = (parts[2] as 'normal' | 'reward' | 'boss') || 'normal';
  const levelStr = parts[4] || '1';
  const waveStr = parts[6] || '1';
  const level = parseInt(levelStr, 10) || 1;
  const wave = parseInt(waveStr, 10) || 1;

  const totalWaves = getGateRoomTotalWaves(type, level);
  const room = GATE_ROOM_TYPES.find(r => r.type === type) || GATE_ROOM_TYPES[0];
  const waveIdx = Math.min(wave - 1, room.enemyNames.length - 1);
  let enemyName = room.enemyNames[waveIdx];
  let enemyEmoji = room.enemyEmojis[waveIdx];

  let hp = 0;
  let atk = 0;

  if (type === 'boss') {
    // ── 邪神の間：常に1ウェーブ一発決戦！Lv5からUZ+++推奨の高難度設計 ──
    const bossNames = [
      '極オロチの幻影',
      '邪神クシナダ',
      '覚醒エンマ(異次元)',
      '終焉の邪神',
      '極・邪神ゲートマスター(Lv5)',
      '極・邪神ゲートマスター(Lv6)',
      '極・邪神ゲートマスター(Lv7)',
      '極・邪神ゲートマスター(Lv8)',
      '極・邪神ゲートマスター(Lv9)',
      '真・極邪神ゲートマスター(Lv10)'
    ];
    const bossEmojis = ['🐉', '🐍', '👑', '👿', '⚡', '⚡', '⚡', '⚡', '⚡', '🔥⚡'];
    const idx = Math.min(level - 1, bossNames.length - 1);
    enemyName = bossNames[idx];
    enemyEmoji = bossEmojis[idx];

    if (level === 1) {
      hp = 150000;
      atk = 300;
    } else if (level === 2) {
      hp = 450000;
      atk = 480;
    } else if (level === 3) {
      hp = 1300000;
      atk = 720;
    } else if (level === 4) {
      hp = 5000000;
      atk = 1100;
    } else if (level === 5) {
      // 💥 Lv5: UZ+++がいないときつい超高HP（7,500万 HP）
      hp = 75000000;
      atk = 3200;
    } else if (level === 6) {
      hp = 200000000;
      atk = 4800;
    } else if (level === 7) {
      hp = 550000000;
      atk = 7200;
    } else if (level === 8) {
      hp = 1500000000;
      atk = 11000;
    } else if (level === 9) {
      hp = 3500000000;
      atk = 16000;
    } else if (level === 10) {
      hp = 10000000000; // 100億
      atk = 25000;
    } else if (level === 100) {
      // 💥💥 Lv.100 (MAX 頂点ボス): 【全能超越】極・邪神創世皇ゲートマスター
      enemyName = '【全能超越】極・邪神創世皇ゲートマスター(Lv100)';
      enemyEmoji = '⚡🔥👑👿';
      hp = 3000000000000; // 3兆 HP (要超高火力＆漢方連打)
      atk = 666666;
    } else {
      // 💥 Lv.11 ~ 99 深層スケール
      enemyName = `【深層邪神】極・邪神ゲートマスター(Lv.${level})`;
      enemyEmoji = '⚡🔥';
      // Lv10(100億)からLv99まで指数関数的成長
      const scaleFactor = Math.pow(1.062, level - 10);
      hp = Math.floor(10000000000 * scaleFactor);
      atk = Math.floor(25000 + (level - 10) * 6500);
    }
  } else if (type === 'reward') {
    // ── ごほうびの間 (常に2ウェーブ) ──
    const scale = 1 + (level - 1) * 0.4 + (wave - 1) * 0.3;
    hp = Math.floor(room.baseHp * scale);
    atk = Math.floor(room.baseAtk * (1 + (level - 1) * 0.1));
  } else {
    // ── 通常の間 ──
    const scale = 1 + (level - 1) * 0.35 + (wave - 1) * 0.35;
    hp = Math.floor(room.baseHp * scale);
    atk = Math.floor(room.baseAtk * (1 + (level - 1) * 0.15 + (wave - 1) * 0.2));
  }

  const baseRewardScale = type === 'boss' ? (level >= 5 ? 3 + (level - 5) * 1.5 : 1 + (level - 1) * 0.4) : (1 + (level - 1) * 0.3);

  return {
    id: stageId,
    name: `${room.name} (Lv.${level} - Wave ${wave}/${totalWaves})`,
    enemyName: `【Gate Lv.${level}】${enemyName}`,
    enemyHp: hp,
    enemyAtk: atk,
    enemyColor: room.color,
    enemyEmoji: enemyEmoji,
    rewardMoney: Math.floor(1200 * baseRewardScale),
    rewardYPoints: Math.floor((room.rewardYp / totalWaves) * baseRewardScale),
    areaName: `きまぐれゲート・${room.name}`,
  };
};

