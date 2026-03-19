import React from 'react';
import type { ChalkSkill, ProgressionState } from '../../types';
import { getPhaseInfo } from '../../types';
import { getSkillLevelProgress, getSkillLevelTitle } from '../hooks/useProgression';

interface Props {
  skill: ChalkSkill;
  progression: ProgressionState | null;
  discovered: boolean;
  onClick?: () => void;
  onRecordUsage?: () => void;
}

/** Deterministic hash for generating unique geometric art per skill */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function GeometricArt({ skillId, color }: { skillId: string; color: string }) {
  const h = hashCode(skillId);
  const shapes: React.ReactNode[] = [];

  for (let i = 0; i < 5; i++) {
    const seed = hashCode(skillId + i);
    const cx = 10 + (seed % 60);
    const cy = 10 + ((seed >> 4) % 60);
    const r = 8 + (seed % 20);
    const opacity = 0.15 + (seed % 30) / 100;
    const type = seed % 3;

    if (type === 0) {
      shapes.push(
        <circle key={i} cx={cx} cy={cy} r={r} fill={color} opacity={opacity} />,
      );
    } else if (type === 1) {
      shapes.push(
        <rect
          key={i}
          x={cx - r / 2}
          y={cy - r / 2}
          width={r}
          height={r}
          fill={color}
          opacity={opacity}
          transform={`rotate(${seed % 45}, ${cx}, ${cy})`}
        />,
      );
    } else {
      const points = `${cx},${cy - r} ${cx + r * 0.87},${cy + r * 0.5} ${cx - r * 0.87},${cy + r * 0.5}`;
      shapes.push(
        <polygon key={i} points={points} fill={color} opacity={opacity} />,
      );
    }
  }

  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      {shapes}
    </svg>
  );
}

export function SkillCard({ skill, progression, discovered, onClick, onRecordUsage }: Props) {
  const phaseInfo = getPhaseInfo(skill.phase);
  const usage = progression?.skillUsage[skill.id];
  const level = usage?.level ?? 0;
  const usageCount = usage?.usageCount ?? 0;
  const levelTitle = level > 0 ? getSkillLevelTitle(level) : 'Undiscovered';
  const levelProgress = level > 0 ? getSkillLevelProgress(usageCount, level) : 0;

  const rarityClass =
    skill.rarity === 'epic' ? 'card-epic holographic' :
    skill.rarity === 'rare' ? 'card-rare' :
    'card-common';

  if (!discovered) {
    return (
      <div
        className="w-[280px] h-[380px] rounded-xl bg-card-bg border-2 border-gray-800 flex flex-col items-center justify-center gap-3 cursor-pointer opacity-50 card-tilt"
        onClick={onClick}
      >
        <div className="text-5xl opacity-30">?</div>
        <div className="text-sm text-gray-600">{skill.name}</div>
        <div className="text-xs text-gray-700">Undiscovered</div>
      </div>
    );
  }

  return (
    <div
      className={`w-[280px] h-[380px] rounded-xl bg-card-bg flex flex-col overflow-hidden cursor-pointer card-tilt ${rarityClass}`}
      onClick={onClick}
    >
      {/* Phase Header */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ background: `${phaseInfo.color}30` }}
      >
        <span className="text-lg font-bold truncate">{skill.name}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-black/30">
          v{skill.version}
        </span>
      </div>

      {/* Geometric Art */}
      <div className="card-art" style={{ background: `${phaseInfo.color}10` }}>
        <GeometricArt skillId={skill.id} color={phaseInfo.color} />
      </div>

      {/* Description */}
      <div className="px-4 py-2 flex-1">
        <p className="text-xs text-gray-400 line-clamp-3">{skill.description}</p>
      </div>

      {/* Capability Tags */}
      <div className="px-4 pb-2 flex flex-wrap gap-1">
        {skill.capabilities.slice(0, 3).map(cap => (
          <span
            key={cap}
            className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300"
          >
            {cap}
          </span>
        ))}
        {skill.capabilities.length > 3 && (
          <span className="text-[10px] text-gray-500">+{skill.capabilities.length - 3}</span>
        )}
      </div>

      {/* Stats Row */}
      <div className="px-4 pb-2 flex items-center gap-2 text-[10px]">
        <span
          className="px-1.5 py-0.5 rounded"
          style={{ background: `${phaseInfo.color}30`, color: phaseInfo.color }}
        >
          {phaseInfo.icon} {phaseInfo.label}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
          {skill.owner}
        </span>
        {skill.allowedTools.length > 0 && (
          <span className="text-gray-500 ml-auto">
            {skill.allowedTools.length} tools
          </span>
        )}
      </div>

      {/* XP Bar Footer */}
      <div className="px-4 pb-3 pt-1 border-t border-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold" style={{ color: phaseInfo.color }}>
            {levelTitle}
          </span>
          {usage && (
            <span className="text-[10px] text-gray-500">
              {usageCount} uses
            </span>
          )}
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${levelProgress * 100}%` }} />
        </div>
        {onRecordUsage && (
          <button
            className="mt-2 w-full text-[10px] py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
            onClick={(e) => { e.stopPropagation(); onRecordUsage(); }}
          >
            + Record Usage
          </button>
        )}
      </div>
    </div>
  );
}
