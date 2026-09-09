// Local Storage Game Save Manager (Obfuscated/Encrypted Storage)

export interface CharacterSaveData {
  level: number;
  skillLevel?: number;    // わざレベル 1-5
  limitBreak?: number;    // 限界突破段階 0-5
  duplicates?: number;    // 同キャラ取得回数（限界突破用）
}

export interface SavedTeam {
  id: string;
  name: string;
  team: string[];
}

export interface PlayerData {
  money: number;
  yPoints: number;
  summerMedals: number;
  bleachRings?: number; // ブリーチ特設通貨「ブリーチリング 💍」
  characters: Record<string, CharacterSaveData>;
  team: string[];
  savedTeams?: SavedTeam[];
  activeTeamIndex?: number;
  maxTeamSlots?: number;
  clearedStages: string[];
  maxClearedStageId?: string;
  items: {
    expSmall: number;   // 小けいけんちだま (+1 level)
    expLarge: number;   // 大けいけんちだま (+5 levels)
    skillBook: number;  // ひっさつの秘伝書 (+1 わざレベル)
    godSkillBook?: number; // 神ひっさつの秘伝書 (+2 わざレベルまたはMAX)
    superLimitBreakBook?: number; // 超限界突破の書 (+1 限界突破)
    godAscensionStone?: number; // 神昇の秘石 (Z' → ZZ 神昇進化アイテム)
  };
  selectedTitle?: string;
  unlockedTitles?: string[];
  notifiedUnlockedTitles?: string[];
  missionProgress: Record<string, number>;  // missionId -> progress count
  completedMissions: string[];              // claimed mission IDs
  pityCount?: number;
  stepUpCount?: number;
  minRequiredTeamSize?: number;
  gachaHistory?: { timestamp: number; charId: string }[];
  usedSerialCodes?: string[];
  scoreAttackHighScore?: number;
  lastClaimedWeeklyRewardWeek?: string;
  scoreAttackClaimedMilestones?: string[]; // スコアタ到達報酬受取済みリスト
  bleachRingExchanges?: Record<string, number>; // BLEACHリング交換所 購入済み回数
  dailyMissionsProgress?: Record<string, number>;
  dailyMissionsCompleted?: string[];
  lastDailyResetTime?: number;
}

