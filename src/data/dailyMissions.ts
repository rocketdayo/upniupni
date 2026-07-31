export type DailyMissionType =
  | 'complete_stage'
  | 'complete_event_stage'
  | 'kill_enemy'
  | 'score_attack_play'
  | 'score_attack_score'
  | 'gacha_pull'
  | 'level_up'
  | 'skill_up'
  | 'item_use'
  | 'fever_enter'
  | 'big_puni'
  | 'use_skill';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: DailyMissionType;
  goal: number;
  rewardYPoints?: number;
  rewardMoney?: number;
  rewardItems?: { expSmall?: number; expLarge?: number; skillBook?: number };
}

// ── Group 1: ステージクリア系 ──
const GROUP_1_CLEAR: DailyMission[] = [
  {
    id: 'daily_clear_1',
    title: '【デイリー】ステージクリア！',
    description: 'いずれかの通常・イベントステージを1回クリアしよう',
    type: 'complete_stage',
    goal: 1,
    rewardYPoints: 30,
    rewardMoney: 150,
  },
  {
    id: 'daily_clear_3',
    title: '【デイリー】連続バトル勝利！',
    description: 'いずれかのステージを3回クリアしよう',
    type: 'complete_stage',
    goal: 3,
    rewardYPoints: 50,
    rewardMoney: 300,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_clear_5',
    title: '【デイリー】ステージ周回マスター！',
    description: 'いずれかのステージを5回クリアしよう',
    type: 'complete_stage',
    goal: 5,
    rewardYPoints: 80,
    rewardMoney: 500,
    rewardItems: { expLarge: 1 },
  },
  {
    id: 'daily_event_1',
    title: '【デイリー】イベント特設挑戦！',
    description: 'イベントステージを1回クリアしよう',
    type: 'complete_event_stage',
    goal: 1,
    rewardYPoints: 40,
    rewardMoney: 200,
  },
  {
    id: 'daily_event_2',
    title: '【デイリー】イベント攻略エキスパート！',
    description: 'イベントステージを2回クリアしよう',
    type: 'complete_event_stage',
    goal: 2,
    rewardYPoints: 70,
    rewardMoney: 400,
    rewardItems: { expSmall: 1 },
  },
];

// ── Group 2: 敵討伐系 ──
const GROUP_2_KILL: DailyMission[] = [
  {
    id: 'daily_kill_1',
    title: '【デイリー】ファーストキル！',
    description: 'バトルで敵を1体倒そう',
    type: 'kill_enemy',
    goal: 1,
    rewardYPoints: 20,
    rewardMoney: 100,
  },
  {
    id: 'daily_kill_3',
    title: '【デイリー】敵を3体討伐！',
    description: 'バトルで敵を合計3体倒そう',
    type: 'kill_enemy',
    goal: 3,
    rewardYPoints: 40,
    rewardMoney: 200,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_kill_5',
    title: '【デイリー】妖怪ハンター！',
    description: 'バトルで敵を合計5体倒そう',
    type: 'kill_enemy',
    goal: 5,
    rewardYPoints: 60,
    rewardMoney: 350,
    rewardItems: { expSmall: 2 },
  },
  {
    id: 'daily_kill_10',
    title: '【デイリー】大討伐作戦！',
    description: 'バトルで敵を合計10体倒そう',
    type: 'kill_enemy',
    goal: 10,
    rewardYPoints: 100,
    rewardMoney: 600,
    rewardItems: { expLarge: 1 },
  },
];

// ── Group 3: スコアアタック系 ──
const GROUP_3_SCORE: DailyMission[] = [
  {
    id: 'daily_score_play_1',
    title: '【デイリー】スコアタに挑め！',
    description: 'スコアアタックを1回プレイしよう',
    type: 'score_attack_play',
    goal: 1,
    rewardYPoints: 40,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_score_play_2',
    title: '【デイリー】スコアタ熱攻！',
    description: 'スコアアタックを2回プレイしよう',
    type: 'score_attack_play',
    goal: 2,
    rewardYPoints: 70,
    rewardMoney: 200,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_score_10k',
    title: '【デイリー】スコア10万突破！',
    description: 'スコアアタックで10万点以上を獲得しよう',
    type: 'score_attack_score',
    goal: 100000,
    rewardYPoints: 50,
    rewardMoney: 200,
  },
  {
    id: 'daily_score_50k',
    title: '【デイリー】スコア50万突破！',
    description: 'スコアアタックで50万点以上を獲得しよう',
    type: 'score_attack_score',
    goal: 500000,
    rewardYPoints: 80,
    rewardMoney: 400,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_score_100k',
    title: '【デイリー】スコア100万ハイスコア！',
    description: 'スコアアタックで100万点以上を獲得しよう',
    type: 'score_attack_score',
    goal: 1000000,
    rewardYPoints: 120,
    rewardMoney: 600,
    rewardItems: { expLarge: 1 },
  },
];

