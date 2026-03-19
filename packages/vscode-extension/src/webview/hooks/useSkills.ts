import { useState, useCallback } from 'react';
import type { ChalkSkill, ProgressionState } from '../../types';
import { useOnMessage, useRequestData } from './useMessages';

export function useSkills() {
  const [skills, setSkills] = useState<ChalkSkill[]>([]);
  const [progression, setProgression] = useState<ProgressionState | null>(null);
  const [lastAchievement, setLastAchievement] = useState<{ id: string; name: string; icon: string; xpReward: number } | null>(null);

  useRequestData();

  useOnMessage(useCallback((msg) => {
    switch (msg.type) {
      case 'skills:loaded':
        setSkills(msg.payload);
        break;
      case 'progression:loaded':
        setProgression(msg.payload);
        break;
      case 'achievement:unlocked':
        setLastAchievement(msg.payload);
        setTimeout(() => setLastAchievement(null), 5000);
        break;
    }
  }, []));

  return { skills, progression, lastAchievement };
}
