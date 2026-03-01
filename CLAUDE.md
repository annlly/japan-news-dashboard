# Trend Radar Dashboard (formerly Japan News Dashboard)

## 📌 Project Overview
A multi-platform intelligence dashboard aggregating Japanese political/economic news and Chinese social media trending topics (Zhihu, Weibo, Baidu, Toutiao, Bilibili, Douyin, Tieba, Wallstreetcn, Thepaper, Ifeng, CLS).

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS / Vanilla CSS
- **Data Fetching**: Server-side API Routes (`/api/trending`, `/api/news`)

## 📝 Current Task
- [x] Upgrade the original Japan News Dashboard to "Trend Hub".
- [x] Create `/api/trending` to fetch from 11 Chinese platforms.
- [x] Rewrite `/app/page.tsx` to include dual columns: Japan News feed and Chinese Trending feeds.
- [x] Update `globals.css` with improved aesthetics for the dual-feed UI.
- [x] Upgrade related Skill (`scripts/generate_report.mjs` upgraded to fetch all Chinese Trend data for NotebookLM contexts).
- [x] Add Agent-Reach independent skill in `~/.gemini/skills/agent-reach`.
- [x] Upgrade `baoyu-xhs-images` skill with expanded visual styling and MCP Auto-Publish capability.

## ✅ Quality Checklist
- [x] API backend works.
- [x] UI is responsive and premium.
- [x] No EOF errors during file writing (split files to small chunks if needed).
- [x] Japanese news functionality is preserved.
- [x] Removed NotebookLM integration and report generation.
- [x] Codebase cleaned (removed `@modelcontextprotocol/sdk`, proxies, scripts).
- [ ] Deployed to GitHub and Vercel.
