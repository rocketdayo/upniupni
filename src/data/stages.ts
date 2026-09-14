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
  isHidden?: boolean;
  isDeepHidden?: boolean;
  isDeepestHidden?: boolean;
  areaName?: string;
}

const BOSS_EVAL = [
  { emoji: '👺', color: '#ff4444' },
  { emoji: '👹', color: '#cc0000' },
  { emoji: '👻', color: '#6600cc' },
  { emoji: '💀', color: '#333333' },
  { emoji: '👽', color: '#00cc66' },
  { emoji: '🤖', color: '#0088cc' },
  { emoji: '🎃', color: '#ff6600' },
  { emoji: '👾', color: '#aa00aa' },
  { emoji: '🐍', color: '#22aa22' },
  { emoji: '🪲', color: '#886600' },
  { emoji: '🦁', color: '#eeaa00' },
  { emoji: '🐉', color: '#ff22aa' },
  { emoji: '🐲', color: '#9900ee' },
  { emoji: '👁️', color: '#00cccc' },
  { emoji: '🔥', color: '#ff2200' },
];

const AREA_NAMES = [
  'さくらニュータウン',
  'おつかい横丁',
  'そよ風ヒルズ',
  'さくら中央シティ',
  'おまもり山・奥の院',
  '妖魔界・本通り',
  '平釜平原',
  'むげん地獄・上層',
  'むげん地獄・深層',
  'アミダ極楽',
  '極・妖魔界',
  '神の領域',
  '終焉の地',
  '超・妖魔大決戦',
  '次元の狭間'
];

const WORLD2_AREA_NAMES = [
  '神界・ゲートブリッジ',
  '神界・星屑の聖域',
  '異次元・虚無の回廊',
  '神帝の試練場',
  '終焉・創世の頂'
];

const ENEMY_PREFIXES = [
  'プチ', 'わんぱく', 'いたずら', '狂暴な', '怒りの', '漆黒の',
  '覚醒', '爆裂', '極・', '幻影', '超絶', '神級', '覇王',
  '創世', '無の界', '終焉神', '次元覇者'
];

const ENEMY_BASE_NAMES = [
  '妖怪バッター', '影怪魔', 'オニ火', '邪悪ピエロ', '赤鬼の影',
  '青鬼の弟子', '黒カラス', 'ドクロ騎士', '闇龍の幼生', '機甲兵',
  '魔界将軍', '深淵の主', '混沌の獣', '終焉の使者', '神話の龍',
  '創世の守護者', '次元喰らい', '絶対神獣', '無想の魔神'
];

