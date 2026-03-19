import React, { useState } from 'react';
import { useSkills } from './hooks/useSkills';
import { Dashboard } from './components/Dashboard';
import { SkillInventory } from './components/SkillInventory';
import { SkillTree } from './components/SkillTree';

type Tab = 'dashboard' | 'inventory' | 'skilltree';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '\u{1F3AE}' },
  { id: 'inventory', label: 'Inventory', icon: '\u{1F0CF}' },
  { id: 'skilltree', label: 'Skill Tree', icon: '\u{1F333}' },
];

export function App() {
  const root = document.getElementById('root');
  const initialTab = (root?.dataset.initialTab as Tab) ?? 'dashboard';
  const initialSkill = root?.dataset.initialSkill ?? undefined;

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const { skills, progression, lastAchievement } = useSkills();

  return (
    <div className="min-h-screen bg-surface">
      {/* Achievement Toast */}
      {lastAchievement && (
        <div className="achievement-toast">
          <div className="bg-surface-light border border-xp-bar/40 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
            <span className="text-2xl">{lastAchievement.icon}</span>
            <div>
              <div className="text-sm font-bold text-xp-bar">Achievement Unlocked!</div>
              <div className="text-xs text-gray-300">{lastAchievement.name}</div>
              <div className="text-[10px] text-xp-bar">+{lastAchievement.xpReward} XP</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="flex border-b border-white/10 px-4 sticky top-0 bg-surface z-40">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center text-xs text-gray-500 px-3">
          {skills.length} skills loaded
        </div>
      </nav>

      {/* Content */}
      <main>
        {activeTab === 'dashboard' && (
          <Dashboard skills={skills} progression={progression} />
        )}
        {activeTab === 'inventory' && (
          <SkillInventory
            skills={skills}
            progression={progression}
            focusSkillId={initialSkill}
          />
        )}
        {activeTab === 'skilltree' && (
          <SkillTree skills={skills} progression={progression} />
        )}
      </main>
    </div>
  );
}
