<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Model & Cost Preferences

## CRITICAL: Never Use GPT o1 / o3 / Reasoning Models
- **NEVER use GPT o1, o3, o1-mini, o3-mini, or any OpenAI reasoning models**
- These models are extremely expensive and must not be used for this project
- Always use Claude Sonnet 4.6 (current model) or other cost-effective alternatives
- If model updates become available, only switch after explicit user approval

## Model Update Policy
- Do not automatically switch to newer/different models without user approval
- Check for model updates only when explicitly requested
- Prioritize cost-efficiency over cutting-edge capabilities
- Document any model changes in git commit messages
