// 超大型レイドボス（強敵討伐戦）のデータ定義

export interface RaidBossTrait {
  tribeBoost?: { tribe: string; multiplier: number; label: string };
  skillTypeBoost?: { skillType: string; multiplier: number; label: string };
  specificCharBoost?: { charIds: string[]; multiplier: number; label: string };
  description: string;
}

export interface RaidBoss {
  id: string;
  name: string;
  subtitle: string;
  maxHp: number; // 50兆, 200兆, 1000兆, 100京など
  formattedHp: string;
  avatarEmoji: string;
  bgGradient: string;
  borderHex: string;
  rewardYPoints: number;
  rewardItemName: string;
  rewardItemIcon: string;
  rewardItemCount: number;
  traits: RaidBossTrait[];
}

export const RAID_BOSSES: RaidBoss[] = [
  {
    id: 'raid_1',
    name: '災厄巨神・百鬼夜行オロチ',
    subtitle: '【討伐レベル 1】超巨身の古き魔神（50兆HP）',
    maxHp: 50000000000000, // 50兆
    formattedHp: '50兆',
    avatarEmoji: '🐍💥',
    bgGradient: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #1e1b4b 100%)',
    borderHex: '#f59e0b',
    rewardYPoints: 30000,
    rewardItemName: '超限界突破の書',
    rewardItemIcon: '📕',
    rewardItemCount: 2,
    traits: [
      {
        tribeBoost: { tribe: 'イサマシ', multiplier: 5, label: '⚔️ イサマシ族 攻撃力5倍！' },
        description: 'イサマシ族の勇猛果敢な剣技が特効！ダメージが5倍に上昇。'
      },
      {
        skillTypeBoost: { skillType: 'single_damage', multiplier: 10, label: '🎯 単体直接攻撃必殺技 10倍！' },
        description: 'ピンポイントの一撃必殺技が貫通特効を発揮して10倍ダメージ！'
      }
    ]
  },
  {
    id: 'raid_2',
    name: '虚圏大帝・バラガン・ルイゼンバーン',
    subtitle: '【討伐レベル 2】老いと腐食を司る絶対絶対帝王（200兆HP）',
    maxHp: 200000000000000, // 200兆
    formattedHp: '200兆',
    avatarEmoji: '👑💀',
    bgGradient: 'linear-gradient(135deg, #31103f 0%, #581c87 50%, #0f172a 100%)',
    borderHex: '#c084fc',
    rewardYPoints: 100000,
    rewardItemName: '神昇の秘石',
    rewardItemIcon: '💎',
    rewardItemCount: 2,
    traits: [
      {
        tribeBoost: { tribe: 'ウスラカゲ', multiplier: 8, label: '🌑 ウスラカゲ族 攻撃力8倍！' },
        description: '闇を抱くウスラカゲ族の術式が帝王の腐食能力を打ち消す！'
      },
      {
        specificCharBoost: {
          charIds: ['char_bleach_aizen', 'char_bleach_ulquiorra', 'char_bleach_grimmjow', 'char_bleach_ichigo'],
          multiplier: 30,
          label: '⚔️ BLEACHコラボキャラクター 30倍超特効！'
        },
        description: '虚圏（ウェコムンド）の決戦者たちが圧倒的な特効ダメージを叩き出す！'
      }
    ]
  },
  {
    id: 'raid_3',
    name: '崩玉完全融合・藍染惣右介【神崩】',
    subtitle: '【討伐レベル 3】次元の壁を突破した完全超越存在（1,000兆 / 1京HP）',
    maxHp: 1000000000000000, // 1000兆 (1京)
    formattedHp: '1,000兆 (1京)',
    avatarEmoji: '🦋✨',
    bgGradient: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #312e81 100%)',
    borderHex: '#ff3399',
    rewardYPoints: 300000,
    rewardItemName: '神ひっさつの秘伝書',
    rewardItemIcon: '📜',
    rewardItemCount: 3,
    traits: [
      {
        tribeBoost: { tribe: 'エンマ', multiplier: 10, label: '👑 エンマ族 攻撃力10倍！' },
        description: '王の血族たるエンマ族の神気のみが超越者の領域に到達する！'
      },
      {
        skillTypeBoost: { skillType: 'fever_charge', multiplier: 50, label: '⚡ フィーバー突入＆強化技 50倍爆発！' },
        description: 'フィーバータイム中の猛攻が崩玉のバリアを粉砕し50倍ダメージ！'
      }
    ]
  },
  {
    id: 'raid_4',
    name: '始祖滅殺・極天創世神【全知全能】',
    subtitle: '【最難関・超覇王】全次元の終焉と創世を司る始祖神（100京HP）',
    maxHp: 1000000000000000000, // 100京
    formattedHp: '100京',
    avatarEmoji: '☀️🌌',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #7e22ce 50%, #be123c 100%)',
    borderHex: '#ffd700',
    rewardYPoints: 1000000,
    rewardItemName: '最高峰限定称号【創世の絶対討伐神】',
    rewardItemIcon: '🏆',
    rewardItemCount: 1,
    traits: [
      {
        specificCharBoost: {
          charIds: ['char_uz_god_supreme', 'char_bleach_aizen', 'char_bleach_ulquiorra'],
          multiplier: 100,
          label: '☀️ 創世神・ZZ神昇キャラクター 100倍超神特効！'
        },
        description: '神の領域に達したZZ/UZキャラクターのみが100倍の神撃を与える！'
      }
    ]
  }
];

// レイドボスIDからStageオブジェクトを生成
export const getRaidStage = (raidId: string, currentHpOverride?: number) => {
  const boss = RAID_BOSSES.find(b => b.id === raidId) || RAID_BOSSES[0];
  const enemyHp = typeof currentHpOverride === 'number' && currentHpOverride > 0 ? currentHpOverride : boss.maxHp;

  return {
    id: boss.id,
    name: `超大型レイドボス ${boss.name}`,
    enemyName: boss.name,
    enemyHp: enemyHp,
    enemyAtk: 120, // パズルバトル中の通常攻撃
    enemyColor: boss.borderHex,
    enemyEmoji: boss.avatarEmoji,
    rewardMoney: 1000000,
    rewardYPoints: boss.rewardYPoints,
    areaName: '超大型レイドボス強敵討伐戦'
  };
};
