import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { ChalkSkill, RiskLevel, riskToRarity } from './types';
import { classifyPhase } from './phase-classifier';
import { loadPhaseIndex } from './skill-indexer';

function parseCommaSeparated(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function toDisplayName(kebab: string): string {
  return kebab
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseSkillFile(filePath: string, phaseIndex: Map<string, string>): ChalkSkill | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    const name = data.name as string;
    if (!name) return null;

    const riskLevel = (data['risk-level'] as RiskLevel) ?? 'unknown';
    const metadataVersion = data['metadata-version'] === '2' ? 2 : 1;

    const indexPhase = phaseIndex.get(name);
    const phase = indexPhase
      ? (indexPhase as ChalkSkill['phase'])
      : classifyPhase(name, parseCommaSeparated(data.capabilities));

    return {
      id: name,
      name: toDisplayName(name),
      description: (data.description as string) ?? '',
      owner: (data.owner as 'chalk' | 'project') ?? 'chalk',
      version: (data.version as string) ?? '0.0.0',
      metadataVersion,
      allowedTools: parseCommaSeparated(data['allowed-tools']),
      argumentHint: data['argument-hint'] as string | undefined,
      capabilities: parseCommaSeparated(data.capabilities),
      activationIntents: parseCommaSeparated(data['activation-intents']),
      activationEvents: parseCommaSeparated(data['activation-events']),
      activationArtifacts: parseCommaSeparated(data['activation-artifacts']),
      riskLevel,
      rarity: riskToRarity(riskLevel),
      phase,
      filePath,
      bodyMarkdown: content,
    };
  } catch {
    return null;
  }
}

export function discoverSkillDirs(rootPath: string): string[] {
  const dirs: string[] = [];

  // Check skills/ directory (chalk-skills repo)
  const skillsDir = path.join(rootPath, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const skillFile = path.join(skillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          dirs.push(skillFile);
        }
      }
    }
  }

  // Check .chalk/skills/ directory (project-level skills)
  const chalkSkillsDir = path.join(rootPath, '.chalk', 'skills');
  if (fs.existsSync(chalkSkillsDir)) {
    for (const entry of fs.readdirSync(chalkSkillsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const skillFile = path.join(chalkSkillsDir, entry.name, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          dirs.push(skillFile);
        }
      }
    }
  }

  return dirs;
}

export function loadAllSkills(rootPath: string): ChalkSkill[] {
  const indexPath = path.join(rootPath, 'skills', 'skills-index.yaml');
  const phaseIndex = loadPhaseIndex(indexPath);
  const skillFiles = discoverSkillDirs(rootPath);

  const skills: ChalkSkill[] = [];
  for (const filePath of skillFiles) {
    const skill = parseSkillFile(filePath, phaseIndex);
    if (skill) {
      skills.push(skill);
    }
  }

  return skills.sort((a, b) => a.id.localeCompare(b.id));
}
