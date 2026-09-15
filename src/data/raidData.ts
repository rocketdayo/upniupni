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
  maxHp: number; // 垓, 𥝱 級の超巨大HP
  formattedHp: string;
  avatarEmoji: string;
  bgGradient: string;
  borderHex: string;
  rewardYPoints: number;
  rewardItemName: string;
  rewardItemIcon: string;
  rewardItemCount: number;
  hasObstacleGimmick?: boolean; // お邪魔スキル（お邪魔ぷに・妨害ギミック）
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
    rewardYPoints: 120, // 大幅下方修正
    rewardItemName: '超限界突破の書',
    rewardItemIcon: '📕',
    rewardItemCount: 1,
    traits: [
      {
        tribeBoost: { tribe: 'イサマシ', multiplier: 5, label: '⚔️ イサマシ族 攻撃力5倍！' },
        description: 'イサマシ族の勇猛果敢な剣技が特効！ダメージが5倍に上昇。'
      }
    ]
  },
  {
    id: 'raid_2',
    name: '虚圏大帝・バラガン・ルイゼンバーン',
    subtitle: '【討伐レベル 2】老いと腐食を司る絶対帝王（200兆HP）',
    maxHp: 200000000000000, // 200兆
    formattedHp: '200兆',
    avatarEmoji: '👑💀',
    bgGradient: 'linear-gradient(135deg, #31103f 0%, #581c87 50%, #0f172a 100%)',
    borderHex: '#c084fc',
    rewardYPoints: 350, // 大幅下方修正
    rewardItemName: '神昇の秘石',
    rewardItemIcon: '💎',
    rewardItemCount: 1,
    traits: [
      {
        tribeBoost: { tribe: 'ウスラカゲ', multiplier: 8, label: '🌑 ウスラカゲ族 攻撃力8倍！' },
        description: '闇を抱くウスラカゲ族の術式が帝王の腐食能力を打ち消す！'
      }
    ]
  },
  {
    id: 'raid_3',
    name: '崩玉完全融合・藍染惣右介【神崩】',
    subtitle: '【討伐レベル 3】次元の壁を突破した完全超越存在（1京HP）',
    maxHp: 10000000000000000, // 1京
    formattedHp: '1京',
    avatarEmoji: '🦋✨',
    bgGradient: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #312e81 100%)',
    borderHex: '#ff3399',
    rewardYPoints: 800, // 大幅下方修正
    rewardItemName: '神ひっさつの秘伝書',
    rewardItemIcon: '📜',
    rewardItemCount: 1,
    traits: [
      {
        tribeBoost: { tribe: 'エンマ', multiplier: 10, label: '👑 エンマ族 攻撃力10倍！' },
        description: '王の血族たるエンマ族の神気のみが超越者の領域に到達する！'
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
    rewardYPoints: 2000, // 大幅下方修正
    rewardItemName: '最高峰限定称号【創世の絶対討伐神】',
    rewardItemIcon: '🏆',
    rewardItemCount: 1,
    traits: [
      {
        specificCharBoost: {
          charIds: ['char_uz_god_supreme', 'char_bleach_aizen', 'char_bleach_ulquiorra'],
          multiplier: 100,
          label: '☀️ 創世神キャラクター 100倍超神特効！'
        },
        description: '神の領域に達したZZ/UZキャラクターのみが100倍の神撃を与える！'
      }
    ]
  },
  {
    id: 'raid_5',
    name: '【終焉垓神】アザトース・オメガ',
    subtitle: '【絶望級・お邪魔妨害】数多の宇宙を呑み込む無限の混沌（100垓(がい)HP）',
    maxHp: 9000000000000000000, // 100垓相当の超巨大HP
    formattedHp: '100垓 (100,000,000京)',
    avatarEmoji: '🌀👿💥',
    bgGradient: 'linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #09090b 100%)',
    borderHex: '#ef4444',
    rewardYPoints: 5000, // 非常にレアで価値のあるYpt
    rewardItemName: '【垓神の証】究極創世の秘石',
    rewardItemIcon: '🔮',
    rewardItemCount: 1,
    hasObstacleGimmick: true,
    traits: [
      {
        description: '⚠️【お邪魔妨害スキル発動】定期的にパズル盤面上にお邪魔ぷに（デカお邪魔＆固定ブロック）を生成し、プレイヤーの連鎖を徹底妨害する最凶ギミック！'
      },
      {
        specificCharBoost: {
          charIds: ['char_uz_jashin_master', 'char_uz_god_supreme'],
          multiplier: 250,
          label: '👑 UZ+++【極・邪神創世皇】特効 250倍ダメージ！'
        },
        description: '最上位UZ+++キャラクターのみがお邪魔結界を粉砕し250倍の特効ダメージを与える！'
      }
    ]
  },
  {
    id: 'raid_6',
    name: '【次元𥝱神】オメガ・ジ・エンパイア',
    subtitle: '【神域極限・全能お邪魔妨害】全次元と因果律を完全に統べる究極神（10𥝱(じょ)HP）',
    maxHp: 9000000000000000000000000, // 10𥝱 相当
    formattedHp: '10𥝱 (10,000,000垓)',
    avatarEmoji: '👑🌌⚡',
    bgGradient: 'linear-gradient(135deg, #09090b 0%, #581c87 50%, #000000 100%)',
    borderHex: '#00ffff',
    rewardYPoints: 10000, // 最高難度報酬
    rewardItemName: '【𥝱神の冠】全能神の神剣',
    rewardItemIcon: '⚔️',
    rewardItemCount: 1,
    hasObstacleGimmick: true,
    traits: [
      {
        description: '⚠️【超・お邪魔妨害スキル】パズルエリアに絶え間なく高硬度のお邪魔ぷにを降らせ、さらにフィーバーゲージを強制吸収する極悪非道な妨害ギミック！'
      },
      {
        specificCharBoost: {
          charIds: ['char_uz_jashin_master'],
          multiplier: 500,
          label: '⚡ UZ+++【極・邪神創世皇ゲートマスター】特効 500倍超神特効！'
        },
        description: '最高峰UZ+++「極・邪神創世皇ゲートマスター」だけが神域の因果律を断ち切り500倍の超絶ダメージを与える！'
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
    enemyAtk: boss.hasObstacleGimmick ? 45000 : 12000, // 圧倒的攻撃力
    enemyColor: boss.borderHex,
    enemyEmoji: boss.avatarEmoji,
    rewardMoney: 10000,
    rewardYPoints: boss.rewardYPoints,
    areaName: '超大型レイドボス強敵討伐戦'
  };
};

