export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'Z';

export type Tribe = 'イサマシ' | 'フシギ' | 'ゴーケツ' | 'プリチー' | 'ポカポカ' | 'ウスラカゲ' | 'ブキミー' | 'ニョロロン' | 'エンマ' | 'ハグレ';

export const TRIBES: { name: Tribe; emoji: string; color: string }[] = [
  { name: 'イサマシ', emoji: '⚔️', color: '#ef4444' },
  { name: 'フシギ', emoji: '🔮', color: '#eab308' },
  { name: 'ゴーケツ', emoji: '🛡️', color: '#3b82f6' },
  { name: 'プリチー', emoji: '🎀', color: '#ec4899' },
  { name: 'ポカポカ', emoji: '💚', color: '#22c55e' },
  { name: 'ウスラカゲ', emoji: '🌙', color: '#64748b' },
  { name: 'ブキミー', emoji: '👻', color: '#a855f7' },
  { name: 'ニョロロン', emoji: '🐍', color: '#06b6d4' },
  { name: 'エンマ', emoji: '👑', color: '#f59e0b' },
  { name: 'ハグレ', emoji: '🌀', color: '#6366f1' },
];

export const getTribeMultiplier = (sameTribeCount: number): number => {
  if (sameTribeCount <= 1) return 1;
  if (sameTribeCount === 2) return 2;
  if (sameTribeCount === 3) return 3;
  if (sameTribeCount === 4) return 4;
  return 5; // 5体で5倍！
};

export const RANK_BASE_MAX_LEVEL: Record<Rank, number> = {
  'Z': 120,
  'SSS': 100,
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
  let base = import.meta.env.BASE_URL || '/';
  if (base === './' || base === '.') base = '/';
  if (!base.startsWith('/')) base = '/' + base;
  if (!base.endsWith('/')) base = base + '/';
  return base + cleanPath;
};

// Legacy ID migration map to ensure user save data is preserved without corruption
const OLD_TO_NEW_CHAR_ID: Record<string, string> = {};
const allRanks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'Z'];
let legacyCounter = 1;
allRanks.forEach(r => {
  for (let idx = 1; idx <= 10; idx++) {
    const oldId = `char_${r.toLowerCase()}_${legacyCounter++}`;
    const newId = `char_${r.toLowerCase()}_${idx}`;
    OLD_TO_NEW_CHAR_ID[oldId] = newId;
  }
});

export const migrateCharId = (id: string): string => {
  return OLD_TO_NEW_CHAR_ID[id] || id;
};

// Color generator per character name for vibrant visual distinction
export const getCharacterDistinctColor = (name: string, _defaultColor: string): { bg: string, accent: string, textBg: string, hair: string } => {
  // SSS God Characters
  if (/サマーエンマ王|創世神/i.test(name)) return { bg: '#dc2626', accent: '#ffd700', textBg: '#7f1d1d', hair: '#f59e0b' };
  if (/アルティメット龍神エンマ|龍神/i.test(name)) return { bg: '#059669', accent: '#38bdf8', textBg: '#042f2e', hair: '#0284c7' };
  if (/極・覚醒サマーエンマ/i.test(name)) return { bg: '#7e22ce', accent: '#f43f5e', textBg: '#581c87', hair: '#ec4899' };
  if (/極滅神・暗黒ハデス/i.test(name)) return { bg: '#090514', accent: '#a855f7', textBg: '#02010a', hair: '#6b21a8' }; // Prevent fallback/wrong match
  if (/冥王神・終焉ハデス|ハデス/i.test(name)) return { bg: '#1e1b4b', accent: '#a855f7', textBg: '#0f172a', hair: '#c084fc' };
  if (/リムル/i.test(name)) return { bg: '#bae6fd', accent: '#0284c7', textBg: '#0f172a', hair: '#38bdf8' };
  if (/五条悟/i.test(name)) return { bg: '#1e293b', accent: '#a855f7', textBg: '#0f172a', hair: '#e2e8f0' };
  if (/ルフィ/i.test(name)) return { bg: '#ef4444', accent: '#eab308', textBg: '#7f1d1d', hair: '#1e293b' };
  if (/エルサ/i.test(name)) return { bg: '#e0f2fe', accent: '#06b6d4', textBg: '#0369a1', hair: '#bae6fd' };
  if (/ウルトラゼロ/i.test(name)) return { bg: '#3b82f6', accent: '#ef4444', textBg: '#1e3a8a', hair: '#e2e8f0' };
  if (/天照大御神/i.test(name)) return { bg: '#fef3c7', accent: '#ef4444', textBg: '#78350f', hair: '#f59e0b' };
  
  // Z Rank Transcendent God Characters
  if (/極エンマ神/i.test(name)) return { bg: '#111827', accent: '#00ffff', textBg: '#1e1b4b', hair: '#06b6d4' };
  if (/覇邪の邪龍神・大蛇/i.test(name)) return { bg: '#3b0712', accent: '#00ffff', textBg: '#022c22', hair: '#10b981' };
  if (/アルセウス/i.test(name)) return { bg: '#f8fafc', accent: '#eab308', textBg: '#0f172a', hair: '#f1f5f9' };
  if (/悟空/i.test(name)) return { bg: '#f97316', accent: '#3b82f6', textBg: '#7c2d12', hair: '#e2e8f0' };
  if (/八岐大蛇/i.test(name)) return { bg: '#2e1065', accent: '#dc2626', textBg: '#1e1b4b', hair: '#a21caf' };
  if (/金剛武神/i.test(name)) return { bg: '#eab308', accent: '#ef4444', textBg: '#78350f', hair: '#f59e0b' };
  if (/ジバニャンＺ/i.test(name)) return { bg: '#ef4444', accent: '#f59e0b', textBg: '#7f1d1d', hair: '#f97316' };
  if (/黒色星夜神/i.test(name)) return { bg: '#030712', accent: '#fbbf24', textBg: '#111827', hair: '#f59e0b' };
  if (/阿修羅/i.test(name)) return { bg: '#b91c1c', accent: '#f97316', textBg: '#450a0a', hair: '#ea580c' };
  if (/コマさんＺ/i.test(name)) return { bg: '#38bdf8', accent: '#facc15', textBg: '#0369a1', hair: '#7dd3fc' };
  if (/プリンセスコマミ/i.test(name)) return { bg: '#f472b6', accent: '#fbcfe8', textBg: '#be185d', hair: '#f472b6' };
  if (/ぷに神フウキ/i.test(name)) return { bg: '#fef08a', accent: '#fbbf24', textBg: '#854d0e', hair: '#fde047' };
  if (/業炎輪廻/i.test(name)) return { bg: '#dc2626', accent: '#f59e0b', textBg: '#7f1d1d', hair: '#ef4444' };
  if (/カイラ大王/i.test(name)) return { bg: '#0f172a', accent: '#38bdf8', textBg: '#020617', hair: '#e2e8f0' };
  if (/カイラ覚醒/i.test(name)) return { bg: '#172554', accent: '#22d3ee', textBg: '#1e1b4b', hair: '#06b6d4' };
  if (/カイチ闇夜神/i.test(name)) return { bg: '#09090b', accent: '#c084fc', textBg: '#18181b', hair: '#a855f7' };
  if (/覚醒ブシニャン闇/i.test(name)) return { bg: '#18181b', accent: '#fbbf24', textBg: '#09090b', hair: '#22d3ee' };
  if (/オロチ影極/i.test(name)) return { bg: '#2e1065', accent: '#c084fc', textBg: '#1e1b4b', hair: '#a855f7' };

  // Direct character color overrides for instant recognition
  if (/めぐみん/i.test(name)) return { bg: '#2d132c', accent: '#ffaa00', textBg: '#990022', hair: '#1a0818' };
  if (/ベニマル/i.test(name)) return { bg: '#cc1100', accent: '#ffcc00', textBg: '#880000', hair: '#ff2200' };
  if (/里羽リュウタ|オロチ/i.test(name)) return { bg: '#0088cc', accent: '#00ffff', textBg: '#004488', hair: '#00ccff' };
  if (/阿弥陀丸/i.test(name)) return { bg: '#006644', accent: '#ffd700', textBg: '#003322', hair: '#009966' };
  if (/覚醒早乙女乱馬/i.test(name)) return { bg: '#e62e00', accent: '#ffd700', textBg: '#990000', hair: '#111111' };
  if (/フェルト/i.test(name)) return { bg: '#ffcc00', accent: '#ff0044', textBg: '#cc9900', hair: '#ffee33' };
  if (/五月/i.test(name)) return { bg: '#ff3366', accent: '#ffd700', textBg: '#cc0044', hair: '#ff1144' };
  if (/メリオダス/i.test(name)) return { bg: '#ffe033', accent: '#8800cc', textBg: '#550088', hair: '#ffff44' };
  if (/ブシ王/i.test(name)) return { bg: '#d4af37', accent: '#ffffff', textBg: '#886600', hair: '#ffcc00' };
  if (/パウロ/i.test(name)) return { bg: '#2255cc', accent: '#ffd700', textBg: '#112266', hair: '#e6b800' };
  
  if (/ミカサ/i.test(name)) return { bg: '#cc1122', accent: '#ffffff', textBg: '#551111', hair: '#111111' };
  if (/花垣武道/i.test(name)) return { bg: '#1a2238', accent: '#ffee33', textBg: '#0f172a', hair: '#ffee33' };
  if (/ゴモラ/i.test(name)) return { bg: '#664422', accent: '#ffaa00', textBg: '#332211', hair: '#885533' };
  if (/ウルトラマン/i.test(name)) return { bg: '#d0d0d0', accent: '#00d2ff', textBg: '#cc0000', hair: '#ee1111' };
  if (/獅白ぼたん/i.test(name)) return { bg: '#e0e0e0', accent: '#33cc99', textBg: '#224433', hair: '#cccccc' };
  if (/赤ぷよ/i.test(name)) return { bg: '#ff0044', accent: '#ffffff', textBg: '#aa0022', hair: '#ff2255' };
  if (/アーサー/i.test(name)) return { bg: '#3366cc', accent: '#ffd700', textBg: '#113388', hair: '#ffcc00' };
  if (/クワガ大将|オオクワノ神|カブトさん/i.test(name)) return { bg: '#335522', accent: '#ffd700', textBg: '#112200', hair: '#447733' };
  if (/なまはげ/i.test(name)) return { bg: '#cc1111', accent: '#ffffff', textBg: '#660000', hair: '#e0e0e0' };

  if (/フユニャン/i.test(name)) return { bg: '#1a3388', accent: '#ffee33', textBg: '#0f1d52', hair: '#2244aa' };
  if (/メラメライオン|グラグライオン|轟獅子/i.test(name)) return { bg: '#ff4400', accent: '#ffee00', textBg: '#aa1100', hair: '#ff8800' };
  if (/おにぎり侍|ちからモチ/i.test(name)) return { bg: '#f0f0f0', accent: '#cc1122', textBg: '#222222', hair: '#1a1a1a' };
  if (/ブリー隊長/i.test(name)) return { bg: '#448822', accent: '#ffee33', textBg: '#224411', hair: '#559933' };
  if (/バクロ婆|泥田坊/i.test(name)) return { bg: '#776655', accent: '#ffaa66', textBg: '#443322', hair: '#998877' };
  
  // Hashed distinct color fallback
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [0, 25, 45, 90, 140, 180, 210, 260, 290, 320, 340];
  const hue = hues[Math.abs(hash) % hues.length];
  const hairHue = (hue + 180) % 360;
  return {
    bg: `hsl(${hue}, 85%, 45%)`,
    accent: `hsl(${(hue + 40) % 360}, 95%, 60%)`,
    textBg: `hsl(${hue}, 90%, 30%)`,
    hair: `hsl(${hairHue}, 75%, 30%)`
  };
};

