import React, { useMemo, useState } from 'react';
import type { ChalkSkill, Phase, ProgressionState, Rarity } from '../../types';
import { getPhaseInfo } from '../../types';
import { SkillCard } from './SkillCard';
import { DEFAULT_FILTERS, FilterBar, Filters } from './FilterBar';
import { postMessage } from '../vscode-api';

interface Props {
  skills: ChalkSkill[];
  progression: ProgressionState | null;
  focusSkillId?: string;
}

const RARITY_ORDER: Record<Rarity, number> = { common: 0, rare: 1, epic: 2 };

export function SkillInventory({ skills, progression, focusSkillId }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(focusSkillId ?? null);

  const discoveredIds = new Set(Object.keys(progression?.skillUsage ?? {}));

  const filtered = useMemo(() => {
    let result = [...skills];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
      );
    }
    if (filters.phases.length > 0) {
      result = result.filter(s => filters.phases.includes(s.phase));
    }
    if (filters.rarities.length > 0) {
      result = result.filter(s => filters.rarities.includes(s.rarity));
    }
    if (filters.owner !== 'all') {
      result = result.filter(s => s.owner === filters.owner);
    }

    switch (filters.sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'phase':
        result.sort((a, b) => getPhaseInfo(a.phase).order - getPhaseInfo(b.phase).order || a.name.localeCompare(b.name));
        break;
      case 'rarity':
        result.sort((a, b) => RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] || a.name.localeCompare(b.name));
        break;
      case 'level': {
        const usage = progression?.skillUsage ?? {};
        result.sort((a, b) => (usage[b.id]?.level ?? 0) - (usage[a.id]?.level ?? 0) || a.name.localeCompare(b.name));
        break;
      }
      case 'version':
        result.sort((a, b) => b.version.localeCompare(a.version) || a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [skills, filters, progression]);

  const handleRecordUsage = (skillId: string) => {
    postMessage({ type: 'record:usage', payload: { skillId } });
  };

  const handleOpenFile = (filePath: string) => {
    postMessage({ type: 'open:skillFile', payload: { filePath } });
  };

  return (
    <div className="p-4">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={skills.length}
        discoveredCount={discoveredIds.size}
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {filtered.map(skill => (
          <div key={skill.id} className="flex justify-center">
            <SkillCard
              skill={skill}
              progression={progression}
              discovered={discoveredIds.has(skill.id)}
              onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
              onRecordUsage={() => handleRecordUsage(skill.id)}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No skills match your filters
        </div>
      )}

      {/* Skill Detail Drawer */}
      {selectedSkill && (() => {
        const skill = skills.find(s => s.id === selectedSkill);
        if (!skill) return null;
        const usage = progression?.skillUsage[skill.id];

        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelectedSkill(null)}>
            <div
              className="bg-surface-light rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{skill.name}</h2>
                <button onClick={() => setSelectedSkill(null)} className="text-gray-400 hover:text-white">
                  X
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">{skill.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="bg-black/20 p-2 rounded">
                  <span className="text-gray-500">Phase</span>
                  <div style={{ color: getPhaseInfo(skill.phase).color }}>
                    {getPhaseInfo(skill.phase).icon} {getPhaseInfo(skill.phase).label}
                  </div>
                </div>
                <div className="bg-black/20 p-2 rounded">
                  <span className="text-gray-500">Rarity</span>
                  <div className={skill.rarity === 'epic' ? 'text-purple-400' : skill.rarity === 'rare' ? 'text-blue-400' : 'text-gray-300'}>
                    {skill.rarity.charAt(0).toUpperCase() + skill.rarity.slice(1)}
                  </div>
                </div>
                <div className="bg-black/20 p-2 rounded">
                  <span className="text-gray-500">Version</span>
                  <div>v{skill.version}</div>
                </div>
                <div className="bg-black/20 p-2 rounded">
                  <span className="text-gray-500">Uses</span>
                  <div>{usage?.usageCount ?? 0}</div>
                </div>
              </div>

              {skill.capabilities.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Capabilities</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.capabilities.map(c => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {skill.allowedTools.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Allowed Tools</div>
                  <div className="flex flex-wrap gap-1">
                    {skill.allowedTools.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  className="flex-1 py-2 text-sm rounded-lg bg-xp-bar/20 text-xp-bar hover:bg-xp-bar/30 transition-colors"
                  onClick={() => handleRecordUsage(skill.id)}
                >
                  + Record Usage
                </button>
                <button
                  className="flex-1 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  onClick={() => handleOpenFile(skill.filePath)}
                >
                  Open SKILL.md
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
