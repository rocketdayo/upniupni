import type { Stage } from './stages';

export interface TowerArtifact {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  effectType: 'atk' | 'cut' | 'gauge' | 'heal' | 'connect' | 'fever';
  value: number; // e.g. 30 for +30%
}

export const TOWER_ARTIFACTS: TowerArtifact[] = [
  { id: 'art_atk_1', name: '武神の覇刃', emoji: '🗡️', desc: '味方全体の攻撃力 +35%', effectType: 'atk', value: 35 },
  { id: 'art_cut_1', name: '金剛の神盾', emoji: '🛡️', desc: '敵からの被ダメージ 25% 軽減', effectType: 'cut', value: 25 },
  { id: 'art_gauge_1', name: '雷光の神速', emoji: '⚡', desc: 'でかぷに消去時の技ゲージ増加量 +50%', effectType: 'gauge', value: 50 },
  { id: 'art_heal_1', name: '聖樹の秘雫', emoji: '💖', desc: 'フィーバー突入時に最大HPの40%を即時回復', effectType: 'heal', value: 40 },
  { id: 'art_connect_1', name: '連鎖の神意', emoji: '🌀', desc: 'ぷにの連結可能距離 +50%', effectType: 'connect', value: 50 },
  { id: 'art_fever_1', name: '狂気の会心撃', emoji: '💥', desc: 'フィーバー中の全与ダメージ +80%', effectType: 'fever', value: 80 },
  { id: 'art_atk_2', name: '破壊神の咆哮', emoji: '🔱', desc: '味方全体の攻撃力 +50%', effectType: 'atk', value: 50 },
  { id: 'art_cut_2', name: '不滅の天衣', emoji: '🥋', desc: '敵からの被ダメージ 35% 軽減', effectType: 'cut', value: 35 },
];

export interface TowerMilestone {
  floor: number;
  title: string;
  bossName: string;
  bossEmoji: string;
  rewardDesc: string;
  rewardType: 'item' | 'ypoint' | 'title';
  rewardValue: any;
}