// Generates an inline SVG Data URL for guaranteed high-quality custom Puni rendering in all environments
export const createPuniSvgDataUrl = (
  name: string = '妖怪',
  defaultColor: string = '#ff4488',
  rank: string = 'E',
  emojiSymbol: string = '⭐'
): string => {
  // Determine display name
  const isEmojiOnly = /^[\u1F300-\u1F9FF\u2600-\u26FF\u2700-\u27BF]+$/.test(name);
  const displayName = isEmojiOnly ? '妖怪' : (name.length > 5 ? name.slice(0, 4) + '…' : name);

  const { bg: bodyColor, accent: accentColor, textBg, hair: hairColor } = getCharacterDistinctColor(name, defaultColor);

  const rankBorderColors: Record<string, string> = {
    'Z': '#00ffff',
    'SSS': '#ffd700',
    'SS': '#ff00ee',
    'S': '#ffaa00',
    'A': '#ff3333',
    'B': '#33ccff',
    'C': '#a333ff',
    'D': '#33aa55',
    'E': '#888888'
  };
  const borderColor = rankBorderColors[rank] || '#ffffff';

  // Distinct character construction
  let hairAndAccessoriesSvg = '';
  let eyesSvg = '';
  let mouthSvg = `<path d="M 52 76 Q 64 88 76 76" fill="none" stroke="#1a0022" stroke-width="4" stroke-linecap="round" />`;
  let customSkinColor = '#ffe0d0'; // Realistic face skin tone by default
  let customBodyFill = '';

  // --- Z GOD RANK CHARACTERS (1000% UNIQUE & TRANSCENDENT DESIGN) ---
  
  // 1. 超終次元・極エンマ神 (Ultimate Future God Enma Z)
  if (/極エンマ神/i.test(name)) {
    customSkinColor = '#f0fdf4';
    hairAndAccessoriesSvg = `
      <!-- Ultimate Galactic Aura Background -->
      <circle cx="64" cy="64" r="62" fill="none" stroke="#00ffff" stroke-width="4.5" opacity="0.95" stroke-dasharray="14,4">
        <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="64" cy="64" r="59" fill="none" stroke="#f43f5e" stroke-width="3" opacity="0.8" stroke-dasharray="6,6">
        <animateTransform attributeName="transform" type="rotate" from="360 64 64" to="0 64 64" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <!-- Galactic Crown -->
      <path d="M 12 24 L 32 -16 L 64 12 L 96 -16 L 116 24 Z" fill="#00ffff" stroke="#ffffff" stroke-width="3.5" />
      <circle cx="64" cy="12" r="8" fill="#ffd700" stroke="#ffffff" stroke-width="2" />
      <!-- Void Deep Hair -->
      <path d="M 18 42 C 10 14 30 6 64 6 C 98 6 118 14 110 42 Z" fill="#1e1b4b" stroke="#00ffff" stroke-width="2.5" />
    `;
    eyesSvg = `
      <!-- Ultimate Radiant Cyan/Gold Eyes -->
      <circle cx="42" cy="56" r="11" fill="#00ffff" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="42" cy="56" r="4.5" fill="#ffd700" />
      <circle cx="86" cy="56" r="11" fill="#00ffff" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="86" cy="56" r="4.5" fill="#ffd700" />
    `;
    mouthSvg = `<path d="M 48 78 Q 64 92 80 78" fill="none" stroke="#00ffff" stroke-width="4.5" stroke-linecap="round" />`;
  }
  // 2. 覇邪の邪龍神・大蛇 (Serpent Dragon God Orochi Z)
  else if (/邪龍神/i.test(name)) {
    customSkinColor = '#fdf2f8';
    hairAndAccessoriesSvg = `
      <!-- Serpent Dragon Wings and Horns -->
      <path d="M 24 30 Q -15 -15 -25 20 Q 15 15 34 34 Z" fill="#10b981" stroke="#00ffff" stroke-width="2.5" />
      <path d="M 104 30 Q 143 -15 153 20 Q 113 15 94 34 Z" fill="#10b981" stroke="#00ffff" stroke-width="2.5" />
      <!-- Jade Snake Hair -->
      <path d="M 14 50 C 6 16 30 6 64 6 C 98 6 122 16 114 50 C 122 80 108 102 96 102 L 32 102 C 20 102 6 80 14 50 Z" fill="#047857" stroke="#10b981" stroke-width="3" />
      <!-- Floating Dragon Flame Whisker -->
      <path d="M 22 62 Q -12 48 -10 78" fill="none" stroke="#00ffff" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 106 62 Q 140 48 138 78" fill="none" stroke="#00ffff" stroke-width="4.5" stroke-linecap="round" />
    `;
    eyesSvg = `
      <!-- Slit Jade/Cyan Eyes -->
      <polygon points="28,46 54,52 34,62" fill="#10b981" stroke="#00ffff" stroke-width="2.5" />
      <polygon points="100,46 74,52 94,62" fill="#10b981" stroke="#00ffff" stroke-width="2.5" />
      <line x1="41" y1="48" x2="41" y2="60" stroke="#ffffff" stroke-width="3" />
      <line x1="87" y1="48" x2="87" y2="60" stroke="#ffffff" stroke-width="3" />
    `;
    mouthSvg = `<path d="M 50 76 Q 64 84 78 76" fill="none" stroke="#00ffff" stroke-width="4" stroke-linecap="round" />`;
  }
  // 3. 終焉創世神・アルセウス (Arceus Z)
  else if (/アルセウス/i.test(name)) {
    customSkinColor = '#f8fafc';
    hairAndAccessoriesSvg = `
      <!-- Holy Golden Wheel / Ring on Back -->
      <circle cx="64" cy="64" r="54" fill="none" stroke="#ffd700" stroke-width="5" />
      <path d="M 64 10 L 64 118 M 10 64 L 118 64 M 26 26 L 102 102 M 26 102 L 102 26" stroke="#ffd700" stroke-width="3.5" opacity="0.8" />
      <!-- Emerald Jewels in the Wheel -->
      <circle cx="64" cy="18" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="64" cy="110" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="18" cy="64" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="110" cy="64" r="4.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
      <!-- Sacred White Helm/Head Part -->
      <path d="M 32 40 Q 64 10 96 40 C 104 60 90 82 80 82 L 48 82 C 38 82 24 60 32 40 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="2.5" />
      <path d="M 64 14 L 64 36" stroke="#ffd700" stroke-width="3" />
    `;
    eyesSvg = `
      <!-- Golden Ringed Red Eyes of God -->
      <circle cx="44" cy="56" r="7.5" fill="#ef4444" stroke="#ffd700" stroke-width="2" />
      <circle cx="44" cy="56" r="3" fill="#111111" />
      <circle cx="84" cy="56" r="7.5" fill="#ef4444" stroke="#ffd700" stroke-width="2" />
      <circle cx="84" cy="56" r="3" fill="#111111" />
    `;
    mouthSvg = `<path d="M 54 72 Q 64 76 74 72" fill="none" stroke="#64748b" stroke-width="3" />`;
  }
  // 4. 極覚醒・身勝手の悟空 (Ultra Instinct Goku Z)
  else if (/悟空/i.test(name)) {
    customSkinColor = '#ffeedd';
    hairAndAccessoriesSvg = `
      <!-- Spiky Radiant Silver Hair -->
      <path d="M 12 44 L -14 -12 L 26 14 L 64 -32 L 102 14 L 142 -12 L 116 44 C 126 76 112 100 96 100 L 32 100 C 16 100 2 76 12 44 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3.5" />
      <!-- Silver Aura Glow behind -->
      <circle cx="64" cy="64" r="62" fill="none" stroke="#e2e8f0" stroke-width="2.5" opacity="0.6" stroke-dasharray="8,8" />
    `;
    eyesSvg = `
      <!-- Sharp Silver Eyes of Ultra Instinct -->
      <polygon points="30,46 54,52 38,60" fill="#ffffff" stroke="#475569" stroke-width="2" />
      <circle cx="42" cy="52" r="3" fill="#3b82f6" />
      <circle cx="42" cy="52" r="1" fill="#ffffff" />
      <polygon points="98,46 74,52 90,60" fill="#ffffff" stroke="#475569" stroke-width="2" />
      <circle cx="86" cy="52" r="3" fill="#3b82f6" />
      <circle cx="86" cy="52" r="1" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 52 74 Q 64 78 76 74" fill="none" stroke="#111111" stroke-width="3.5" />`;
  }
  // 5. 終滅蛇神・八岐大蛇 (Yamata no Orochi Z)
  else if (/八岐大蛇/i.test(name)) {
    customSkinColor = '#f5e1ff';
    hairAndAccessoriesSvg = `
      <!-- Sinister Purple Snake Hair Mane -->
      <path d="M 10 48 C -6 18 16 8 40 18 L 64 2 L 88 18 C 112 8 134 18 118 48 C 130 80 106 102 96 102 L 32 102 C 22 102 -6 80 10 48 Z" fill="#701a75" stroke="#4a044e" stroke-width="3" />
      <!-- Glowing Red Serpent Eyes on Hair -->
      <circle cx="28" cy="24" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1" />
      <circle cx="100" cy="24" r="4.5" fill="#ef4444" stroke="#ffffff" stroke-width="1" />
      <circle cx="64" cy="10" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1" />
    `;
    eyesSvg = `
      <!-- Ominous Slit Violet Eyes -->
      <polygon points="30,48 54,54 36,64" fill="#a21caf" stroke="#ffffff" stroke-width="2" />
      <polygon points="98,48 74,54 92,64" fill="#a21caf" stroke="#ffffff" stroke-width="2" />
      <line x1="42" y1="50" x2="42" y2="62" stroke="#ffffff" stroke-width="2.5" />
      <line x1="86" y1="50" x2="86" y2="62" stroke="#ffffff" stroke-width="2.5" />
    `;
    mouthSvg = `
      <!-- Vampire Fangs mouth -->
      <path d="M 48 74 Q 64 88 80 74" fill="none" stroke="#111111" stroke-width="3.5" />
      <polygon points="52,74 56,82 60,74" fill="#ffffff" />
      <polygon points="68,74 72,82 76,74" fill="#ffffff" />
    `;
  }
  // 6. 絶対守護・黄金金剛武神 (Golden Kongo Bushin Z)
  else if (/金剛武神/i.test(name)) {
    customSkinColor = '#fbbf24';
    customBodyFill = '#d97706';
    hairAndAccessoriesSvg = `
      <!-- Giant Heavy Golden Shogun Armor Helmet -->
      <path d="M 12 32 Q 64 -18 116 32 L 102 88 L 26 88 Z" fill="#fbbf24" stroke="#78350f" stroke-width="3.5" />
      <!-- Giant Crescent Golden Emblem -->
      <path d="M 20 18 Q 64 -24 108 18 Q 64 2 20 18 Z" fill="#fffbeb" stroke="#b45309" stroke-width="2.5" />
      <!-- Blue Kongo Diamond Gem on Forehead -->
      <polygon points="64,22 72,30 64,38 56,30" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
    `;
    eyesSvg = `
      <!-- Glowing Blue Robotic Twin Visor -->
      <ellipse cx="42" cy="56" rx="8" ry="5.5" fill="#00ffff" stroke="#ffffff" stroke-width="1.5" />
      <ellipse cx="86" cy="56" rx="8" ry="5.5" fill="#00ffff" stroke="#ffffff" stroke-width="1.5" />
    `;
    mouthSvg = `<path d="M 46 76 L 82 76" stroke="#d97706" stroke-width="4.5" />`;
  }
  // 7. 極滅神・暗黒ハデス (Dark Hades Z)
  else if (/暗黒ハデス/i.test(name)) {
    customSkinColor = '#0f172a';
    hairAndAccessoriesSvg = `
      <!-- Dark Purple Eternal Flame Background -->
      <circle cx="64" cy="64" r="61" fill="none" stroke="#6b21a8" stroke-width="4" opacity="0.9" stroke-dasharray="10,5" />
      <!-- Massive Black Curving Ram Horns -->
      <path d="M 28 34 Q -22 14 -24 50 Q -8 64 22 42 Z" fill="#030712" stroke="#a21caf" stroke-width="3.5" />
      <path d="M 100 34 Q 150 14 152 50 Q 136 64 106 42 Z" fill="#030712" stroke="#a21caf" stroke-width="3.5" />
      <!-- Void Obsidian Spiky Hair -->
      <path d="M 14 52 C 6 20 30 10 64 10 C 98 10 122 20 114 52 Z" fill="#1e1b4b" stroke="#701a75" stroke-width="3" />
      <!-- Death Symbol on Forehead (Purple) -->
      <path d="M 60 20 L 68 28 M 68 20 L 60 28 M 64 16 L 64 32" stroke="#a21caf" stroke-width="2.5" />
    `;
    eyesSvg = `
      <!-- Malevolent Blood Red Eyes of Dark Hades -->
      <polygon points="28,48 56,54 36,66" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <polygon points="100,48 72,54 92,66" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="56" r="3.5" fill="#111111" />
      <circle cx="86" cy="56" r="3.5" fill="#111111" />
    `;
    mouthSvg = `<path d="M 48 76 L 80 76" stroke="#9d174d" stroke-width="4.5" stroke-linecap="round" />`;
  }
  // 8. 神威覇道・覚醒ジバニャンＺ (Awakened Jibanyan Z)
  else if (/ジバニャンＺ/i.test(name)) {
    customSkinColor = '#ef4444';
    customBodyFill = '#991b1b';
    hairAndAccessoriesSvg = `
      <!-- Giant Flaming Red Cat Ears -->
      <path d="M 22 40 L -2 -4 L 42 22 Z" fill="#ef4444" stroke="#ffffff" stroke-width="3.5" />
      <path d="M 24 34 L 10 10 L 36 20 Z" fill="#f43f5e" />
      <path d="M 106 40 L 130 -4 L 86 22 Z" fill="#ef4444" stroke="#ffffff" stroke-width="3.5" />
      <path d="M 104 34 L 118 10 L 92 20 Z" fill="#f43f5e" />
      <!-- Golden Flame behind ears -->
      <path d="M -4 -4 Q 18 -20 22 4" fill="none" stroke="#fbbf24" stroke-width="3" />
      <path d="M 132 -4 Q 110 -20 106 4" fill="none" stroke="#fbbf24" stroke-width="3" />
      <!-- Blue-green soul emblem on forehead -->
      <path d="M 64 12 Q 54 26 64 34 Q 74 26 64 12 Z" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="64" cy="23" r="3" fill="#ffffff" />
    `;
    eyesSvg = `
      <!-- Radiant Gold Awakened Cat Eyes -->
      <circle cx="42" cy="58" r="11" fill="#fbbf24" stroke="#78350f" stroke-width="2.5" />
      <ellipse cx="42" cy="58" rx="3" ry="8" fill="#111111" />
      <circle cx="86" cy="58" r="11" fill="#fbbf24" stroke="#78350f" stroke-width="2.5" />
      <ellipse cx="86" cy="58" rx="3" ry="8" fill="#111111" />
    `;
    mouthSvg = `<path d="M 52 76 Q 64 88 76 76" fill="none" stroke="#111111" stroke-width="4" stroke-linecap="round" />`;
  }
  // 9. 深淵虚空・黒色星夜神 (Black Void Star God Z)
  else if (/黒色星夜神/i.test(name)) {
    customSkinColor = '#090d16';
    hairAndAccessoriesSvg = `
      <!-- Absolute Abyss Black Hole Circle behind -->
      <circle cx="64" cy="64" r="63" fill="#030712" stroke="#fbbf24" stroke-width="5" />
      <circle cx="64" cy="64" r="54" fill="none" stroke="#1e1b4b" stroke-width="4.5" stroke-dasharray="12,6" />
      <!-- Starry Points -->
      <circle cx="28" cy="28" r="2.5" fill="#fbbf24" />
      <circle cx="100" cy="28" r="2.5" fill="#fbbf24" />
      <circle cx="34" cy="94" r="2" fill="#ffffff" />
      <circle cx="94" cy="94" r="2" fill="#ffffff" />
    `;
    eyesSvg = `
      <!-- Piercing Star Gold Eyes -->
      <polygon points="30,48 54,52 36,62" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5" />
      <polygon points="98,48 74,52 92,62" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="42" cy="55" r="3.5" fill="#ffffff" />
      <circle cx="86" cy="55" r="3.5" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 50 76 Q 64 82 78 76" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" />`;
  }
  // 10. 覇邪破滅・大豪傑阿修羅 (Destroyer Asura Z)
  else if (/阿修羅/i.test(name)) {
    customSkinColor = '#b91c1c';
    customBodyFill = '#7f1d1d';
    hairAndAccessoriesSvg = `
      <!-- Six Ringing Flame Fire Rings on Back -->
      <circle cx="64" cy="64" r="58" fill="none" stroke="#f97316" stroke-width="4" stroke-dasharray="8,12" />
      <path d="M 64 2 Q 80 14 64 26 Q 48 14 64 2 Z" fill="#ef4444" />
      <path d="M 120 64 Q 108 80 96 64 Q 108 48 120 64 Z" fill="#ef4444" />
      <path d="M 8 64 Q 20 80 32 64 Q 20 48 8 64 Z" fill="#ef4444" />
      <!-- Wild Red Devil Spiky Hair -->
      <path d="M 14 44 L -10 -8 L 28 16 L 64 -26 L 100 16 L 138 -8 L 114 44 Z" fill="#dc2626" stroke="#450a0a" stroke-width="3.5" />
    `;
    eyesSvg = `
      <!-- Triple Angry Eyes of Asura -->
      <polygon points="28,48 54,54 36,64" fill="#ffee00" stroke="#000000" stroke-width="2" />
      <circle cx="42" cy="56" r="3" fill="#111111" />
      <polygon points="98,48 74,54 92,64" fill="#ffee00" stroke="#000000" stroke-width="2" />
      <circle cx="86" cy="56" r="3" fill="#111111" />
      <!-- Vertical Third Eye on Forehead -->
      <ellipse cx="64" cy="38" rx="5" ry="9" fill="#ffee00" stroke="#000000" stroke-width="2" />
      <circle cx="64" cy="38" r="2.5" fill="#ef4444" />
    `;
    mouthSvg = `
      <!-- Aggressive fanged grin -->
      <path d="M 46 74 Q 64 90 82 74" fill="#7f1d1d" stroke="#111111" stroke-width="2.5" />
      <polygon points="50,74 54,80 58,74" fill="#ffffff" />
      <polygon points="70,74 74,80 78,74" fill="#ffffff" />
    `;
  }
  // 11. 桃源超神・コマさんＺ (Komasan Z)
  else if (/コマさんＺ/i.test(name)) {
    customSkinColor = '#f8fafc';
    hairAndAccessoriesSvg = `
      <!-- Blue Spiritual Hitodama Flames above Ears -->
      <path d="M 12 32 Q -4 -16 22 -12 Q 32 8 20 32 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2.5" />
      <path d="M 116 32 Q 132 -16 106 -12 Q 96 8 108 32 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2.5" />
      <!-- Komasan Long Ears -->
      <path d="M 28 42 C 12 12 38 6 48 30 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2" />
      <path d="M 100 42 C 116 12 90 6 80 30 Z" fill="#f8fafc" stroke="#38bdf8" stroke-width="2" />
      <!-- Swirl Green Pouch Neck Mantle -->
      <path d="M 24 78 Q 64 108 104 78 Q 96 112 64 116 Q 32 112 24 78 Z" fill="#22c55e" stroke="#15803d" stroke-width="2.5" />
      <circle cx="64" cy="98" r="4" fill="#ffffff" />
    `;
    eyesSvg = `
      <circle cx="42" cy="56" r="9.5" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
      <circle cx="40" cy="52" r="3.5" fill="#ffffff" />
      <circle cx="86" cy="56" r="9.5" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
      <circle cx="84" cy="52" r="3.5" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 52 74 Q 58 80 64 74 Q 70 80 76 74" fill="none" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" />`;
  }
  // 12. 夢幻可憐・プリンセスコマミＺ (Princess Komami Z)
  else if (/プリンセスコマミ/i.test(name)) {
    customSkinColor = '#fdf2f8';
    hairAndAccessoriesSvg = `
      <!-- Princess Tiara Crown -->
      <path d="M 38 24 L 48 2 L 64 16 L 80 2 L 90 24 Z" fill="#fbbf24" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="64" cy="10" r="4.5" fill="#f43f5e" stroke="#ffffff" stroke-width="1.5" />
      <!-- Pink Heart Hitodama -->
      <path d="M 16 32 C 4 12 26 6 30 24 Z" fill="#f472b6" />
      <path d="M 112 32 C 124 12 102 6 98 24 Z" fill="#f472b6" />
      <!-- Pink Princess Collar Bow -->
      <path d="M 44 86 Q 64 96 84 86 L 88 104 L 40 104 Z" fill="#f472b6" stroke="#ffffff" stroke-width="2" />
    `;
    eyesSvg = `
      <circle cx="42" cy="56" r="10" fill="#db2777" stroke="#ffffff" stroke-width="2" />
      <circle cx="40" cy="52" r="3" fill="#ffffff" />
      <circle cx="86" cy="56" r="10" fill="#db2777" stroke="#ffffff" stroke-width="2" />
      <circle cx="84" cy="52" r="3" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 54 74 Q 64 82 74 74" fill="#f43f5e" stroke="#0f172a" stroke-width="2" />`;
  }
  // 13. 天星無双・ぷに神フウキ (Puni God Fuki Z)
  else if (/ぷに神フウキ/i.test(name)) {
    customSkinColor = '#fef08a';
    hairAndAccessoriesSvg = `
      <!-- Floating Angel Halo Ring -->
      <ellipse cx="64" cy="10" rx="36" ry="8" fill="none" stroke="#fde047" stroke-width="4.5" />
      <ellipse cx="64" cy="10" rx="36" ry="8" fill="none" stroke="#ffffff" stroke-width="2" />
      <!-- Star Hitodama Wings -->
      <polygon points="18,10 22,22 34,22 24,28 28,40 18,32 8,40 12,28 2,22 14,22" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5" />
      <polygon points="110,10 114,22 126,22 116,28 120,40 110,32 100,40 104,28 94,22 106,22" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5" />
    `;
    eyesSvg = `
      <polygon points="42,48 45,54 52,55 47,60 48,67 42,63 36,67 37,60 32,55 39,54" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" />
      <polygon points="86,48 89,54 96,55 91,60 92,67 86,63 80,67 81,60 76,55 83,54" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" />
    `;
    mouthSvg = `<path d="M 52 74 Q 64 84 76 74" fill="none" stroke="#78350f" stroke-width="3.5" stroke-linecap="round" />`;
  }
  // 14. 輪廻転生・業炎輪廻 (Rinne God Z)
  else if (/業炎輪廻/i.test(name)) {
    customSkinColor = '#fee2e2';
    hairAndAccessoriesSvg = `
      <!-- Flaming Chakra Wheel -->
      <circle cx="64" cy="64" r="60" fill="none" stroke="#dc2626" stroke-width="6" stroke-dasharray="12,8" />
      <circle cx="64" cy="64" r="54" fill="none" stroke="#fbbf24" stroke-width="3" />
      <!-- Forehead Eye Symbol -->
      <ellipse cx="64" cy="28" rx="8" ry="5" fill="#1e1b4b" stroke="#f59e0b" stroke-width="1.5" />
      <circle cx="64" cy="28" r="2.5" fill="#dc2626" />
      <!-- Spiky Flame Hair -->
      <path d="M 16 48 L 0 -4 L 32 16 L 64 -20 L 96 16 L 128 -4 L 112 48 Z" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
    `;
    eyesSvg = `
      <polygon points="28,48 56,54 36,66" fill="#dc2626" stroke="#fde047" stroke-width="2" />
      <polygon points="100,48 72,54 92,66" fill="#dc2626" stroke="#fde047" stroke-width="2" />
      <circle cx="42" cy="56" r="3" fill="#111111" />
      <circle cx="86" cy="56" r="3" fill="#111111" />
    `;
    mouthSvg = `<path d="M 50 76 L 78 76" stroke="#7f1d1d" stroke-width="4" stroke-linecap="round" />`;
  }
  // 15. 覇王神・カイラ大王 (King Kaira Z)
  else if (/カイラ大王/i.test(name)) {
    customSkinColor = '#f1f5f9';
    hairAndAccessoriesSvg = `
      <!-- Ice Dragon Horns -->
      <path d="M 28 32 Q 0 -10 -12 18 Q 14 24 34 38 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2.5" />
      <path d="M 100 32 Q 128 -10 140 18 Q 114 24 94 38 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="2.5" />
      <!-- Silver Crown -->
      <path d="M 40 20 L 52 2 L 64 14 L 76 2 L 88 20 Z" fill="#e2e8f0" stroke="#0284c7" stroke-width="2" />
      <!-- Royal Fur Collar -->
      <path d="M 20 80 Q 64 110 108 80 L 96 114 Q 64 122 32 114 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="56" rx="8" ry="11" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
      <line x1="42" y1="47" x2="42" y2="65" stroke="#ffffff" stroke-width="2.5" />
      <ellipse cx="86" cy="56" rx="8" ry="11" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
      <line x1="86" y1="47" x2="86" y2="65" stroke="#ffffff" stroke-width="2.5" />
    `;
    mouthSvg = `<path d="M 52 76 Q 64 82 76 76" fill="none" stroke="#0f172a" stroke-width="3" />`;
  }
  // 16. 創世邪神・蛇王カイラ覚醒 (Awakened Serpent King Kaira Z)
  else if (/カイラ覚醒/i.test(name)) {
    customSkinColor = '#0f172a';
    hairAndAccessoriesSvg = `
      <!-- Electric Dragon Horns -->
      <path d="M 24 30 Q -20 -15 -28 20 Q 12 18 32 36 Z" fill="#06b6d4" stroke="#38bdf8" stroke-width="3" />
      <path d="M 104 30 Q 148 -15 156 20 Q 116 18 96 36 Z" fill="#06b6d4" stroke="#38bdf8" stroke-width="3" />
      <!-- Cyan Whiskers -->
      <path d="M 18 64 Q -16 52 -12 80" fill="none" stroke="#22d3ee" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 110 64 Q 144 52 140 80" fill="none" stroke="#22d3ee" stroke-width="4.5" stroke-linecap="round" />
    `;
    eyesSvg = `
      <polygon points="28,48 54,54 36,64" fill="#facc15" stroke="#06b6d4" stroke-width="2" />
      <line x1="41" y1="50" x2="41" y2="62" stroke="#ffffff" stroke-width="2.5" />
      <polygon points="100,48 74,54 92,64" fill="#facc15" stroke="#06b6d4" stroke-width="2" />
      <line x1="87" y1="50" x2="87" y2="62" stroke="#ffffff" stroke-width="2.5" />
    `;
    mouthSvg = `<path d="M 48 76 Q 64 84 80 76" fill="none" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" />`;
  }
  // 17. 虚無終焉・カイチ闇夜神 (Kaichi Darkness God Z)
  else if (/カイチ闇夜神/i.test(name)) {
    customSkinColor = '#09090b';
    hairAndAccessoriesSvg = `
      <!-- Crescent Horn -->
      <path d="M 44 -12 C 14 -12 2 18 32 32 C 60 40 84 10 64 -12 C 58 4 48 4 44 -12 Z" fill="#a855f7" stroke="#ffffff" stroke-width="2.5" />
      <!-- Purple Flame Aura -->
      <circle cx="64" cy="64" r="61" fill="none" stroke="#c084fc" stroke-width="3.5" opacity="0.8" stroke-dasharray="8,6" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="56" rx="9" ry="12" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="56" r="3.5" fill="#ffffff" />
      <ellipse cx="86" cy="56" rx="9" ry="12" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
      <circle cx="86" cy="56" r="3.5" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 50 76 L 78 76" stroke="#c084fc" stroke-width="4" stroke-linecap="round" />`;
  }
  // 18. 幻影天魔・覚醒ブシニャン闇 (Awakened Shadow Bushinyan Z)
  else if (/覚醒ブシニャン闇/i.test(name)) {
    customSkinColor = '#18181b';
    hairAndAccessoriesSvg = `
      <!-- Dark Crescent Samurai Helmet -->
      <path d="M 16 32 Q 64 -24 112 32 Q 64 8 16 32 Z" fill="#fbbf24" stroke="#ffffff" stroke-width="3" />
      <!-- Dark Cat Ears -->
      <path d="M 22 42 L 2 2 L 44 24 Z" fill="#18181b" stroke="#ffffff" stroke-width="3" />
      <path d="M 106 42 L 126 2 L 84 24 Z" fill="#18181b" stroke="#ffffff" stroke-width="3" />
    `;
    eyesSvg = `
      <polygon points="30,50 54,56 38,64" fill="#ef4444" stroke="#fbbf24" stroke-width="2" />
      <polygon points="98,50 74,56 90,64" fill="#ef4444" stroke="#fbbf24" stroke-width="2" />
    `;
    mouthSvg = `<path d="M 52 76 L 76 76" stroke="#ffffff" stroke-width="3.5" />`;
  }
  // 19. 暗黒蛇帝・オロチ影極 (Shadow Orochi Z)
  else if (/オロチ影極/i.test(name)) {
    customSkinColor = '#1e1b4b';
    hairAndAccessoriesSvg = `
      <!-- Shadow Dragon Scarves -->
      <path d="M 14 58 C -10 30 10 10 36 24 C 54 10 74 10 92 24 C 118 10 138 30 114 58 L 98 102 L 30 102 Z" fill="#581c87" stroke="#a855f7" stroke-width="3" />
      <!-- Purple Dragon Whiskers -->
      <path d="M 20 62 Q -18 48 -14 78" fill="none" stroke="#c084fc" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 108 62 Q 146 48 142 78" fill="none" stroke="#c084fc" stroke-width="4.5" stroke-linecap="round" />
    `;
    eyesSvg = `
      <polygon points="28,48 54,54 36,64" fill="#c084fc" stroke="#22d3ee" stroke-width="2" />
      <polygon points="100,48 74,54 92,64" fill="#c084fc" stroke="#22d3ee" stroke-width="2" />
      <line x1="41" y1="50" x2="41" y2="62" stroke="#ffffff" stroke-width="2.5" />
      <line x1="87" y1="50" x2="87" y2="62" stroke="#ffffff" stroke-width="2.5" />
    `;
    mouthSvg = `<path d="M 50 76 Q 64 82 78 76" fill="none" stroke="#22d3ee" stroke-width="3.5" stroke-linecap="round" />`;
  }

  // --- SSS GOD RANK CHARACTERS (100% UNIQUE & ULTRA DISTINCT) ---
  
  // 1. 創世神・サマーエンマ王 (Sun God Enma) - Flaming Sun Crown & Cool Sunglasses
  if (/サマーエンマ王|創世神/i.test(name)) {
    customSkinColor = '#fff0e0';
    hairAndAccessoriesSvg = `
      <!-- Radiant Solar Sun Rays Background -->
      <path d="M 64 -20 L 70 8 L 96 -12 L 86 16 L 118 4 L 98 28 L 126 28 L 102 44 L 124 58 L 98 62 L 112 82 L 88 74 L 92 100 L 74 84 L 64 108 L 54 84 L 36 100 L 40 74 L 16 82 L 30 62 L 4 58 L 26 44 L 2 28 L 30 28 L 10 4 L 42 16 L 32 -12 L 58 8 Z" fill="#ffaa00" stroke="#ffd700" stroke-width="2" />
      <!-- Flaming Golden Crown -->
      <path d="M 18 30 L 36 -10 L 64 8 L 92 -10 L 110 30 Z" fill="#ff2200" stroke="#ffd700" stroke-width="3" />
      <polygon points="64,-2 74,18 54,18" fill="#ffd700" />
      <circle cx="64" cy="18" r="7" fill="#ffffff" stroke="#ff0000" stroke-width="2" />
      <!-- Flame Red Hair -->
      <path d="M 22 46 C 14 20 34 12 64 12 C 94 12 114 20 106 46 Z" fill="#dc2626" />
    `;
    eyesSvg = `
      <!-- Ultra Cool Golden Sun Glasses -->
      <polygon points="26,44 60,44 54,64 32,64" fill="#111111" stroke="#ffd700" stroke-width="3" />
      <polygon points="68,44 102,44 96,64 74,64" fill="#111111" stroke="#ffd700" stroke-width="3" />
      <line x1="60" y1="50" x2="68" y2="50" stroke="#ffd700" stroke-width="3" />
      <!-- Sunglass Glare -->
      <line x1="30" y1="48" x2="44" y2="60" stroke="#ffffff" stroke-width="2.5" />
      <line x1="72" y1="48" x2="86" y2="60" stroke="#ffffff" stroke-width="2.5" />
    `;
    mouthSvg = `<path d="M 50 74 Q 64 88 78 74" fill="none" stroke="#dc2626" stroke-width="4" stroke-linecap="round" />`;
  }
  // 2. アルティメット龍神エンマ (Ultimate Dragon Enma) - Emerald Twin Dragon Horns & Cyan Whisker
  else if (/アルティメット龍神エンマ|龍神/i.test(name)) {
    customSkinColor = '#e0f2fe';
    hairAndAccessoriesSvg = `
      <!-- Twin Giant Golden Dragon Horns -->
      <path d="M 28 32 Q 2 -20 -16 10 Q 18 10 38 36 Z" fill="#ffd700" stroke="#0284c7" stroke-width="3" />
      <path d="M 100 32 Q 126 -20 144 10 Q 110 10 90 36 Z" fill="#ffd700" stroke="#0284c7" stroke-width="3" />
      <!-- Dragon Jade Mane -->
      <path d="M 16 52 C 8 20 32 10 64 10 C 96 10 120 20 112 52 C 122 84 106 106 94 106 L 34 106 C 22 106 6 84 16 52 Z" fill="#059669" stroke="#0284c7" stroke-width="3" />
      <!-- Floating Cyan Dragon Whisker -->
      <path d="M 24 64 Q -10 50 -8 80" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 104 64 Q 138 50 136 80" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round" />
      <!-- Dragon Orb on Forehead -->
      <circle cx="64" cy="22" r="10" fill="#38bdf8" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="61" cy="19" r="3.5" fill="#ffffff" />
    `;
    eyesSvg = `
      <!-- Glowing Cyan Dragon Slit Eyes -->
      <polygon points="30,48 56,54 36,66" fill="#38bdf8" stroke="#000000" stroke-width="2" />
      <polygon points="98,48 72,54 92,66" fill="#38bdf8" stroke="#000000" stroke-width="2" />
      <line x1="43" y1="50" x2="43" y2="64" stroke="#000000" stroke-width="3" />
      <line x1="85" y1="50" x2="85" y2="64" stroke="#000000" stroke-width="3" />
    `;
    mouthSvg = `<path d="M 52 76 Q 64 82 76 76" fill="none" stroke="#0284c7" stroke-width="3.5" />`;
  }
  // 3. 極・覚醒サマーエンマ (Goku Awakening Enma) - Purple Lightning Hair & Third Eye
  else if (/極・覚醒サマーエンマ/i.test(name)) {
    customSkinColor = '#fae8ff';
    hairAndAccessoriesSvg = `
      <!-- Extreme Spiky Electric Purple Hair -->
      <path d="M 10 52 L -12 -12 L 28 18 L 64 -28 L 100 18 L 140 -12 L 118 52 C 128 84 112 108 96 108 L 32 108 C 16 108 0 84 10 52 Z" fill="#9333ea" stroke="#f43f5e" stroke-width="3.5" />
      <!-- Floating Gold Lightning Crown -->
      <path d="M 34 16 L 46 -10 L 52 8 L 64 -18 L 76 8 L 82 -10 L 94 16 Z" fill="#ffd700" stroke="#000000" stroke-width="2" />
      <!-- Awakening Third Eye on Forehead -->
      <ellipse cx="64" cy="24" rx="8" ry="12" fill="#f43f5e" stroke="#ffd700" stroke-width="2" />
      <circle cx="64" cy="24" r="4" fill="#ffffff" />
    `;
    eyesSvg = `
      <!-- Furious Glowing Crimson/Gold Eyes -->
      <ellipse cx="42" cy="58" rx="8.5" ry="11" fill="#f43f5e" stroke="#ffd700" stroke-width="2" />
      <circle cx="42" cy="58" r="4" fill="#ffd700" />
      <ellipse cx="86" cy="58" rx="8.5" ry="11" fill="#f43f5e" stroke="#ffd700" stroke-width="2" />
      <circle cx="86" cy="58" r="4" fill="#ffd700" />
    `;
    mouthSvg = `<path d="M 48 76 Q 64 90 80 76" fill="none" stroke="#7e22ce" stroke-width="4" stroke-linecap="round" />`;
  }
  // 4. 冥王神・終焉ハデス (Hades) - Skull Demon Crown & Obsidian Rams Horns
  else if (/冥王神・終焉ハデス|ハデス/i.test(name)) {
    customSkinColor = '#312e81';
    hairAndAccessoriesSvg = `
      <!-- Curved Obsidian Ram Horns -->
      <path d="M 28 36 Q -18 20 -20 54 Q -6 68 20 46 Z" fill="#1e1b4b" stroke="#c084fc" stroke-width="3" />
      <path d="M 100 36 Q 146 20 148 54 Q 134 68 108 46 Z" fill="#1e1b4b" stroke="#c084fc" stroke-width="3" />
      <!-- Dark Violet Phantom Hair -->
      <path d="M 14 54 C 6 22 30 12 64 12 C 98 12 122 22 114 54 C 122 84 108 106 96 106 L 32 106 C 20 106 6 84 14 54 Z" fill="#4c1d95" stroke="#a855f7" stroke-width="3" />
      <!-- Golden Skull Crown -->
      <path d="M 42 22 L 64 2 L 86 22 Z" fill="#ffd700" stroke="#000000" stroke-width="2" />
      <!-- Mini White Skull Emblem on Forehead -->
      <circle cx="64" cy="22" r="7" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
      <circle cx="61" cy="20" r="1.5" fill="#000" />
      <circle cx="67" cy="20" r="1.5" fill="#000" />
      <path d="M 61 25 L 67 25" stroke="#000" stroke-width="1.5" />
    `;
    eyesSvg = `
      <!-- Demonic Ominous Purple/Cyan Eyes -->
      <polygon points="28,48 56,54 36,66" fill="#a855f7" stroke="#ffffff" stroke-width="2" />
      <polygon points="100,48 72,54 92,66" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="56" r="3" fill="#ffffff" />
      <circle cx="86" cy="56" r="3" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 48 76 L 80 76" stroke="#c084fc" stroke-width="4" stroke-linecap="square" />`;
  }
  // 5. 極限支配・魔王リムル (Demon Lord Rimuru SSS)
  else if (/リムル/i.test(name)) {
    customSkinColor = '#e0f2fe';
    hairAndAccessoriesSvg = `
      <!-- Slime Liquid Effect behind head -->
      <ellipse cx="64" cy="94" rx="46" ry="18" fill="#38bdf8" opacity="0.7" />
      <!-- Silky Cyan Hair -->
      <path d="M 14 52 C 8 20 28 10 64 10 C 100 10 120 20 114 52 C 122 78 112 100 100 102 C 92 84 88 66 78 52 C 68 38 60 38 50 52 C 40 66 36 84 28 102 C 16 100 6 78 14 52 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="3" />
      <!-- Golden Crest / Star emblem on forehead -->
      <polygon points="64,18 67,24 74,24 69,28 71,34 64,30 57,34 59,28 54,24 61,24" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
    `;
    eyesSvg = `
      <!-- Beautiful Royal Gold Eyes -->
      <ellipse cx="42" cy="58" rx="8.5" ry="12" fill="#eab308" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="58" r="4.5" fill="#f59e0b" />
      <circle cx="40" cy="54" r="2.5" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8.5" ry="12" fill="#eab308" stroke="#ffffff" stroke-width="2" />
      <circle cx="86" cy="58" r="4.5" fill="#f59e0b" />
      <circle cx="84" cy="54" r="2.5" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 52 76 Q 64 82 76 76" fill="none" stroke="#0284c7" stroke-width="3.5" stroke-linecap="round" />`;
  }
  // 6. 無限虚空・五条悟 (Gojo Satoru SSS)
  else if (/五条悟/i.test(name)) {
    customSkinColor = '#fcf8f2';
    hairAndAccessoriesSvg = `
      <!-- Dashing Spiky White/Silver Hair -->
      <path d="M 14 44 L -10 -6 L 26 18 L 64 -24 L 102 18 L 138 -6 L 114 44 C 124 76 110 98 96 98 L 32 98 C 18 98 4 76 14 44 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="3" />
      <!-- Black Blindfold Eyepatch partially pulled up -->
      <path d="M 22 46 L 106 38 L 102 54 L 18 62 Z" fill="#0f172a" stroke="#000000" stroke-width="1.5" />
      <!-- Blindfold Tie Knots behind -->
      <path d="M 12 50 L -2 60 L 10 68 Z" fill="#0f172a" />
    `;
    eyesSvg = `
      <!-- Striking Cyan Six Eyes (Glinting from under the pulled blindfold) -->
      <ellipse cx="42" cy="58" rx="8.5" ry="12" fill="#06b6d4" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="58" r="4" fill="#a5f3fc" />
      <circle cx="40" cy="54" r="2.5" fill="#ffffff" />
      <!-- Right eye is completely covered by blindfold, but let's make it peer out as well or stay covered for cool asymmetry! -->
      <ellipse cx="86" cy="58" rx="8.5" ry="12" fill="#0f172a" opacity="0.85" />
      <path d="M 78 58 L 94 58" stroke="#111111" stroke-width="2" />
    `;
    mouthSvg = `<path d="M 54 78 Q 64 80 74 78" fill="none" stroke="#111111" stroke-width="3" stroke-linecap="round" />`;
  }
  // 7. 太陽神・天照大御神 (Amaterasu SSS)
  else if (/天照大御神/i.test(name)) {
    customSkinColor = '#fff5f5';
    hairAndAccessoriesSvg = `
      <!-- Giant Golden Sun Wheel/Halo on Back -->
      <circle cx="64" cy="64" r="58" fill="none" stroke="#f59e0b" stroke-width="4.5" />
      <path d="M 64 6 L 64 16 M 64 112 L 64 122 M 6 64 L 16 64 M 112 64 L 122 64 M 23 23 L 30 30 M 98 98 L 105 105 M 23 98 L 30 91 M 98 23 L 105 30" stroke="#f59e0b" stroke-width="3.5" stroke-linecap="round" />
      <!-- Soft Pink/Cherry Blossom Hair -->
      <path d="M 14 54 C 6 22 26 12 64 12 C 102 12 122 22 114 54 C 124 84 110 106 98 106 L 30 106 C 18 106 4 84 14 54 Z" fill="#fbcfe8" stroke="#f43f5e" stroke-width="2.5" />
      <!-- Solar Gold Tiara / Crown -->
      <path d="M 40 22 L 64 4 L 88 22 Z" fill="#f59e0b" stroke="#78350f" stroke-width="2" />
      <!-- Red Sun Crest on Forehead -->
      <circle cx="64" cy="22" r="5" fill="#ef4444" />
    `;
    eyesSvg = `
      <!-- Gentle Glowing Ruby/Golden Eyes -->
      <ellipse cx="42" cy="58" rx="8" ry="11" fill="#ef4444" stroke="#f59e0b" stroke-width="1.5" />
      <circle cx="42" cy="58" r="3.5" fill="#fcd34d" />
      <circle cx="40" cy="54" r="2" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8" ry="11" fill="#ef4444" stroke="#f59e0b" stroke-width="1.5" />
      <circle cx="86" cy="58" r="3.5" fill="#fcd34d" />
      <circle cx="84" cy="54" r="2" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 52 74 Q 64 82 76 74" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round" />`;
  }
  // 8. 絶対覇王・ルフィＧ５ (Luffy Gear 5 SSS)
  else if (/ルフィ/i.test(name)) {
    customSkinColor = '#ffeedd';
    hairAndAccessoriesSvg = `
      <!-- Fluffy White Cloud Hair (Gear 5) -->
      <path d="M 14 46 C -6 20 12 -12 44 2 C 54 -14 74 -14 84 2 C 116 -12 134 20 114 46 C 132 76 114 100 96 100 L 32 100 C 14 100 -4 76 14 46 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="3.5" />
      <!-- Cloud ring around head -->
      <path d="M 8 50 Q 64 26 120 50 Q 64 102 8 50" fill="none" stroke="#e2e8f0" stroke-width="4.5" opacity="0.6" />
    `;
    eyesSvg = `
      <!-- Playful Red Ringed Awakened Eyes -->
      <circle cx="42" cy="56" r="8.5" fill="#ffffff" stroke="#ef4444" stroke-width="2.5" />
      <circle cx="42" cy="56" r="3" fill="#ef4444" />
      <circle cx="86" cy="56" r="8.5" fill="#ffffff" stroke="#ef4444" stroke-width="2.5" />
      <circle cx="86" cy="56" r="3" fill="#ef4444" />
    `;
    mouthSvg = `
      <!-- Giant, iconic laughing grin -->
      <path d="M 40 70 Q 64 96 88 70 Z" fill="#ef4444" stroke="#111111" stroke-width="3" />
      <path d="M 44 71 Q 64 82 84 71" fill="none" stroke="#ffffff" stroke-width="5" />
    `;
  }
  // 9. 氷雪女王・エルサ (Elsa SSS)
  else if (/エルサ/i.test(name)) {
    customSkinColor = '#f0f9ff';
    hairAndAccessoriesSvg = `
      <!-- White-Gold Gorgeous Swept Hair -->
      <path d="M 16 52 C 10 24 28 14 64 14 C 100 14 118 24 112 52 C 122 80 110 102 98 102 L 30 102 C 18 102 6 80 16 52 Z" fill="#fffbeb" stroke="#fcd34d" stroke-width="3" />
      <!-- Beautiful side-swept braid -->
      <path d="M 16 64 C -4 80 12 100 24 112 Q 32 100 20 80 Z" fill="#fffbeb" stroke="#fcd34d" stroke-width="2" />
      <!-- Sparkling Blue Snowflake Crown -->
      <polygon points="64,2 69,12 79,12 71,18 74,28 64,22 54,28 57,18 49,12 59,12" fill="#06b6d4" stroke="#ffffff" stroke-width="1.5" />
    `;
    eyesSvg = `
      <!-- Captivating Ice Blue Eyes -->
      <ellipse cx="42" cy="58" rx="8.5" ry="12" fill="#0ea5e9" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="58" r="4" fill="#0284c7" />
      <circle cx="40" cy="54" r="2.5" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8.5" ry="12" fill="#0ea5e9" stroke="#ffffff" stroke-width="2" />
      <circle cx="86" cy="58" r="4" fill="#0284c7" />
      <circle cx="84" cy="54" r="2.5" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 54 76 Q 64 84 74 76" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round" />`;
  }
  // 10. ウルトラゼロマント (Ultraman Zero SSS)
  else if (/ウルトラゼロ/i.test(name)) {
    customSkinColor = '#e2e8f0';
    customBodyFill = '#1d4ed8';
    hairAndAccessoriesSvg = `
      <!-- Twin Zero Slugger crescent blades on top -->
      <path d="M 32 18 Q 12 -16 28 -22 Q 44 -16 48 18 Z" fill="#cbd5e1" stroke="#1e3a8a" stroke-width="2.5" />
      <path d="M 96 18 Q 116 -16 100 -22 Q 84 -16 80 18 Z" fill="#cbd5e1" stroke="#1e3a8a" stroke-width="2.5" />
      <!-- Ultra Blue/Red Markings -->
      <path d="M 12 56 Q 30 14 64 14 Q 98 14 116 56 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
      <!-- Ultimate Blue Aegis Chest Gem -->
      <polygon points="64,80 72,88 64,96 56,88" fill="#06b6d4" stroke="#ffffff" stroke-width="2.5" />
      <!-- Emerald Beam Lamp on forehead -->
      <circle cx="64" cy="22" r="5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
    `;
    eyesSvg = `
      <!-- Ultimate Glowing Diamond Eyes -->
      <polygon points="26,50 54,44 48,64 30,62" fill="#fffbeb" stroke="#b45309" stroke-width="2.5" />
      <polygon points="102,50 74,44 80,64 98,62" fill="#fffbeb" stroke="#b45309" stroke-width="2.5" />
    `;
    mouthSvg = `<path d="M 52 72 L 76 72" stroke="#475569" stroke-width="3" stroke-linecap="round" />`;
  }

  // --- SS RANK CHARACTERS (100% Unique, DISTINCT SILHOUETTE) ---
  
  // 1. めぐみん (Megumin) - Wizard Hat, Crimson Eye & Eyepatch
  else if (/めぐみん/i.test(name)) {
    customSkinColor = '#fff0e6';
    hairAndAccessoriesSvg = `
      <!-- Hair Bob -->
      <path d="M 14 60 C 10 24 30 14 64 14 C 98 14 118 24 114 60 C 118 88 108 104 100 106 C 94 86 90 70 82 56 C 72 40 56 40 46 56 C 38 70 34 86 28 106 C 20 104 10 88 14 60 Z" fill="#221122" stroke="#000000" stroke-width="2.5" />
      <!-- Giant Crimson Wizard Hat -->
      <path d="M 12 38 L 64 -18 L 116 38 Z" fill="#3a1128" stroke="#ffaa00" stroke-width="3.5" />
      <ellipse cx="64" cy="38" rx="54" ry="12" fill="#d00044" stroke="#ffaa00" stroke-width="2.5" />
      <!-- Hat Gold Buckle -->
      <rect x="52" y="22" width="24" height="20" rx="4" fill="#ffd700" stroke="#000000" stroke-width="2" />
      <rect x="58" y="27" width="12" height="10" rx="2" fill="#3a1128" />
    `;
    eyesSvg = `
      <!-- Left Glowing Crimson Eye -->
      <circle cx="42" cy="58" r="9.5" fill="#ff0044" stroke="#ffffff" stroke-width="2" />
      <circle cx="42" cy="58" r="4" fill="#ffff00" />
      <!-- Right Eyepatch -->
      <path d="M 72 46 L 98 68 L 94 72 L 68 50 Z" fill="#111111" />
      <rect x="74" y="48" width="20" height="20" rx="4" fill="#aa0022" stroke="#111111" stroke-width="2" />
      <path d="M 78 52 L 90 64 M 90 52 L 78 64" stroke="#ffd700" stroke-width="2.5" />
    `;
  }
  // 2. ベニマル (Benimaru) - Flame Red Spiky Hair & Black Horn
  else if (/ベニマル/i.test(name)) {
    customSkinColor = '#ffe8df';
    hairAndAccessoriesSvg = `
      <!-- Flame Red Spiky Hair -->
      <path d="M 12 48 L -2 -12 L 32 20 L 64 -22 L 96 20 L 130 -12 L 116 48 C 126 80 112 108 96 108 L 32 108 C 16 108 2 80 12 48 Z" fill="#ff2200" stroke="#550000" stroke-width="3.5" />
      <!-- Giant Obsidian Horn with Gold Ring -->
      <path d="M 56 34 Q 48 -18 64 -26 Q 80 -18 72 34 Z" fill="#111111" stroke="#ffd700" stroke-width="3" />
      <ellipse cx="64" cy="10" rx="8" ry="3" fill="#ffd700" />
    `;
    eyesSvg = `
      <!-- Sharp Golden Demon Eyes -->
      <polygon points="30,48 54,56 36,66" fill="#ffcc00" stroke="#000000" stroke-width="2" />
      <polygon points="98,48 74,56 92,66" fill="#ffcc00" stroke="#000000" stroke-width="2" />
      <circle cx="42" cy="56" r="3.5" fill="#111111" />
      <circle cx="86" cy="56" r="3.5" fill="#111111" />
    `;
    mouthSvg = `<path d="M 52 74 Q 64 82 76 74" fill="none" stroke="#111111" stroke-width="3.5" />`;
  }
  // 3. 里羽リュウタ (Ryuuta) - Cyan Dragon Horns & Aura
  else if (/里羽リュウタ|オロチ/i.test(name)) {
    customSkinColor = '#e0f7fa';
    hairAndAccessoriesSvg = `
      <!-- Dragon Cyan Spiky Hair -->
      <path d="M 14 52 L -4 -2 L 32 24 L 64 -18 L 96 24 L 132 -2 L 114 52 C 122 84 106 106 94 106 L 34 106 C 22 106 6 84 14 52 Z" fill="#00ccff" stroke="#004488" stroke-width="3" />
      <!-- Twin Cyan Dragon Horns -->
      <path d="M 28 32 Q 4 4 -2 22 Q 22 26 36 34 Z" fill="#00ffff" stroke="#ffffff" stroke-width="2.5" />
      <path d="M 100 32 Q 124 4 130 22 Q 106 26 92 34 Z" fill="#00ffff" stroke="#ffffff" stroke-width="2.5" />
      <!-- Dragon Orb on Forehead -->
      <circle cx="64" cy="20" r="9" fill="#00ffff" stroke="#003366" stroke-width="2" />
      <circle cx="62" cy="18" r="3" fill="#ffffff" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="58" rx="8" ry="11" fill="#003366" stroke="#00ffff" stroke-width="2" />
      <circle cx="40" cy="53" r="3.5" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8" ry="11" fill="#003366" stroke="#00ffff" stroke-width="2" />
      <circle cx="84" cy="53" r="3.5" fill="#ffffff" />
    `;
  }
  // 4. 阿弥陀丸 (Amidamaru) - Emerald Samurai Mane & Gold Crest
  else if (/阿弥陀丸/i.test(name)) {
    customSkinColor = '#e8f5e9';
    hairAndAccessoriesSvg = `
      <!-- Emerald Long Samurai Hair -->
      <path d="M 10 48 C -4 16 18 6 42 18 L 64 2 L 86 18 C 110 6 132 16 118 48 C 130 84 104 106 94 106 L 34 106 C 24 106 -2 84 10 48 Z" fill="#009966" stroke="#003322" stroke-width="3" />
      <!-- Golden Samurai Crescent Ornament -->
      <path d="M 24 24 Q 64 -12 104 24 Q 64 8 24 24 Z" fill="#ffd700" stroke="#000000" stroke-width="3" />
      <circle cx="64" cy="12" r="8" fill="#00e676" stroke="#ffffff" stroke-width="2" />
    `;
    eyesSvg = `
      <polygon points="30,48 54,54 36,64" fill="#002211" stroke="#ffffff" stroke-width="1.5" />
      <polygon points="98,48 74,54 92,64" fill="#002211" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="42" cy="55" r="3" fill="#ffffff" />
      <circle cx="86" cy="55" r="3" fill="#ffffff" />
    `;
  }
  // 5. 覚醒早乙女乱馬 (Ranma) - Black Long Braided Ponytail & Martial Arts Outfit
  else if (/覚醒早乙女乱馬/i.test(name)) {
    customSkinColor = '#fff3e0';
    hairAndAccessoriesSvg = `
      <!-- Long Braided Ponytail on Left Side -->
      <path d="M 18 48 Q -10 70 8 102 Q 22 108 24 92 Q 8 68 28 58 Z" fill="#111111" stroke="#000000" stroke-width="2.5" />
      <!-- Short Spiky Black Front Hair -->
      <path d="M 16 52 C 12 22 34 14 64 14 C 94 14 116 22 112 52 C 120 82 106 100 96 100 L 32 100 C 22 100 8 82 16 52 Z" fill="#1a1a1a" stroke="#000000" stroke-width="2.5" />
      <!-- Chinese Martial Arts Red Collar -->
      <path d="M 24 82 Q 64 106 104 82 L 94 110 Q 64 120 34 110 Z" fill="#cc1100" stroke="#ffd700" stroke-width="2.5" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="56" rx="8" ry="11" fill="#111111" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="40" cy="51" r="3.5" fill="#ffffff" />
      <ellipse cx="86" cy="56" rx="8" ry="11" fill="#111111" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="84" cy="51" r="3.5" fill="#ffffff" />
    `;
  }
  // 6. フェルト (Felt) - Blonde Hair & Huge Red Head Ribbon
  else if (/フェルト/i.test(name)) {
    customSkinColor = '#fff8e7';
    hairAndAccessoriesSvg = `
      <!-- Wild Blonde Hair -->
      <path d="M 12 50 C 4 18 28 10 64 10 C 100 10 124 18 116 50 C 126 80 110 102 96 102 C 88 80 84 60 76 46 C 66 32 62 32 52 46 C 44 60 40 80 32 102 C 18 102 2 80 12 50 Z" fill="#ffee33" stroke="#cc9900" stroke-width="3" />
      <!-- Huge Red Head Ribbon -->
      <path d="M 64 18 L 18 -10 L 32 28 L 64 20 L 96 28 L 110 -10 Z" fill="#ff0044" stroke="#880022" stroke-width="3" />
      <circle cx="64" cy="20" r="7" fill="#cc0033" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="58" rx="8.5" ry="12" fill="#ff0044" stroke="#ffffff" stroke-width="2" />
      <circle cx="40" cy="52" r="4" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8.5" ry="12" fill="#ff0044" stroke="#ffffff" stroke-width="2" />
      <circle cx="84" cy="52" r="4" fill="#ffffff" />
    `;
    mouthSvg = `<path d="M 52 74 Q 60 86 68 76" fill="none" stroke="#111111" stroke-width="3.5" stroke-linecap="round" />`;
  }
  // 7. 五月 (Itsuki Nakano) - Red Hair, Ahoge & Twin Star Pins
  else if (/五月/i.test(name)) {
    customSkinColor = '#ffebee';
    hairAndAccessoriesSvg = `
      <!-- Rich Red Hair -->
      <path d="M 10 60 C 4 18 28 8 64 8 C 100 8 124 18 118 60 C 126 94 110 112 96 112 C 90 88 86 66 78 50 C 68 34 56 34 48 50 C 40 66 36 88 30 112 C 16 112 2 94 10 60 Z" fill="#ff2255" stroke="#880022" stroke-width="3" />
      <!-- Bouncy Ahoge (Hair Strand) -->
      <path d="M 64 8 Q 76 -16 88 -6 Q 72 -2 64 8 Z" fill="#ff2255" stroke="#880022" stroke-width="2.5" />
      <!-- Gold Twin Star Hairpins -->
      <polygon points="30,26 33,34 41,34 35,39 37,47 30,42 23,47 25,39 19,34 27,34" fill="#ffd700" stroke="#cc9900" stroke-width="1.5" />
      <polygon points="98,26 101,34 109,34 103,39 105,47 98,42 91,47 93,39 87,34 95,34" fill="#ffd700" stroke="#cc9900" stroke-width="1.5" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="58" rx="8.5" ry="12" fill="#0088cc" stroke="#ffffff" stroke-width="2" />
      <circle cx="40" cy="52" r="4" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8.5" ry="12" fill="#0088cc" stroke="#ffffff" stroke-width="2" />
      <circle cx="84" cy="52" r="4" fill="#ffffff" />
    `;
  }
  // 8. メリオダス (Meliodas) - Spiky Golden Hair & Demon Crest
  else if (/メリオダス/i.test(name)) {
    customSkinColor = '#fffde7';
    hairAndAccessoriesSvg = `
      <!-- Spiky Golden Hair -->
      <path d="M 10 50 L -2 -8 L 30 18 L 64 -18 L 98 18 L 130 -8 L 118 50 C 126 82 108 104 96 104 L 32 104 C 20 104 2 82 10 50 Z" fill="#ffee33" stroke="#aa8800" stroke-width="3.5" />
      <!-- Demon Mark over forehead -->
      <path d="M 30 30 Q 50 20 40 50 C 34 42 24 38 30 30 Z" fill="#3a0055" stroke="#aa00ff" stroke-width="2" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="58" rx="8" ry="11" fill="#00cc66" stroke="#ffffff" stroke-width="2" />
      <circle cx="40" cy="53" r="3.5" fill="#ffffff" />
      <ellipse cx="86" cy="58" rx="8" ry="11" fill="#00cc66" stroke="#ffffff" stroke-width="2" />
      <circle cx="84" cy="53" r="3.5" fill="#ffffff" />
    `;
  }
  // 9. ブシ王 (Bushi-O) - Gold Samurai King Helmet & Crescent
  else if (/ブシ王/i.test(name)) {
    customSkinColor = '#ffd700';
    customBodyFill = '#b38f00';
    hairAndAccessoriesSvg = `
      <!-- Huge Gold Helmet & Crescent -->
      <path d="M 12 28 Q 64 -20 116 28 Q 64 4 12 28 Z" fill="#ffee33" stroke="#000000" stroke-width="3.5" />
      <circle cx="64" cy="12" r="9" fill="#ff0044" stroke="#ffffff" stroke-width="2" />
      <!-- Red Samurai Face Mask (Menpo) -->
      <path d="M 28 66 L 100 66 L 90 94 L 38 94 Z" fill="#cc1100" stroke="#000000" stroke-width="2.5" />
    `;
    eyesSvg = `
      <circle cx="42" cy="54" r="7" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <circle cx="42" cy="54" r="3.5" fill="#ff0000" />
      <circle cx="86" cy="54" r="7" fill="#ffffff" stroke="#000000" stroke-width="2" />
      <circle cx="86" cy="54" r="3.5" fill="#ff0000" />
    `;
    mouthSvg = `<path d="M 52 80 L 76 80" stroke="#ffffff" stroke-width="3" />`;
  }
  // 10. パウロ (Paulo) - Blonde Slicked Hair, Beard & Blue Armor
  else if (/パウロ/i.test(name)) {
    customSkinColor = '#fff0e0';
    hairAndAccessoriesSvg = `
      <!-- Blonde Dashing Hair -->
      <path d="M 12 48 C 8 16 30 6 64 6 C 98 6 120 16 116 48 C 122 78 108 96 98 96 C 92 76 88 54 78 38 C 68 26 60 26 50 38 C 40 54 36 76 30 96 C 20 96 6 78 12 48 Z" fill="#e6b800" stroke="#664d00" stroke-width="3" />
      <!-- Blue Knight Armor Shoulder & Collar -->
      <path d="M 20 80 Q 64 108 108 80 L 98 112 Q 64 122 30 112 Z" fill="#1144cc" stroke="#ffffff" stroke-width="2.5" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="56" rx="7" ry="10" fill="#0088ff" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="40" cy="52" r="3" fill="#ffffff" />
      <ellipse cx="86" cy="56" rx="7" ry="10" fill="#0088ff" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="84" cy="52" r="3" fill="#ffffff" />
    `;
    mouthSvg = `
      <path d="M 52 72 Q 64 82 76 72" fill="none" stroke="#111111" stroke-width="3" />
      <path d="M 56 82 Q 64 86 72 82" fill="none" stroke="#997700" stroke-width="3" />
    `;
  }

  // --- S RANK & OTHER DISTINCT CHARACTERS ---

  // 11. 花垣武道 (Takemichi) - Blonde Regent Pompadour Hair & Black Gakuran
  else if (/花垣武道/i.test(name)) {
    customSkinColor = '#fff8e7';
    hairAndAccessoriesSvg = `
      <!-- Blonde Regent Pompadour -->
      <path d="M 20 40 Q 64 -24 108 40 C 118 68 106 96 96 96 C 88 72 82 48 64 48 C 46 48 40 72 32 96 C 22 96 10 68 20 40 Z" fill="#ffee33" stroke="#aa8800" stroke-width="3" />
      <!-- Black Gakuran Collar -->
      <path d="M 24 82 Q 64 104 104 82 L 94 112 Q 64 120 34 112 Z" fill="#0f172a" stroke="#ffffff" stroke-width="2" />
    `;
    eyesSvg = `
      <circle cx="42" cy="58" r="7" fill="#0066cc" stroke="#ffffff" stroke-width="1.5" />
      <circle cx="86" cy="58" r="7" fill="#0066cc" stroke="#ffffff" stroke-width="1.5" />
    `;
  }
  // 12. ミカサ (Mikasa) - Black Bob Hair & Red Scarf
  else if (/ミカサ/i.test(name)) {
    customSkinColor = '#fff0e6';
    hairAndAccessoriesSvg = `
      <path d="M 16 48 C 12 18 32 10 64 10 C 96 10 116 18 112 48 C 116 76 108 94 100 96 C 92 76 88 58 78 46 C 68 34 60 34 50 46 C 40 58 36 76 28 96 C 20 94 12 76 16 48 Z" fill="#111111" stroke="#000000" stroke-width="2.5" />
      <path d="M 20 76 Q 64 104 108 76 Q 114 96 64 116 Q 14 96 20 76 Z" fill="#cc1122" stroke="#660011" stroke-width="2.5" />
    `;
    eyesSvg = `
      <ellipse cx="42" cy="56" rx="7" ry="10" fill="#222222" stroke="#ffffff" stroke-width="1.5" />
      <ellipse cx="86" cy="56" rx="7" ry="10" fill="#222222" stroke="#ffffff" stroke-width="1.5" />
    `;
  }
  // 13. ゴモラ (Gomora) - Monster Brown Skin & Twin Crescent Horns
  else if (/ゴモラ/i.test(name)) {
    customSkinColor = '#775533';
    customBodyFill = '#553311';
    hairAndAccessoriesSvg = `
      <!-- Twin Massive Monster Horns -->
      <path d="M 28 32 Q 0 -12 -12 10 Q 14 20 34 36 Z" fill="#ffaa00" stroke="#000000" stroke-width="3" />
      <path d="M 100 32 Q 128 -12 140 10 Q 114 20 94 36 Z" fill="#ffaa00" stroke="#000000" stroke-width="3" />
    `;
    eyesSvg = `
      <circle cx="42" cy="56" r="6" fill="#ffcc00" stroke="#000000" stroke-width="1.5" />
      <circle cx="86" cy="56" r="6" fill="#ffcc00" stroke="#000000" stroke-width="1.5" />
    `;
    mouthSvg = `<path d="M 44 76 Q 64 94 84 76 Z" fill="#aa2200" stroke="#000000" stroke-width="2.5" />`;
  }
  // 14. ウルトラマン (Ultraman) - Silver Body, Yellow Oval Eyes & Color Timer
  else if (/ウルトラマン/i.test(name)) {
    customSkinColor = '#e0e0e0';
    customBodyFill = '#cc0000';
    hairAndAccessoriesSvg = `
      <!-- Ultraman Red Side Markings -->
      <path d="M 12 64 Q 30 18 64 18 Q 98 18 116 64 Z" fill="#cc0000" stroke="#990000" stroke-width="2" />
      <!-- Color Timer Badge -->
      <circle cx="64" cy="88" r="9" fill="#00d2ff" stroke="#ffffff" stroke-width="2" />
    `;
    eyesSvg = `
      <!-- Glowing Yellow Oval Eyes -->
      <ellipse cx="40" cy="52" rx="10" ry="14" fill="#ffee55" stroke="#998800" stroke-width="2" />
      <ellipse cx="88" cy="52" rx="10" ry="14" fill="#ffee55" stroke="#998800" stroke-width="2" />
    `;
    mouthSvg = `<path d="M 54 74 L 74 74" stroke="#666666" stroke-width="3" />`;
  }
  // 15. 赤ぷよ (Puyo) - Full Gloss Red Puyo Body
  else if (/赤ぷよ/i.test(name)) {
    customSkinColor = '#ff0044';
    customBodyFill = '#bb0033';
    eyesSvg = `
      <ellipse cx="42" cy="54" rx="10" ry="14" fill="#ffffff" stroke="#111111" stroke-width="2" />
      <ellipse cx="42" cy="54" rx="4" ry="7" fill="#111111" />
      <ellipse cx="86" cy="54" rx="10" ry="14" fill="#ffffff" stroke="#111111" stroke-width="2" />
      <ellipse cx="86" cy="54" rx="4" ry="7" fill="#111111" />
    `;
    mouthSvg = `<ellipse cx="64" cy="76" rx="8" ry="10" fill="#aa0022" stroke="#ffffff" stroke-width="2" />`;
  }
  // 16. フユニャン / Jibanyan (Cats) - Blue/Red Cat Body & Ears
  else if (/ニャン|ネコ|ねこ|猫|バケーラ|ジバ/i.test(name)) {
    customSkinColor = /フユニャン/i.test(name) ? '#1a3388' : '#ff2200';
    customBodyFill = '#112266';
    hairAndAccessoriesSvg = `
      <!-- Cat Ears -->
      <path d="M 22 42 L 2 2 L 44 24 Z" fill="${customSkinColor}" stroke="#ffffff" stroke-width="3" />
      <path d="M 24 36 L 10 12 L 38 22 Z" fill="#ff77aa" />
      <path d="M 106 42 L 126 2 L 84 24 Z" fill="${customSkinColor}" stroke="#ffffff" stroke-width="3" />
      <path d="M 104 36 L 118 12 L 90 22 Z" fill="#ff77aa" />
      <!-- Headband -->
      <rect x="24" y="22" width="80" height="14" rx="7" fill="#ffee33" stroke="#000000" stroke-width="2" />
    `;
    eyesSvg = `
      <circle cx="42" cy="58" r="10" fill="#ffee00" stroke="#000000" stroke-width="2" />
      <ellipse cx="42" cy="58" rx="3" ry="8" fill="#111111" />
      <circle cx="86" cy="58" r="10" fill="#ffee00" stroke="#000000" stroke-width="2" />
      <ellipse cx="86" cy="58" rx="3" ry="8" fill="#111111" />
    `;
  }
  // 17. メラメライオン (Meramelion) - Flaming Fire Mane
  else if (/ライオン|獅子|轟/i.test(name)) {
    customSkinColor = '#ff4400';
    customBodyFill = '#cc1100';
    hairAndAccessoriesSvg = `
      <path d="M 10 64 C -14 14 18 -14 64 -14 C 110 -14 142 14 118 64 C 142 114 96 142 64 142 C 32 142 -14 114 10 64 Z" fill="#ff3300" stroke="#ffee00" stroke-width="4" />
      <path d="M 20 64 C 4 28 26 6 64 6 C 102 6 124 28 108 64 C 124 100 90 120 64 120 C 38 120 4 100 20 64 Z" fill="#ffaa00" />
    `;
    eyesSvg = `
      <polygon points="30,48 54,52 36,64" fill="#ffee00" stroke="#000000" stroke-width="2" />
      <polygon points="98,48 74,52 92,64" fill="#ffee00" stroke="#000000" stroke-width="2" />
    `;
  }
  // 18. おにぎり侍 / ちからモチ (Onigiri / Mochi)
  else if (/おにぎり|モチ|餅/i.test(name)) {
    customSkinColor = '#ffffff';
    customBodyFill = '#e0e0e0';
    hairAndAccessoriesSvg = `
      <path d="M 64 8 L 120 92 C 120 110 102 116 64 116 C 26 116 8 110 8 92 Z" fill="#ffffff" stroke="#cccccc" stroke-width="3" />
      <rect x="36" y="80" width="56" height="36" fill="#1a1a1a" />
    `;
    eyesSvg = `
      <circle cx="42" cy="58" r="6" fill="#111111" />
      <circle cx="86" cy="58" r="6" fill="#111111" />
    `;
  }
  // 19. Generic Fallback by Name Hash (Never duplicate template!)
  else {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const styleType = Math.abs(hash) % 4;
    customSkinColor = `hsl(${Math.abs(hash * 37) % 360}, 75%, 85%)`;
    
    if (styleType === 0) {
      hairAndAccessoriesSvg = `
        <path d="M 16 48 C -8 18 12 0 36 20 C 50 8 78 8 92 20 C 116 0 136 18 112 48 L 96 100 L 32 100 Z" fill="${hairColor}" stroke="#111111" stroke-width="2.5" />
      `;
    } else if (styleType === 1) {
      hairAndAccessoriesSvg = `
        <path d="M 12 50 L 0 -8 L 32 18 L 64 -16 L 96 18 L 128 -8 L 116 50 Z" fill="${hairColor}" stroke="#111111" stroke-width="3" />
      `;
    } else if (styleType === 2) {
      hairAndAccessoriesSvg = `
        <path d="M 38 22 L 44 2 L 54 14 L 64 0 L 74 14 L 84 2 L 90 22 Z" fill="#ffd700" stroke="#000000" stroke-width="2" />
      `;
    } else {
      hairAndAccessoriesSvg = `
        <path d="M 34 32 Q 16 -8 40 -4 Q 52 14 48 34 Z" fill="${accentColor}" stroke="#000000" stroke-width="2.5" />
        <path d="M 94 32 Q 112 -8 88 -4 Q 76 14 80 34 Z" fill="${accentColor}" stroke="#000000" stroke-width="2.5" />
      `;
    }

    eyesSvg = `
      <ellipse cx="42" cy="58" rx="8" ry="11" fill="#111122" stroke="#ffffff" stroke-width="1.5"/>
      <ellipse cx="86" cy="58" rx="8" ry="11" fill="#111122" stroke="#ffffff" stroke-width="1.5"/>
    `;
  }

  // High Contrast Character Symbol / Emoji Badge
  const symbolText = emojiSymbol || '⭐';

  // Forehead Emblem / Badge Differentiation - Moved to the Top-Left Corner as an elegant medal to avoid face clutter
  let foreheadBadge = '';
  if (rank === 'Z') {
    foreheadBadge = `
      <!-- Z Rank Premium Corner Medal -->
      <g transform="translate(24, 24)" filter="url(#puniShadow)">
        <defs>
          <linearGradient id="zMedalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22d3ee" />
            <stop offset="100%" stop-color="#0891b2" />
          </linearGradient>
        </defs>
        <!-- Diamond Medal Shape -->
        <polygon points="0,-15 15,0 0,15 -15,0" fill="url(#zMedalGrad)" stroke="#ffffff" stroke-width="2" />
        <!-- Shiny Gloss effect -->
        <path d="M -15 0 L 0 -15 L 0 0 Z" fill="#ffffff" opacity="0.4" />
        <text x="0" y="1" font-size="14" font-weight="950" font-family="'Impact', 'Arial Black', sans-serif" text-anchor="middle" dominant-baseline="central" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" paint-order="stroke fill">Z</text>
        <!-- Mini sparkles -->
        <circle cx="11" cy="-11" r="2" fill="#ffff00" />
        <circle cx="-11" cy="11" r="1.5" fill="#ffffff" />
      </g>
    `;
  } else if (rank === 'SSS') {
    foreheadBadge = `
      <!-- SSS Rank Premium Corner Medal -->
      <g transform="translate(24, 24)" filter="url(#puniShadow)">
        <defs>
          <linearGradient id="sssMedalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#b45309" />
          </linearGradient>
        </defs>
        <!-- Star / Shield Medal Shape -->
        <circle cx="0" cy="0" r="14" fill="url(#sssMedalGrad)" stroke="#ffffff" stroke-width="2" />
        <!-- Glowing outer star points -->
        <path d="M 0,-17 L 4,-6 L 15,-10 L 7,-2 L 12,10 L 0,4 L -12,10 L -7,-2 L -15,-10 L -4,-6 Z" fill="#fef08a" opacity="0.5" />
        <circle cx="0" cy="0" r="12" fill="url(#sssMedalGrad)" stroke="#ffd700" stroke-width="1" />
        <!-- Shiny gloss -->
        <path d="M -12 0 A 12 12 0 0 1 0 -12 L 0 0 Z" fill="#ffffff" opacity="0.4" />
        <text x="0" y="1" font-size="9" font-weight="950" font-family="'Impact', 'Arial Black', sans-serif" letter-spacing="-0.5" text-anchor="middle" dominant-baseline="central" fill="#ffffff" stroke="#7c2d12" stroke-width="1.5" paint-order="stroke fill">SSS</text>
      </g>
    `;
  } else if (rank === 'SS') {
    foreheadBadge = `
      <!-- SS Rank Premium Corner Medal -->
      <g transform="translate(24, 24)" filter="url(#puniShadow)">
        <defs>
          <linearGradient id="ssMedalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#f472b6" />
            <stop offset="100%" stop-color="#db2777" />
          </linearGradient>
        </defs>
        <!-- Hexagon Medal Shape -->
        <polygon points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7" fill="url(#ssMedalGrad)" stroke="#ffffff" stroke-width="2" />
        <!-- Shiny gloss -->
        <path d="M -12 0 L 0 -14 L 0 0 Z" fill="#ffffff" opacity="0.4" />
        <text x="0" y="1" font-size="10" font-weight="950" font-family="'Impact', 'Arial Black', sans-serif" text-anchor="middle" dominant-baseline="central" fill="#ffffff" stroke="#4c0519" stroke-width="1.5" paint-order="stroke fill">SS</text>
      </g>
    `;
  } else {
    foreheadBadge = `
      <!-- Fallback Rank / Emoji Corner Badge -->
      <g transform="translate(24, 24)" filter="url(#puniShadow)">
        <circle cx="0" cy="0" r="12" fill="#ffffff" stroke="#333333" stroke-width="2" />
        <text x="0" y="0.5" font-size="12" text-anchor="middle" dominant-baseline="central">${symbolText.length > 1 ? symbolText[0] : symbolText}</text>
      </g>
    `;
  }

  // Rank Aura for High Ranks (Z, SSS, SS, S, A)
  const auraSvg = rank === 'Z' ? `
    <!-- Ultra Cosmic Transcendent Z Aura -->
    <circle cx="64" cy="64" r="63" fill="none" stroke="#00ffff" stroke-width="7.5" opacity="0.95" stroke-dasharray="16,8">
      <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="64" cy="64" r="60" fill="none" stroke="#ff00ff" stroke-width="4" opacity="0.9" stroke-dasharray="8,8">
      <animateTransform attributeName="transform" type="rotate" from="360 64 64" to="0 64 64" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    <!-- Geometric Cosmic Frame for Z -->
    <path d="M 64 2 L 78 16 L 126 64 L 78 112 L 64 126 L 50 112 L 2 64 L 50 16 Z" fill="none" stroke="#ffff00" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.8">
      <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="-360 64 64" dur="4s" repeatCount="indefinite"/>
    </path>
  ` : rank === 'SSS' ? `
    <!-- Divine Golden SSS Aura -->
    <circle cx="64" cy="64" r="63" fill="none" stroke="#ffd700" stroke-width="6.5" opacity="0.95" stroke-dasharray="14,6">
      <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="64" cy="64" r="60" fill="none" stroke="#ff007f" stroke-width="3.5" opacity="0.8" stroke-dasharray="8,8">
      <animateTransform attributeName="transform" type="rotate" from="360 64 64" to="0 64 64" dur="2s" repeatCount="indefinite"/>
    </circle>
  ` : (rank === 'SS' || rank === 'S' || rank === 'A') ? `
    <circle cx="64" cy="64" r="62" fill="none" stroke="${rank === 'SS' ? '#ff00ff' : (rank === 'S' ? '#ff2222' : '#ffaa00')}" stroke-width="4.5" opacity="0.85" stroke-dasharray="10,6">
      <animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="5s" repeatCount="indefinite"/>
    </circle>
  ` : '';

  const safeId = encodeURIComponent(name).replace(/%/g, '_');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="puniSkin_${safeId}" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
        <stop offset="45%" stop-color="${customSkinColor}" />
        <stop offset="100%" stop-color="${customBodyFill || bodyColor}" />
      </radialGradient>
      <filter id="puniShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000" flood-opacity="0.6"/>
      </filter>
    </defs>
    ${auraSvg}
    
    <!-- Outer Rank Ring Frame -->
    <circle cx="64" cy="64" r="57" fill="none" stroke="${borderColor}" stroke-width="5.5" opacity="1" />

    <!-- Hair / Back Accessories (Placed behind or wrapped around Puni) -->
    ${hairAndAccessoriesSvg}

    <!-- Main Gel Puni Face Base -->
    <circle cx="64" cy="64" r="48" fill="url(#puniSkin_${safeId})" filter="url(#puniShadow)" stroke="#111111" stroke-width="3" />
    
    <!-- 3D Glass Gloss Highlights -->
    <ellipse cx="44" cy="34" rx="16" ry="8" fill="#ffffff" opacity="0.7" transform="rotate(-25 44 34)" />
    <circle cx="84" cy="82" r="3.5" fill="#ffffff" opacity="0.4" />
    
    <!-- Blushing Cheeks -->
    <ellipse cx="32" cy="70" rx="8" ry="4.5" fill="#ff2266" opacity="0.6" />
    <ellipse cx="96" cy="70" rx="8" ry="4.5" fill="#ff2266" opacity="0.6" />

    <!-- Eyes & Facial Features -->
    ${eyesSvg}
    ${mouthSvg}

    <!-- DISTANT RECOGNITION ICON BADGE (Corner Medal) -->
    ${foreheadBadge}

    <!-- Character Name Banner (Super High Contrast) -->
    <rect x="14" y="92" width="100" height="22" rx="11" fill="${textBg}" stroke="#ffffff" stroke-width="2" />
    <text x="64" y="103" font-size="12" font-weight="900" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" stroke="#000000" stroke-width="2.5" paint-order="stroke fill">${displayName}</text>
  </svg>`;

  // Convert SVG to safe Base64 Data URL to prevent any browser/library double-decoding "URI malformed" errors (due to '%' characters in gradients/styles)
  const utf8Bytes = new TextEncoder().encode(svg);
  let binStr = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binStr += String.fromCharCode(utf8Bytes[i]);
  }
  return `data:image/svg+xml;base64,${btoa(binStr)}`;
};

export const createRankBadgeSvgDataUrl = (rank: string): string => {
  const colors: Record<string, string> = {
    'E': '#66bb66',
    'D': '#3388ff',
    'C': '#9933ff',
    'B': '#ffaa00',
    'A': '#ff3333',
    'S': '#ff00aa',
    'SS': '#e500ff',
    'SSS': '#ffd700',
    'Z': '#00ffff'
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
  
  // Convert SVG to safe Base64 Data URL to prevent any browser/library double-decoding "URI malformed" errors
  const utf8Bytes = new TextEncoder().encode(svg);
  let binStr = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binStr += String.fromCharCode(utf8Bytes[i]);
  }
  return `data:image/svg+xml;base64,${btoa(binStr)}`;
};

export type SkillType = 'center_pop' | 'random_pop' | 'all_pop' | 'inflate_puni' | 'heal' | 'damage' | 'fever_charge' | 'puni_unify' | 'team_gauge_fill' | 'god_burst';

export interface Skill {
  name: string;
  type: SkillType;
  power: number; // multiplier for damage or flat heal
  description?: string;
}

export interface CharacterDef {
  name: string;
  emoji: string;
  trait: string;
  tribe?: Tribe;
  skillName?: string;
  skillType?: SkillType;
  skillPower?: number;
}

export interface Character {
  id: string;
  name: string;
  rank: Rank;
  tribe: Tribe;
  color: string;
  emoji: string;
  rankImage: string;
  imageUrl: string;
  baseHp: number;
  baseAtk: number;
  skill?: Skill;
  trait?: string;
  eventBoost?: boolean;
  eventBoostDesc?: string;
}

export const getSkillDetails = (skill?: Skill, skillLevel: number = 1) => {
  if (!skill) {
    return {
      description: '必殺技を持っていません',
      power: 0,
      countInfo: '',
      nextUpgrade: ''
    };
  }

  const lv = Math.max(1, skillLevel);
  const isMax = lv >= 7;

  switch (skill.type) {
    case 'center_pop': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.25));
      const popCount = Math.min(18, 6 + lv * 2);
      const nextPopCount = Math.min(18, 6 + (lv + 1) * 2);
      const nextPower = Math.round(skill.power * (1 + lv * 0.25));
      return {
        description: `パズル中央付近のぷにをまとめて消去し、敵にダメージ＋フィーバーゲージを溜める！`,
        power: currentPower,
        countInfo: `消去目安: 約${popCount}個 / 技威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 消去約${nextPopCount}個 / 威力 ${nextPower}`
      };
    }
    case 'random_pop': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.25));
      const popCount = Math.min(22, 8 + lv * 2);
      const nextPopCount = Math.min(22, 8 + (lv + 1) * 2);
      const nextPower = Math.round(skill.power * (1 + lv * 0.25));
      return {
        description: `盤面のぷにをランダムに大量消去し、敵に大ダメージを与える！`,
        power: currentPower,
        countInfo: `消去数: ${popCount}個 / 技威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 消去 ${nextPopCount}個 / 威力 ${nextPower}`
      };
    }
    case 'all_pop': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.3));
      const nextPower = Math.round(skill.power * (1 + lv * 0.3));
      return {
        description: `画面上のすべてのぷにを一瞬で全消去し、敵に超絶大ダメージを与える！`,
        power: currentPower,
        countInfo: `盤面全消去 / 技威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 技威力 ${nextPower}`
      };
    }
    case 'inflate_puni': {
      const targetCount = Math.min(5, 1 + Math.floor((lv + 1) / 2));
      const sizeBonus = 3 + Math.floor(lv * 0.8);
      const nextTargetCount = Math.min(5, 1 + Math.floor((lv + 2) / 2));
      const nextSizeBonus = 3 + Math.floor((lv + 1) * 0.8);
      return {
        description: `盤面のぷにをランダムで選んで一気に「でかぷに」へ成長させる！`,
        power: skill.power,
        countInfo: `変化個数: ${targetCount}個 / サイズ+${sizeBonus}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 変化 ${nextTargetCount}個 / サイズ+${nextSizeBonus}`
      };
    }
    case 'heal': {
      const healAmount = Math.round(skill.power * (1 + (lv - 1) * 0.35));
      const nextHeal = Math.round(skill.power * (1 + lv * 0.35));
      return {
        description: `プレイヤーのHPを即座に大幅回復する！`,
        power: healAmount,
        countInfo: `回復量: HP ${healAmount}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 回復量 HP ${nextHeal}`
      };
    }
    case 'damage': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.3));
      const nextPower = Math.round(skill.power * (1 + lv * 0.3));
      return {
        description: `敵単体に強力な直接攻撃ダメージを与える！`,
        power: currentPower,
        countInfo: `ダメージ威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 威力 ${nextPower}`
      };
    }
    case 'fever_charge': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.3));
      const nextPower = Math.round(skill.power * (1 + lv * 0.3));
      return {
        description: `敵に極大攻撃を与え、フィーバーゲージを即座に100%（MAX）チャージする！`,
        power: currentPower,
        countInfo: `技威力: ${currentPower} / フィーバーMAX即時進入`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 威力 ${nextPower}`
      };
    }
    case 'puni_unify': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.3));
      const nextPower = Math.round(skill.power * (1 + lv * 0.3));
      return {
        description: `盤面にある全ぷにを「自分自身のぷに」に瞬時に統一変換し、一気に巨大繋ぎ可能にする！`,
        power: currentPower,
        countInfo: `全ぷに自分変化 / 技威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 威力 ${nextPower}`
      };
    }
    case 'team_gauge_fill': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.3));
      const nextPower = Math.round(skill.power * (1 + lv * 0.3));
      return {
        description: `敵に超ダメージを与えつつ、チーム全員の技ゲージを＋50%分チャージする！`,
        power: currentPower,
        countInfo: `全員技ゲージ+50% / 技威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 威力 ${nextPower}`
      };
    }
    case 'god_burst': {
      const currentPower = Math.round(skill.power * (1 + (lv - 1) * 0.3));
      const healAmount = Math.round(50000 * (1 + (lv - 1) * 0.3));
      const nextPower = Math.round(skill.power * (1 + lv * 0.3));
      return {
        description: `【創世神奥義】画面内全消去＋HP極大回復＋即時フィーバーMAXを同時に発動する絶対必殺技！`,
        power: currentPower,
        countInfo: `全消去＋HP${healAmount}回復＋フィーバー満タン / 威力: ${currentPower}`,
        nextUpgrade: isMax ? '技レベルMAX！' : `次Lv: 威力 ${nextPower}`
      };
    }
  }
};

