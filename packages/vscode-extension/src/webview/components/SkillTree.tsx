import React, { useMemo, useState } from 'react';
import type { ChalkSkill, Phase, PhaseInfo, ProgressionState } from '../../types';
import { PHASES } from '../../types';
import { getColumnHeight, HEADER_HEIGHT, NODE_GAP, NODE_RADIUS, PhaseColumn } from './PhaseColumn';
import { postMessage } from '../vscode-api';

interface Props {
  skills: ChalkSkill[];
  progression: ProgressionState | null;
}

const COLUMN_WIDTH = 220;
const COLUMN_PADDING = 60;

export function SkillTree({ skills, progression }: Props) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const phaseGroups = useMemo(() => {
    const grouped = new Map<Phase, ChalkSkill[]>();
    for (const skill of skills) {
      const existing = grouped.get(skill.phase) ?? [];
      existing.push(skill);
      grouped.set(skill.phase, existing);
    }

    return PHASES
      .filter(p => grouped.has(p.id))
      .map(p => ({
        phase: p,
        skills: grouped.get(p.id)!.sort((a, b) => a.id.localeCompare(b.id)),
      }));
  }, [skills]);

  const maxSkills = Math.max(...phaseGroups.map(g => g.skills.length), 1);
  const svgHeight = getColumnHeight(maxSkills) + 40;
  const svgWidth = phaseGroups.length * (COLUMN_WIDTH + COLUMN_PADDING) + COLUMN_PADDING;

  const handleSkillClick = (skillId: string) => {
    postMessage({ type: 'record:usage', payload: { skillId } });
  };

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-lg font-bold mb-4 text-xp-bar">Skill Tree</h2>
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '80vh' }}>
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="min-w-full"
        >
          {/* Phase connector lines */}
          {phaseGroups.map((group, i) => {
            if (i === 0) return null;
            const x1 = COLUMN_PADDING + (i - 1) * (COLUMN_WIDTH + COLUMN_PADDING);
            const x2 = COLUMN_PADDING + i * (COLUMN_WIDTH + COLUMN_PADDING);
            const midY = svgHeight / 2;

            return (
              <path
                key={`connector-${i}`}
                d={`M ${x1 + 30} ${midY} C ${(x1 + x2) / 2} ${midY}, ${(x1 + x2) / 2} ${midY}, ${x2 - 30} ${midY}`}
                fill="none"
                stroke="#2a2a4a"
                strokeWidth={2}
                className="phase-connector"
              />
            );
          })}

          {/* Phase columns */}
          {phaseGroups.map((group, i) => {
            const x = COLUMN_PADDING + i * (COLUMN_WIDTH + COLUMN_PADDING);
            return (
              <PhaseColumn
                key={group.phase.id}
                phase={group.phase}
                skills={group.skills}
                progression={progression}
                x={x}
                onSkillClick={handleSkillClick}
                hoveredSkill={hoveredSkill}
                onHover={setHoveredSkill}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
