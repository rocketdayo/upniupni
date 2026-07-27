import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAndGetData, savePlayerData } from '../firebase';
import { CHARACTERS, getCharacterMaxLevel } from '../data/characters';
import { CURRENT_EVENTS } from '../data/events';
import { STAGES } from '../data/stages';
import type { PlayerData } from '../firebase';

interface GameState extends PlayerData {
  uid: string | null;
  loading: boolean;
  addMoney: (amount: number) => void;
  addYPoints: (amount: number) => void;
  unlockCharacter: (charId: string) => void;
  unlockAllCharacters: () => void;
  unlockAllStages: () => void;
  addMaxItems: () => void;
  upgradeCharacter: (charId: string, moneyCost: number) => void;
  consumeExpItem: (charId: string, itemType: 'expSmall' | 'expLarge') => void;
  consumeSkillBook: (charId: string) => void;
  setTeam: (newTeam: string[]) => void;
  clearStage: (stageId: string, moneyReward: number, yPointReward: number) => void;
  trackMission: (type: string, amount?: number) => void;
  claimMission: (missionId: string) => void;
  recordGachaResult: (charIds: string[], newPityCount: number, newStepUpCount: number) => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};

const DEFAULT_ITEMS = { expSmall: 3, expLarge: 1, skillBook: 0 };

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PlayerData>({
    money: 0,
    yPoints: 0,
    characters: {},
    team: [],
    maxClearedStageId: '',
    clearedStages: [],
    items: DEFAULT_ITEMS,
    missionProgress: {},
    completedMissions: [],
    pityCount: 100,
    stepUpCount: 0,
    gachaHistory: [],
  });

  useEffect(() => {
    loginAndGetData((playerData, uid) => {
      if (!playerData.clearedStages) playerData.clearedStages = [];
      if (!playerData.items) playerData.items = DEFAULT_ITEMS;
      if (!playerData.missionProgress) playerData.missionProgress = {};
      if (!playerData.completedMissions) playerData.completedMissions = [];
      if (playerData.pityCount === undefined) playerData.pityCount = 100;
      if (playerData.stepUpCount === undefined) playerData.stepUpCount = 0;
      if (!playerData.gachaHistory) playerData.gachaHistory = [];

      // Migrate old character saves (add missing fields)
      const migratedChars: PlayerData['characters'] = {};
      Object.entries(playerData.characters || {}).forEach(([id, c]) => {
        migratedChars[id] = {
          level: c.level || 1,
          skillLevel: (c as any).skillLevel || 1,
          limitBreak: (c as any).limitBreak || 0,
          duplicates: (c as any).duplicates || 0,
        };
      });
      playerData.characters = migratedChars;

      // Ensure initial 5 starter characters exist
      const starterIds = ['char_e_1', 'char_e_2', 'char_e_3', 'char_e_4', 'char_e_5'];
      starterIds.forEach(id => {
        if (!playerData.characters[id]) {
          playerData.characters[id] = { level: 1, skillLevel: 1, limitBreak: 0, duplicates: 0 };
        }
      });

      let validTeam = (playerData.team || []).filter(id => CHARACTERS.some(c => c.id === id));
      if (validTeam.length < 5) {
        const missingCount = 5 - validTeam.length;
        const available = Object.keys(playerData.characters).filter(id => !validTeam.includes(id));
        validTeam = [...validTeam, ...available.slice(0, missingCount)];
      }
      playerData.team = validTeam;
      savePlayerData(uid, { characters: playerData.characters, team: validTeam });
      setData(playerData);
      setUid(uid);
      setLoading(false);
    });
  }, []);

  const mutateAndSave = (updater: Partial<PlayerData> | ((prev: PlayerData) => Partial<PlayerData>)) => {
    setData(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;
      const updated = { ...prev, ...newData };
      if (uid) savePlayerData(uid, newData);
      return updated;
    });
  };

  // Debug tools
  useEffect(() => {
    (window as any).addYPoints = (amount: number) => {
      setData(prev => {
        const newData = { yPoints: prev.yPoints + amount };
        if (uid) savePlayerData(uid, newData);
        return { ...prev, ...newData };
      });
    };
    (window as any).addMoney = (amount: number) => {
      setData(prev => {
        const newData = { money: prev.money + amount };
        if (uid) savePlayerData(uid, newData);
        return { ...prev, ...newData };
      });
    };
    (window as any).addItems = (type: string, amount: number) => {
      setData(prev => {
        const newItems = { ...prev.items, [type]: (prev.items as any)[type] + amount };
        if (uid) savePlayerData(uid, { items: newItems });
        return { ...prev, items: newItems };
      });
    };
  }, [uid]);

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

  const addMaxItems = () => {
    mutateAndSave(() => ({
      items: { expSmall: 99, expLarge: 99, skillBook: 99 }
    }));
  };
  const addMoney = (amount: number) => mutateAndSave(prev => ({ money: prev.money + amount }));
  const addYPoints = (amount: number) => mutateAndSave(prev => ({ yPoints: prev.yPoints + amount }));

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
    if (levelsGained > 0) setTimeout(() => trackMission('level_up', levelsGained), 0);
  };

  const consumeSkillBook = (charId: string) => {
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      if (!charData || (prev.items.skillBook || 0) <= 0) return {};
      
      const currentSkillLv = charData.skillLevel || 1;
      if (currentSkillLv >= 5) return {};
      
      return {
        items: { ...prev.items, skillBook: prev.items.skillBook - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, skillLevel: currentSkillLv + 1 } }
      };
    });
  };

  const setTeam = (newTeam: string[]) => mutateAndSave({ team: newTeam });

  const clearStage = (stageId: string, moneyReward: number, yPointReward: number) => {
    let didClear = false;
    mutateAndSave(prev => {
      const newCleared = prev.clearedStages.includes(stageId)
        ? prev.clearedStages
        : [...prev.clearedStages, stageId];
      
      const dropChance = Math.random();
      const newItems = { ...prev.items };
      if (dropChance > 0.7) newItems.expSmall = (newItems.expSmall || 0) + 1;
      if (dropChance > 0.95) newItems.expLarge = (newItems.expLarge || 0) + 1;
      
      didClear = true;
      return {
        money: prev.money + moneyReward,
        yPoints: prev.yPoints + yPointReward,
        maxClearedStageId: stageId,
        clearedStages: newCleared,
        items: newItems,
      };
    });
    if (didClear) setTimeout(() => trackMission('complete_stage', 1), 0);
  };

  const trackMission = (type: string, amount: number = 1) => {
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

  return (
    <GameContext.Provider value={{
      ...data,
      uid,
      loading,
      addMoney,
      addYPoints,
      unlockCharacter,
      unlockAllCharacters,
      unlockAllStages,
      addMaxItems,
      upgradeCharacter,
      consumeExpItem,
      consumeSkillBook,
      setTeam,
      clearStage,
      trackMission,
      claimMission,
      recordGachaResult,
    }}>
      {children}
    </GameContext.Provider>
  );
};
