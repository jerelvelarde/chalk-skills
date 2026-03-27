# Changelog

All notable changes to `chalk-skills` will be documented in this file.

The format is inspired by Keep a Changelog and uses SemVer semantics for skill versions.

## [0.10.0] — 2026-03-27

### Added

- **Bundled skill catalog** — the VS Code extension now ships with all 78 curated skills pre-bundled as a JSON blob, giving users the full catalog out of the box
- **"Sync Curated Skills to Workspace"** command to copy bundled skills into `.chalk/skills/` on demand
- Bundled registry and skill-merge logic so workspace skills always take priority while bundled skills fill gaps
- `AGENTS.md` repo overview for agent consumption

### Changed

- Build pipeline includes a TypeScript `bundle-skills` step that serializes all skill definitions at compile time
- Shared skill-parsing helpers extracted into `skill-parse-helpers.ts` (single source of truth for runtime and build)
- `buildFrontmatter()` uses `yaml.stringify()` for safe YAML serialization

## [0.9.0] — 2026-03-26

### Added

- **Context injection engine** — skills can declare `context-needs` and `benefits-from` for automatic context gathering
- **Skill catalog with registry** — `registry.yaml` format for curated skill collections
- **Skill activation system** — per-workspace skill toggle with `.enabled` state files
- Auto-gitignore for `.chalk/skills/*.enabled` activation state files

### Changed

- Generalized `ensureGitignore()` to manage multiple Chalk-specific entries (`.chalk/context/` and `.chalk/skills/*.enabled`) with incremental append logic for missing entries

---

## [Unreleased]

### Added

- Metadata contract docs: `docs/open-source-scope.md`, `docs/skill-contract.md`
- Activation model spec: `docs/activation-model.md`
- Example project activation manifest: `docs/examples/activation-skills.yaml`
- Provider-agnostic validation script: `scripts/validate-skills.sh`
- Skill index manifest: `skills/skills-index.yaml`
- New skill: `skills/project-skill-creator/SKILL.md`

### Changed

- Standardized frontmatter across all shipped skills (`owner`, `version`, `metadata-version`)
- Extended the frontmatter contract with provider-agnostic activation metadata (`metadata-version: "2"`)
- Updated `README.md` for unified `.chalk/skills` architecture and ownership/version policy
- Updated scaffolding and validation tooling for activation metadata

### Removed

- Provider-specific metadata file: `skills/product-context-docs/agents/openai.yaml`
