/**
 * 数値を日本語の位取り（万、億、兆、京）でフォーマットする
 */
export function formatJapaneseNumber(val: number): string {
  const v = Math.max(0, Math.floor(val));
  if (v === 0) return '0';
  
  if (v < 10000) {
    return v.toLocaleString();
  }
  
  if (v >= 10000000000000000) { // 1京以上
    const kyo = Math.floor(v / 10000000000000000);
    const choRem = Math.floor((v % 10000000000000000) / 1000000000000);
    return `${kyo}京${choRem > 0 ? choRem + '兆' : ''}`;
  }
  
  if (v >= 1000000000000) { // 1兆以上
    const cho = Math.floor(v / 1000000000000);
    const okuRem = Math.floor((v % 1000000000000) / 100000000);
    return `${cho}兆${okuRem > 0 ? okuRem + '億' : ''}`;
  }
  
  if (v >= 100000000) { // 1億以上
    const oku = Math.floor(v / 100000000);
    const manRem = Math.floor((v % 100000000) / 10000);
    return `${oku}億${manRem > 0 ? manRem + '万' : ''}`;
  }
  
  // 1万以上
  const man = Math.floor(v / 10000);
  const rem = Math.floor(v % 10000);
  return `${man}万${rem > 0 ? rem.toLocaleString() : ''}`;
}