export const generateCharacters = (): Character[] => {
  const chars: Character[] = [];

  const rankImageMap: Record<Rank, string> = {
    'E': createRankBadgeSvgDataUrl('E'),
    'D': createRankBadgeSvgDataUrl('D'),
    'C': createRankBadgeSvgDataUrl('C'),
    'B': createRankBadgeSvgDataUrl('B'),
    'A': createRankBadgeSvgDataUrl('A'),
    'S': createRankBadgeSvgDataUrl('S'),
    'SS': createRankBadgeSvgDataUrl('SS'),
    'SSS': createRankBadgeSvgDataUrl('SSS'),
    'Z': createRankBadgeSvgDataUrl('Z'),
  };

  const createSet = (rank: Rank, baseHp: number, baseAtk: number, color: string, list: CharacterDef[]) => {
    list.forEach((a, i) => {
      let tribe: Tribe = a.tribe || 'イサマシ';
      if (!a.tribe) {
        if (/エンマ|ハデス/i.test(a.name)) {
          tribe = 'エンマ';
        } else if (/龍神|リュウタ|ドラゴン|ヘビ|マグロ/i.test(a.name)) {
          tribe = 'ニョロロン';
        } else if (/武士|侍|武道|刀|ライオン|獅子|勝負|拳|剣/i.test(a.name)) {
          tribe = 'イサマシ';
        } else if (/バクロ|予言|知恵|魔法|めぐみん|五月|帽子|頭巾/i.test(a.name)) {
          tribe = 'フシギ';
        } else if (/カブト|ベンケイ|クワガ|鎧|アーサー|モチ|鬼/i.test(a.name)) {
          tribe = 'ゴーケツ';
        } else if (/ニャン|ネコ|ぼたん|桃|愛|花/i.test(a.name)) {
          tribe = 'プリチー';
        } else if (/回復|聖|光|ポカ|隊長|おにぎり/i.test(a.name)) {
          tribe = 'ポカポカ';
        } else if (/影|黒|ダーク|仮面|枕|泥/i.test(a.name)) {
          tribe = 'ウスラカゲ';
        } else if (/死|怪獣|悪魔|呪い/i.test(a.name)) {
          tribe = 'ブキミー';
        } else {
          const defaultTribes: Tribe[] = ['イサマシ', 'フシギ', 'ゴーケツ', 'プリチー', 'ポカポカ', 'ウスラカゲ', 'ブキミー', 'ニョロロン'];
          tribe = defaultTribes[i % defaultTribes.length];
        }
      }

      const char: Character = {
        id: `char_${rank.toLowerCase()}_${i + 1}`,
        name: a.name,
        rank,
        tribe,
        color,
        emoji: a.emoji,
        rankImage: rankImageMap[rank],
        imageUrl: createPuniSvgDataUrl(a.name, color, rank, a.emoji),
        baseHp: baseHp + i * 8,
        baseAtk: baseAtk + i * 3,
      };

      if (a.skillName && a.skillType) {
        char.skill = {
          name: a.skillName,
          type: a.skillType,
          power: a.skillPower || (
            rank === 'SS' ? (a.skillType === 'heal' ? 3000 : 50) :
            rank === 'S'  ? (a.skillType === 'heal' ? 1500 : 30) :
            (a.skillType === 'heal' ? 400 : 12)
          )
        };
      } else if (rank === 'S' || rank === 'SS') {
        const isSS = rank === 'SS';
        const defaultTypes: SkillType[] = ['center_pop', 'random_pop', 'inflate_puni', 'heal', 'all_pop'];
        const chosenType = defaultTypes[i % defaultTypes.length];
        char.skill = {
          name: isSS ? (i % 2 === 0 ? '覇王絶空斬' : '神聖なる光') : (i % 2 === 0 ? '爆裂連撃' : '癒やしの陣'),
          type: chosenType,
          power: isSS ? (chosenType === 'heal' ? 2500 : 45) : (chosenType === 'heal' ? 1000 : 25),
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

      // イベント特効キャラ（Zランク全キャラ ＆ SSSランク全キャラ ＆ SSランクの特定のキャラ）
      if (rank === 'Z') {
        char.eventBoost = true;
        char.eventBoostDesc = '【Z極限超特効】イベントステージで攻撃力が30倍爆増！';
      } else if (rank === 'SSS') {
        char.eventBoost = true;
        char.eventBoostDesc = '【SSS超特効】イベントステージで攻撃力が10倍爆増！';
      } else if (rank === 'SS' && i % 3 === 0) {
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
    { name: '寸胴丸', emoji: '🍜', trait: 'ラーメン of 寸胴から生まれた妖怪。' },
    { name: 'ホンマグロ大将', emoji: '🐟', trait: '活きのいいマグロの寿司職人。' },
    { name: 'ザンバラ刀', emoji: '⚔️', trait: 'ザンバラ髪のワイルドな刀妖怪。' },
  ];
  createSet('C', 200, 25, '#aa5555', cList);

  // Bランク妖怪
  const bList: CharacterDef[] = [
    { name: 'さきがけの助', emoji: '🚩', trait: '一番槍を狙う一番手。', skillName: '突撃一番槍', skillType: 'random_pop' },
    { name: 'グラグライオン', emoji: '🌋', trait: '大地をグラグラ揺らすライオン。', skillName: 'グラグララッシュ', skillType: 'center_pop' },
    { name: 'クワノ武士', emoji: '🪲', trait: '立派なハサミで切断するクワガタ。', skillName: 'ハサミ一閃', skillType: 'random_pop' },
    { name: 'フユニャン', emoji: '🐱', trait: '根性あふれるダークブルーのガッツネコ！', skillName: 'ど根性ストレート', skillType: 'inflate_puni' },
    { name: '妖怪ガッツK', emoji: '⚾', trait: 'ガッツ溢れる伝説 of ベースボール妖怪。', skillName: 'ガッツフルスイング', skillType: 'center_pop' },
    { name: 'フユニャン曹操', emoji: '👑', trait: '三国志 of 英雄・曹操となったフユニャン。', skillName: '覇王肉きゅう', skillType: 'random_pop' },
    { name: 'さきがけの助金旋', emoji: '✨', trait: '金箔を施された特別なさきがけの助。', skillName: '黄金突撃', skillType: 'center_pop' },
    { name: 'いばる〜ん', emoji: '😤', trait: '威張ってばかりいる気取った妖怪。', skillName: 'いばり威嚇', skillType: 'heal' },
    { name: '早乙女乱馬', emoji: '🥋', trait: '無差別格闘早乙女流の継承者！', skillName: '飛龍昇天破', skillType: 'all_pop' },
    { name: '犬夜叉', emoji: '🐕', trait: '鉄砕牙を操る半妖の少年！', skillName: '風の傷', skillType: 'random_pop' },
  ];
  createSet('B', 300, 40, '#ff88aa', bList);

  // Aランク妖怪
  const aList: CharacterDef[] = [
    { name: '轟獅子', emoji: '🦁', trait: '轟く咆哮で味方の士気を最大に高める！', skillName: '轟く咆哮', skillType: 'inflate_puni' },
    { name: 'くしゃ武者', emoji: '😡', trait: 'くしゃくしゃに怒り狂う暴れ武者。', skillName: '怒髪天斬り', skillType: 'center_pop' },
    { name: '万尾獅子', emoji: '🦁', trait: '「満を持して…今だ！」圧倒的一撃。', skillName: '満を持して連撃', skillType: 'random_pop' },
    { name: 'モモタロニャン', emoji: '🍑', trait: '鬼退治の英雄となった桃ネコ妖怪。', skillName: 'きびだんごアタック', skillType: 'inflate_puni' },
    { name: 'マスクドニャーン', emoji: '🎭', trait: '覆面を被った謎のプロレスニャン。', skillName: '必殺フライングプレス', skillType: 'center_pop' },
    { name: 'ニャン騎士', emoji: '🛡️', trait: '騎士道精神に溢れる高貴なネコ騎士。', skillName: 'ホーリーセイバー', skillType: 'random_pop' },
    { name: '総ナメ', emoji: '👅', trait: 'あらゆる栄冠を総ナメにする豪運妖怪。', skillName: '栄光の舌舐め', skillType: 'heal' },
    { name: '天下無僧', emoji: '⛩️', trait: '天下に敵なしと謳われる修行僧。', skillName: '天下無双掌', skillType: 'center_pop' },
    { name: 'まさむね', emoji: '⚔️', trait: '名刀政宗を宿した天下一の剣士。', skillName: '名刀一刀両断', skillType: 'random_pop' },
    { name: 'むらまさ', emoji: '🗡️', trait: '妖刀村正に魅せられた妖しき剣豪。', skillName: '妖刀連撃', skillType: 'random_pop' },
  ];
  createSet('A', 450, 60, '#ffaa00', aList);

  // Sランク妖怪
  const sList: CharacterDef[] = [
    { name: '花垣武道', emoji: '👊', trait: '何度倒れても立ち上がるリベンジャー！', skillName: '譲れない思い', skillType: 'inflate_puni', skillPower: 35 },
    { name: 'ミカサ', emoji: '⚔️', trait: '人類最強 of 戦闘能力を誇る調査兵団。', skillName: 'ブレード乱舞', skillType: 'random_pop', skillPower: 38 },
    { name: 'ゴモラ', emoji: '🦖', trait: '超振動波で岩盤をも砕く古代怪獣！', skillName: '超振動波', skillType: 'center_pop', skillPower: 34 },
    { name: 'ウルトラマン', emoji: '光', trait: 'M78星雲からきた光 of 巨人！', skillName: 'スペシウム光線', skillType: 'center_pop', skillPower: 40 },
    { name: '獅白ぼたん', emoji: '♌', trait: 'ホロライブ所属のFPSゲーマー獅子！', skillName: 'エイム爆撃', skillType: 'random_pop', skillPower: 36 },
    { name: '赤ぷよ', emoji: '🔴', trait: '4つ揃うと弾けて大連鎖を起こす！', skillName: 'ばよえ〜ん連鎖', skillType: 'all_pop', skillPower: 32 },
    { name: 'アーサー', emoji: '👑', trait: '聖剣エクスカリバーを掲げる騎士王。', skillName: 'エクスカリバー', skillType: 'center_pop', skillPower: 38 },
    { name: 'クワガ大将', emoji: '🪲', trait: 'クワガタ族の頂点に立つ将軍。', skillName: '大将の挟撃', skillType: 'random_pop', skillPower: 30 },
    { name: 'オオクワノ神', emoji: '✨', trait: '神の加護を受けたクワガタの神霊。', skillName: '神域の鋏', skillType: 'heal', skillPower: 2000 },
    { name: 'なまはげ', emoji: '👹', trait: '「悪い子はいねーかー！」包丁を乱舞！', skillName: '悪い子乱舞', skillType: 'random_pop', skillPower: 38 },
  ];
  createSet('S', 700, 100, '#ff2222', sList);

  // SSランク妖怪
  const ssList: CharacterDef[] = [
    { name: 'パウロ', emoji: '🗡️', trait: '無職転生の伝承剣士。二刀流で敵を圧倒！', skillName: '二閃流斬撃', skillType: 'random_pop', skillPower: 60 },
    { name: 'ベニマル', emoji: '🔥', trait: '鬼種族の若き大将。黒炎で敵を焼き尽くす！', skillName: '黒炎獄', skillType: 'center_pop', skillPower: 62 },
    { name: '里羽リュウタ', emoji: '🐉', trait: '龍の血を継ぐ龍羽の戦士！', skillName: '龍神極光斬', skillType: 'inflate_puni', skillPower: 65 },
    { name: '阿弥陀丸', emoji: '⚔️', trait: 'シャーマンキングの持霊！名刀春雨の一撃！', skillName: '真空仏陀切り', skillType: 'random_pop', skillPower: 64 },
    { name: '覚醒早乙女乱馬', emoji: '🥋', trait: '究極の格闘センスが開花した乱馬！', skillName: '猛虎高飛車', skillType: 'inflate_puni', skillPower: 68 },
    { name: 'フェルト', emoji: '風', trait: '風のように素早い風足の王位候補。', skillName: '風の疾走', skillType: 'random_pop', skillPower: 58 },
    { name: 'めぐみん', emoji: '💥', trait: '爆裂魔法を愛し、爆裂魔法に生きる紅魔族！', skillName: 'エクスプロージョン！', skillType: 'all_pop', skillPower: 80 },
    { name: '五月', emoji: '⭐', trait: '五等分の花嫁！真面目で一途なパワー！', skillName: '星 of 祝福', skillType: 'heal', skillPower: 4500 },
    { name: 'メリオダス', emoji: '😈', trait: '＜七つの大罪＞団長！魔神の力を全解放！', skillName: '全反撃（フルカウンター）', skillType: 'all_pop', skillPower: 75 },
    { name: 'ブシ王', emoji: '👑', trait: 'レジェンド武士の王者！全妖怪を平定する！', skillName: '天下布武・千人斬り', skillType: 'center_pop', skillPower: 70 },
  ];
  createSet('SS', 1200, 250, '#ff22ff', ssList);

  // SSSランク妖怪（超高級ガシャ限定・新神降臨！絶対王者）
  const sssList: CharacterDef[] = [
    { name: '創世神・サマーエンマ王', emoji: '☀️👑🔥', trait: '常夏ビーチの神創神。全画面消滅＆100億オーバーの天災超ダメージ！', skillName: '創世神創・極熱天翔', skillType: 'all_pop', skillPower: 2500 },
    { name: 'アルティメット龍神エンマ', emoji: '🐉👑✨', trait: '龍神の血と神王の力を極限解放した絶対王者！一撃で敵を即死追放！', skillName: '極龍神王・創世覇斬', skillType: 'center_pop', skillPower: 2300 },
    { name: '極・覚醒サマーエンマ', emoji: '☀️👑⚡', trait: '10億の敵をも一瞬で打ち砕く神の領域。超デカぷにを画面満たし一気に連爆！', skillName: '超神炎・創世大爆発', skillType: 'inflate_puni', skillPower: 2200 },
    { name: '冥王神・終焉ハデス', emoji: '💀👑🔥', trait: '冥界と太陽を統べる絶対神。無差別の神雷で敵全滅＆HP10万極大回復！', skillName: '冥王神・終焉爆破', skillType: 'random_pop', skillPower: 2400 },
    { name: '極限支配・魔王リムル', emoji: '👿🔥🔵', trait: '魔王へと進化したリムル。神之怒（メギド）で敵の魂を根こそぎ喰らう。', skillName: '暴食之王（ベルゼビュート）', skillType: 'inflate_puni', skillPower: 2480 },
    { name: '無限虚空・五条悟', emoji: '👁️⚡👓', trait: '領域展開「無量空処」を発動。無限の情報を脳内に流し込み敵を行動不能にする！', skillName: '術式反転「赫」・虚式「茈」', skillType: 'all_pop', skillPower: 2600 },
    { name: '太陽神・天照大御神', emoji: '☀️🌸👑', trait: '高天原を統べる太陽の女神。八咫鏡の聖光で盤面を全消去し味方を最大回復！', skillName: '八咫鏡・日輪創生輝', skillType: 'all_pop', skillPower: 2550 },
    { name: '絶対覇王・ルフィＧ５', emoji: '🍖⚡👑', trait: 'ギア5の覚醒に達した自由の戦士。ゴムゴムの巨人で盤面全体を縦横無尽に跳ね回る！', skillName: 'ゴムゴムの雷・白き戦士', skillType: 'center_pop', skillPower: 2450 },
    { name: '氷雪女王・エルサ', emoji: '❄️👑🏰', trait: '氷の魔法を極めた美しき女王。盤面のぷにを瞬時に凍りつかせて一斉爆破！', skillName: 'レット・イット・ゴー極氷破', skillType: 'random_pop', skillPower: 2380 },
    { name: 'ウルトラゼロマント', emoji: '🌌👑🛡️', trait: '宇宙警備隊の若き最強戦士。無限の光エネルギーをチャージし、必殺光線で敵を両断！', skillName: 'ワイドゼロショット・極', skillType: 'center_pop', skillPower: 2420 },
  ];
  createSet('SSS', 25000, 8500, '#ffd700', sssList);

  // Zランク妖怪（超ウルトラガシャ限定・終次元の超越支配者。SSSの10倍のステータス＆異次元極限パワー）
  const zList: CharacterDef[] = [
    // --- プリチー族 (5体) ---
    { name: '神威覇道・覚醒ジバニャンＺ', tribe: 'プリチー', emoji: '🐱🔥🐾', trait: '【性能SSSの10倍！】限界を超えし覚醒 of プリチー王者！盤面全ぷにを自分に超スピード変化させる！', skillName: '極・ひゃくれつ肉球変化斬', skillType: 'puni_unify', skillPower: 24000 },
    { name: '極覚醒・身勝手の悟空', tribe: 'プリチー', emoji: '🔥🥋👟', trait: '【性能SSSの10倍！】神の領域「身勝手の極意」を極めたサイヤ人！全消去＋HP回復＋フィーバーMAXの創世神技！', skillName: '身勝手の極意・創世爆裂破', skillType: 'god_burst', skillPower: 26000 },
    { name: '桃源超神・コマさんＺ', tribe: 'プリチー', emoji: '🐶🔥🌸', trait: '【性能SSSの10倍！】もんげー！桃源郷の神霊が宿った究極コマさん！聖なる青い霊火で即座にフィーバー突入！', skillName: '超・もんげー桃源フィーバー', skillType: 'fever_charge', skillPower: 24500 },
    { name: '夢幻可憐・プリンセスコマミＺ', tribe: 'プリチー', emoji: '👑🌸🎀', trait: '【性能SSSの10倍！】可憐な王冠を冠した夢幻の姫君コマミ。愛と癒やしの輝きでチームのHPを特大回復！', skillName: '夢幻・愛されプリンセスヒーリング', skillType: 'heal', skillPower: 85000 },
    { name: '天星無双・ぷに神フウキ', tribe: 'プリチー', emoji: '🌟🐱💖', trait: '【性能SSSの10倍！】星々の輝きを束ねしぷに神！愛くるしい笑顔から放たれる無限のぷに巨大化魔法！', skillName: '天星ぷに神・無限連鎖でかぷに', skillType: 'inflate_puni', skillPower: 23500 },

    // --- エンマ族 (5体) ---
    { name: '超終次元・極エンマ神', tribe: 'エンマ', emoji: '🌀👑🌌⚡', trait: '【性能SSSの10倍！】全次元の因果を統べる超越神。異次元の攻撃力と全消去必殺技で宇宙を無に帰す！', skillName: '終次元超越・極極大消滅', skillType: 'all_pop', skillPower: 25000 },
    { name: '極滅神・暗黒ハデス', tribe: 'エンマ', emoji: '💀🔥😈', trait: '【性能SSSの10倍！】暗黒の深淵から蘇りし冥府の絶対破壊神。味方全員の技ゲージを＋50%強奪チャージ！', skillName: '冥府終焉・暗黒技ゲージ強奪', skillType: 'team_gauge_fill', skillPower: 25200 },
    { name: '輪廻転生・業炎輪廻', tribe: 'エンマ', emoji: '🔥👑☯️', trait: '【性能SSSの10倍！】六道を司る業炎の輪廻神！地獄の業火を解き放ち、敵を灼熱フィーバーへと叩き落とす！', skillName: '六道業炎・輪廻地獄フィーバー', skillType: 'fever_charge', skillPower: 25800 },
    { name: '覇王神・カイラ大王', tribe: 'エンマ', emoji: '👑❄️🐉', trait: '【性能SSSの10倍！】妖魔界を背負う覇王カイラ。絶対零度の氷龍を召喚しパズル中央を一網打尽！', skillName: '覇王氷龍・絶対零度一閃', skillType: 'center_pop', skillPower: 24800 },
    { name: '創世邪神・蛇王カイラ覚醒', tribe: 'エンマ', emoji: '🐍👑⚡', trait: '【性能SSSの10倍！】邪龍の力を極限覚醒させた黒き大王。全消去＋HP回復＋フィーバーを同時に創世発動！', skillName: '創世邪龍・極大雷霆破滅創生', skillType: 'god_burst', skillPower: 26500 },

    // --- ウスラカゲ族 (5体) ---
    { name: '深淵虚空・黒色星夜神', tribe: 'ウスラカゲ', emoji: '🌌⭐🖤', trait: '【性能SSSの10倍！】ブラックホールを宿した深淵の神。盤面全体のぷにをブラックホール化して自分色に変換！', skillName: '虚無終焉・特異点ブラックホール変化', skillType: 'puni_unify', skillPower: 26500 },
    { name: '絶対守護・黄金金剛武神', tribe: 'ウスラカゲ', emoji: '🤖🛡️💎', trait: '【性能SSSの10倍！】黄金に輝く巨大なゴーケツ武神。鉄壁の装甲と聖なる癒やしで不沈の盾となる！', skillName: '金剛輝神・万物不沈守護', skillType: 'heal', skillPower: 80000 },
    { name: '虚無終焉・カイチ闇夜神', tribe: 'ウスラカゲ', emoji: '🌙💀🔮', trait: '【性能SSSの10倍！】暗闇の深淵を統べる黒き虚無神。紫の月光で敵にダメージ＋全味方の技ゲージを即チャージ！', skillName: '虚無月影・全技チャージ闇爆発', skillType: 'team_gauge_fill', skillPower: 25100 },
    { name: '幻影天魔・覚醒ブシニャン闇', tribe: 'ウスラカゲ', emoji: '🌙⚔️🖤', trait: '【性能SSSの10倍！】影の剣術を極めし黒の侍。漆黒の新月三日月刀でランダムに敵を一瞬で一刀両断！', skillName: '影流・新月漆黒千人斬り', skillType: 'random_pop', skillPower: 25500 },
    { name: '暗黒蛇帝・オロチ影極', tribe: 'ウスラカゲ', emoji: '🌙🐍💜', trait: '【性能SSSの10倍！】影の龍を従える伝説の暗黒忍び。無数の影龍で盤面のぷにを巨大でかぷにへ変貌させる！', skillName: '極・影龍幻影でかぷに乱舞', skillType: 'inflate_puni', skillPower: 24200 },

    // --- その他Zランク神話級キャラ ---
    { name: '覇邪の邪龍神・大蛇', tribe: 'ニョロロン', emoji: '🐍👑💥🌀', trait: '【性能SSSの10倍！】次元の狭間から顕現した大蛇の究極神化。敵を一撃で蹂躙する神速でかぷに成長技！', skillName: '八岐終焉・極・邪龍豪裂波', skillType: 'inflate_puni', skillPower: 22000 },
    { name: '終焉創世神・アルセウス', tribe: 'フシギ', emoji: '🐎💫💎', trait: '【性能SSSの10倍！】全宇宙を創造したとされる始まりの神。全ての属性を無効化する絶対神！', skillName: 'さばきのつぶて', skillType: 'all_pop', skillPower: 25500 },
    { name: '終滅蛇神・八岐大蛇', tribe: 'ニョロロン', emoji: '🐉💀🔥', trait: '【性能SSSの10倍！】八つの頭と尾を持つ伝説の大蛇。その巨大な牙で盤面を薙ぎ払う！', skillName: '八頭終焉・天叢雲剣斬', skillType: 'center_pop', skillPower: 24500 },
    { name: '覇邪破滅・大豪傑阿修羅', tribe: 'ゴーケツ', emoji: '👹🔥🛡️', trait: '【性能SSSの10倍！】六臂の腕を持つ伝説の破壊神。怒りの業火であらゆる障害を焼き滅ぼす！', skillName: '阿修羅六道・極大紅蓮烈火', skillType: 'random_pop', skillPower: 24800 },
  ];
  createSet('Z', 250000, 85000, '#00ffff', zList);

  return chars;
};

export const CHARACTERS = generateCharacters();