const generateStages = (count: number): Stage[] => {
  const stages: Stage[] = [];
  
  for (let i = 1; i <= count; i++) {
    let hp = 0;
    let atk = 0;
    let money = 0;
    let yPoints = 0;
    let areaName = '';

    if (i <= 150) {
      // World 1 (Stages 1-150)
      // Stage 1: HP 450, ATK 10
      // Stage 150: HP ~180,000, ATK ~550
      hp = Math.floor(450 + Math.pow(i, 2.3) * 1.5 + i * 120);
      atk = Math.floor(10 + Math.pow(i, 1.25) * 0.45 + i * 0.9);
      money = Math.floor(60 + i * 18 + Math.pow(i, 1.2) * 2);
      yPoints = Math.floor(12 + i * 4.5);

      const areaIndex = Math.min(Math.floor((i - 1) / 10), AREA_NAMES.length - 1);
      areaName = AREA_NAMES[areaIndex];
    } else {
      // World 2 (Stages 151-200) - 神界エリア (HP 20万 〜 120万)
      const w2Index = i - 150; // 1 to 50
      hp = Math.floor(200000 + Math.pow(w2Index, 2.2) * 180 + w2Index * 15000);
      atk = Math.floor(600 + Math.pow(w2Index, 1.35) * 8 + w2Index * 25);
      money = Math.floor(8000 + w2Index * 500);
      yPoints = Math.floor(300 + w2Index * 25);

      const w2AreaIndex = Math.min(Math.floor((w2Index - 1) / 10), WORLD2_AREA_NAMES.length - 1);
      areaName = WORLD2_AREA_NAMES[w2AreaIndex];
    }
    
    const bossEval = BOSS_EVAL[(i - 1) % BOSS_EVAL.length];
    const prefix = ENEMY_PREFIXES[Math.min(Math.floor(i / 12), ENEMY_PREFIXES.length - 1)];
    const baseName = ENEMY_BASE_NAMES[(i - 1) % ENEMY_BASE_NAMES.length];
    
    const enemyName = i % 10 === 0 
      ? (i > 150 ? `【神界超ボス】${prefix}${baseName}` : `【大ボス】${prefix}${baseName}`) 
      : `${prefix}${baseName}`;

    stages.push({
      id: `stage_${i}`,
      name: `ステージ ${i}`,
      enemyName,
      enemyHp: hp,
      enemyAtk: atk,
      enemyColor: bossEval.color,
      enemyEmoji: bossEval.emoji,
      rewardMoney: money,
      rewardYPoints: yPoints,
      areaName,
    });

    // Add a hidden stage (ウラステージ) every 5 stages
    if (i % 5 === 0) {
      const hiddenIndex = i / 5;
      const hiddenHp = Math.floor(hp * (i > 150 ? 3.0 : 2.2));
      const hiddenAtk = Math.floor(atk * (i > 150 ? 1.8 : 1.45));
      
      stages.push({
        id: `stage_hidden_${hiddenIndex}`,
        name: `ウラ ${hiddenIndex}`,
        enemyName: `【秘】真・${baseName} Lv.${hiddenIndex}`,
        enemyHp: hiddenHp,
        enemyAtk: hiddenAtk,
        enemyColor: '#110022',
        enemyEmoji: hiddenIndex % 2 === 0 ? '🐲' : '👿',
        rewardMoney: Math.floor(money * 2.8),
        rewardYPoints: Math.floor(yPoints * 2.2),
        isHidden: true,
        areaName: `${areaName} (裏)`,
      });
    }
  }
  return stages;
};

export const EVENT_SUMMER_STAGES: Stage[] = [
  {
    id: 'event_snow_1_1',
    name: '常夏ビーチ裏 1-1',
    enemyName: '【裏】灼熱のサマーベアー',
    enemyHp: 350000,
    enemyAtk: 850,
    enemyColor: '#ea580c',
    enemyEmoji: '🏖️🐻',
    rewardMoney: 15000,
    rewardYPoints: 5,
    areaName: '常夏ビーチ (裏)',
    isHidden: true,
  },
  {
    id: 'event_snow_1_2',
    name: '常夏ビーチ裏 1-2',
    enemyName: '【裏】トロピカルサーファー',
    enemyHp: 750000,
    enemyAtk: 1450,
    enemyColor: '#0284c7',
    enemyEmoji: '🏄‍♂️🦈',
    rewardMoney: 30000,
    rewardYPoints: 8,
    areaName: '常夏ビーチ (裏)',
    isHidden: true,
  },
  {
    id: 'event_snow_1_3',
    name: '常夏ビーチ裏 1-3',
    enemyName: '【裏】サンシャインゴーレム',
    enemyHp: 1400000,
    enemyAtk: 2200,
    enemyColor: '#d97706',
    enemyEmoji: '☀️🗿',
    rewardMoney: 60000,
    rewardYPoints: 12,
    areaName: '常夏ビーチ (裏)',
    isHidden: true,
  },
  {
    id: 'event_snow_1_4',
    name: '常夏ビーチ裏 1-4',
    enemyName: '【裏】深海の大王クラーケン',
    enemyHp: 2500000,
    enemyAtk: 3400,
    enemyColor: '#0f766e',
    enemyEmoji: '🦑🌊',
    rewardMoney: 120000,
    rewardYPoints: 18,
    areaName: '常夏ビーチ (裏)',
    isHidden: true,
  },
  {
    id: 'event_snow_1_5',
    name: '常夏ビーチ裏 1-5',
    enemyName: '【超激ムズ裏ボス】常夏魔王 サマーエンマ大王',
    enemyHp: 5000000,
    enemyAtk: 5200,
    enemyColor: '#7f1d1d',
    enemyEmoji: '👑🏖️🔥',
    rewardMoney: 300000,
    rewardYPoints: 30,
    areaName: '常夏ビーチ (裏)',
    isHidden: true,
  },
];

