# Tasks

## 1. Import skills

- [x] 1.1 Copy `brand-identity` (SKILL.md, README.md, references/) and the repo's MIT LICENSE into `.claude/skills/brand-identity/`; verify SKILL.md frontmatter `name: brand-identity` is present
- [x] 1.2 Copy `brand-guidelines` (SKILL.md, LICENSE.txt) into `.claude/skills/brand-guidelines/` and add `disable-model-invocation: true` to its frontmatter; verify the flag is present and the rest of the file is unchanged
- [x] 1.3 Copy `skills/taste-skill/` and the repo's LICENSE into `.claude/skills/design-taste-frontend/`; verify the file count matches the source (1,631 files + LICENSE) and `scripts/gate.mjs` exists at the path the Stop hook expects
- [x] 1.4 Copy the four Mobbin skills (`best-practices`, `search`, `redesign-screen`, `plain-writing`) and the repo's LICENSE into `.claude/skills/<name>/`; verify each has a SKILL.md
- [x] 1.5 Write `.claude/skills/PROVENANCE.md` listing source URL, commit SHA, licence and local folder for every imported skill; verify all four SHAs match the cloned repos

## 2. Configure

- [x] 2.1 Add the Mobbin MCP server (`https://api.mobbin.com/mcp`, streamable HTTP) to `.mcp.json`; verify the file parses as JSON
- [x] 2.2 Add `.taste-skill/` to `.gitignore`; verify `git check-ignore .taste-skill/x` matches
- [x] 2.3 Write `CLAUDE.md` with project context and the four skill overrides from design.md decision 5; verify each override names the skill rule it replaces

## 3. Verify

- [x] 3.1 Run `node .claude/skills/design-taste-frontend/scripts/copy-lint.mjs --help` (or against a sample file) to confirm the vendored scripts run on this machine's Node version
- [x] 3.2 Run `openspec validate import-design-skills` and confirm it passes

## Workflow follow-up

- Felix signs in to Mobbin (`/mcp` in an interactive session) if a plan is bought
- Archive the change with `/opsx:archive` once Felix has reviewed the imported files
