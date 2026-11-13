# Tasks

## 1. Branches

- [x] 1.1 Create `dev` from `main` (`40f5e4f`), switch to it and push with upstream; verify `git branch -vv` shows `dev` tracking `origin/dev`
- [x] 1.2 Add a "Branches" section to CLAUDE.md (work on `dev`, releases merge to `main` with a tag, never commit to `main` directly); verify the section exists
- [x] 1.3 Give Felix the GitHub UI steps to protect `main` (require pull request, no direct pushes) and set `dev` as default branch; verify Felix confirms the settings

## 2. Skill policy

- [x] 2.1 Add a "Skill policy" section to CLAUDE.md: a standing rule, with the four gates (gap, evidence, security, trial) run only at checkups (phase boundaries, a new kind of task, a retire-by trigger), plus the no-blindness and no-forced-use rules; verify the checkup triggers and each gate's reject condition are stated
- [x] 2.2 Start `docs/process/2026-11-10-skill-curation.md` with the gap table from design.md; verify it links this change
- [x] 2.3 Add the next checkup dates to `Ref/Roadmap.md` (start of weeks 2, 3 and 5); verify they appear in the weekly plan

## 3. Research

- [ ] 3.1 Search r/ClaudeAI, r/ClaudeCode and design subreddits for each gap; log each thread as read or unread, with its claims, in the process note; verify every gap has at least one search logged
- [ ] 3.2 For each candidate, check the repo (last commit, open issues, licence, size); verify a shortlist of at most 2 candidates per gap with reasons for the cut

## 4. Security review and trials

- [x] 4.1 Clone the shortlisted skills into scratch, read SKILL.md, scripts and hooks; verify each has a recorded verdict (clean or rejected, with reason)
- [x] 4.2 Write trial tasks and success criteria per gap before running anything; verify the criteria are in the process note before 4.3 starts
- [x] 4.3 Run each trial with and without the skill and present both outputs to Felix blind; verify his pick and the reason are recorded
- [x] 4.4 Run the head-to-head trial `frontend-design` vs `design-taste-frontend` on one product card; verify the loser is marked for removal — *not run: on 2026-11-11 Felix kept `design-taste-frontend` and did not adopt `frontend-design` (recorded in the process note)*

## 5. Adopt, retire, record

- [x] 5.1 Install the adopted skills into `.claude/skills/`, pinned to commits; verify each has a provenance row with its job and its retire-by condition — *no new skill adopted; the kept skills got job and retire-by rows*
- [x] 5.2 Remove the retired skills (and the Mobbin MCP entry if no plan); verify they are gone from `.claude/skills/` and `.mcp.json`
- [x] 5.3 Finish the process note with the decision table (skill, gap, verdict, reason); verify every candidate appears in it
- [ ] 5.4 Commit the result on `dev`; verify `main` is unchanged

## Workflow follow-up

- Archive this change after Felix has reviewed the decision table
- Then start `/opsx:apply establish-brand-identity`
