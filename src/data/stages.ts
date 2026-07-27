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

const ENEMY_PREFIXES = [
  'プチ', 'わんぱく', 'いたずら', '狂暴な', '怒りの', '漆黒の',
  '覚醒', '爆裂', '極・', '幻影', '超絶', '神級', '覇王'
];

const ENEMY_BASE_NAMES = [
  '妖怪バッター', '影怪魔', 'オニ火', '邪悪ピエロ', '赤鬼の影',
  '青鬼の弟子', '黒カラス', 'ドクロ騎士', '闇龍の幼生', '機甲兵',
  '魔界将軍', '深淵の主', '混沌の獣', '終焉の使者', '神話の龍'
];

const generateStages = (count: number): Stage[] => {
  const stages: Stage[] = [];
  
  for (let i = 1; i <= count; i++) {
    // Smoother progressive exponential scaling up to stage 150
    // Stage 1: HP 500, ATK 12
    // Stage 50: HP 18,000, ATK 120
    // Stage 100: HP 220,000, ATK 380
    // Stage 150: HP 1,200,000, ATK 850
    const hp = Math.floor(500 + Math.pow(i, 2.7) * 2.2 + i * 250);
    const atk = Math.floor(12 + Math.pow(i, 1.4) * 0.75 + i * 1.8);
    
    const money = Math.floor(60 + i * 18 + Math.pow(i, 1.2) * 2);
    const yPoints = Math.floor(12 + i * 4.5);
    
    const areaIndex = Math.min(Math.floor((i - 1) / 10), AREA_NAMES.length - 1);
    const areaName = AREA_NAMES[areaIndex];
    
    const bossEval = BOSS_EVAL[(i - 1) % BOSS_EVAL.length];
    const prefix = ENEMY_PREFIXES[Math.min(Math.floor(i / 12), ENEMY_PREFIXES.length - 1)];
    const baseName = ENEMY_BASE_NAMES[(i - 1) % ENEMY_BASE_NAMES.length];
    
    const enemyName = i % 10 === 0 ? `【大ボス】${prefix}${baseName}` : `${prefix}${baseName}`;

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
      const hiddenHp = Math.floor(hp * 2.2);
      const hiddenAtk = Math.floor(atk * 1.45);
      
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

export const STAGES = generateStages(150);