export const TOWER_MILESTONES: TowerMilestone[] = [
  // ── 1〜100F Milestone Rewards ──
  {
    floor: 5,
    title: '第5階層・守護龍の試練',
    bossName: '【5F守護竜】青龍帝',
    bossEmoji: '🐉💙',
    rewardDesc: 'ひっさつの秘伝書 x1',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 1 }
  },
  {
    floor: 10,
    title: '第10階層・阿修羅の業火',
    bossName: '【10F猛将】阿修羅豪炎帝',
    bossEmoji: '🔥👺⚔️',
    rewardDesc: 'ひっさつの秘伝書 x2 ＆ 30,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 2, yPoints: 30000 }
  },
  {
    floor: 15,
    title: '第15階層・宵闇の覚醒者',
    bossName: '【15F幻影】漆黒のフユニャン',
    bossEmoji: '🐱🌙✨',
    rewardDesc: 'けいけんち玉・大 x10 ＆ 50,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'expLarge', amount: 10, yPoints: 50000 }
  },
  {
    floor: 20,
    title: '第20階層・冥王神の審判',
    bossName: '【20F支配者】暴走カイラ神',
    bossEmoji: '👑🐍⚡',
    rewardDesc: '超限界突破の書 x1 ＆ 称号「塔の覇王」',
    rewardType: 'title',
    rewardValue: { title: '塔の覇王', itemKey: 'superLimitBreakBook', amount: 1, yPoints: 60000 }
  },
  {
    floor: 25,
    title: '第25階層・虚夜宮の絶望',
    bossName: '【25F破面】神虚ウルキオラ神',
    bossEmoji: '🦇💚🌌',
    rewardDesc: '超限界突破の書 x2 ＆ 80,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 2, yPoints: 80000 }
  },
  {
    floor: 30,
    title: '第30階層・神話の極致',
    bossName: '【30F月神】極・ツクヨミ神',
    bossEmoji: '🌕🌙✨',
    rewardDesc: '神ひっさつの秘伝書 x1 ＆ 100,000 Ypt ＆ 称号「試練を統べし者」',
    rewardType: 'title',
    rewardValue: { title: '試練を統べし者', itemKey: 'godSkillBook', amount: 1, yPoints: 100000 }
  },
  {
    floor: 40,
    title: '第40階層・創世の胎動',
    bossName: '【40F太古神】創世冥王龍',
    bossEmoji: '🐲🌌⚡👑',
    rewardDesc: '神ひっさつの秘伝書 x2 ＆ 超限界突破の書 x3 ＆ 150,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 2, extraItem: 'superLimitBreakBook', extraAmount: 3, yPoints: 150000 }
  },
  {
    floor: 50,
    title: '第50階層・無限の特異点',
    bossName: '【50F終焉】無限の虚無神・ゼロ',
    bossEmoji: '🌌👁️⚡✨',
    rewardDesc: '💎神昇の秘石 x1 ＆ 神ひっさつの秘伝書 x2 ＆ 250,000 Ypt ＆ 超神称号「無限の超越神」',
    rewardType: 'title',
    rewardValue: { title: '無限の超越神', itemKey: 'godAscensionStone', amount: 1, extraItem: 'godSkillBook', extraAmount: 2, yPoints: 250000 }
  },
  {
    floor: 75,
    title: '第75階層・神域の極北',
    bossName: '【75F神王】極限神エンマ・アルファ',
    bossEmoji: '👑🔥🌌⚡',
    rewardDesc: '神ひっさつの秘伝書 x3 ＆ 超限界突破の書 x5 ＆ 400,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 3, extraItem: 'superLimitBreakBook', extraAmount: 5, yPoints: 400000 }
  },
  {
    floor: 100,
    title: '第100階層・無限回廊の頂点',
    bossName: '【100F頂点】創世神覇王オメガ',
    bossEmoji: '⚡👑💎🌟',
    rewardDesc: '💎神昇の秘石 x2 ＆ 神ひっさつの秘伝書 x5 ＆ 超限界突破の書 x5 ＆ 600,000 Ypt ＆ 神話称号「百界の制覇神」',
    rewardType: 'title',
    rewardValue: { title: '百界の制覇神', itemKey: 'godAscensionStone', amount: 2, extraItem: 'godSkillBook', extraAmount: 5, yPoints: 600000 }
  },

  // ── 101〜500F Milestone Rewards (10階ごと) ──
  {
    floor: 110,
    title: '第110階層・天翔ける雷光',
    bossName: '【110F迅雷】神威インドラ',
    bossEmoji: '⚡🦅✨',
    rewardDesc: 'ひっさつの秘伝書 x2 ＆ 50,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 2, yPoints: 50000 }
  },
  {
    floor: 120,
    title: '第120階層・紅蓮の激震',
    bossName: '【120F激震】神撃スサノオ',
    bossEmoji: '⚔️💥🔥',
    rewardDesc: '超限界突破の書 x1 ＆ 60,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 1, yPoints: 60000 }
  },
  {
    floor: 130,
    title: '第130階層・蒼海の深淵',
    bossName: '【130F海神】溟海ポセイドン',
    bossEmoji: '🌊🔱💧',
    rewardDesc: 'けいけんち玉・大 x10 ＆ 70,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'expLarge', amount: 10, yPoints: 70000 }
  },
  {
    floor: 140,
    title: '第140階層・冥府の幻影',
    bossName: '【140F冥府】冥界ハーデス',
    bossEmoji: '💀🔥🌌',
    rewardDesc: '神ひっさつの秘伝書 x1 ＆ 80,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 1, yPoints: 80000 }
  },
  {
    floor: 150,
    title: '第150階層・光明天頂',
    bossName: '【150F光神】天帝ルミナス',
    bossEmoji: '☀️👑🌟',
    rewardDesc: '神ひっさつの秘伝書 x1 ＆ 超限界突破の書 x2 ＆ 100,000 Ypt ＆ 称号「百五十層の踏破覇王」',
    rewardType: 'title',
    rewardValue: { title: '百五十層の踏破覇王', itemKey: 'godSkillBook', amount: 1, extraItem: 'superLimitBreakBook', extraAmount: 2, yPoints: 100000 }
  },
  {
    floor: 160,
    title: '第160階層・万象凍結',
    bossName: '【160F絶対零度】氷帝フロスト',
    bossEmoji: '❄️💎🧊',
    rewardDesc: '超限界突破の書 x2 ＆ 100,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 2, yPoints: 100000 }
  },
  {
    floor: 170,
    title: '第170階層・暴虐の魔爪',
    bossName: '【170F兇刃】黒滅ベリアル',
    bossEmoji: '👿🗡️🖤',
    rewardDesc: 'ひっさつの秘伝書 x3 ＆ 110,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 3, yPoints: 110000 }
  },
  {
    floor: 180,
    title: '第180階層・星雲崩壊',
    bossName: '【180F星砕】星霊ネビュラ',
    bossEmoji: '🌌🌠⚡',
    rewardDesc: '神ひっさつの秘伝書 x2 ＆ 120,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 2, yPoints: 120000 }
  },
  {
    floor: 190,
    title: '第190階層・天変地異',
    bossName: '【190F天変】獄炎ガイア',
    bossEmoji: '🌋🔥💥',
    rewardDesc: '超限界突破の書 x3 ＆ 130,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 3, yPoints: 130000 }
  },
  {
    floor: 200,
    title: '第200階層・神域第二境界',
    bossName: '【200F真神王】極天エンマ・テラ',
    bossEmoji: '👑🔥⚡🌟',
    rewardDesc: '神ひっさつの秘伝書 x3 ＆ 超限界突破の書 x3 ＆ 200,000 Ypt ＆ 称号「二百界の神王」',
    rewardType: 'title',
    rewardValue: { title: '二百界の神王', itemKey: 'godSkillBook', amount: 3, extraItem: 'superLimitBreakBook', extraAmount: 3, yPoints: 200000 }
  },
  {
    floor: 210,
    title: '第210階層・雷神の怒号',
    bossName: '【210F雷神】天鳴トール',
    bossEmoji: '⚡🔨🌩️',
    rewardDesc: 'ひっさつの秘伝書 x3 ＆ 140,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 3, yPoints: 140000 }
  },
  {
    floor: 220,
    title: '第220階層・幻惑の幽境',
    bossName: '【220F妖異】幻獣キマイラ',
    bossEmoji: '🦁🐍🦅',
    rewardDesc: '超限界突破の書 x2 ＆ 150,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 2, yPoints: 150000 }
  },
  {
    floor: 230,
    title: '第230階層・灼熱の魔眼',
    bossName: '【230F焦熱】紅蓮イフリート',
    bossEmoji: '🔥👁️👹',
    rewardDesc: 'けいけんち玉・大 x15 ＆ 160,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'expLarge', amount: 15, yPoints: 160000 }
  },
  {
    floor: 240,
    title: '第240階層・断罪の刃',
    bossName: '【240F天誅】神使ミカエル',
    bossEmoji: '⚔️🪽✨',
    rewardDesc: '神ひっさつの秘伝書 x2 ＆ 170,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 2, yPoints: 170000 }
  },
  {
    floor: 250,
    title: '第250階層・神魔相剋',
    bossName: '【250F魔導神】暴走アザトース',
    bossEmoji: '🐙🌌🔮',
    rewardDesc: '神ひっさつの秘伝書 x2 ＆ 超限界突破の書 x3 ＆ 180,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 2, extraItem: 'superLimitBreakBook', extraAmount: 3, yPoints: 180000 }
  },
  {
    floor: 260,
    title: '第260階層・金剛の防壁',
    bossName: '【260F金剛】要塞バハムート',
    bossEmoji: '🛡️🐲💎',
    rewardDesc: '超限界突破の書 x3 ＆ 190,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 3, yPoints: 190000 }
  },
  {
    floor: 270,
    title: '第270階層・常闇の帳',
    bossName: '【270F影帝】影神エレボス',
    bossEmoji: '👤🖤🌑',
    rewardDesc: 'ひっさつの秘伝書 x4 ＆ 200,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 4, yPoints: 200000 }
  },
  {
    floor: 280,
    title: '第280階層・天翔ける神鳥',
    bossName: '【280F不死】真鳳凰フェニックス',
    bossEmoji: '🔥🐦🌟',
    rewardDesc: '神ひっさつの秘伝書 x3 ＆ 210,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 3, yPoints: 210000 }
  },
  {
    floor: 290,
    title: '第290階層・滅亡の足音',
    bossName: '【290F滅神】神滅のアシュラ',
    bossEmoji: '👺🗡️⚡',
    rewardDesc: '超限界突破の書 x4 ＆ 220,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 4, yPoints: 220000 }
  },
  {
    floor: 300,
    title: '第300階層・神域第三境界',
    bossName: '【300F滅殺神】終焉神帝クロノス',
    bossEmoji: '⏳👑🌌⚡',
    rewardDesc: '神ひっさつの秘伝書 x4 ＆ 超限界突破の書 x4 ＆ 300,000 Ypt ＆ 称号「三百界の滅殺神」',
    rewardType: 'title',
    rewardValue: { title: '三百界の滅殺神', itemKey: 'godSkillBook', amount: 4, extraItem: 'superLimitBreakBook', extraAmount: 4, yPoints: 300000 }
  },
  {
    floor: 310,
    title: '第310階層・雷霆の洗礼',
    bossName: '【310F雷神】迅雷ゼウス',
    bossEmoji: '⚡👑🔱',
    rewardDesc: 'ひっさつの秘伝書 x4 ＆ 230,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 4, yPoints: 230000 }
  },
  {
    floor: 320,
    title: '第320階層・凍てつく魂',
    bossName: '【320F冥氷】雪華クィーン',
    bossEmoji: '❄️👸💎',
    rewardDesc: '超限界突破の書 x3 ＆ 240,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 3, yPoints: 240000 }
  },
  {
    floor: 330,
    title: '第330階層・烈火の怒涛',
    bossName: '【330F焔帝】炎皇ヴォルケルス',
    bossEmoji: '🔥🌋🦁',
    rewardDesc: 'けいけんち玉・大 x20 ＆ 250,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'expLarge', amount: 20, yPoints: 250000 }
  },
  {
    floor: 340,
    title: '第340階層・風神の息吹',
    bossName: '【340F嵐帝】暴風シルフィード',
    bossEmoji: '🌪️🍃🪽',
    rewardDesc: '神ひっさつの秘伝書 x3 ＆ 260,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 3, yPoints: 260000 }
  },
  {
    floor: 350,
    title: '第350階層・時空の裂け目',
    bossName: '【350F時空】次元龍ディアルガ',
    bossEmoji: '🐉⏳🔷',
    rewardDesc: '神ひっさつの秘伝書 x3 ＆ 超限界突破の書 x4 ＆ 270,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 3, extraItem: 'superLimitBreakBook', extraAmount: 4, yPoints: 270000 }
  },
  {
    floor: 360,
    title: '第360階層・暗黒物質',
    bossName: '【360F反物質】黒霊アンチマター',
    bossEmoji: '🕳️🖤⚡',
    rewardDesc: '超限界突破の書 x4 ＆ 280,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 4, yPoints: 280000 }
  },
  {
    floor: 370,
    title: '第370階層・神聖な輝き',
    bossName: '【370F天光】熾天使セラフィム',
    bossEmoji: '🪽✨🌟',
    rewardDesc: 'ひっさつの秘伝書 x5 ＆ 290,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 5, yPoints: 290000 }
  },
  {
    floor: 380,
    title: '第380階層・深淵の邪神',
    bossName: '【380F深淵】邪神ク・リトル・リトル',
    bossEmoji: '🐙🖤🌊',
    rewardDesc: '神ひっさつの秘伝書 x4 ＆ 300,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 4, yPoints: 300000 }
  },
  {
    floor: 390,
    title: '第390階層・天地開闢',
    bossName: '【390F開闢】創世神イザナギ',
    bossEmoji: '🗾⚡👑',
    rewardDesc: '超限界突破の書 x5 ＆ 320,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 5, yPoints: 320000 }
  },
  {
    floor: 400,
    title: '第400階層・神域第四境界',
    bossName: '【400F幽玄神】幽幻神王オシリス',
    bossEmoji: '👑⚖️🌌✨',
    rewardDesc: '神ひっさつの秘伝書 x5 ＆ 超限界突破の書 x5 ＆ 400,000 Ypt ＆ 称号「四百界の幽玄神」',
    rewardType: 'title',
    rewardValue: { title: '四百界の幽玄神', itemKey: 'godSkillBook', amount: 5, extraItem: 'superLimitBreakBook', extraAmount: 5, yPoints: 400000 }
  },
  {
    floor: 410,
    title: '第410階層・百花繚乱',
    bossName: '【410F精霊】霊王オベロン',
    bossEmoji: '🌸🧚👑',
    rewardDesc: 'ひっさつの秘伝書 x5 ＆ 330,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 5, yPoints: 330000 }
  },
  {
    floor: 420,
    title: '第420階層・金剛不壊',
    bossName: '【420F無敵】金剛神ヘラクレス',
    bossEmoji: '💪🦁🛡️',
    rewardDesc: '超限界突破の書 x4 ＆ 340,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 4, yPoints: 340000 }
  },
  {
    floor: 430,
    title: '第430階層・天狼の牙',
    bossName: '【430F月狼】月蝕フェンリル',
    bossEmoji: '🐺🌕❄️',
    rewardDesc: 'けいけんち玉・大 x25 ＆ 350,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'expLarge', amount: 25, yPoints: 350000 }
  },
  {
    floor: 440,
    title: '第440階層・黄昏の刻',
    bossName: '【440F黄昏】終焉ラグナロク',
    bossEmoji: '🌅🔥💀',
    rewardDesc: '神ひっさつの秘伝書 x4 ＆ 360,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 4, yPoints: 360000 }
  },
  {
    floor: 450,
    title: '第450階層・混沌の極み',
    bossName: '【450F混沌】混沌神カオス',
    bossEmoji: '🌀🌌👁️',
    rewardDesc: '神ひっさつの秘伝書 x4 ＆ 超限界突破の書 x5 ＆ 370,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 4, extraItem: 'superLimitBreakBook', extraAmount: 5, yPoints: 370000 }
  },
  {
    floor: 460,
    title: '第460階層・太陽神の威光',
    bossName: '【460F太陽神】太陽神ラー',
    bossEmoji: '☀️🦅👑',
    rewardDesc: '超限界突破の書 x5 ＆ 380,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 5, yPoints: 380000 }
  },
  {
    floor: 470,
    title: '第470階層・死線の彼方',
    bossName: '【470F死線】冥府神アヌビス',
    bossEmoji: '🐕⚖️🖤',
    rewardDesc: 'ひっさつの秘伝書 x6 ＆ 390,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'skillBook', amount: 6, yPoints: 390000 }
  },
  {
    floor: 480,
    title: '第480階層・神々の黄昏',
    bossName: '【480F天頂】主神オーディン',
    bossEmoji: '🐴🗡️⚡',
    rewardDesc: '神ひっさつの秘伝書 x5 ＆ 400,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 5, yPoints: 400000 }
  },
  {
    floor: 490,
    title: '第490階層・万物の終結',
    bossName: '【490F終結】神終アポカリプス',
    bossEmoji: '💥🌌👑',
    rewardDesc: '超限界突破の書 x6 ＆ 420,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'superLimitBreakBook', amount: 6, yPoints: 420000 }
  },
  {
    floor: 500,
    title: '第500階層・神域半界踏破',
    bossName: '【500F冥王神】極限冥府王ハデス・ゼウス',
    bossEmoji: '👑💀🌌🔥✨',
    rewardDesc: '💎神昇の秘石 x1 ＆ 神ひっさつの秘伝書 x5 ＆ 超限界突破の書 x5 ＆ 500,000 Ypt ＆ 称号「五百界の冥王神」',
    rewardType: 'title',
    rewardValue: { title: '五百界の冥王神', itemKey: 'godAscensionStone', amount: 1, extraItem: 'godSkillBook', extraAmount: 5, yPoints: 500000 }
  },

  // ── 501〜1000F Milestone Rewards (50階ごと) ──
  {
    floor: 550,
    title: '第550階層・天球の響き',
    bossName: '【550F星帝】天穹龍ウラノス',
    bossEmoji: '🪐🌌✨',
    rewardDesc: '神ひっさつの秘伝書 x3 ＆ 超限界突破の書 x3 ＆ 550,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 3, extraItem: 'superLimitBreakBook', extraAmount: 3, yPoints: 550000 }
  },
  {
    floor: 600,
    title: '第600階層・神域創生の光',
    bossName: '【600F創生神】創世母神ガイア・ネオ',
    bossEmoji: '👑🌱🌌✨',
    rewardDesc: '神ひっさつの秘伝書 x4 ＆ 超限界突破の書 x4 ＆ 600,000 Ypt ＆ 称号「六百界の創生神」',
    rewardType: 'title',
    rewardValue: { title: '六百界の創生神', itemKey: 'godSkillBook', amount: 4, extraItem: 'superLimitBreakBook', extraAmount: 4, yPoints: 600000 }
  },
  {
    floor: 650,
    title: '第650階層・銀河の咆哮',
    bossName: '【650F銀河】星獣ギャラクシー',
    bossEmoji: '🌌🦁⭐',
    rewardDesc: '神ひっさつの秘伝書 x4 ＆ 超限界突破の書 x4 ＆ 650,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 4, extraItem: 'superLimitBreakBook', extraAmount: 4, yPoints: 650000 }
  },
  {
    floor: 700,
    title: '第700階層・七星の輝き',
    bossName: '【700F光芒神】北斗天神ポラリス',
    bossEmoji: '⭐👑⚡🌟',
    rewardDesc: '神ひっさつの秘伝書 x5 ＆ 超限界突破の書 x5 ＆ 700,000 Ypt ＆ 称号「七百界の光芒神」',
    rewardType: 'title',
    rewardValue: { title: '七百界の光芒神', itemKey: 'godSkillBook', amount: 5, extraItem: 'superLimitBreakBook', extraAmount: 5, yPoints: 700000 }
  },
  {
    floor: 750,
    title: '第750階層・天頂の極光',
    bossName: '【750F極光】オーロラ神帝',
    bossEmoji: '🌈🪽🌌',
    rewardDesc: '💎神昇の秘石 x1 ＆ 神ひっさつの秘伝書 x5 ＆ 超限界突破の書 x5 ＆ 800,000 Ypt ＆ 称号「七百五十層の天頂覇神」',
    rewardType: 'title',
    rewardValue: { title: '七百五十層の天頂覇神', itemKey: 'godAscensionStone', amount: 1, extraItem: 'godSkillBook', extraAmount: 5, yPoints: 800000 }
  },
  {
    floor: 800,
    title: '第800階層・終焉の使徒',
    bossName: '【800F終焉神】絶対神オメガ・ゼロ',
    bossEmoji: '👑💀⚡🌌',
    rewardDesc: '神ひっさつの秘伝書 x6 ＆ 超限界突破の書 x6 ＆ 900,000 Ypt ＆ 称号「八百界の終焉神」',
    rewardType: 'title',
    rewardValue: { title: '八百界の終焉神', itemKey: 'godSkillBook', amount: 6, extraItem: 'superLimitBreakBook', extraAmount: 6, yPoints: 900000 }
  },
  {
    floor: 850,
    title: '第850階層・神速の彼方',
    bossName: '【850F超光速】光速神ヘルメス・ゴッド',
    bossEmoji: '⚡🪽💨',
    rewardDesc: '神ひっさつの秘伝書 x6 ＆ 超限界突破の書 x6 ＆ 1,000,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 6, extraItem: 'superLimitBreakBook', extraAmount: 6, yPoints: 1000000 }
  },
  {
    floor: 900,
    title: '第900階層・無の境地',
    bossName: '【900F虚無神】虚無の覇王ヴォイド',
    bossEmoji: '🕳️👁️👑🖤',
    rewardDesc: '神ひっさつの秘伝書 x7 ＆ 超限界突破の書 x7 ＆ 1,200,000 Ypt ＆ 称号「九百界の虚無神」',
    rewardType: 'title',
    rewardValue: { title: '九百界の虚無神', itemKey: 'godSkillBook', amount: 7, extraItem: 'superLimitBreakBook', extraAmount: 7, yPoints: 1200000 }
  },
  {
    floor: 950,
    title: '第950階層・神威の終着点',
    bossName: '【950F神威極】創世守護神セラフ',
    bossEmoji: '🪽👑⚡🌟',
    rewardDesc: '神ひっさつの秘伝書 x8 ＆ 超限界突破の書 x8 ＆ 1,500,000 Ypt',
    rewardType: 'item',
    rewardValue: { itemKey: 'godSkillBook', amount: 8, extraItem: 'superLimitBreakBook', extraAmount: 8, yPoints: 1500000 }
  },
  {
    floor: 1000,
    title: '第1000階層・全宇宙の天頂',
    bossName: '【1000F全知全能】創世超越神・無量エンマ・オメガ',
    bossEmoji: '🌌👑☀️⚡💥💎🌟♾️',
    rewardDesc: '💎神昇の秘石 x5 ＆ 神ひっさつの秘伝書 x10 ＆ 超限界突破の書 x10 ＆ 3,000,000 Ypt ＆ 伝説神話称号「千界制覇・無量超越神」',
    rewardType: 'title',
    rewardValue: { title: '千界制覇・無量超越神', itemKey: 'godAscensionStone', amount: 5, extraItem: 'godSkillBook', extraAmount: 10, yPoints: 3000000 }
  }
];

