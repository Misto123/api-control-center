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

# Browser Automation Preferences

## ALWAYS Use Kimi WebBridge for Web Browsing
- **Default tool for ALL web browsing and browser automation: Kimi WebBridge**
- Use the user's real browser with actual login sessions
- Kimi WebBridge handles: navigation, clicking, typing, reading, screenshots, web scraping
- Only use alternative tools (Playwright, etc.) if explicitly requested or if Kimi WebBridge fails
- Triggers: "browse", "open website", "click on page", "screenshot", "scrape", any web interaction

## Browser Tool Priority
1. **Kimi WebBridge** (primary - real browser with user sessions)
2. Stealth Browser MCP (if installed and available)
3. Playwright/other tools (fallback only)

# Code Quality & Efficiency

## ALWAYS Use Ponytail for Minimal Code
- **Install:** Add `"plugin": ["@dietrichgebert/ponytail"]` to `opencode.json`
- **Purpose:** Write only necessary code, reuse existing solutions, prefer stdlib/platform features
- **Benefits:** ~54% less code, ~20% cheaper, ~27% faster, 100% safe
- **Default mode:** `full` (use `/ponytail ultra` for aggressive minimalism)
- **Commands:** `/ponytail-review` (review current diff), `/ponytail-audit` (audit whole repo)
- **Principles:** YAGNI → reuse → stdlib → platform → dependency → one-liner → minimal working code
- **Never compromises:** validation, error handling, security, accessibility
- **Repository:** https://github.com/DietrichGebert/ponytail
