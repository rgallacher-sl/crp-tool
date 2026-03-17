You are setting up a new project that was created from the agentic-dev-boilerplate template. Follow these steps in order.

## 1. Understand the project

Ask the user one question: "What are you building?" Wait for their answer before proceeding. You need to know:
- What type of project (web app, API, mobile, CLI, etc.)
- What stack/language if known
- Whether it's going to production or just a prototype

## 2. Trim AGENTS.md

Open `AGENTS.md` and remove every skill from the skills table that doesn't apply to this project. Keep:
- Always: `spec-driven-development`, `planning-and-task-breakdown`, `incremental-implementation`, `debugging-and-error-recovery`, `code-review-and-quality`, `git-workflow-and-versioning`, `security-and-hardening`, `idea-refine`
- Web frontend: `frontend-ui-engineering`, `rg-ui-standards`
- React/Next.js: `react-best-practices`, `composition-patterns`
- React Native: `react-native-guidelines`
- Any API: `api-and-interface-design`
- Database: `database-and-migrations`
- TypeScript: `typescript-patterns`
- Going to production: `shipping-and-launch`, `ci-cd-and-automation`, `performance-optimization`, `observability-and-monitoring`
- Public-facing site: `web-quality-audit`, `performance`, `core-web-vitals`, `accessibility`, `seo`, `best-practices`
- Auth or user data: `security-auditor`
- Complex env/config: `environment-and-config`
- Presentations: `pptx`
- GitHub Copilot integration: `copilot-sdk`

Remove the corresponding references too if their paired skills are removed.

Also update the boilerplate notice at the top of AGENTS.md — replace "This is a boilerplate — it contains the full set of skills across all project types. Once a spec exists for this project, remove skills from this table that don't apply to what's being built." with a one-line description of what this project actually is.

## 3. Register in the boilerplate

Add this project's repo name (folder name only, not the full path) as a new line in `../agentic-dev-boilerplate/sync-targets.txt`. This registers it to receive future core updates when `sync.sh` is run from the boilerplate.

## 4. Set the test command

Create `.claude/test-command` with the test command for this project on a single line:
- Node.js: `npm test` or `npx jest` or `npx vitest run`
- Python: `pytest`
- Go: `go test ./...`
- Rust: `cargo test`
- If unknown or no tests yet: leave the file empty or skip this step

## 5. Confirm

Tell the user:
- Which skills were kept and why
- What TEST_COMMAND was set to
- That hooks are active and what they protect against
- That `project-story/` will start building a journal of this project automatically

Do not do anything else. Do not start building anything. This command is setup only.
