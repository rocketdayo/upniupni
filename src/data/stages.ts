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
      // Stage 1: HP 500, ATK 12
      // Stage 150: HP 1,200,000, ATK 850
      hp = Math.floor(500 + Math.pow(i, 2.7) * 2.2 + i * 250);
      atk = Math.floor(12 + Math.pow(i, 1.4) * 0.75 + i * 1.8);
      money = Math.floor(60 + i * 18 + Math.pow(i, 1.2) * 2);
      yPoints = Math.floor(12 + i * 4.5);

      const areaIndex = Math.min(Math.floor((i - 1) / 10), AREA_NAMES.length - 1);
      areaName = AREA_NAMES[areaIndex];
    } else {
      // World 2 (Stages 151-200) - Ultimate God Realm (100 Billion+ HP Routine!)
      // Stage 151: HP ~32.5 Billion (325億)
      // Stage 175: HP ~236 Billion (2360億)
      // Stage 200: HP ~1 Trillion (1.01兆)
      const w2Index = i - 150; // 1 to 50
      hp = Math.floor(30000000000 + Math.pow(w2Index, 2.5) * 500000000 + w2Index * 2000000000);
      atk = Math.floor(8000 + Math.pow(w2Index, 1.8) * 80 + w2Index * 1200);
      money = Math.floor(200000 + w2Index * 50000);
      yPoints = Math.floor(10000 + w2Index * 3000);

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
    enemyHp: 10000000,
    enemyAtk: 7500,
    enemyColor: '#dc2626',
    enemyEmoji: '🌋🐉',
    rewardMoney: 500000,
    rewardYPoints: 50,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
  {
    id: 'event_snow_2_2',
    name: '常夏ビーチ 裏の裏 2-2',
    enemyName: '【極裏】常夏の冥界覇王ハデス',
    enemyHp: 50000000,
    enemyAtk: 12000,
    enemyColor: '#581c87',
    enemyEmoji: '🔥💀',
    rewardMoney: 1000000,
    rewardYPoints: 80,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
  {
    id: 'event_snow_2_3',
    name: '常夏ビーチ 裏の裏 2-3',
    enemyName: '【極裏】超覚醒・常夏皇帝ゼウス',
    enemyHp: 200000000,
    enemyAtk: 18000,
    enemyColor: '#d97706',
    enemyEmoji: '⚡👑',
    rewardMoney: 2500000,
    rewardYPoints: 120,
    areaName: '常夏ビーチ (裏の裏)',
    isHidden: true,
    isDeepHidden: true,
  },
  {
    id: 'event_snow_2_4',
    name: '常夏ビーチ 裏の裏 2-4',
    enemyName: '【終焉極裏ボス】神創・サマーエンマ大王 創世形態',
    enemyHp: 1000000000, // 10億 (1B)
    enemyAtk: 25000,
    enemyColor: '#4c0519',
    enemyEmoji: '☀️👑🔥',
    rewardMoney: 10000000,
    rewardYPoints: 200,
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
    enemyHp: 1000000000000, // 1兆 (1T)
    enemyAtk: 35000,
    enemyColor: '#dc2626',
    enemyEmoji: '🔥🐉💥',
    rewardMoney: 20000000,
    rewardYPoints: 350,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_3_2',
    name: '常夏ビーチ 裏の裏の裏 3-2',
    enemyName: '【超越裏】終焉の暗黒神 ヴェルゼ',
    enemyHp: 5000000000000, // 5兆 (5T)
    enemyAtk: 48000,
    enemyColor: '#4c0519',
    enemyEmoji: '💀👑⚡',
    rewardMoney: 50000000,
    rewardYPoints: 600,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_3_3',
    name: '常夏ビーチ 裏の裏の裏 3-3',
    enemyName: '【超越裏】絶対真神 創世オルティス',
    enemyHp: 20000000000000, // 20兆 (20T)
    enemyAtk: 65000,
    enemyColor: '#7c2d12',
    enemyEmoji: '☀️👑🌌',
    rewardMoney: 100000000,
    rewardYPoints: 1000,
    areaName: '常夏ビーチ (裏の裏の裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_3_4',
    name: '常夏ビーチ 裏の裏の裏 3-4',
    enemyName: '【次元頂点神】全知全能・無限創世エンマ神',
    enemyHp: 100000000000000, // 100兆 (100T)
    enemyAtk: 88000,
    enemyColor: '#ffd700',
    enemyEmoji: '👑☀️🌌🔥',
    rewardMoney: 500000000,
    rewardYPoints: 2000,
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
    enemyHp: 500000000000000, // 500兆 (500T)
    enemyAtk: 120000,
    enemyColor: '#0369a1',
    enemyEmoji: '🔱🐙🌊',
    rewardMoney: 1000000000, // 10億
    rewardYPoints: 3500,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_4_2',
    name: '常夏ビーチ 最裏 4-2',
    enemyName: '【超越最裏】常夏の時空支配神 クロノス',
    enemyHp: 2000000000000000, // 2000兆 (2000T / 2京)
    enemyAtk: 160000,
    enemyColor: '#7c2d12',
    enemyEmoji: '⏳👑🔥',
    rewardMoney: 2000000000, // 20億
    rewardYPoints: 6000,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_4_3',
    name: '常夏ビーチ 最裏 4-3',
    enemyName: '【超越最裏】真・絶対破壊神 デストロイ',
    enemyHp: 10000000000000000, // 1京 (10000兆 / 10P)
    enemyAtk: 220000,
    enemyColor: '#7f1d1d',
    enemyEmoji: '💀💥🔥',
    rewardMoney: 5000000000, // 50億
    rewardYPoints: 10000,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
  {
    id: 'event_snow_4_4',
    name: '常夏ビーチ 最裏 4-4',
    enemyName: '【最深頂点神】極限超越・常夏創世ゼウスエンマ',
    enemyHp: 50000000000000000, // 5京 (50000兆 / 50P)
    enemyAtk: 320000,
    enemyColor: '#00ffff',
    enemyEmoji: '👑☀️⚡🌌',
    rewardMoney: 10000000000, // 100億
    rewardYPoints: 20000,
    areaName: '常夏ビーチ (最裏)',
    isHidden: true,
    isDeepHidden: true,
    isDeepestHidden: true,
  },
];

export const EVENT_SNOW_STAGES = [...EVENT_SUMMER_STAGES, ...EVENT_SUMMER_DEEP_STAGES, ...EVENT_SUMMER_DEEPEST_STAGES, ...EVENT_SUMMER_ULTRA_DEEP_STAGES];

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

export const STAGES = [SCORE_ATTACK_STAGE, ...EVENT_SNOW_STAGES, ...generateStages(200)];

