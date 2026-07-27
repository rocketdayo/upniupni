const fs = require('fs');

let content = fs.readFileSync('src/store/GameContext.tsx', 'utf-8');

const targetStr = `  const addMoney = (amount: number) => mutateAndSave({ money: data.money + amount });
  const addYPoints = (amount: number) => mutateAndSave({ yPoints: data.yPoints + amount });`;

const replaceStr = `  const addMoney = (amount: number) => mutateAndSave(prev => ({ money: prev.money + amount }));
  const addYPoints = (amount: number) => mutateAndSave(prev => ({ yPoints: prev.yPoints + amount }));`;

content = content.replace(targetStr, replaceStr);

content = content.replace(/  const unlockCharacter = \(charId: string\) => \{[\s\S]*?    \}\n  \};\n/, `  const unlockCharacter = (charId: string) => {
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
  };\n`);

content = content.replace(/  const upgradeCharacter = \(charId: string, moneyCost: number\) => \{[\s\S]*?    \}\n  \};\n/, `  const upgradeCharacter = (charId: string, moneyCost: number) => {
    let leveledUp = false;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      if (prev.money >= moneyCost && charData) {
        leveledUp = true;
        return {
          money: prev.money - moneyCost,
          characters: {
            ...prev.characters,
            [charId]: { ...charData, level: charData.level + 1 }
          }
        };
      }
      return {};
    });
    if (leveledUp) setTimeout(() => trackMission('level_up', 1), 0);
  };\n`);

content = content.replace(/  const useExpItem = \(charId: string, itemType: 'expSmall' \| 'expLarge'\) => \{[\s\S]*?    \}\);\n    trackMission\('level_up', newLevel - charData\.level\);\n  \};\n/, `  const useExpItem = (charId: string, itemType: 'expSmall' | 'expLarge') => {
    let levelsGained = 0;
    mutateAndSave(prev => {
      const charData = prev.characters[charId];
      const charDef = CHARACTERS.find(c => c.id === charId);
      if (!charData || !charDef || (prev.items[itemType] || 0) <= 0) return {};
      
      const levelGain = itemType === 'expSmall' ? 1 : 5;
      const limitBonus = (charData.limitBreak || 0) * 10;
      const maxLv = { SS: 60, S: 50, A: 40, B: 30, C: 25, D: 20, E: 10 }[charDef.rank] + limitBonus;
      const newLevel = Math.min(maxLv, charData.level + levelGain);
      
      if (newLevel <= charData.level) return {};
      
      levelsGained = newLevel - charData.level;
      return {
        items: { ...prev.items, [itemType]: prev.items[itemType] - 1 },
        characters: { ...prev.characters, [charId]: { ...charData, level: newLevel } }
      };
    });
    if (levelsGained > 0) setTimeout(() => trackMission('level_up', levelsGained), 0);
  };\n`);

content = content.replace(/  const useSkillBook = \(charId: string\) => \{[\s\S]*?    \}\);\n  \};\n/, `  const useSkillBook = (charId: string) => {
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
  };\n`);

content = content.replace(/  const setTeam = \(newTeam: string\[\]\) => mutateAndSave\(\{ team: newTeam \}\);\n/, `  const setTeam = (newTeam: string[]) => mutateAndSave({ team: newTeam });\n`);

content = content.replace(/  const clearStage = \(stageId: string, moneyReward: number, yPointReward: number\) => \{[\s\S]*?    trackMission\('complete_stage', 1\);\n  \};\n/, `  const clearStage = (stageId: string, moneyReward: number, yPointReward: number) => {
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
  };\n`);

content = content.replace(/  const trackMission = \(type: string, amount: number = 1\) => \{[\s\S]*?    \}\);\n    mutateAndSave\(\{ missionProgress: newProgress \}\);\n  \};\n/, `  const trackMission = (type: string, amount: number = 1) => {
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
  };\n`);

content = content.replace(/  const claimMission = \(missionId: string\) => \{[\s\S]*?    \}\);\n  \};\n/, `  const claimMission = (missionId: string) => {
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
  };\n`);

content = content.replace(/  const recordGachaResult = \(charIds: string\[\], newPityCount: number, newStepUpCount: number\) => \{[\s\S]*?    \}\);\n  \};\n/, `  const recordGachaResult = (charIds: string[], newPityCount: number, newStepUpCount: number) => {
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
  };\n`);

fs.writeFileSync('src/store/GameContext.tsx', content);
