import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAndGetData, savePlayerData, saveToLocalStorageDirectly } from '../storage';
import { CHARACTERS, getCharacterMaxLevel, migrateCharId } from '../data/characters';
import type { Rank } from '../data/characters';
import { CURRENT_EVENTS } from '../data/events';
import { STAGES, EVENT_SNOW_STAGES } from '../data/stages';
import { decodeSerialCode } from '../utils/serialCode';
import type { PlayerData } from '../storage';
import { DAILY_MISSIONS_POOL, getTodayDailyMissions } from '../data/dailyMissions';

export interface StageDropReward {
  expSmallCount: number;
  expLargeCount: number;
  skillBookCount: number;
  droppedCharacter?: {
    id: string;
    name: string;
    rank: string;
    emoji: string;
    isNew: boolean;
  };
}

interface GameState extends PlayerData {
  uid: string | null;
  loading: boolean;
  addMoney: (amount: number) => void;
  addYPoints: (amount: number) => void;
  setMoney: (amount: number) => void;
  setYPoints: (amount: number) => void;
  addSummerMedals: (amount: number) => void;
  unlockCharacter: (charId: string) => void;
  unlockAllCharacters: () => void;
  unlockAllStages: () => void;
  unlockEventStages: () => void;
  addMaxItems: () => void;
  upgradeCharacter: (charId: string, moneyCost: number) => void;
  consumeExpItem: (charId: string, itemType: 'expSmall' | 'expLarge') => void;
  consumeSkillBook: (charId: string) => void;
  consumeGodSkillBook: (charId: string) => void;
  consumeSuperLimitBreakBook: (charId: string) => void;
  setSelectedTitle: (titleName: string) => void;
  unlockTitle: (titleName: string) => void;
  setTeam: (newTeam: string[]) => void;
  setActiveTeamIndex: (index: number) => void;
  updateSavedTeamName: (index: number, name: string) => void;
  getTeamSlotAddCost: () => number;
  addTeamSlot: () => { success: boolean; message: string };
  unlockMinRequiredTeamSize: () => { success: boolean; message: string };
  clearStage: (stageId: string, moneyReward: number, yPointReward: number) => StageDropReward;
  trackMission: (type: string, amount?: number) => void;
  claimMission: (missionId: string) => void;
  trackDailyMission: (type: string, amount?: number) => void;
  claimDailyMission: (missionId: string) => void;
  submitScoreAttackScore: (score: number) => { isNewHighScore: boolean; previousHighScore: number };
  recordGachaResult: (charIds: string[], newPityCount: number, newStepUpCount: number) => void;
  redeemSerialCode: (code: string) => { success: boolean; message: string; rewardsSummary?: string };
  convertYPointsToSummerMedals: (amount: number) => { success: boolean; message: string };
}

const GameContext = createContext<GameState | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};

const DEFAULT_ITEMS = { expSmall: 3, expLarge: 1, skillBook: 0 };

