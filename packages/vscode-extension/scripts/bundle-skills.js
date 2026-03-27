#!/usr/bin/env node
/**
 * bundle-skills.js
 *
 * Reads every SKILL.md in ../../skills/ and the skills-index.yaml phase map,
 * then writes a single bundled-skills.json into dist/ that the extension can
 * import at runtime without needing the user's workspace to contain the skills.
 *
 * Run: node scripts/bundle-skills.js
 * Output: dist/bundled-skills.json
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ── Paths ──────────────────────────────────────────────────────────

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const INDEX_PATH = path.join(SKILLS_DIR, 'skills-index.yaml');
const REGISTRY_PATH = path.join(SKILLS_DIR, 'registry.yaml');
const OUT_DIR = path.join(__dirname, '..', 'dist');
const OUT_FILE = path.join(OUT_DIR, 'bundled-skills.json');

// ── Phase index parser (mirrors skill-indexer.ts) ──────────────────

const PHASE_COMMENT_RE = /^#\s*---\s*Phase\s+(\d+):\s*(.+?)\s*---/;
const PHASE_NUMBER_MAP = {
  '0': 'foundation',
  '3': 'design',
  '4': 'architecture',
  '5': 'engineering',
  '6': 'development',
  '8': 'launch',
};

function loadPhaseIndex(indexPath) {
  const phaseMap = new Map();
  if (!fs.existsSync(indexPath)) return phaseMap;

  const lines = fs.readFileSync(indexPath, 'utf-8').split('\n');
  let currentPhase = 'uncategorized';

  for (const line of lines) {
    const phaseMatch = line.match(PHASE_COMMENT_RE);
    if (phaseMatch) {
      currentPhase = PHASE_NUMBER_MAP[phaseMatch[1]] ?? 'uncategorized';
      continue;
    }
    const nameMatch = line.match(/^\s*-\s*name:\s*(.+)/);
    if (nameMatch) {
      phaseMap.set(nameMatch[1].trim(), currentPhase);
    }
  }
  return phaseMap;
}

// ── Helpers (mirror skill-loader.ts) ───────────────────────────────

function parseCommaSeparated(value) {
  if (!value) return [];
  return String(value).split(',').map(s => s.trim()).filter(Boolean);
}

function parseListField(value) {
  if (typeof value === 'string') return parseCommaSeparated(value);
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return [];
}

function toDisplayName(kebab) {
  return kebab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const RISK_TO_RARITY = { high: 'epic', medium: 'rare' };

function parseAnnotations(data, riskLevel) {
  if (
    data['read-only'] !== undefined ||
    data['destructive'] !== undefined ||
    data['idempotent'] !== undefined ||
    data['open-world'] !== undefined
  ) {
    return {
      readOnly: data['read-only'] === true,
      destructive: data['destructive'] === true,
      idempotent: data['idempotent'] === true || data['idempotent'] === undefined,
      openWorld: data['open-world'] === true,
    };
  }
  switch (riskLevel) {
    case 'high': return { readOnly: false, destructive: true, idempotent: false, openWorld: true };
    case 'medium': return { readOnly: false, destructive: false, idempotent: false, openWorld: false };
    case 'low': return { readOnly: true, destructive: false, idempotent: true, openWorld: false };
    default: return { readOnly: false, destructive: false, idempotent: true, openWorld: false };
  }
}

function classifyPhase(name, capabilities) {
  // Simple keyword heuristic — mirrors phase-classifier.ts
  const text = `${name} ${capabilities.join(' ')}`.toLowerCase();
  if (/setup|init|scaffold|standard|foundation/.test(text)) return 'foundation';
  if (/prd|ux|user.stor|design|jtbd|roadmap/.test(text)) return 'design';
  if (/adr|rfc|api.design|data.model|architect|threat/.test(text)) return 'architecture';
  if (/estimat|test.plan|engineer/.test(text)) return 'engineering';
  if (/commit|pr|review.code|debug|develop/.test(text)) return 'development';
  if (/release|deploy|launch|rollback|runbook|incident|postmortem/.test(text)) return 'launch';
  return 'uncategorized';
}

// ── Main ───────────────────────────────────────────────────────────

function main() {
  const phaseIndex = loadPhaseIndex(INDEX_PATH);

  // Discover all SKILL.md files
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const skills = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillFile = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    try {
      const raw = fs.readFileSync(skillFile, 'utf-8');
      const { data, content } = matter(raw);
      const name = data.name;
      if (!name) continue;

      const riskLevel = data['risk-level'] ?? 'unknown';
      const mv = data['metadata-version'];
      const metadataVersion = mv === '3' ? 3 : mv === '2' ? 2 : 1;

      const indexPhase = phaseIndex.get(name);
      const phase = indexPhase ?? classifyPhase(name, parseCommaSeparated(data.capabilities));
      const author = data.author ?? data.owner ?? 'chalk';

      skills.push({
        id: name,
        name: toDisplayName(name),
        description: data.description ?? '',
        author,
        version: data.version ?? '0.0.0',
        metadataVersion,
        allowedTools: parseCommaSeparated(data['allowed-tools']),
        argumentHint: data['argument-hint'] ?? undefined,
        annotations: parseAnnotations(data, riskLevel),
        userInvocable: data['user-invocable'] !== false,
        tags: parseCommaSeparated(data.tags),
        license: data.license ?? undefined,
        capabilities: parseCommaSeparated(data.capabilities),
        activationIntents: parseCommaSeparated(data['activation-intents']),
        activationEvents: parseCommaSeparated(data['activation-events']),
        activationArtifacts: parseCommaSeparated(data['activation-artifacts']),
        riskLevel,
        rarity: RISK_TO_RARITY[riskLevel] ?? 'common',
        phase,
        bodyMarkdown: content,
        contextNeeds: parseListField(data['context-needs']),
        benefitsFrom: parseListField(data['benefits-from']),
      });
    } catch (err) {
      console.warn(`  ⚠ Skipping ${entry.name}: ${err.message}`);
    }
  }

  skills.sort((a, b) => a.id.localeCompare(b.id));

  // Also bundle the registry.yaml if present
  let registryYaml = null;
  if (fs.existsSync(REGISTRY_PATH)) {
    registryYaml = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  }

  // Also bundle the skills-index.yaml
  let indexYaml = null;
  if (fs.existsSync(INDEX_PATH)) {
    indexYaml = fs.readFileSync(INDEX_PATH, 'utf-8');
  }

  const bundle = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    skillCount: skills.length,
    skills,
    registryYaml,
    indexYaml,
  };

  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(bundle, null, 2), 'utf-8');
  console.log(`✓ Bundled ${skills.length} skills → ${path.relative(process.cwd(), OUT_FILE)}`);
}

main();
