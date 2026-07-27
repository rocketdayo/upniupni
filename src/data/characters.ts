export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';

export const RANK_BASE_MAX_LEVEL: Record<Rank, number> = {
  'SS': 60,
  'S': 50,
  'A': 40,
  'B': 30,
  'C': 25,
  'D': 20,
  'E': 10,
};

export const getCharacterMaxLevel = (rank: Rank, limitBreak: number = 0): number => {
  const base = RANK_BASE_MAX_LEVEL[rank] || 30;
  return base + (limitBreak || 0) * 10;
};

export const getPublicUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  let cleanPath = path;
  while (cleanPath.startsWith('/') || cleanPath.startsWith('./')) {
    cleanPath = cleanPath.replace(/^(\.\/|\/)+/, '');
  }
  const base = import.meta.env.BASE_URL || './';
  return base.endsWith('/') ? base + cleanPath : base + '/' + cleanPath;
};

// Generates an inline SVG Data URL for guaranteed high-quality Puni rendering
export const createPuniSvgDataUrl = (emoji: string, bgColor: string = '#ff4488'): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="grad" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="35%" stop-color="${bgColor}" />
        <stop offset="100%" stop-color="#110022" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.5"/>
      </filter>
    </defs>
    <circle cx="64" cy="64" r="54" fill="url(#grad)" filter="url(#shadow)" stroke="#ffffff" stroke-width="4" />
    <ellipse cx="44" cy="36" rx="16" ry="8" fill="#ffffff" opacity="0.6" transform="rotate(-25 44 36)" />
    <text x="64" y="80" font-size="56" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const createRankBadgeSvgDataUrl = (rank: string): string => {
  const colors: Record<string, string> = {
    'E': '#66bb66',
    'D': '#3388ff',
    'C': '#9933ff',
    'B': '#ffaa00',
    'A': '#ff3333',
    'S': '#ff00aa',
    'SS': '#e500ff'
  };
  const col = colors[rank] || '#ff4488';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <defs>
      <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#fff" />
        <stop offset="100%" stop-color="${col}" />
      </linearGradient>
    </defs>
    <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="url(#rg)" stroke="#fff" stroke-width="3"/>
    <text x="32" y="38" font-size="24" font-weight="900" fill="#fff" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">${rank}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export interface Skill {
  name: string;
  type: 'damage' | 'heal';
  power: number; // multiplier for damage or flat heal
}

export interface Character {
  id: string;
  name: string;
  rank: Rank;
  color: string;
  emoji: string;
  rankImage: string;
  imageUrl?: string;
  baseHp: number;
  baseAtk: number;
  skill?: Skill;
  trait?: string;           // キャラ特性（フレーバーテキスト）
  eventBoost?: boolean;     // イベント特効キャラか
  eventBoostDesc?: string;  // 特効の説明文
}