// 動的階層ステージ生成関数
export const getTowerFloorStage = (floor: number): Stage => {
  const milestone = TOWER_MILESTONES.find(m => m.floor === floor);
  
  // 基礎HPと攻撃力の計算
  let baseHp: number;
  let baseAtk: number;
  let name = `無限の試練の塔 ${floor}F`;
  let enemyName = `【${floor}F試練獣】ガーディアン`;
  let enemyEmoji = '🗿⚡';
  let enemyColor = '#6366f1';

  if (floor <= 5) {
    baseHp = 800000 * floor;
    baseAtk = 80 + floor * 15;
  } else if (floor <= 10) {
    baseHp = 4000000 + (floor - 5) * 4000000;
    baseAtk = 160 + (floor - 5) * 20;
    enemyEmoji = '👹🔥';
    enemyColor = '#dc2626';
  } else if (floor <= 20) {
    baseHp = 25000000 + (floor - 10) * 15000000;
    baseAtk = 260 + (floor - 10) * 25;
    enemyEmoji = '🐲⚡';
    enemyColor = '#7c3aed';
  } else if (floor <= 30) {
    baseHp = 200000000 + (floor - 20) * 80000000;
    baseAtk = 500 + (floor - 20) * 40;
    enemyEmoji = '👑🔮';
    enemyColor = '#9333ea';
  } else if (floor <= 50) {
    baseHp = 1000000000 + (floor - 30) * 1000000000;
    baseAtk = 1000 + (floor - 30) * 100;
    enemyEmoji = '🌌⚡';
    enemyColor = '#3b0764';
  } else if (floor < 100) {
    // 51F〜99F: 50F(200億)から99F(約40兆)まで急激に上昇
    const progress = (floor - 50) / 49;
    baseHp = Math.floor(20000000000 * Math.pow(2000, progress));
    baseAtk = Math.floor(3000 + progress * 97000);
    enemyEmoji = '👑🌌✨';
    enemyColor = '#1e1b4b';
  } else if (floor === 100) {
    // 100F: Uz+++でも倒すのが難しい超絶難関ボス！
    // 基礎HP 80兆 (milestone倍率で120兆), 基礎Atk 180,000 (milestone倍率で225,000)
    baseHp = 80000000000000;
    baseAtk = 180000;
    enemyEmoji = '⚡👑💎🌟';
    enemyColor = '#ffd700';
  } else if (floor <= 500) {
    // 101F〜500F: 100兆から3,000兆へスケール
    const progress = (floor - 100) / 400;
    baseHp = Math.floor(100000000000000 + progress * 2900000000000000);
    baseAtk = Math.floor(200000 + progress * 1300000);
    enemyEmoji = '🌌👑⚡';
    enemyColor = '#0f172a';
  } else {
    // 501F〜1000F: 3,000兆から10京(100,000兆)へスケール
    const progress = (floor - 500) / 500;
    baseHp = Math.floor(3000000000000000 + progress * 97000000000000000);
    baseAtk = Math.floor(1500000 + progress * 8500000);
    enemyEmoji = '🌌♾️👑⚡';
    enemyColor = '#000000';
  }

  if (milestone) {
    name = `無限の試練の塔 【${floor}F BOSS】`;
    enemyName = milestone.bossName;
    enemyEmoji = milestone.bossEmoji;
    baseHp = Math.floor(baseHp * 1.5);
    baseAtk = Math.floor(baseAtk * 1.25);
    enemyColor = '#ffd700';
  }

  // 報酬
  const rewardMoney = Math.min(10000000, 10000 + floor * 5000);
  const rewardYPoints = Math.min(50000, 200 + floor * 75);

  return {
    id: `tower_floor_${floor}`,
    name,
    enemyName,
    enemyHp: baseHp,
    enemyAtk: baseAtk,
    enemyColor,
    enemyEmoji,
    rewardMoney,
    rewardYPoints,
    areaName: `無限の試練の塔 ${Math.floor((floor - 1) / 10) * 10 + 1}F〜${Math.floor((floor - 1) / 10 + 1) * 10}F`
  };
};
