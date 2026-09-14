/**
 * Score Attack Weekly Cycle Manager
 * 毎週日曜日の夜 23:59:00 にスコアアタックの記録が削除・リセットされる周期管理
 */

export interface TimeUntilReset {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
}

/**
 * 現在のスコアタ周期の締め切り（毎週日曜 23:59:00）の Date オブジェクトを取得
 */
export const getScoreAttackCycleDeadline = (now: Date = new Date()): Date => {
  const d = new Date(now);
  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilSunday = (7 - day) % 7;
  
  const deadline = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + daysUntilSunday,
    23,
    59,
    0,
    0
  );

  // もし今日が日曜日で、すでに 23:59:00 を過ぎている場合は翌週の日曜 23:59 が次の締め切り
  if (now.getTime() >= deadline.getTime()) {
    deadline.setDate(deadline.getDate() + 7);
  }

  return deadline;
};

/**
 * 現在のスコアタ周期のユニーク識別キーを取得 (例: "week_ending_20260913")
 */
export const getScoreAttackWeekKey = (now: Date = new Date()): string => {
  const deadline = getScoreAttackCycleDeadline(now);
  const y = deadline.getFullYear();
  const m = String(deadline.getMonth() + 1).padStart(2, '0');
  const d = String(deadline.getDate()).padStart(2, '0');
  return `week_ending_${y}${m}${d}`;
};

/**
 * 日曜 23:59 のリセットまでの残り時間を計算
 */
export const getTimeUntilSundayReset = (now: Date = new Date()): TimeUntilReset => {
  const deadline = getScoreAttackCycleDeadline(now);
  const diffMs = Math.max(0, deadline.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let formatted = '';
  if (days > 0) {
    formatted = `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
  } else if (hours > 0) {
    formatted = `${hours}時間 ${minutes}分 ${seconds}秒`;
  } else {
    formatted = `${minutes}分 ${seconds}秒`;
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    formatted
  };
};
