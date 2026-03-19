import { Phase } from './types';

/**
 * Static classification for skills not found in skills-index.yaml.
 * Uses name prefix patterns and capability namespaces.
 */

const PREFIX_RULES: [RegExp, Phase][] = [
  // Reference: framework-specific patterns
  [/^react-/, 'reference'],
  [/^flutter-/, 'reference'],
  [/^nextjs-/, 'reference'],
  [/^python-/, 'reference'],
  [/^fastapi-/, 'reference'],
  [/^tailwind-/, 'reference'],
  [/^typescript-/, 'reference'],
  [/^graphql-/, 'reference'],
  [/^prisma-/, 'reference'],

  // Foundation
  [/^setup-/, 'foundation'],
  [/^create-doc$/, 'foundation'],
  [/^update-doc$/, 'foundation'],
  [/^create-plan$/, 'foundation'],
  [/^create-review$/, 'foundation'],
  [/^create-handoff$/, 'foundation'],
  [/^create-onboarding/, 'foundation'],
  [/^create-retro$/, 'foundation'],
  [/^create-decision-log$/, 'foundation'],
  [/^triage-bugs$/, 'foundation'],
  [/^project-skill-creator$/, 'foundation'],
  [/^product-context-docs$/, 'foundation'],
  [/^simplify$/, 'foundation'],

  // Design & Specification
  [/^create-prd$/, 'design'],
  [/^review-prd$/, 'design'],
  [/^create-user-stories$/, 'design'],
  [/^create-jtbd-canvas$/, 'design'],
  [/^create-interview-guide$/, 'design'],
  [/^synthesize-research$/, 'design'],
  [/^synthesize-feedback$/, 'design'],
  [/^create-shape-up-pitch$/, 'design'],
  [/^score-backlog$/, 'design'],
  [/^analyze-competitors$/, 'design'],
  [/^create-experiment-design$/, 'design'],
  [/^create-roadmap$/, 'design'],
  [/^create-metrics-framework$/, 'design'],
  [/^create-gtm-brief$/, 'design'],
  [/^analyze-metrics$/, 'design'],
  [/^create-stakeholder-update$/, 'design'],
  [/^create-ost$/, 'design'],

  // Architecture & Technical Design
  [/^create-adr$/, 'architecture'],
  [/^create-rfc$/, 'architecture'],
  [/^create-api-design$/, 'architecture'],
  [/^create-data-model$/, 'architecture'],
  [/^create-threat-model$/, 'architecture'],

  // Engineering Handoff & Planning
  [/^create-estimation$/, 'engineering'],
  [/^create-test-plan$/, 'engineering'],
  [/^create-feature-flag-plan$/, 'engineering'],
  [/^audit-/, 'engineering'],
  [/^validate-/, 'engineering'],
  [/^analyze-dependencies$/, 'engineering'],

  // Development & Delivery
  [/^create-pr/, 'development'],
  [/^review-code$/, 'development'],
  [/^review-changes$/, 'development'],
  [/^commit$/, 'development'],
  [/^create-commit-message$/, 'development'],
  [/^create-bug-report$/, 'development'],
  [/^create-github-issue$/, 'development'],
  [/^debug-/, 'development'],
  [/^manage-tech-debt$/, 'development'],
  [/^fix-/, 'development'],
  [/^capture-pr-visuals$/, 'development'],
  [/^work-issue$/, 'development'],

  // Launch & Release
  [/^create-release-/, 'launch'],
  [/^create-rollback-plan$/, 'launch'],
  [/^create-runbook$/, 'launch'],
  [/^create-incident-report$/, 'launch'],
  [/^create-postmortem$/, 'launch'],
  [/^create-changelog$/, 'launch'],
];

const CAPABILITY_NAMESPACE_MAP: Record<string, Phase> = {
  'docs': 'foundation',
  'review': 'foundation',
  'planning': 'foundation',
  'skills': 'foundation',
  'chalk': 'foundation',
};

export function classifyPhase(skillName: string, capabilities: string[]): Phase {
  // Try prefix rules first
  for (const [pattern, phase] of PREFIX_RULES) {
    if (pattern.test(skillName)) {
      return phase;
    }
  }

  // Try capability namespace fallback
  for (const cap of capabilities) {
    const ns = cap.split('.')[0];
    if (ns && CAPABILITY_NAMESPACE_MAP[ns]) {
      return CAPABILITY_NAMESPACE_MAP[ns];
    }
  }

  return 'uncategorized';
}