const DEFAULT_DATA: PlayerData = {
  money: 0,
  yPoints: 50,
  summerMedals: 0,
  bleachRings: 10,
  characters: {
    'char_e_1': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_2': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_3': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_4': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
    'char_e_5': { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 },
  },
  team: ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'],
  savedTeams: [
    { id: 'team_1', name: 'デッキ1', team: ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'] },
    { id: 'team_2', name: 'デッキ2', team: ['char_e_1', 'char_e_2', 'char_e_3'] },
    { id: 'team_3', name: 'デッキ3', team: [] },
  ],
  activeTeamIndex: 0,
  maxClearedStageId: '',
  clearedStages: [],
  items: { expSmall: 3, expLarge: 1, skillBook: 0, godSkillBook: 0, superLimitBreakBook: 0, godAscensionStone: 1 },
  selectedTitle: '新米妖怪レーサー',
  unlockedTitles: ['新米妖怪レーサー', 'ぷにぷにマスター'],
  notifiedUnlockedTitles: ['新米妖怪レーサー', 'ぷにぷにマスター'],
  missionProgress: {},
  completedMissions: [],
  pityCount: 100,
  stepUpCount: 0,
  maxTeamSlots: 5,
  minRequiredTeamSize: 5,
  gachaHistory: [],
  usedSerialCodes: [],
};

// Simple encryption using XOR cipher & standard Base64 to prevent easy reading/editing
export const encryptData = (data: PlayerData): string => {
  try {
    const json = JSON.stringify(data);
    // Convert string to UTF-8 bytes to fully support Japanese and other special characters safely
    const utf8Bytes = new TextEncoder().encode(json);
    const obfuscatedBytes = new Uint8Array(utf8Bytes.length);
    for (let i = 0; i < utf8Bytes.length; i++) {
      obfuscatedBytes[i] = utf8Bytes[i] ^ 0x5A;
    }
    let binString = '';
    for (let i = 0; i < obfuscatedBytes.length; i++) {
      binString += String.fromCharCode(obfuscatedBytes[i]);
    }
    return btoa(binString);
  } catch (e) {
    console.error("Encryption failed, fallback to plain JSON", e);
    return JSON.stringify(data);
  }
};

export const decryptData = (encryptedStr: string): PlayerData | null => {
  try {
    const trimmed = encryptedStr.trim();
    if (!trimmed) return null;

    // 1. Raw JSON fallback (for plain text saves)
    if (trimmed.startsWith('{')) {
      return JSON.parse(trimmed) as PlayerData;
    }

    // Decode Base64 string first
    const binString = atob(trimmed);

    // 2. Try New UTF-8 Byte Format first
    try {
      const bytes = new Uint8Array(binString.length);
      for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i) ^ 0x5A;
      }
      const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (json.trim().startsWith('{')) {
        return JSON.parse(json) as PlayerData;
      }
    } catch {
      // Not new format, proceed to legacy formats
    }

    // 3. Legacy Format fallback (encodeURIComponent + XOR 0x5A)
    try {
      let decoded = '';
      for (let i = 0; i < binString.length; i++) {
        decoded += String.fromCharCode(binString.charCodeAt(i) ^ 0x5A);
      }
      const json = decodeURIComponent(decoded);
      if (json.trim().startsWith('{')) {
        return JSON.parse(json) as PlayerData;
      }
    } catch {
      // Quiet fallback: legacy decryption is either not applicable or failed
    }

    // 4. Try parsing raw input as plain JSON just in case
    try {
      return JSON.parse(encryptedStr) as PlayerData;
    } catch {
      return null;
    }
  } catch (e) {
    console.error("Critical decryption failure", e);
    return null;
  }
};

export const saveToLocalStorageDirectly = (data: PlayerData) => {
  try {
    const encrypted = encryptData(data);
    localStorage.setItem('punipuni_save', encrypted);
    localStorage.setItem('punipuni_save_backup', encrypted);
  } catch (e) {
    console.error("Error saving directly to localStorage", e);
  }
};

export const loginAndGetData = async (onDataLoaded: (data: PlayerData, uid: string) => void) => {
  const uid = "local_user";
  const data = await fetchPlayerData(uid);
  onDataLoaded(data, uid);
};

export const fetchPlayerData = async (_uid: string): Promise<PlayerData> => {
  try {
    const stored = localStorage.getItem('punipuni_save');
    if (stored) {
      const parsed = decryptData(stored);
      if (parsed && typeof parsed === 'object' && parsed.characters) {
        // If it was migrated from plain JSON, save the encrypted version
        if (stored.trim().startsWith('{')) {
          saveToLocalStorageDirectly(parsed);
        }
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error fetching player data from primary save, trying backup...", error);
  }

  // Try loading backup
  try {
    const backup = localStorage.getItem('punipuni_save_backup');
    if (backup) {
      const parsed = decryptData(backup);
      if (parsed && typeof parsed === 'object' && parsed.characters) {
        console.log("Successfully restored player data from backup!");
        // Save the encrypted version
        saveToLocalStorageDirectly(parsed);
        return parsed;
      }
    }
  } catch (error) {
    console.error("Error fetching player data from backup", error);
  }

  return DEFAULT_DATA;
};

export const savePlayerData = async (uid: string, data: Partial<PlayerData> | PlayerData) => {
  try {
    let updated: PlayerData;
    const stored = localStorage.getItem('punipuni_save');
    if (stored) {
      try {
        const current = decryptData(stored) || DEFAULT_DATA;
        updated = { ...current, ...data };
      } catch {
        updated = { ...DEFAULT_DATA, ...data };
      }
    } else {
      updated = { ...DEFAULT_DATA, ...data };
    }

    saveToLocalStorageDirectly(updated);
  } catch (error) {
    console.error("Error saving player data", error);
  }
};


