/**
 * 数値を日本語の位取り（万、億、兆、京）でフォーマットする
 * 1万以上は小数第1位まで表示し、それ以下は省略して見やすくする
 */
export function formatJapaneseNumber(val: number): string {
  const v = Math.max(0, Math.floor(val));
  if (v === 0) return '0';
  
  if (v < 10000) {
    return v.toLocaleString();
  }

  const formatWithOneDecimal = (num: number, unit: string): string => {
    const truncated = Math.floor(num * 10) / 10;
    return `${truncated}${unit}`;
  };

  if (v >= 10000000000000000) { // 1京以上
    return formatWithOneDecimal(v / 10000000000000000, '京');
  }
  
  if (v >= 1000000000000) { // 1兆以上
    return formatWithOneDecimal(v / 1000000000000, '兆');
  }
  
  if (v >= 100000000) { // 1億以上
    return formatWithOneDecimal(v / 100000000, '億');
  }
  
  // 1万以上
  return formatWithOneDecimal(v / 10000, '万');
}
