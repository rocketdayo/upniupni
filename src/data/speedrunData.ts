import type { Stage } from './stages';

export interface SpeedrunCourse {
  id: string;
  title: string;
  difficulty: string;
  difficultyColor: string;
  enemyName: string;
  enemyEmoji: string;
  enemyHp: number;
  enemyAtk: number;
  targetTimes: {
    sPlus: number; // 秒数
    s: number;
    a: number;
    b: number;
  };
  rewardYPoints: number;
  firstClearReward: {
    desc: string;
    yPoints?: number;
    itemKey?: string;
    itemAmount?: number;
    title?: string;
  };
  desc: string;
}

export const SPEEDRUN_COURSES: SpeedrunCourse[] = [
  {
    id: 'speedrun_novice',
    title: '入門・疾風迅雷コース',
    difficulty: '★☆☆☆ 初級',
    difficultyColor: '#10b981',
    enemyName: '【疾風の雷竜】覚醒オロチ',
    enemyEmoji: '🐍⚡',
    enemyHp: 3500000, // 350万
    enemyAtk: 120,
    targetTimes: {
      sPlus: 5.0,
      s: 10.0,
      a: 18.0,
      b: 30.0,
    },
    rewardYPoints: 800,
    firstClearReward: {
      desc: '3,000 Ypt ＆ 称号「疾風の抜刀手」',
      yPoints: 3000,
      title: '疾風の抜刀手'
    },
    desc: 'でかぷにを一瞬で繋いで速攻必殺技を叩き込め！初心者から上級者までの入門スピードラン。'
  },
  {
    id: 'speedrun_expert',
    title: '上級・修羅業火コース',
    difficulty: '★★☆☆ 上級',
    difficultyColor: '#f59e0b',
    enemyName: '【修羅の覚醒神】暴走エンマ',
    enemyEmoji: '👑🔥⚔️',
    enemyHp: 350000000, // 3.5億
    enemyAtk: 650,
    targetTimes: {
      sPlus: 12.0,
      s: 20.0,
      a: 35.0,
      b: 50.0,
    },
    rewardYPoints: 2500,
    firstClearReward: {
      desc: '10,000 Ypt ＆ ひっさつの秘伝書 x1 ＆ 称号「音速の撃墜神」',
      yPoints: 10000,
      itemKey: 'skillBook',
      itemAmount: 1,
      title: '音速の撃墜神'
    },
    desc: 'HP3.5億の猛攻！フィーバー突入のスピードとZZ技の瞬間火力が試される本格スピードラン。'
  },
  {
    id: 'speedrun_master',
    title: '神話級・崩玉絶対領域コース',
    difficulty: '★★★☆ 神話級',
    difficultyColor: '#a855f7',
    enemyName: '【神域超越終焉神】崩玉完全覚醒・藍染惣右介',
    enemyEmoji: '👑🌌🔮⚡',
    enemyHp: 5000000000, // 50億
    enemyAtk: 1400,
    targetTimes: {
      sPlus: 20.0,
      s: 30.0,
      a: 50.0,
      b: 75.0,
    },
    rewardYPoints: 6000,
    firstClearReward: {
      desc: '30,000 Ypt ＆ 神昇の秘石 x1 ＆ 称号「光速の神罰」',
      yPoints: 30000,
      itemKey: 'godAscensionStone',
      itemAmount: 1,
      title: '光速の神罰'
    },
    desc: 'HP50億の超絶耐久！コンボを途切れさせずデュアル必殺技の超絶火力を叩き込め！'
  },
  {
    id: 'speedrun_god',
    title: '超神話級・ゼロの極限領域コース',
    difficulty: '★★★★ 超絶神話',
    difficultyColor: '#ec4899',
    enemyName: '【無限神覇冥王神】極エンマ神ZZ',
    enemyEmoji: '⚡👑💎🌟',
    enemyHp: 80000000000, // 800億
    enemyAtk: 3000,
    targetTimes: {
      sPlus: 30.0,
      s: 45.0,
      a: 70.0,
      b: 100.0,
    },
    rewardYPoints: 15000,
    firstClearReward: {
      desc: '100,000 Ypt ＆ 神ひっさつの秘伝書 x1 ＆ 神昇の秘石 x2 ＆ 超神称号「時空の支配者」',
      yPoints: 100000,
      itemKey: 'godSkillBook',
      itemAmount: 1,
      title: '時空の支配者'
    },
    desc: '異次元のHP800億！全プレイヤーの最高峰パーティーが秒単位の限界に挑む頂上決戦。'
  },
];

// コースIDからStageオブジェクトに変換
export const getSpeedrunStage = (courseId: string): Stage | null => {
  const course = SPEEDRUN_COURSES.find(c => c.id === courseId);
  if (!course) return null;
  return {
    id: course.id,
    name: `【最速TA】${course.title}`,
    enemyName: course.enemyName,
    enemyHp: course.enemyHp,
    enemyAtk: course.enemyAtk,
    enemyColor: course.difficultyColor,
    enemyEmoji: course.enemyEmoji,
    rewardMoney: course.rewardYPoints * 20,
    rewardYPoints: course.rewardYPoints,
    areaName: '最速討伐タイムアタック競技場'
  };
};

export const getSpeedrunRank = (timeSec: number, targetTimes: SpeedrunCourse['targetTimes']): { rank: 'S+' | 'S' | 'A' | 'B' | 'C'; color: string; label: string } => {
  if (timeSec <= targetTimes.sPlus) return { rank: 'S+', color: '#ec4899', label: '超神速 S+ (神記録)' };
  if (timeSec <= targetTimes.s) return { rank: 'S', color: '#ffd700', label: '神速 S (超上級)' };
  if (timeSec <= targetTimes.a) return { rank: 'A', color: '#38bdf8', label: '優秀 A (上級)' };
  if (timeSec <= targetTimes.b) return { rank: 'B', color: '#4ade80', label: '合格 B (中級)' };
  return { rank: 'C', color: '#94a3af', label: '達成 C' };
};