export const EVENT_SUMMER_DEEP_STAGES: Stage[] = [
  {
    id: 'event_snow_2_1',
    name: '常夏ビーチ 裏の裏 2-1',
    enemyName: '【極裏】灼熱の魔海竜ヴォルカ',
    enemyHp: 800000,
    enemyAtk: 1200,
    enemyColor: '#dc2626',
    enemyEmoji: '🌋🐉',
    rewardMoney: 30000,
    rewardYPoints: 40,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
  {
    id: 'event_snow_2_2',
    name: '常夏ビーチ 裏の裏 2-2',
    enemyName: '【極裏】常夏の冥界覇王ハデス',
    enemyHp: 1500000,
    enemyAtk: 1800,
    enemyColor: '#581c87',
    enemyEmoji: '🔥💀',
    rewardMoney: 60000,
    rewardYPoints: 60,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
  {
    id: 'event_snow_2_3',
    name: '常夏ビーチ 裏の裏 2-3',
    enemyName: '【極裏】超覚醒・常夏皇帝ゼウス',
    enemyHp: 2500000,
    enemyAtk: 2400,
    enemyColor: '#d97706',
    enemyEmoji: '⚡👑',
    rewardMoney: 120000,
    rewardYPoints: 100,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
  {
    id: 'event_snow_2_4',
    name: '常夏ビーチ 裏の裏 2-4',
    enemyName: '【終焉極裏ボス】神創・サマーエンマ大王 創世形態',
    enemyHp: 4500000,
    enemyAtk: 3200,
    enemyColor: '#4c0519',
    enemyEmoji: '☀️👑🔥',
    rewardMoney: 250000,
    rewardYPoints: 150,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
];

export const EVENT_SUMMER_DEEPEST_STAGES: Stage[] = [
  {
    id: 'event_snow_3_1',
    name: '常夏ビーチ 裏の裏の裏 3-1',
    enemyName: '【超越裏】虚無の灼熱魔獣 ヴォイド',
    enemyHp: 6000000,
    enemyAtk: 3800,
    enemyColor: '#dc2626',
    enemyEmoji: '🔥🐉💥',
    rewardMoney: 400000,
    rewardYPoints: 200,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_3_2',
    name: '常夏ビーチ 裏の裏の裏 3-2',
    enemyName: '【超越裏】終焉の暗黒神 ヴェルゼ',
    enemyHp: 8000000,
    enemyAtk: 4500,
    enemyColor: '#4c0519',
    enemyEmoji: '💀👑⚡',
    rewardMoney: 600000,
    rewardYPoints: 300,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_3_3',
    name: '常夏ビーチ 裏の裏の裏 3-3',
    enemyName: '【超越裏】絶対真神 創世オルティス',
    enemyHp: 11000000,
    enemyAtk: 5200,
    enemyColor: '#7c2d12',
    enemyEmoji: '☀️👑🌌',
    rewardMoney: 800000,
    rewardYPoints: 400,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_3_4',
    name: '常夏ビーチ 裏の裏の裏 3-4',
    enemyName: '【次元頂点神】全知全能・無限創世エンマ神',
    enemyHp: 15000000,
    enemyAtk: 6000,
    enemyColor: '#ffd700',
    enemyEmoji: '👑☀️🌌🔥',
    rewardMoney: 1200000,
    rewardYPoints: 600,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
];

export const EVENT_SUMMER_ULTRA_DEEP_STAGES: Stage[] = [
  {
    id: 'event_snow_4_1',
    name: '常夏ビーチ 最裏 4-1',
    enemyName: '【超越最裏】虚無の極限深海王 オケアノス',
    enemyHp: 18000000,
    enemyAtk: 6800,
    enemyColor: '#0369a1',
    enemyEmoji: '🔱🐙🌊',
    rewardMoney: 1500000,
    rewardYPoints: 800,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_4_2',
    name: '常夏ビーチ 最裏 4-2',
    enemyName: '【超越最裏】常夏の時空支配神 クロノス',
    enemyHp: 22000000,
    enemyAtk: 7500,
    enemyColor: '#7c2d12',
    enemyEmoji: '⏳👑🔥',
    rewardMoney: 2000000,
    rewardYPoints: 1000,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_4_3',
    name: '常夏ビーチ 最裏 4-3',
    enemyName: '【超越最裏】真・絶対破壊神 デストロイ',
    enemyHp: 28000000,
    enemyAtk: 8500,
    enemyColor: '#7f1d1d',
    enemyEmoji: '💀💥🔥',
    rewardMoney: 3000000,
    rewardYPoints: 1500,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_4_4',
    name: '常夏ビーチ 最裏 4-4',
    enemyName: '【最深頂点神】極限超越・常夏創世ゼウスエンマ',
    enemyHp: 35000000,
    enemyAtk: 9800,
    enemyColor: '#00ffff',
    enemyEmoji: '👑☀️⚡🌌',
    rewardMoney: 5000000,
    rewardYPoints: 2500,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
];

export const EVENT_SNOW_STAGES = [...EVENT_SUMMER_STAGES, ...EVENT_SUMMER_DEEP_STAGES, ...EVENT_SUMMER_DEEPEST_STAGES, ...EVENT_SUMMER_ULTRA_DEEP_STAGES];

export const BLEACH_EVENT_STAGES: Stage[] = [
  {
    id: 'bleach_st_1',
    name: '虚圏 1-1',
    enemyName: '【第6十刃】グリムジョー・ジャガージャック',
    enemyHp: 1800000,
    enemyAtk: 180,
    enemyColor: '#0284c7',
    enemyEmoji: '🐆💙⚡',
    rewardMoney: 25000,
    rewardYPoints: 300,
    areaName: '虚圏（ウェコムンド）特設エリア',
  },
  {
    id: 'bleach_st_2',
    name: '虚圏 1-2',
    enemyName: '【第3十刃】皇鮫後 ティア・ハリベル',
    enemyHp: 4500000,
    enemyAtk: 260,
    enemyColor: '#075985',
    enemyEmoji: '🦈🌊🗡️',
    rewardMoney: 45000,
    rewardYPoints: 450,
    areaName: '虚圏（ウェコムンド）特設エリア',
  },
  {
    id: 'bleach_st_3',
    name: '虚圏 1-3',
    enemyName: '【第2十刃】神聖死神老帝 バラガン',
    enemyHp: 9000000,
    enemyAtk: 360,
    enemyColor: '#450a0a',
    enemyEmoji: '💀👑⌛',
    rewardMoney: 80000,
    rewardYPoints: 700,
    areaName: '虚圏（ウェコムンド）特設エリア',
  },
  {
    id: 'bleach_st_4',
    name: '虚圏 1-4',
    enemyName: '【第1十刃】群狼 コヨーテ・スターク',
    enemyHp: 18000000,
    enemyAtk: 480,
    enemyColor: '#1e293b',
    enemyEmoji: '🐺🔫⚡',
    rewardMoney: 150000,
    rewardYPoints: 1000,
    areaName: '虚圏（ウェコムンド）特設エリア',
  },
  {
    id: 'bleach_st_5',
    name: '虚圏 1-5 (激戦)',
    enemyName: '【第4十刃・刀剣解放第二階層】覚醒ウルキオラ',
    enemyHp: 35000000,
    enemyAtk: 620,
    enemyColor: '#030712',
    enemyEmoji: '🦇💚⚡👑',
    rewardMoney: 300000,
    rewardYPoints: 1600,
    areaName: '虚圏（ウェコムンド）特設エリア',
  },
  {
    id: 'bleach_st_6',
    name: '虚圏 最奥 (崩玉神殿)',
    enemyName: '【虚圏統括・超越神】藍染惣右介（崩玉完全融合）',
    enemyHp: 75000000,
    enemyAtk: 800,
    enemyColor: '#312e81',
    enemyEmoji: '👑🔮🌌⚡',
    rewardMoney: 600000,
    rewardYPoints: 2500,
    areaName: '虚圏（ウェコムンド）特設エリア',
  },
  {
    id: 'bleach_st_7',
    name: '虚圏 特別マップ 1 (虚夜宮 天蓋)',
    enemyName: '【第0十刃・憤獣極限解放】ヤミー＆十刃総力戦',
    enemyHp: 150000000,
    enemyAtk: 980,
    enemyColor: '#831843',
    enemyEmoji: '👹💥🌙⚔️',
    rewardMoney: 1500000,
    rewardYPoints: 5000,
    areaName: '虚圏（ウェコムンド）特別深層マップ',
  },
  {
    id: 'bleach_st_8',
    name: '虚圏 特別マップ 2 (崩玉次元絶対領域)',
    enemyName: '【神域超越終焉神】藍染惣右介（崩玉最終完全覚醒）',
    enemyHp: 300000000,
    enemyAtk: 1250,
    enemyColor: '#4c0519',
    enemyEmoji: '👑🌌🔮⚡✨',
    rewardMoney: 3500000,
    rewardYPoints: 10000,
    areaName: '虚圏（ウェコムンド）特別深層マップ',
  },
];

export const SCORE_ATTACK_STAGE: Stage = {
  id: 'score_attack',
  name: 'スコアアタック',
  enemyName: '【ボス】マイティードッグ＆レッドJ',
  enemyHp: 999999999999999, // 実質無限HP
  enemyAtk: 40,
  enemyColor: '#dc2626',
  enemyEmoji: '👹🔥',
  rewardMoney: 300,
  rewardYPoints: 100,
  areaName: 'スコアタ特設ステージ',
};

import { SPEEDRUN_COURSES, getSpeedrunStage } from './speedrunData';
import { getTowerFloorStage } from './towerData';
import { getRaidStage } from './raidData';
import { getGateStage } from './gateData';

export const SPEEDRUN_STAGES: Stage[] = SPEEDRUN_COURSES.map(c => getSpeedrunStage(c.id)!);

export const STAGES = [SCORE_ATTACK_STAGE, ...SPEEDRUN_STAGES, ...BLEACH_EVENT_STAGES, ...EVENT_SNOW_STAGES, ...generateStages(200)];

// 塔の動的階層・レイドボス・きまぐれゲートを含めた安全なステージ取得関数（キャッシュで同一インスタンスを返却）
const dynamicStageCache = new Map<string, Stage>();

export const getStageById = (id: string | undefined): Stage | undefined => {
  if (!id) return undefined;
  if (dynamicStageCache.has(id)) {
    return dynamicStageCache.get(id);
  }
  if (id.startsWith('tower_floor_')) {
    const floorNum = parseInt(id.replace('tower_floor_', ''), 10);
    if (!isNaN(floorNum) && floorNum > 0) {
      const stage = getTowerFloorStage(floorNum);
      dynamicStageCache.set(id, stage);
      return stage;
    }
  }
  if (id.startsWith('raid_')) {
    const stage = getRaidStage(id);
    dynamicStageCache.set(id, stage);
    return stage;
  }
  if (id.startsWith('gate_')) {
    const stage = getGateStage(id);
    dynamicStageCache.set(id, stage);
    return stage;
  }
  const found = STAGES.find(s => s.id === id);
  if (found) {
    dynamicStageCache.set(id, found);
  }
  return found;
};


