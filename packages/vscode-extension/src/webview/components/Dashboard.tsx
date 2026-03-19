import React, { useMemo } from 'react';
import type { ChalkSkill, Phase, ProgressionState } from '../../types';
import { getPhaseInfo, PHASES, PLAYER_LEVELS, SKILL_LEVELS } from '../../types';
import { getPlayerLevelInfo, getSkillLevelTitle } from '../hooks/useProgression';
import { ProgressRing } from './ProgressRing';
import { AchievementBadge } from './AchievementBadge';
import { ACHIEVEMENTS } from '../../progression';

interface Props {
  skills: ChalkSkill[];
  progression: ProgressionState | null;
}

function RadarChart({ skills, progression }: { skills: ChalkSkill[]; progression: ProgressionState | null }) {
  const mainPhases: Phase[] = ['foundation', 'design', 'architecture', 'engineering', 'development', 'launch'];
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 80;

  const phaseData = mainPhases.map((phase, i) => {
    const total = skills.filter(s => s.phase === phase).length;
    const used = skills.filter(s => s.phase === phase && progression?.skillUsage[s.id]).length;
    const ratio = total > 0 ? used / total : 0;
    const angle = (Math.PI * 2 * i) / mainPhases.length - Math.PI / 2;

    return {
      phase,
      ratio,
      x: cx + maxR * ratio * Math.cos(angle),
      y: cy + maxR * ratio * Math.sin(angle),
      labelX: cx + (maxR + 16) * Math.cos(angle),
      labelY: cy + (maxR + 16) * Math.sin(angle),
      axisX: cx + maxR * Math.cos(angle),
      axisY: cy + maxR * Math.sin(angle),
    };
  });

  const points = phaseData.map(d => `${d.x},${d.y}`).join(' ');

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {rings.map(r => {
        const ringPoints = mainPhases.map((_, i) => {
          const angle = (Math.PI * 2 * i) / mainPhases.length - Math.PI / 2;
          return `${cx + maxR * r * Math.cos(angle)},${cy + maxR * r * Math.sin(angle)}`;
        }).join(' ');
        return <polygon key={r} points={ringPoints} className="radar-grid" />;
      })}

      {/* Axes */}
      {phaseData.map((d, i) => (
        <line key={i} x1={cx} y1={cy} x2={d.axisX} y2={d.axisY} className="radar-axis" />
      ))}

      {/* Data area */}
      <polygon points={points} className="radar-area" />

      {/* Dots */}
      {phaseData.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={3} className="radar-dot" />
      ))}

      {/* Labels */}
      {phaseData.map((d, i) => (
        <text
          key={i}
          x={d.labelX}
          y={d.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={getPhaseInfo(d.phase).color}
          fontSize="9"
          fontWeight="bold"
        >
          {getPhaseInfo(d.phase).icon}
        </text>
      ))}
    </svg>
  );
}

export function Dashboard({ skills, progression }: Props) {
  if (!progression) {
    return <div className="p-8 text-center text-gray-500">Loading progression data...</div>;
  }

  const levelInfo = getPlayerLevelInfo(progression);
  const discoveredCount = Object.keys(progression.skillUsage).length;
  const totalUsages = Object.values(progression.skillUsage).reduce((s, u) => s + u.usageCount, 0);

  const topSkills = useMemo(() => {
    return Object.values(progression.skillUsage)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10);
  }, [progression]);

  const maxUsage = topSkills[0]?.usageCount ?? 1;

  return (
    <div className="p-4 space-y-6">
      {/* Player Profile */}
      <div className="bg-surface-light rounded-2xl p-6 flex items-center gap-6">
        <ProgressRing
          progress={levelInfo.progress}
          size={80}
          strokeWidth={6}
          label={`Lv.${progression.playerLevel}`}
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-xp-bar">{levelInfo.current.title}</h1>
          <div className="text-sm text-gray-400 mt-1">
            {progression.totalXp.toLocaleString()} XP
            {levelInfo.next && (
              <span className="text-gray-600"> / {levelInfo.next.xpRequired.toLocaleString()} XP</span>
            )}
          </div>
          <div className="xp-bar mt-2 h-2">
            <div className="xp-bar-fill" style={{ width: `${levelInfo.progress * 100}%` }} />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span>{discoveredCount} / {skills.length} discovered</span>
            <span>{totalUsages} total uses</span>
            <span>{progression.unlockedAchievements.length} / {ACHIEVEMENTS.length} achievements</span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-surface-light rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Phase Coverage</h3>
          <div className="flex justify-center">
            <RadarChart skills={skills} progression={progression} />
          </div>
        </div>

        {/* Top Skills Leaderboard */}
        <div className="bg-surface-light rounded-2xl p-6">
          <h3 className="text-sm font-bold text-gray-300 mb-3">Most Used Skills</h3>
          {topSkills.length === 0 ? (
            <div className="text-center text-gray-600 py-8">No skills used yet. Start exploring!</div>
          ) : (
            <div className="space-y-2">
              {topSkills.map((usage, i) => {
                const skill = skills.find(s => s.id === usage.skillId);
                if (!skill) return null;
                const barWidth = (usage.usageCount / maxUsage) * 100;

                return (
                  <div key={usage.skillId} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-5 text-right">#{i + 1}</span>
                    <div className="flex-1 relative">
                      <div
                        className="absolute inset-0 rounded opacity-20"
                        style={{
                          width: `${barWidth}%`,
                          background: getPhaseInfo(skill.phase).color,
                        }}
                      />
                      <div className="relative px-2 py-1 flex items-center justify-between">
                        <span className="text-xs font-medium">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">
                            {getSkillLevelTitle(usage.level)}
                          </span>
                          <span className="text-[10px] text-xp-bar font-bold">
                            {usage.usageCount}x
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-surface-light rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-300 mb-3">
          Achievements ({progression.unlockedAchievements.length} / {ACHIEVEMENTS.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map(a => (
            <AchievementBadge
              key={a.id}
              id={a.id}
              name={a.name}
              description={a.description}
              icon={a.icon}
              category={a.category}
              unlocked={progression.unlockedAchievements.includes(a.id)}
            />
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-surface-light rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-300 mb-3">Recent Activity</h3>
        {progression.activityLog.length === 0 ? (
          <div className="text-center text-gray-600 py-4">No activity yet</div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {progression.activityLog.slice(0, 20).map((entry, i) => {
              const skill = skills.find(s => s.id === entry.skillId);
              const time = new Date(entry.timestamp);
              return (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600 w-24 shrink-0">
                    {time.toLocaleDateString()} {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={entry.wasDiscovery ? 'text-xp-bar font-bold' : 'text-gray-300'}>
                    {entry.wasDiscovery ? 'Discovered' : 'Used'} {skill?.name ?? entry.skillId}
                  </span>
                  <span className="text-xp-bar ml-auto">+{entry.xpEarned} XP</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skills Per Phase */}
      <div className="bg-surface-light rounded-2xl p-6">
        <h3 className="text-sm font-bold text-gray-300 mb-3">Skills by Phase</h3>
        <div className="space-y-2">
          {PHASES.filter(p => skills.some(s => s.phase === p.id)).map(p => {
            const total = skills.filter(s => s.phase === p.id).length;
            const discovered = skills.filter(s => s.phase === p.id && progression.skillUsage[s.id]).length;

            return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-sm w-28" style={{ color: p.color }}>{p.icon} {p.label}</span>
                <div className="flex-1 xp-bar h-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(discovered / total) * 100}%`,
                      background: p.color,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-12 text-right">{discovered}/{total}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