// ── Group 4: フィーバー・バトルテクニック系 ──
const GROUP_4_BATTLE: DailyMission[] = [
  {
    id: 'daily_fever_1',
    title: '【デイリー】フィーバー突入！',
    description: 'バトルでフィーバータイムに1回突入しよう',
    type: 'fever_enter',
    goal: 1,
    rewardYPoints: 30,
    rewardMoney: 150,
  },
  {
    id: 'daily_fever_3',
    title: '【デイリー】フィーバー連発！',
    description: 'バトルでフィーバータイムに合計3回突入しよう',
    type: 'fever_enter',
    goal: 3,
    rewardYPoints: 60,
    rewardMoney: 300,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_big_puni_1',
    title: '【デイリー】でかぷに作成！',
    description: 'サイズ10以上のデカぷにを1個つくろう',
    type: 'big_puni',
    goal: 1,
    rewardYPoints: 40,
    rewardMoney: 200,
  },
  {
    id: 'daily_big_puni_3',
    title: '【デイリー】超デカぷにマスター！',
    description: 'サイズ10以上のデカぷにを合計3個つくろう',
    type: 'big_puni',
    goal: 3,
    rewardYPoints: 70,
    rewardMoney: 400,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_use_skill_1',
    title: '【デイリー】ひっさつわざ発動！',
    description: 'バトルでひっさつわざを1回発動しよう',
    type: 'use_skill',
    goal: 1,
    rewardYPoints: 30,
    rewardMoney: 150,
  },
  {
    id: 'daily_use_skill_3',
    title: '【デイリー】ひっさつわざ乱舞！',
    description: 'バトルでひっさつわざを合計3回発動しよう',
    type: 'use_skill',
    goal: 3,
    rewardYPoints: 50,
    rewardMoney: 300,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_use_skill_5',
    title: '【デイリー】必殺技ラッシュ！',
    description: 'バトルでひっさつわざを合計5回発動しよう',
    type: 'use_skill',
    goal: 5,
    rewardYPoints: 80,
    rewardMoney: 500,
    rewardItems: { expLarge: 1 },
  },
];

// ── Group 5: ガシャ・育成・アイテム系 ──
const GROUP_5_TRAIN: DailyMission[] = [
  {
    id: 'daily_gacha_1',
    title: '【デイリー】運試しガシャ！',
    description: '妖怪ガシャを1回引こう',
    type: 'gacha_pull',
    goal: 1,
    rewardYPoints: 30,
    rewardMoney: 100,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_gacha_3',
    title: '【デイリー】ガシャぶん回し！',
    description: '妖怪ガシャを合計3回引こう',
    type: 'gacha_pull',
    goal: 3,
    rewardYPoints: 80,
    rewardMoney: 300,
    rewardItems: { expSmall: 2 },
  },
  {
    id: 'daily_level_1',
    title: '【デイリー】ぷにの育成！',
    description: 'ぷにのレベルを1回上げよう',
    type: 'level_up',
    goal: 1,
    rewardYPoints: 20,
    rewardMoney: 100,
  },
  {
    id: 'daily_level_3',
    title: '【デイリー】すくすくレベルアップ！',
    description: 'ぷにのレベルを合計3回上げよう',
    type: 'level_up',
    goal: 3,
    rewardYPoints: 50,
    rewardMoney: 250,
    rewardItems: { expSmall: 1 },
  },
  {
    id: 'daily_item_use_1',
    title: '【デイリー】経験値だま活用！',
    description: '経験値だまを1回使おう',
    type: 'item_use',
    goal: 1,
    rewardYPoints: 30,
    rewardMoney: 150,
  },
  {
    id: 'daily_skill_up_1',
    title: '【デイリー】ひっさつわざ強化！',
    description: 'ひっさつわざレベルを1回上げるか秘伝書を使おう',
    type: 'skill_up',
    goal: 1,
    rewardYPoints: 100,
    rewardMoney: 500,
    rewardItems: { expLarge: 1 },
  },
];

// 全デイリーミッションのマスタープール
export const DAILY_MISSIONS_POOL: DailyMission[] = [
  ...GROUP_1_CLEAR,
  ...GROUP_2_KILL,
  ...GROUP_3_SCORE,
  ...GROUP_4_BATTLE,
  ...GROUP_5_TRAIN,
];

/**
 * 日付インデックス（0:00 JST/UTC換算の日数）に応じて、
 * 5つのカテゴリから毎日異なる5つのミッションを確定的に選出します。
 */
export function getTodayDailyMissions(dayIndex?: number): DailyMission[] {
  const day = dayIndex !== undefined && dayIndex > 0
    ? dayIndex
    : Math.floor(Date.now() / (24 * 3600 * 1000));

  const m1 = GROUP_1_CLEAR[(day * 7 + 1) % GROUP_1_CLEAR.length];
  const m2 = GROUP_2_KILL[(day * 13 + 3) % GROUP_2_KILL.length];
  const m3 = GROUP_3_SCORE[(day * 19 + 5) % GROUP_3_SCORE.length];
  const m4 = GROUP_4_BATTLE[(day * 23 + 2) % GROUP_4_BATTLE.length];
  const m5 = GROUP_5_TRAIN[(day * 29 + 4) % GROUP_5_TRAIN.length];

  return [m1, m2, m3, m4, m5];
}

// 後方互換用のエクスポート（現在日のデイリーミッション一覧）
export const DAILY_MISSIONS: DailyMission[] = getTodayDailyMissions();

