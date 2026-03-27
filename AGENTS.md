# Chalk Skills

A curated collection of 80+ reusable agent skills for software development workflows.

## Skill Locations

Skills are located in `skills/*/SKILL.md`. Each subdirectory contains one skill with its `SKILL.md` file (YAML frontmatter + markdown instructions).

## Compatible Agents

These skills work with any agent that supports markdown-based skill files:

- Claude Code
- Cursor
- OpenCode
- Cline
- GitHub Copilot
- Any agent supporting the `vercel-labs/skills` format

## Installation

```bash
npx skills add GeneralJerel/chalk-skills
```

Or install specific skills:

```bash
npx skills add GeneralJerel/chalk-skills --path skills/commit
npx skills add GeneralJerel/chalk-skills --path skills/create-pr
```

## Skill Format

Each skill uses metadata-version 3 frontmatter:

```yaml
---
name: skill-name
description: What the skill does
author: chalk
version: "1.0.0"
metadata-version: "3"
allowed-tools: Bash, Read, Glob, Grep
tags: category1, category2
---
```
