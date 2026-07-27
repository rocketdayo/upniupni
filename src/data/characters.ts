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
  return '/' + cleanPath;
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
        imageUrl: createPuniSvgDataUrl(a.emoji, color),
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

  // Eランク妖怪（各族ミックス）
  const eList: CharacterDef[] = [
    { name: 'ぶようじん坊', emoji: '🗡️', trait: 'いつも油断ばかりしている足軽妖怪。' },
    { name: 'わすれん帽', emoji: '🎩', trait: '取り憑かれると大事なことを忘れてしまう。' },
    { name: 'どき土器', emoji: '🏺', trait: '何でもドキドキしてしまう土器の妖怪。' },
    { name: 'ひも爺', emoji: '👴', trait: 'お腹を空かせるひもじいパワーの持ち主。' },
    { name: 'ネガティブーン', emoji: '🦟', trait: 'ネガティブな気持ちにさせる小さな妖怪。' },
    { name: 'じんめん犬', emoji: '🐶', trait: '顔が人間、体が犬のシュールな妖怪。' },
    { name: 'ツチノコ', emoji: '🐍', trait: 'めったに出会えないラッキーな妖怪。' },
    { name: 'ジミー', emoji: '🥷', trait: '存在感がとても薄い忍者妖怪。' },
    { name: 'モレゾウ', emoji: '🐘', trait: '取り憑かれるとおしっこが漏れそうになる。' },
    { name: 'びんぼう家', emoji: '🏚️', trait: '取り憑かれるとお金が逃げていく。' },
  ];
  createSet('E', 100, 10, '#88cc88', eList);

  // Dランク妖怪（各族ミックス）
  const dList: CharacterDef[] = [
    { name: 'ノガッパ', emoji: '🥒', trait: 'キュウリが大好きな河童妖怪。' },
    { name: 'グレるリン', emoji: '🕶️', trait: 'リーゼントが自慢の不良妖怪。' },
    { name: 'バクロ婆', emoji: '👵', trait: '隠し事を暴露させてしまうおばあさん。' },
    { name: 'おにぎり侍', emoji: '🍙', trait: 'おにぎりを愛する熱血侍。' },
    { name: 'キズナメコ', emoji: '🍄', trait: '傷口を舐めて癒やしてくれるきのこ。' },
    { name: 'ダララダンビラ', emoji: '⚔️', trait: 'だらだら過ごすのが大好きな大剣士。' },
    { name: 'むりかべ', emoji: '🧱', trait: '「ムリ〜！」と言って立ちふさがる壁。' },
    { name: 'けちらし', emoji: '💨', trait: '散らかすのが大好きな妖怪。' },
    { name: 'うらやましろう', emoji: '👻', trait: '何でもうらやましがる妖怪。' },
    { name: 'たらいまわし', emoji: '🪣', trait: 'タライを回してあちこちへ押し付ける。' },
  ];
  createSet('D', 150, 15, '#55aa55', dList);

  // Cランク妖怪（各族ミックス）
  const cList: CharacterDef[] = [
    { name: 'コマじろう', emoji: '🐯', trait: 'コマさんの弟。都会にすっかり慣れている。' },
    { name: 'メラメライオン', emoji: '🦁', trait: '燃え上がる情熱でみんなをアツくする！' },
    { name: 'ほのボーノ', emoji: '☀️', trait: '場をほのぼのさせる癒やし系妖怪。' },
    { name: 'ろくろ首', emoji: '🦒', trait: '首がびよーんと伸びるクラシックな妖怪。' },
    { name: 'からかさお化け', emoji: '☂️', trait: '一本足でジャンプする傘の妖怪。' },
    { name: 'ちからもち', emoji: '🏋️', trait: '力自慢の豪快な妖怪。' },
    { name: 'えんらえんら', emoji: '💨', trait: '煙から生まれた美しき妖怪。' },
    { name: 'クジラマン', emoji: '🐳', trait: '巨大な体で豪快な打撃を繰り出す。' },
    { name: 'あかなめ', emoji: '👅', trait: 'お風呂場の汚れを綺麗になめる。' },
    { name: 'かたのり小僧', emoji: '👦', trait: '肩に乗って肩こりを起こさせる。' },
  ];
  createSet('C', 200, 25, '#aa5555', cList);

  // Bランク妖怪（各族ミックス）
  const bList: CharacterDef[] = [
    { name: 'ジバニャン', emoji: '🐱', trait: '車に立ち向かう地縛霊のネコ妖怪！', skillName: 'ひゃくれつ肉きゅう', skillType: 'damage' },
    { name: 'コマさん', emoji: '🐶', trait: '「もんげー！」が口癖の神社コマ犬妖怪。', skillName: 'ひとだま乱舞', skillType: 'damage' },
    { name: 'ロボニャン', emoji: '🤖', trait: '未来からやってきたメカジバニャン。', skillName: 'ボックウアタック', skillType: 'damage' },
    { name: 'トゲニャン', emoji: '🦔', trait: '全身がトゲトゲになったジバニャン。', skillName: 'チクチク肉きゅう', skillType: 'damage' },
    { name: 'フゥミン', emoji: '👁️', trait: '寝不足にさせる魅惑の妖怪。', skillName: 'ナイトメア', skillType: 'heal' },
    { name: '武者かぶと', emoji: '🪲', trait: '重厚な鎧を纏った兜虫侍。', skillName: '一刀両断', skillType: 'damage' },
    { name: 'ワルニャン', emoji: '🕶️', trait: 'リーゼントを決めたツッパリネコ。', skillName: 'ケンカキック', skillType: 'damage' },
    { name: '万尾獅子', emoji: '🦁', trait: '「まだだ、まだその時ではない…！」', skillName: '満を持して連撃', skillType: 'damage' },
    { name: 'USAピョン', emoji: '🐰', trait: '宇宙服を着たミーハーなウサギ妖怪！', skillName: 'ベイダーモード', skillType: 'damage' },
    { name: 'ウィスパー', emoji: '👻', trait: '自称・妖怪執事。妖怪パッドが手放せない。', skillName: '執事の一撃', skillType: 'damage' },
  ];
  createSet('B', 300, 40, '#ff88aa', bList);

  // Aランク妖怪（各族ミックス）
  const aList: CharacterDef[] = [
    { name: 'ふぶき姫', emoji: '❄️', trait: '氷を操る美しい妖怪。周りを凍りつかせる。', skillName: 'キラキラ雪ごおり', skillType: 'damage' },
    { name: 'クサナギ', emoji: '⚔️', trait: '神剣クサナギをその手に抱く剣豪。', skillName: '天の叢雲', skillType: 'damage' },
    { name: 'アゲアゲハ', emoji: '🦋', trait: '気分をアゲアゲにしてくれる極楽蝶。', skillName: 'ハッピーパウダー', skillType: 'heal' },
    { name: 'ヤミカラス', emoji: '🦅', trait: '闇夜を舞う漆黒の羽を持つ。', skillName: 'ダークスライサー', skillType: 'damage' },
    { name: '龍神', emoji: '🐉', trait: '天天を駆け巡る高貴な龍神。', skillName: 'ドラゴンブレス', skillType: 'damage' },
    { name: '妖怪ガッツF', emoji: '✊', trait: 'ガッツ溢れる熱きヒーロー！', skillName: 'ガッツパンチ', skillType: 'damage' },
    { name: 'かげむら騎士', emoji: '🛡️', trait: '影の力を宿した漆黒の騎士。', skillName: 'ダークガード', skillType: 'damage' },
    { name: 'ベラボーマン', emoji: '🦸', trait: '正義のために戦うベラボーな妖怪。', skillName: 'ベラボービーム', skillType: 'damage' },
    { name: 'ヒカリオロチ', emoji: '✨', trait: '聖なる光を纏った黄金のオロチ。', skillName: '光龍連弾', skillType: 'damage' },
    { name: 'ダークニャン', emoji: '🦇', trait: '闇のヒーローとなったジバニャン。', skillName: 'ダークフレア', skillType: 'damage' },
  ];
  createSet('A', 450, 60, '#ffaa00', aList);

  // Sランク妖怪（各族ミックス・多彩で強力な必殺技）
  const sList: CharacterDef[] = [
    { name: 'オロチ', emoji: '🐍', trait: 'さすらいの妖魔。龍の影を自在に操る。', skillName: 'やたの鏡', skillType: 'damage', skillPower: 30 },
    { name: 'キュウビ', emoji: '🦊', trait: '九つの尾を持つ最高峰の狐妖怪。', skillName: '紅蓮地獄', skillType: 'damage', skillPower: 32 },
    { name: 'ブシニャン', emoji: '⚔️', trait: 'レジェンド妖怪！伝説の剣技を解き放つ！', skillName: 'カツオ節斬り', skillType: 'damage', skillPower: 35 },
    { name: 'あつガルル', emoji: '🐺', trait: '灼熱の炎を身に纏う凄まじい狼。', skillName: 'アツアツメラメラ', skillType: 'damage', skillPower: 30 },
    { name: '百鬼姫', emoji: '👸', trait: '鬼族の姫君。漆黒の闇花を咲かせる。', skillName: '百鬼夜行', skillType: 'damage', skillPower: 28 },
    { name: '影オロチ', emoji: '👤', trait: '影の暗殺者。一瞬でターゲットを屠る。', skillName: '影流やたの鏡', skillType: 'heal', skillPower: 1500 },
    { name: 'なまはげ', emoji: '👹', trait: '「悪い子はいねーかー！」包丁を振るう！', skillName: '悪い子はいねーかー', skillType: 'damage', skillPower: 38 },
    { name: '土蜘蛛', emoji: '🕷️', trait: '元祖軍の大将。威風堂々とした蜘蛛妖怪。', skillName: '土蜘蛛の大陣', skillType: 'damage', skillPower: 32 },
    { name: '大ガマ', emoji: '🐸', trait: '本家軍の大将。ガマの油で味方を癒やす。', skillName: '蝦蟇油の護り', skillType: 'heal', skillPower: 1800 },
    { name: 'ぬらりひょん', emoji: '👨‍💼', trait: '妖魔界の評議長。圧倒的なカリスマを誇る。', skillName: '波動滅殺砲', skillType: 'damage', skillPower: 34 },
  ];
  createSet('S', 700, 100, '#ff2222', sList);

  // SSランク妖怪（伝説・神クラスの超絶威力必殺技）
  const ssList: CharacterDef[] = [
    { name: 'エンマ大王', emoji: '👑', trait: '妖魔界を統べる若き大王！全属性を凌駕する覇道！', skillName: '覇王閻魔陣', skillType: 'damage', skillPower: 55 },
    { name: '覚醒日野神', emoji: '💻', trait: '神の領域に達した創造主。無限のアイディアで攻撃！', skillName: '締め切りラッシュ', skillType: 'damage', skillPower: 58 },
    { name: '不動明王', emoji: '🗡️', trait: '不動の心で悪を断ち切る神聖なる剣豪！', skillName: '不動雷鳴剣・天地一閃', skillType: 'damage', skillPower: 65 },
    { name: '太陽神エンマ', emoji: '☀️', trait: '太陽の輝きを身に纏うエンマの神形態！', skillName: '日輪閻魔天', skillType: 'damage', skillPower: 60 },
    { name: '暗黒神エンマ', emoji: '🌑', trait: '暗黒の力を解放した極限のエンマ大王！', skillName: '極暗黒閻魔波', skillType: 'damage', skillPower: 64 },
    { name: '極オロチ', emoji: '🐉', trait: '極の称号を得た最恐のオロチ！', skillName: '極・やたの鏡', skillType: 'damage', skillPower: 58 },
    { name: '極ツチノコ', emoji: '🐍', trait: '幻の中の幻！絶大な幸運と大回復をもたらす。', skillName: '超ラッキーゴールド', skillType: 'heal', skillPower: 4000 },
    { name: '暴走エンマ', emoji: '⚡', trait: '制御不能の雷光を放つ怒りのエンマ！', skillName: '暴走閻魔雷撃', skillType: 'damage', skillPower: 70 },
    { name: 'ラストブシニャン', emoji: '🇺🇸', trait: 'メリケンレジェンド！ド派手な一撃を見舞う！', skillName: 'ハラキリ切腹斬り', skillType: 'damage', skillPower: 62 },
    { name: '覚醒赤鬼', emoji: '👹', trait: '覚醒した鬼の王。大地を揺るがすパワー！', skillName: '金棒超大噴火', skillType: 'damage', skillPower: 56 },
  ];
  createSet('SS', 1200, 250, '#ff22ff', ssList);

  return chars;
};

export const CHARACTERS = generateCharacters();
