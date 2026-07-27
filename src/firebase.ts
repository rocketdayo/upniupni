// Mocking Firebase with localStorage for AI Studio preview

export interface CharacterSaveData {
  level: number;
  skillLevel?: number;    // わざレベル 1-5
  limitBreak?: number;    // 限界突破段階 0-5
  duplicates?: number;    // 同キャラ取得回数（限界突破用）
}

export interface PlayerData {
  money: number;
  yPoints: number;
  characters: Record<string, CharacterSaveData>;
  team: string[];
  maxClearedStageId: string;
  clearedStages: string[];
  items: {
    expSmall: number;   // 小けいけんちだま (+1 level)
    expLarge: number;   // 大けいけんちだま (+5 levels)
    skillBook: number;  // ひっさつの秘伝書 (+1 わざレベル)
  };
  missionProgress: Record<string, number>;  // missionId -> progress count
  completedMissions: string[];              // claimed mission IDs
  pityCount?: number;
  stepUpCount?: number;
  gachaHistory?: { timestamp: number; charId: string }[];
}

const DEFAULT_DATA: PlayerData = {
  money: 0,
  yPoints: 50,
  characters: {
    'char_e_1': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_2': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_3': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_4': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_5': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
  },
  team: ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'],
  maxClearedStageId: '',
  clearedStages: [],
  items: { expSmall: 3, expLarge: 1, skillBook: 0 },
  missionProgress: {},
  completedMissions: [],
  pityCount: 100,
  stepUpCount: 0,
  gachaHistory: [],
};

export const loginAndGetData = async (onDataLoaded: (data: PlayerData, uid: string) => void) => {
  const uid = "local_user";
  const data = await fetchPlayerData(uid);
  onDataLoaded(data, uid);
};

export const fetchPlayerData = async (uid: string): Promise<PlayerData> => {
  try {
    const stored = localStorage.getItem('punipuni_save');
    if (stored) {
      return JSON.parse(stored) as PlayerData;
    }
  } catch (error) {
    console.error("Error fetching player data, using default", error);
  }
  return DEFAULT_DATA;
};

export const savePlayerData = async (uid: string, data: Partial<PlayerData>) => {
  try {
    const current = await fetchPlayerData(uid);
    const updated = { ...current, ...data };
    localStorage.setItem('punipuni_save', JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving player data", error);
  }
};