// eslint-disable-next-line react-refresh/only-export-components
export const MIN_TEAM_SIZE_UNLOCK_COSTS: Record<number, number> = {
  4: 10000,  // 4体での出撃を許可 (5体必須 → 4体へ): 10,000 pt (1万)
  3: 20000,  // 3体での出撃を許可 (4体必須 → 3体へ): 20,000 pt (2万)
  2: 40000,  // 2体での出撃を許可 (3体必須 → 2体へ): 40,000 pt (4万)
  1: 80000,  // 1体での出撃を許可 (2体必須 → 1体へ): 80,000 pt (8万)
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PlayerData>({
    money: 0,
    yPoints: 0,
    summerMedals: 0,
    characters: {},
    team: [],
    maxClearedStageId: '',
    clearedStages: [],
    items: DEFAULT_ITEMS,
    missionProgress: {},
    completedMissions: [],
    pityCount: 100,
    stepUpCount: 0,
    maxTeamSlots: 5,
    minRequiredTeamSize: 5,
    gachaHistory: [],
  });

  useEffect(() => {
    loginAndGetData((playerData, uid) => {
      if (playerData.summerMedals === undefined) playerData.summerMedals = 0;
      if (!playerData.clearedStages) playerData.clearedStages = [];
      if (!playerData.items) playerData.items = DEFAULT_ITEMS;
      if (!playerData.missionProgress) playerData.missionProgress = {};
      if (!playerData.completedMissions) playerData.completedMissions = [];
      if (playerData.pityCount === undefined) playerData.pityCount = 100;
      if (playerData.stepUpCount === undefined) playerData.stepUpCount = 0;
      if (playerData.maxTeamSlots === undefined) playerData.maxTeamSlots = 5;
      if (playerData.minRequiredTeamSize === undefined) playerData.minRequiredTeamSize = 5;
      if (!playerData.gachaHistory) playerData.gachaHistory = [];

      if (!playerData.savedTeams || playerData.savedTeams.length === 0) {
        playerData.savedTeams = [
          { id: 'team_1', name: 'デッキ1', team: playerData.team && playerData.team.length > 0 ? [...playerData.team] : ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'] },
          { id: 'team_2', name: 'デッキ2', team: ['char_e_1', 'char_e_2', 'char_e_3'] },
          { id: 'team_3', name: 'デッキ3', team: [] },
        ];
      }
      if (playerData.activeTeamIndex === undefined || playerData.activeTeamIndex >= playerData.savedTeams.length) {
        playerData.activeTeamIndex = 0;
      }
      // Ensure active team is loaded into team property
      playerData.team = playerData.savedTeams[playerData.activeTeamIndex]?.team || playerData.team || [];

      // Score Attack & Daily Missions Initialization / Reset
      if (playerData.scoreAttackHighScore === undefined) playerData.scoreAttackHighScore = 0;
      if (!playerData.dailyMissionsProgress) playerData.dailyMissionsProgress = {};
      if (!playerData.dailyMissionsCompleted) playerData.dailyMissionsCompleted = [];
      if (playerData.lastDailyResetTime === undefined) playerData.lastDailyResetTime = 0;

      const currentDayIndex = Math.floor(Date.now() / (24 * 3600 * 1000));
      if (playerData.lastDailyResetTime < currentDayIndex) {
        playerData.dailyMissionsProgress = {};
        playerData.dailyMissionsCompleted = [];
        playerData.lastDailyResetTime = currentDayIndex;
      }

      // Migrate old character saves (add missing fields and convert legacy IDs)
      const migratedChars: PlayerData['characters'] = {};
      Object.entries(playerData.characters || {}).forEach(([rawId, c]) => {
        const newId = migrateCharId(rawId);
        migratedChars[newId] = {
          level: c.level || 1,
          skillLevel: (c as any).skillLevel || 1,
          limitBreak: (c as any).limitBreak || 0,
          duplicates: (c as any).duplicates || 0,
        };
      });
      playerData.characters = migratedChars;

      // Ensure initial starter characters exist
      const starterIds = ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'];
      starterIds.forEach(id => {
        if (!playerData.characters[id]) {
          playerData.characters[id] = { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 };
        }
      });

      let validTeam = (playerData.team || [])
        .map(id => migrateCharId(id))
        .filter(id => CHARACTERS.some(c => c.id === id));
      if (validTeam.length === 0) {
        validTeam = ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'];
      }
      if (validTeam.length > 5) {
        validTeam = validTeam.slice(0, 5);
      }
      playerData.team = validTeam;
      savePlayerData(uid, { characters: playerData.characters, team: validTeam, minRequiredTeamSize: playerData.minRequiredTeamSize });
      setData(playerData);
      setUid(uid);
      setLoading(false);
    });
  }, []);

  const mutateAndSave = (updater: Partial<PlayerData> | ((prev: PlayerData) => Partial<PlayerData>)) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      const updated = { ...prev, ...newData };
      // Save entire state directly into localStorage to prevent any stale state loss
      if (uid) {
        savePlayerData(uid, updated);
      }
      return updated;
    });
  };

  // Synchronize save to localStorage on window close / page hide
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (uid && data) {
        try {
          saveToLocalStorageDirectly(data);
        } catch (e) {
          console.error("Failed to save on beforeunload", e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [uid, data]);

  const unlockAllCharacters = () => {
    mutateAndSave(() => {
      const allChars: PlayerData['characters'] = {};
      CHARACTERS.forEach(c => {
        const limitBreak = 5;
        const maxLv = getCharacterMaxLevel(c.rank, limitBreak);
        allChars[c.id] = {
          level: maxLv,
          skillLevel: 5,
          limitBreak: limitBreak,
          duplicates: 10,
        };
      });
      return { characters: allChars };
    });
  };

  const unlockAllStages = () => {
    mutateAndSave(() => {
      const allStageIds = STAGES.map(s => s.id);
      const lastStageId = STAGES[STAGES.length - 1]?.id || 'stage_150';
      return {
        clearedStages: allStageIds,
        maxClearedStageId: lastStageId
      };
    });
  };

  const unlockEventStages = () => {
    mutateAndSave(prev => {
      const eventStageIds = EVENT_SNOW_STAGES.map(s => s.id);
      const existing = new Set(prev.clearedStages || []);
      eventStageIds.forEach(id => existing.add(id));
      return {
        clearedStages: Array.from(existing)
      };
    });
  };

  const addMaxItems = () => {
    mutateAndSave(() => ({
      items: {
        expSmall: 99,
        expLarge: 99,
        skillBook: 99,
        godSkillBook: 99,
        superLimitBreakBook: 99,
      }
    }));
  };
  const addMoney = (amount: number) => mutateAndSave(prev => ({ money: prev.money + amount }));
  const setMoney = (amount: number) => mutateAndSave({ money: amount });
  const addYPoints = (amount: number) => mutateAndSave(prev => ({ yPoints: prev.yPoints + amount }));
  const setYPoints = (amount: number) => mutateAndSave({ yPoints: amount });
  const addSummerMedals = (amount: number) => mutateAndSave(prev => ({ summerMedals: (prev.summerMedals || 0) + amount }));

  const unlockCharacter = (charId: string) => {
    mutateAndSave(prev => {
      const existing = prev.characters[charId];
      if (!existing) {
        return {
          characters: {
            ...prev.characters,
            [charId]: { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 1 }
          }
        };
      } else {
        const newDuplicates = (existing.duplicates || 0) + 1;
        const newLimitBreak = Math.min(5, Math.floor(newDuplicates / 1)); // 1体ごとに段階UP（最大5）
        return {
          characters: {
            ...prev.characters,
            [charId]: {
              ...existing,
              duplicates: newDuplicates,
              limitBreak: newLimitBreak,
              skillLevel: Math.min(5, (existing.skillLevel || 1) + (newDuplicates % 2 === 0 ? 1 : 0)),
            }
          }
        };
      }
    });
  };

  const upgradeCharacter = (charId: string, moneyCost: number) => {
    let leveledUp = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const charDef = CHARACTERS.find(c => c.id === charId);
      if (!charData || !charDef || prev.money < moneyCost) return {};

      const maxLv = getCharacterMaxLevel(charDef.rank, charData.limitBreak || 0);
      if (charData.level >= maxLv) return {};

      leveledUp = true;
      return {
        money: prev.money - moneyCost,
        characters: {
          ...prev.characters,
          [charId]: { ...charData, level: charData.level + 1 }
        }
      };
    });
    if (leveledUp) setTimeout(() => trackMission('level_up', 1), 0);
  };

  const consumeExpItem = (charId: string, itemType: 'expSmall' | 'expLarge') => {
    let levelsGained = 0;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const charDef = CHARACTERS.find(c => c.id === charId);
      if (!charData || !charDef || (prev.items[itemType] || 0) <= 0) return {};
      
      const levelGain = itemType === 'expSmall' ? 1 : 5;
      const maxLv = getCharacterMaxLevel(charDef.rank, charData.limitBreak || 0);
      const newLevel = Math.min(maxLv, charData.level + levelGain);
      
      if (newLevel <= charData.level) return {};
      
      levelsGained = newLevel - charData.level;
      return {
        items: { ...prev.items, [itemType]: prev.items[itemType] - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, level: newLevel } }
      };
    });
    if (levelsGained > 0) {
      setTimeout(() => {
        trackMission('level_up', levelsGained);
        trackMission('item_use', 1);
      }, 0);
    }
  };

  const consumeSkillBook = (charId: string) => {
    let skillIncreased = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      if (!charData || (prev.items.skillBook || 0) <= 0) return {};
      
      const currentSkillLv = charData.skillLevel || 1;
      if (currentSkillLv >= 5) return {};
      
      skillIncreased = true;
      return {
        items: { ...prev.items, skillBook: prev.items.skillBook - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, skillLevel: currentSkillLv + 1 } }
      };
    });
    if (skillIncreased) {
      setTimeout(() => trackMission('skill_up', 1), 0);
    }
  };

  const consumeGodSkillBook = (charId: string) => {
    let skillIncreased = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const count = prev.items.godSkillBook || 0;
      if (!charData || count <= 0) return {};
      
      const currentSkillLv = charData.skillLevel || 1;
      if (currentSkillLv >= 5) return {};
      
      skillIncreased = true;
      return {
        items: { ...prev.items, godSkillBook: count - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, skillLevel: 5 } }
      };
    });
    if (skillIncreased) {
      setTimeout(() => trackMission('skill_up', 1), 0);
    }
  };

  const consumeSuperLimitBreakBook = (charId: string) => {
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const count = prev.items.superLimitBreakBook || 0;
      if (!charData || count <= 0) return {};
      
      const currentLb = charData.limitBreak || 0;
      if (currentLb >= 10) return {};
      
      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      const newUnlocked = unlocked.includes('限界を超えし者') ? unlocked : [...unlocked, '限界を超えし者'];

      return {
        items: { ...prev.items, superLimitBreakBook: count - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, limitBreak: currentLb + 1 } },
        unlockedTitles: newUnlocked
      };
    });
  };

  const setSelectedTitle = (titleName: string) => {
    mutateAndSave({ selectedTitle: titleName });
  };

  const unlockTitle = (titleName: string) => {
    mutateAndSave(prev => {
      const unlocked = prev.unlockedTitles || ['新米妖怪レーサー'];
      if (unlocked.includes(titleName)) return {};
      return { unlockedTitles: [...unlocked, titleName] };
    });
  };

  const setTeam = (newTeam: string[]) => {
    const sliced = newTeam.slice(0, 5);
    mutateAndSave(prev => {
      const activeIdx = prev.activeTeamIndex ?? 0;
      const currentSaved = prev.savedTeams ? [...prev.savedTeams] : [
        { id: 'team_1', name: 'デッキ1', team: sliced }
      ];
      if (currentSaved[activeIdx]) {
        currentSaved[activeIdx] = {
          ...currentSaved[activeIdx],
          team: sliced
        };
      } else {
        currentSaved[activeIdx] = {
          id: `team_${activeIdx + 1}`,
          name: `デッキ${activeIdx + 1}`,
          team: sliced
        };
      }
      return {
        team: sliced,
        savedTeams: currentSaved
      };
    });
  };

  const setActiveTeamIndex = (index: number) => {
    mutateAndSave(prev => {
      const saved = prev.savedTeams || [];
      if (index < 0 || index >= saved.length) return {};
      const targetTeam = saved[index]?.team || [];
      return {
        activeTeamIndex: index,
        team: [...targetTeam]
      };
    });
  };

  const updateSavedTeamName = (index: number, newName: string) => {
    mutateAndSave(prev => {
      const saved = prev.savedTeams ? [...prev.savedTeams] : [];
      if (!saved[index]) return {};
      saved[index] = { ...saved[index], name: newName.trim() || `デッキ${index + 1}` };
      return { savedTeams: saved };
    });
  };

  const getTeamSlotAddCost = (): number => {
    const savedCount = data.savedTeams?.length || 3;
    const additionalSlots = Math.max(0, savedCount - 3);
    return 2000 + additionalSlots * 500;
  };

  const addTeamSlot = (): { success: boolean; message: string } => {
    const cost = getTeamSlotAddCost();
    if ((data.yPoints || 0) < cost) {
      return { success: false, message: `ワイポイントが足りません（必要: ${cost.toLocaleString()} Ypt）` };
    }

    let createdSlotMsg = '';
    mutateAndSave(prev => {
      const currentSaved = prev.savedTeams ? [...prev.savedTeams] : [];
      const newIndex = currentSaved.length;
      currentSaved.push({
        id: `team_${Date.now()}`,
        name: `デッキ${newIndex + 1}`,
        team: []
      });
      createdSlotMsg = `${cost.toLocaleString()} Yptを消費して『デッキ${newIndex + 1}』を新しく解放しました！`;
      return {
        yPoints: prev.yPoints - cost,
        savedTeams: currentSaved
      };
    });

    return { success: true, message: createdSlotMsg };
  };

  const unlockMinRequiredTeamSize = (): { success: boolean; message: string } => {
    const currentMin = data.minRequiredTeamSize ?? 5;
    if (currentMin <= 1) {
      return { success: false, message: '出撃の必須編成数はすでに最小（1体）です！' };
    }
    const targetMin = currentMin - 1;
    const cost = MIN_TEAM_SIZE_UNLOCK_COSTS[targetMin] || 10000;
    if ((data.yPoints || 0) < cost) {
      return { success: false, message: `ワイポイントが足りません（必要: ${cost.toLocaleString()} Ypt）` };
    }

    mutateAndSave(prev => ({
      yPoints: prev.yPoints - cost,
      minRequiredTeamSize: targetMin
    }));

    return { success: true, message: `出撃条件が緩和され、${targetMin}体編成で出撃可能になりました！` };
  };

  const calculateStageDrops = (stageId: string, currentChars: PlayerData['characters']): StageDropReward => {
    const stage = STAGES.find(s => s.id === stageId);
    const randBook = Math.random();
    const randExpLarge = Math.random();
    const randExpSmall = Math.random();
    const randChar = Math.random();

    // 1. 秘伝書 - 進行度に応じて確率上昇 (最序盤1.5% 〜 最深部10%)
    const stageIndex = STAGES.findIndex(s => s.id === stageId);
    const totalStages = STAGES.length;
    let bookRate = 0.015; // デフォルト/最序盤 1.5%
    if (stageIndex >= 0 && totalStages > 1) {
      // 進行度に応じて1.5%から10%まで直線的に増加
      const ratio = stageIndex / (totalStages - 1);
      bookRate = 0.015 + ratio * 0.085;
    }
    const skillBookCount = randBook < bookRate ? 1 : 0;

    // 2. 経験値玉 (大: 低確率15%, 小: 低確率35%)
    const expLargeCount = randExpLarge < 0.15 ? 1 : 0;
    const expSmallCount = randExpSmall < 0.35 ? 1 : 0;

    // 3. キャラクタードロップ - 低確率 (20%の確率)
    let droppedCharacter: StageDropReward['droppedCharacter'] = undefined;
    if (randChar < 0.20 && stage) {
      // 敵のHP・難易度に応じたドロップ可能ランクの設定（ZやSSSはガシャ限定のため絶対除外！）
      const hp = stage.enemyHp || 1000;
      let allowedRanks: Rank[] = ['E', 'D'];
      if (hp > 5000000) {
        allowedRanks = ['S', 'SS'];
      } else if (hp > 500000) {
        allowedRanks = ['A', 'S'];
      } else if (hp > 50000) {
        allowedRanks = ['B', 'A'];
      } else if (hp > 8000) {
        allowedRanks = ['C', 'B'];
      } else {
        allowedRanks = ['E', 'D'];
      }

      // ドロップ可能ランクのキャラクターのみ
      const candidateChars = CHARACTERS.filter(c => allowedRanks.includes(c.rank as Rank));

      if (candidateChars.length > 0) {
        const enemyEmoji = stage.enemyEmoji;
        const rawEnemyName = stage.enemyName.replace(/【.*?】/, '').trim();

        // 敵の絵文字や名前に一致・部分一致するキャラを最優先で探す
        let matchedChar = candidateChars.find(c =>
          c.emoji === enemyEmoji ||
          enemyEmoji.includes(c.emoji) ||
          c.emoji.includes(enemyEmoji) ||
          rawEnemyName.includes(c.name) ||
          c.name.includes(rawEnemyName)
        );

        // 一致するキャラがない場合、全キャラの中でZ/SSS以外の同絵文字・同名キャラを探す
        if (!matchedChar) {
          const exactMatchInAll = CHARACTERS.find(c =>
            (c.emoji === enemyEmoji || rawEnemyName.includes(c.name)) &&
            !['Z', 'SSS'].includes(c.rank)
          );
          if (exactMatchInAll) {
            matchedChar = exactMatchInAll;
          } else {
            // 一致するキャラがなければ難易度に応じた候補からランダムで選択
            const unowned = candidateChars.filter(c => !currentChars[c.id]);
            const pool = unowned.length > 0 && Math.random() < 0.7 ? unowned : candidateChars;
            matchedChar = pool[Math.floor(Math.random() * pool.length)];
          }
        }

        if (matchedChar) {
          const isNew = !currentChars[matchedChar.id];
          droppedCharacter = {
            id: matchedChar.id,
            name: matchedChar.name,
            rank: matchedChar.rank,
            emoji: matchedChar.emoji,
            isNew,
          };
        }
      }
    }

    return {
      expSmallCount,
      expLargeCount,
      skillBookCount,
      droppedCharacter,
    };
  };

  const clearStage = (stageId: string, moneyReward: number, yPointReward: number): StageDropReward => {
    let didClear = false;
    let drops: StageDropReward = {
      expSmallCount: 0,
      expLargeCount: 0,
      skillBookCount: 0,
    };
    const isSummerStage = stageId.startsWith('event_snow_');
    
    mutateAndSave(prev => {
      const newCleared = prev.clearedStages.includes(stageId)
        ? prev.clearedStages
        : [...prev.clearedStages, stageId];
      
      drops = calculateStageDrops(stageId, prev.characters);
      
      const newItems = { ...prev.items };
      if (drops.expSmallCount > 0) newItems.expSmall = (newItems.expSmall || 0) + drops.expSmallCount;
      if (drops.expLargeCount > 0) newItems.expLarge = (newItems.expLarge || 0) + drops.expLargeCount;
      if (drops.skillBookCount > 0) newItems.skillBook = (newItems.skillBook || 0) + drops.skillBookCount;

      const newChars = { ...prev.characters };
      if (drops.droppedCharacter) {
        const charId = drops.droppedCharacter.id;
        const existing = newChars[charId];
        if (!existing) {
          newChars[charId] = { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 1 };
        } else {
          const newDuplicates = (existing.duplicates || 0) + 1;
          const newLimitBreak = Math.min(5, Math.floor(newDuplicates / 1));
          newChars[charId] = {
            ...existing,
            duplicates: newDuplicates,
            limitBreak: newLimitBreak,
            skillLevel: Math.min(5, (existing.skillLevel || 1) + (newDuplicates % 2 === 0 ? 1 : 0)),
          };
        }
      }

      didClear = true;
      
      if (isSummerStage) {
        return {
          money: prev.money + moneyReward,
          summerMedals: (prev.summerMedals || 0) + yPointReward,
          maxClearedStageId: stageId,
          clearedStages: newCleared,
          items: newItems,
          characters: newChars,
        };
      } else {
        return {
          money: prev.money + moneyReward,
          yPoints: prev.yPoints + yPointReward,
          maxClearedStageId: stageId,
          clearedStages: newCleared,
          items: newItems,
          characters: newChars,
        };
      }
    });
    if (didClear) {
      setTimeout(() => {
        trackMission('complete_stage', 1);
        if (stageId.includes('event')) {
          trackMission('complete_event_stage', 1);
        }
        trackMission('kill_enemy', 1);
      }, 0);
    }
    return drops;
  };

  const trackDailyMission = (type: string, amount: number = 1) => {
    mutateAndSave(prev => {
      const todayMissions = getTodayDailyMissions();
      const relevantMissions = todayMissions.filter(m => m.type === type);
      if (relevantMissions.length === 0) return {};

      const progress = prev.dailyMissionsProgress ? { ...prev.dailyMissionsProgress } : {};
      const completed = prev.dailyMissionsCompleted || [];
      let changed = false;

      relevantMissions.forEach(m => {
        if (!completed.includes(m.id)) {
          if (type === 'score_attack_score') {
            const current = progress[m.id] || 0;
            if (amount > current) {
              progress[m.id] = amount;
              changed = true;
            }
          } else {
            progress[m.id] = (progress[m.id] || 0) + amount;
            changed = true;
          }
        }
      });

      return changed ? { dailyMissionsProgress: progress } : {};
    });
  };

  const claimDailyMission = (missionId: string) => {
    mutateAndSave(prev => {
      const mission = DAILY_MISSIONS_POOL.find(m => m.id === missionId);
      const completed = prev.dailyMissionsCompleted || [];
      if (!mission || completed.includes(missionId)) return {};

      const progress = (prev.dailyMissionsProgress || {})[missionId] || 0;
      if (progress < mission.goal) return {};

      const newItems = { ...prev.items };
      if (mission.rewardItems?.expSmall) newItems.expSmall += mission.rewardItems.expSmall;
      if (mission.rewardItems?.expLarge) newItems.expLarge += mission.rewardItems.expLarge;
      if (mission.rewardItems?.skillBook) newItems.skillBook += mission.rewardItems.skillBook;

      return {
        money: prev.money + (mission.rewardMoney || 0),
        yPoints: prev.yPoints + (mission.rewardYPoints || 0),
        items: newItems,
        dailyMissionsCompleted: [...completed, missionId],
      };
    });
  };

  const submitScoreAttackScore = (score: number) => {
    const currentHighScore = data.scoreAttackHighScore || 0;
    const isNewHighScore = score > currentHighScore;
    
    mutateAndSave(prev => {
      const updates: Partial<PlayerData> = {
        yPoints: (prev.yPoints || 0) + 100,
        money: (prev.money || 0) + 300,
      };
      if (isNewHighScore) {
        updates.scoreAttackHighScore = score;
      }
      return updates;
    });

    // Track Daily Mission for Score Attack play and score
    setTimeout(() => {
      trackDailyMission('score_attack_play', 1);
      trackDailyMission('score_attack_score', score);
    }, 0);

    return { isNewHighScore, previousHighScore: currentHighScore };
  };

  const trackMission = (type: string, amount: number = 1) => {
    // Automatically track for daily missions too
    trackDailyMission(type, amount);

    mutateAndSave(prev => {
      const allMissions = CURRENT_EVENTS.flatMap(e => e.missions);
      const relevantMissions = allMissions.filter(m => m.type === type);
      if (relevantMissions.length === 0) return {};
      
      const newProgress = { ...prev.missionProgress };
      let changed = false;
      relevantMissions.forEach(m => {
        if (!prev.completedMissions.includes(m.id)) {
          newProgress[m.id] = (newProgress[m.id] || 0) + amount;
          changed = true;
        }
      });
      return changed ? { missionProgress: newProgress } : {};
    });
  };

  const claimMission = (missionId: string) => {
    mutateAndSave(prev => {
      const allMissions = CURRENT_EVENTS.flatMap(e => e.missions);
      const mission = allMissions.find(m => m.id === missionId);
      if (!mission || prev.completedMissions.includes(missionId)) return {};
      
      const progress = prev.missionProgress[missionId] || 0;
      if (progress < mission.goal) return {};
      
      const newItems = { ...prev.items };
      if (mission.rewardItems?.expSmall) newItems.expSmall += mission.rewardItems.expSmall;
      if (mission.rewardItems?.expLarge) newItems.expLarge += mission.rewardItems.expLarge;
      if (mission.rewardItems?.skillBook) newItems.skillBook += mission.rewardItems.skillBook;
      
      return {
        money: prev.money + (mission.rewardMoney || 0),
        yPoints: prev.yPoints + (mission.rewardYPoints || 0),
        items: newItems,
        completedMissions: [...prev.completedMissions, missionId],
      };
    });
  };

  const recordGachaResult = (charIds: string[], newPityCount: number, newStepUpCount: number) => {
    mutateAndSave(prev => {
      const newHistory = [...(prev.gachaHistory || [])];
      const timestamp = Date.now();
      charIds.forEach(charId => {
        newHistory.unshift({ timestamp, charId }); // add to front
      });
      if (newHistory.length > 50) newHistory.length = 50;
      
      return {
        pityCount: newPityCount,
        stepUpCount: newStepUpCount,
        gachaHistory: newHistory,
      };
    });
  };

  const redeemSerialCode = (code: string): { success: boolean; message: string; rewardsSummary?: string } => {
    const cleanCode = code.trim();
    const used = data.usedSerialCodes || [];

    if (used.includes(cleanCode.toUpperCase()) || used.includes(cleanCode)) {
      return { success: false, message: 'このシリアルコードは既に使用されています。' };
    }

    const decoded = decodeSerialCode(cleanCode);
    if (!decoded.success || !decoded.payload) {
      return { success: false, message: decoded.error || '無効なシリアルコードです。' };
    }

    const { yPoints = 0, money = 0, items, unlockStagesCount = 0, title } = decoded.payload;

    const summaryParts: string[] = [];
    if (yPoints > 0) summaryParts.push(`Yポイント +${yPoints.toLocaleString()}pt`);
    if (money > 0) summaryParts.push(`yマネー +${money.toLocaleString()}`);
    if (unlockStagesCount > 0) summaryParts.push(`通常ステージ +${unlockStagesCount}進展`);
    if (items) {
      if (items.expSmall) summaryParts.push(`小けいけんちだま x${items.expSmall}`);
      if (items.expLarge) summaryParts.push(`大けいけんちだま x${items.expLarge}`);
      if (items.skillBook) summaryParts.push(`ひっさつの秘伝書 x${items.skillBook}`);
    }

    const summaryText = summaryParts.length > 0 ? summaryParts.join(' / ') : '報酬なし';

    mutateAndSave(prev => {
      const newItems = { ...prev.items };
      if (items?.expSmall) newItems.expSmall = (newItems.expSmall || 0) + items.expSmall;
      if (items?.expLarge) newItems.expLarge = (newItems.expLarge || 0) + items.expLarge;
      if (items?.skillBook) newItems.skillBook = (newItems.skillBook || 0) + items.skillBook;

      // 通常ステージ進展の計算
      let newClearedStages = [...(prev.clearedStages || [])];
      if (unlockStagesCount > 0) {
        // 現在の最大通常ステージIDを算出
        let maxStageNum = 0;
        newClearedStages.forEach(id => {
          if (id.startsWith('stage_') && !id.includes('hidden') && !id.includes('event')) {
            const num = parseInt(id.replace('stage_', ''), 10);
            if (!isNaN(num) && num > maxStageNum) {
              maxStageNum = num;
            }
          }
        });

        const targetStage = Math.min(150, maxStageNum + unlockStagesCount);
        for (let i = 1; i <= targetStage; i++) {
          const stId = `stage_${i}`;
          if (!newClearedStages.includes(stId)) {
            newClearedStages.push(stId);
          }
        }
      }

      return {
        yPoints: prev.yPoints + yPoints,
        money: prev.money + money,
        items: newItems,
        clearedStages: newClearedStages,
        usedSerialCodes: [...(prev.usedSerialCodes || []), cleanCode, cleanCode.toUpperCase()],
      };
    });

    return {
      success: true,
      message: title ? `【${title}】の特典を獲得しました！` : 'シリアルコード特典を獲得しました！',
      rewardsSummary: summaryText,
    };
  };

  const convertYPointsToSummerMedals = (amount: number): { success: boolean; message: string } => {
    // 10,000 YP = 3 Medals
    const multiplier = Math.floor(amount / 10000);
    if (multiplier < 1) {
      return { success: false, message: '10,000 Yポイント以上から変換可能です！' };
    }
    const cost = multiplier * 10000;
    const medals = multiplier * 3;

    if ((data.yPoints || 0) < cost) {
      return { success: false, message: 'Yポイントが足りません！' };
    }

    mutateAndSave(prev => ({
      yPoints: prev.yPoints - cost,
      summerMedals: (prev.summerMedals || 0) + medals
    }));

    return { success: true, message: `${cost.toLocaleString()} Yポイントを消費して、${medals}枚のサマーコインに変換しました！` };
  };

  return (
    <GameContext.Provider value={{
      ...data,
      uid,
      loading,
      addMoney,
      addYPoints,
      setMoney,
      setYPoints,
      addSummerMedals,
      unlockCharacter,
      unlockAllCharacters,
      unlockAllStages,
      unlockEventStages,
      addMaxItems,
      upgradeCharacter,
      consumeExpItem,
      consumeSkillBook,
      consumeGodSkillBook,
      consumeSuperLimitBreakBook,
      setSelectedTitle,
      unlockTitle,
      setTeam,
      setActiveTeamIndex,
      updateSavedTeamName,
      getTeamSlotAddCost,
      addTeamSlot,
      unlockMinRequiredTeamSize,
      clearStage,
      trackMission,
      claimMission,
      trackDailyMission,
      claimDailyMission,
      submitScoreAttackScore,
      recordGachaResult,
      redeemSerialCode,
      convertYPointsToSummerMedals,
    }}>
      {children}
    </GameContext.Provider>
  );
};
