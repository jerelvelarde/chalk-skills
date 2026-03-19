// ── Skill Types ──

export type Phase =
  | 'foundation'
  | 'design'
  | 'architecture'
  | 'engineering'
  | 'development'
  | 'launch'
  | 'reference'
  | 'uncategorized';

export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';

export type Rarity = 'common' | 'rare' | 'epic';

export interface ChalkSkill {
  id: string;
  name: string;
  description: string;
  owner: 'chalk' | 'project';
  version: string;
  metadataVersion: 1 | 2;
  allowedTools: string[];
  argumentHint?: string;
  capabilities: string[];
  activationIntents: string[];
  activationEvents: string[];
  activationArtifacts: string[];
  riskLevel: RiskLevel;
  rarity: Rarity;
  phase: Phase;
  filePath: string;
  bodyMarkdown: string;
}

// ── Phase Metadata ──

export interface PhaseInfo {
  id: Phase;
  label: string;
  color: string;
  icon: string;
  order: number;
}

export const PHASES: PhaseInfo[] = [
  { id: 'foundation', label: 'Foundation', color: '#64748b', icon: '\u{1F6E1}', order: 0 },
  { id: 'design', label: 'Design', color: '#8b5cf6', icon: '\u{1F3A8}', order: 1 },
  { id: 'architecture', label: 'Architecture', color: '#06b6d4', icon: '\u{1F3D7}', order: 2 },
  { id: 'engineering', label: 'Engineering', color: '#f59e0b', icon: '\u{1F527}', order: 3 },
  { id: 'development', label: 'Development', color: '#22c55e', icon: '\u{1F4BB}', order: 4 },
  { id: 'launch', label: 'Launch', color: '#f97316', icon: '\u{1F680}', order: 5 },
  { id: 'reference', label: 'Reference', color: '#6366f1', icon: '\u{1F4DA}', order: 6 },
  { id: 'uncategorized', label: 'Uncategorized', color: '#6b7280', icon: '\u{1F4C1}', order: 7 },
];

export function getPhaseInfo(phase: Phase): PhaseInfo {
  return PHASES.find(p => p.id === phase) ?? PHASES[PHASES.length - 1];
}

// ── Rarity Mapping ──

export function riskToRarity(risk: RiskLevel): Rarity {
  switch (risk) {
    case 'high': return 'epic';
    case 'medium': return 'rare';
    default: return 'common';
  }
}

// ── Gamification Types ──

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface SkillLevelInfo {
  level: SkillLevel;
  title: string;
  usesRequired: number;
}

export const SKILL_LEVELS: SkillLevelInfo[] = [
  { level: 1, title: 'Novice', usesRequired: 1 },
  { level: 2, title: 'Apprentice', usesRequired: 5 },
  { level: 3, title: 'Adept', usesRequired: 15 },
  { level: 4, title: 'Expert', usesRequired: 30 },
  { level: 5, title: 'Master', usesRequired: 50 },
];

export interface PlayerLevelInfo {
  level: number;
  title: string;
  xpRequired: number;
}

export const PLAYER_LEVELS: PlayerLevelInfo[] = [
  { level: 1, title: 'Chalk Novice', xpRequired: 0 },
  { level: 2, title: 'Chalk Apprentice', xpRequired: 500 },
  { level: 3, title: 'Chalk Journeyman', xpRequired: 1500 },
  { level: 4, title: 'Chalk Adept', xpRequired: 3500 },
  { level: 5, title: 'Chalk Expert', xpRequired: 7000 },
  { level: 6, title: 'Chalk Master', xpRequired: 12000 },
  { level: 7, title: 'Chalk Grandmaster', xpRequired: 20000 },
];

export interface SkillUsageRecord {
  skillId: string;
  usageCount: number;
  totalXp: number;
  level: SkillLevel;
  firstUsed: number;
  lastUsed: number;
}

export interface ActivityEntry {
  skillId: string;
  timestamp: number;
  xpEarned: number;
  wasDiscovery: boolean;
}

export interface ProgressionState {
  version: 1;
  totalXp: number;
  playerLevel: number;
  skillUsage: Record<string, SkillUsageRecord>;
  unlockedAchievements: string[];
  activityLog: ActivityEntry[];
  firstSeenTimestamp: number;
}

export type AchievementCategory = 'discovery' | 'mastery' | 'breadth' | 'milestone';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  check: (state: ProgressionState, skills: ChalkSkill[]) => boolean;
}

// ── Messaging Protocol ──

export type ExtensionMessage =
  | { type: 'skills:loaded'; payload: ChalkSkill[] }
  | { type: 'progression:loaded'; payload: ProgressionState }
  | { type: 'skill:updated'; payload: ChalkSkill }
  | { type: 'achievement:unlocked'; payload: { id: string; name: string; icon: string; xpReward: number } };

export type WebviewMessage =
  | { type: 'request:skills' }
  | { type: 'request:progression' }
  | { type: 'record:usage'; payload: { skillId: string } }
  | { type: 'navigate:skill'; payload: { skillId: string } }
  | { type: 'open:skillFile'; payload: { filePath: string } };
