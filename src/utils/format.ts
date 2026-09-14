/**
 * 日本語の大きな数の位取り定数（万から無量大数まで）
 * 4桁（10^4）ごとに単位が繰り上がる日本の大数命名法に対応
 */
export interface JapaneseNumberUnit {
  exponent: number;
  unit: string;
  reading: string;
}

export const JAPANESE_NUMBER_UNITS: readonly JapaneseNumberUnit[] = [
  { exponent: 68, unit: '無量大数', reading: 'むりょうたいすう' },
  { exponent: 64, unit: '不可思議', reading: 'ふかしぎ' },
  { exponent: 60, unit: '那由他', reading: 'なゆた' },
  { exponent: 56, unit: '阿僧祇', reading: 'あそうぎ' },
  { exponent: 52, unit: '恒河沙', reading: 'ごうがしゃ' },
  { exponent: 48, unit: '極', reading: 'ごく' },
  { exponent: 44, unit: '載', reading: 'さい' },
  { exponent: 40, unit: '正', reading: 'せい' },
  { exponent: 36, unit: '澗', reading: 'かん' },
  { exponent: 32, unit: '溝', reading: 'こう' },
  { exponent: 28, unit: '穣', reading: 'じょう' },
  { exponent: 24, unit: '秭', reading: 'し' },
  { exponent: 20, unit: '垓', reading: 'がい' },
  { exponent: 16, unit: '京', reading: 'けい' },
  { exponent: 12, unit: '兆', reading: 'ちょう' },
  { exponent: 8, unit: '億', reading: 'おく' },
  { exponent: 4, unit: '万', reading: 'まん' },
] as const;

/**
 * 数値を日本語の位取り（万、億、兆、京、垓、秭、穣、溝、澗、正、載、極、恒河沙、阿僧祇、那由他、不可思議、無量大数）でフォーマットする
 * 1万以上は指定桁数の小数付きで読みやすく表示
 */
export function formatJapaneseNumber(val: number, maxDecimals: number = 1): string {
  const v = Math.max(0, val || 0);
  if (v === 0) return '0';
  if (v < 10000) {
    return Math.floor(v).toLocaleString();
  }

  for (const { exponent, unit } of JAPANESE_NUMBER_UNITS) {
    const threshold = Math.pow(10, exponent);
    if (v >= threshold * 0.999999) {
      const num = v / threshold;
      const factor = Math.pow(10, maxDecimals);
      const truncated = Math.floor(num * factor) / factor;
      // 小数点以下の末尾の不要な0を取り除く
      const formattedNum = truncated % 1 === 0 ? truncated.toString() : truncated.toFixed(maxDecimals).replace(/\.?0+$/, '');
      return `${formattedNum}${unit}`;
    }
  }

  return Math.floor(v).toLocaleString();
}

/**
 * スコアタ等の特大スコア用フォーマッター（pt表記対応）
 * 万〜無量大数まで全自動対応
 */
export function formatLargeScore(score: number, withPt: boolean = true): string {
  const v = Math.max(0, score || 0);
  if (v === 0) return withPt ? '0 pt' : '0';
  
  if (v < 10000) {
    return withPt ? `${v.toLocaleString()} pt` : v.toLocaleString();
  }

  // 1万以上の場合は適切な単位と小数点で表示
  const formatted = formatJapaneseNumber(v, 2);
  return withPt ? `${formatted} pt` : formatted;
}
