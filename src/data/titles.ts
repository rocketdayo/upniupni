export interface TitleInfo {
  id: string;
  name: string;
  description: string;
  rarity: 'Normal' | 'Rare' | 'SR' | 'SSR' | 'UR';
  color: string;
}

export const ALL_TITLES: TitleInfo[] = [
  { id: 'title_beginner', name: '新米妖怪レーサー', description: 'ぷにぷにの世界に足を踏み入れた証', rarity: 'Normal', color: '#9ca3af' },
  { id: 'title_puni_master', name: 'ぷにぷにマスター', description: 'でかぷにを大量に繋ぎ消したつわもの', rarity: 'Rare', color: '#60a5fa' },
  { id: 'title_limit_breaker', name: '限界を超えし者', description: '超限界突破の書を使用した証', rarity: 'SR', color: '#a855f7' },
  { id: 'title_enma_guard', name: 'エンマ親衛隊', description: 'エンマ大王に忠誠を誓いし者', rarity: 'SR', color: '#f59e0b' },
  { id: 'title_y_rich', name: 'Yポイント大富豪', description: '膨大なYポイントを保有する大富豪', rarity: 'SSR', color: '#ec4899' },
  { id: 'title_score_champion', name: 'スコアタ王者', description: 'スコアアタックで高スコアを叩き出した証', rarity: 'UR', color: '#38bdf8' },
  { id: 'title_god_slayer', name: '神覇者', description: 'スコアタ1位・頂点に君臨せし伝説のぷに使い', rarity: 'UR', color: '#facc15' },
];