const generateCharacters = (): Character[] => {
  const chars: Character[] = [];
  let idCounter = 1;

  const rankImageMap: Record<Rank, string> = {
    'E': createRankBadgeSvgDataUrl('E'),
    'D': createRankBadgeSvgDataUrl('D'),
    'C': createRankBadgeSvgDataUrl('C'),
    'B': createRankBadgeSvgDataUrl('B'),
    'A': createRankBadgeSvgDataUrl('A'),
    'S': createRankBadgeSvgDataUrl('S'),
    'SS': createRankBadgeSvgDataUrl('SS'),
  };

  interface CharacterDef {
    name: string;
    emoji: string;
    trait?: string;
    skillName?: string;
    skillType?: 'damage' | 'heal';
    skillPower?: number;
  }

  const createSet = (rank: Rank, baseHp: number, baseAtk: number, color: string, list: CharacterDef[]) => {
    list.forEach((a, i) => {
      const char: Character = {
        id: `char_${rank.toLowerCase()}_${idCounter++}`,
        name: a.name,
        rank,
        color,
        emoji: a.emoji,
        rankImage: rankImageMap[rank],
        imageUrl: `puni_${rank.toLowerCase()}_${i + 1}.png`,
        baseHp: baseHp + i * 8,
        baseAtk: baseAtk + i * 3,
      };

      if (a.skillName && a.skillType) {
        char.skill = {
          name: a.skillName,
          type: a.skillType,
          power: a.skillPower || (
            rank === 'SS' ? (a.skillType === 'damage' ? 50 : 3000) :
            rank === 'S'  ? (a.skillType === 'damage' ? 30 : 1500) :
            (a.skillType === 'damage' ? 12 : 400)
          )
        };
      } else if (rank === 'S' || rank === 'SS') {
        const isSS = rank === 'SS';
        char.skill = {
          name: isSS ? (i % 2 === 0 ? '覇王絶空斬' : '神聖なる光') : (i % 2 === 0 ? '爆裂連撃' : '癒やしの陣'),
          type: i % 2 === 0 ? 'damage' : 'heal',
          power: isSS ? (i % 2 === 0 ? 45 : 2500) : (i % 2 === 0 ? 25 : 1000),
        };
      }

      if (a.trait) {
        char.trait = a.trait;
      } else if (rank === 'SS') {
        char.trait = i % 2 === 0 ? '神域に達した伝説の存在。圧倒的な火力で敵を滅ぼす。' : '究極の治癒力を宿した聖なる妖怪。';
      } else if (rank === 'S') {
        char.trait = '妖怪界の最高峰。一たび暴れだせば誰にも止められない。';
      } else {
        char.trait = `${rank}ランクの頼れる仲間。チームの力を底上げする！`;
      }

      // イベント特効キャラ（SSランクの特定のキャラ）
      if (rank === 'SS' && i % 3 === 0) {
        char.eventBoost = true;
        char.eventBoostDesc = 'イベントステージで攻撃力が3倍アップ！';
      }

      chars.push(char);
    });
  };

  // Eランク妖怪
  const eList: CharacterDef[] = [
    { name: 'ぶようじん坊', emoji: '🗡️', trait: 'いつも油断ばかりしている足軽妖怪。' },
    { name: 'ダラケ刀', emoji: '⚔️', trait: 'だらけて切れない刀の妖怪。' },
    { name: '獅子まる', emoji: '🦁', trait: '未熟だがやる気にあふれる獅子っ子妖怪。' },
    { name: 'おこ武者', emoji: '怒', trait: 'いつも怒っている小さな武者。' },
    { name: '枕返し', emoji: '枕', trait: '寝ている間に枕を返してしまう。' },
    { name: 'わすれん帽', emoji: '🎩', trait: '取り憑かれると大切なことを忘れてしまう。' },
    { name: 'ばか頭巾', emoji: '巾', trait: '取り憑かれると陽気なおバカになる。' },
    { name: '化け草履', emoji: '履', trait: '大切にされないと化けて出る草履。' },
    { name: 'パッカー', emoji: '口', trait: '何でもパッカンと開けてしまう。' },
    { name: 'ナンデナン', emoji: '❓', trait: '何でも「なんでナン？」と聞いてくる。' },
  ];
  createSet('E', 100, 10, '#88cc88', eList);

  // Dランク妖怪
  const dList: CharacterDef[] = [
    { name: 'ちからモチ', emoji: '🍡', trait: '餅のように粘り強いパワーを持つ。' },
    { name: 'やきモチ', emoji: '🔥', trait: '妬みやヤキモチを焼かせる妖怪。' },
    { name: 'おにぎり侍', emoji: '🍙', trait: 'おにぎりを愛する熱血侍。' },
    { name: 'あかなめ', emoji: '👅', trait: 'お風呂場の汚れを綺麗になめる。' },
    { name: '一瞬ボーイ', emoji: '⚡', trait: '何事も一瞬で終わらせる。' },
    { name: 'ガチン小僧', emoji: '✊', trait: 'ガチンコ勝負が大好きな少年妖怪。' },
    { name: 'ひつま武士', emoji: '🍚', trait: 'ひつまぶしをこよなく愛する侍。' },
    { name: '寝ブタ', emoji: '🐖', trait: '寝転がって動かないブタのねぶた。' },
    { name: 'カブトさん', emoji: '🪲', trait: '立派な角と兜を持つカブトムシ。' },
    { name: 'バクロ婆', emoji: '👵', trait: '隠し事を暴露させてしまうおばあさん。' },
  ];
  createSet('D', 150, 15, '#55aa55', dList);

  // Cランク妖怪
  const cList: CharacterDef[] = [
    { name: 'がらあきん坊', emoji: '🥋', trait: 'ガードがガラ空きな元気っ子。' },
    { name: 'メラメライオン', emoji: '🦁', trait: '燃え上がる情熱でみんなをアツくする！' },
    { name: 'ブリー隊長', emoji: '🎖️', trait: '「ビクトリー！」と叫ぶエクササイズ隊長。' },
    { name: '泥田坊', emoji: '🌾', trait: '「田を返せ〜」と田んぼから現れる。' },
    { name: 'がらあきん坊金旋', emoji: '✨', trait: '金のオーラを纏ったがらあきん坊。' },
    { name: 'ニクヤ鬼', emoji: '🍖', trait: 'お肉を焼くのが大好きな鬼。' },
    { name: 'ベンケイ', emoji: '🛡️', trait: '999本の刀を集めた重厚な弁慶。' },
    { name: '寸胴丸', emoji: '🍜', trait: 'ラーメンの寸胴から生まれた妖怪。' },
    { name: 'ホンマグロ大将', emoji: '🐟', trait: '活きのいいマグロの寿司職人。' },
    { name: 'ザンバラ刀', emoji: '⚔️', trait: 'ザンバラ髪のワイルドな刀妖怪。' },
  ];
  createSet('C', 200, 25, '#aa5555', cList);

  // Bランク妖怪
  const bList: CharacterDef[] = [
    { name: 'さきがけの助', emoji: '🚩', trait: '一番槍を狙う一番手。', skillName: '突撃一番槍', skillType: 'damage' },
    { name: 'グラグライオン', emoji: '🌋', trait: '大地をグラグラ揺らすライオン。', skillName: 'グラグララッシュ', skillType: 'damage' },
    { name: 'クワノ武士', emoji: '🪲', trait: '立派なハサミで切断するクワガタ。', skillName: 'ハサミ一閃', skillType: 'damage' },
    { name: 'フユニャン', emoji: '🐱', trait: '根性あふれるダークブルーのガッツネコ！', skillName: 'ど根性ストレート', skillType: 'damage' },
    { name: '妖怪ガッツK', emoji: '⚾', trait: 'ガッツ溢れる伝説のベースボール妖怪。', skillName: 'ガッツフルスイング', skillType: 'damage' },
    { name: 'フユニャン曹操', emoji: '👑', trait: '三国志の英雄・曹操となったフユニャン。', skillName: '覇王肉きゅう', skillType: 'damage' },
    { name: 'さきがけの助金旋', emoji: '✨', trait: '金箔を施された特別なさきがけの助。', skillName: '黄金突撃', skillType: 'damage' },
    { name: 'いばる〜ん', emoji: '😤', trait: '威張ってばかりいる気取った妖怪。', skillName: 'いばり威嚇', skillType: 'heal' },
    { name: '早乙女乱馬', emoji: '🥋', trait: '無差別格闘早乙女流の継承者！', skillName: '飛龍昇天破', skillType: 'damage' },
    { name: '犬夜叉', emoji: '🐕', trait: '鉄砕牙を操る半妖の少年！', skillName: '風の傷', skillType: 'damage' },
  ];
  createSet('B', 300, 40, '#ff88aa', bList);

  // Aランク妖怪
  const aList: CharacterDef[] = [
    { name: '轟獅子', emoji: '🦁', trait: '轟く咆哮で味方の士気を最大に高める！', skillName: '轟く咆哮', skillType: 'damage' },
    { name: 'くしゃ武者', emoji: '😡', trait: 'くしゃくしゃに怒り狂う暴れ武者。', skillName: '怒髪天斬り', skillType: 'damage' },
    { name: '万尾獅子', emoji: '🦁', trait: '「満を持して…今だ！」圧倒的一撃。', skillName: '満を持して連撃', skillType: 'damage' },
    { name: 'モモタロニャン', emoji: '🍑', trait: '鬼退治の英雄となった桃ネコ妖怪。', skillName: 'きびだんごアタック', skillType: 'damage' },
    { name: 'マスクドニャーン', emoji: '🎭', trait: '覆面を被った謎のプロレスニャン。', skillName: '必殺フライングプレス', skillType: 'damage' },
    { name: 'ニャン騎士', emoji: '🛡️', trait: '騎士道精神に溢れる高貴なネコ騎士。', skillName: 'ホーリーセイバー', skillType: 'damage' },
    { name: '総ナメ', emoji: '👅', trait: 'あらゆる栄冠を総ナメにする豪運妖怪。', skillName: '栄光の舌舐め', skillType: 'heal' },
    { name: '天下無僧', emoji: '⛩️', trait: '天下に敵なしと謳われる修行僧。', skillName: '天下無双掌', skillType: 'damage' },
    { name: 'まさむね', emoji: '⚔️', trait: '名刀政宗を宿した天下一の剣士。', skillName: '名刀一刀両断', skillType: 'damage' },
    { name: 'むらまさ', emoji: '🗡️', trait: '妖刀村正に魅せられた妖しき剣豪。', skillName: '妖刀連撃', skillType: 'damage' },
  ];
  createSet('A', 450, 60, '#ffaa00', aList);

  // Sランク妖怪
  const sList: CharacterDef[] = [
    { name: '花垣武道', emoji: '👊', trait: '何度倒れても立ち上がるリベンジャー！', skillName: '譲れない思い', skillType: 'damage', skillPower: 35 },
    { name: 'ミカサ', emoji: '⚔️', trait: '人類最強の戦闘能力を誇る調査兵団。', skillName: 'ブレード乱舞', skillType: 'damage', skillPower: 38 },
    { name: 'ゴモラ', emoji: '🦖', trait: '超振動波で岩盤をも砕く古代怪獣！', skillName: '超振動波', skillType: 'damage', skillPower: 34 },
    { name: 'ウルトラマン', emoji: '光', trait: 'M78星雲からきた光の巨人！', skillName: 'スペシウム光線', skillType: 'damage', skillPower: 40 },
    { name: '獅白ぼたん', emoji: '♌', trait: 'ホロライブ所属のFPSゲーマー獅子！', skillName: 'エイム爆撃', skillType: 'damage', skillPower: 36 },
    { name: '赤ぷよ', emoji: '🔴', trait: '4つ揃うと弾けて大連鎖を起こす！', skillName: 'ばよえ〜ん連鎖', skillType: 'damage', skillPower: 32 },
    { name: 'アーサー', emoji: '👑', trait: '聖剣エクスカリバーを掲げる騎士王。', skillName: 'エクスカリバー', skillType: 'damage', skillPower: 38 },
    { name: 'クワガ大将', emoji: '🪲', trait: 'クワガタ族の頂点に立つ将軍。', skillName: '大将の挟撃', skillType: 'damage', skillPower: 30 },
    { name: 'オオクワノ神', emoji: '✨', trait: '神の加護を受けたクワガタの神霊。', skillName: '神域の鋏', skillType: 'heal', skillPower: 2000 },
    { name: 'なまはげ', emoji: '👹', trait: '「悪い子はいねーかー！」包丁を乱舞！', skillName: '悪い子乱舞', skillType: 'damage', skillPower: 38 },
  ];
  createSet('S', 700, 100, '#ff2222', sList);

  // SSランク妖怪
  const ssList: CharacterDef[] = [
    { name: 'パウロ', emoji: '🗡️', trait: '無職転生の伝承剣士。二刀流で敵を圧倒！', skillName: '二閃流斬撃', skillType: 'damage', skillPower: 60 },
    { name: 'ベニマル', emoji: '🔥', trait: '鬼種族の若き大将。黒炎で敵を焼き尽くす！', skillName: '黒炎獄', skillType: 'damage', skillPower: 62 },
    { name: '里羽リュウタ', emoji: '🐉', trait: '龍の血を継ぐ龍羽の戦士！', skillName: '龍神極光斬', skillType: 'damage', skillPower: 65 },
    { name: '阿弥陀丸', emoji: '⚔️', trait: 'シャーマンキングの持霊！名刀春雨の一撃！', skillName: '真空仏陀切り', skillType: 'damage', skillPower: 64 },
    { name: '覚醒早乙女乱馬', emoji: '🥋', trait: '究極の格闘センスが開花した乱馬！', skillName: '猛虎高飛車', skillType: 'damage', skillPower: 68 },
    { name: 'フェルト', emoji: '風', trait: '風のように素早い風足の王位候補。', skillName: '風の疾走', skillType: 'damage', skillPower: 58 },
    { name: 'めぐみん', emoji: '💥', trait: '爆裂魔法を愛し、爆裂魔法に生きる紅魔族！', skillName: 'エクスプロージョン！', skillType: 'damage', skillPower: 80 },
    { name: '五月', emoji: '⭐', trait: '五等分の花嫁！真面目で一途なパワー！', skillName: '星の祝福', skillType: 'heal', skillPower: 4500 },
    { name: 'メリオダス', emoji: '😈', trait: '＜七つの大罪＞団長！魔神の力を全解放！', skillName: '全反撃（フルカウンター）', skillType: 'damage', skillPower: 75 },
    { name: 'ブシ王', emoji: '👑', trait: 'レジェンド武士の王者！全妖怪を平定する！', skillName: '天下布武・千人斬り', skillType: 'damage', skillPower: 70 },
  ];
  createSet('SS', 1200, 250, '#ff22ff', ssList);

  return chars;
};

export const CHARACTERS = generateCharacters();
