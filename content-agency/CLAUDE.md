# Manasa Content Agency — CLAUDE.md

## Project Overview
This is Manasa's 8-agent AI content system for **DigiMAIDS** (Digital Modern AI Development Services) — an AI-powered business assistant agency built by women, for women-owned businesses.

## Business Context
- **Brand:** DigiMAIDS + Manasa's personal brand
- **Audience:** Women-owned businesses (service-based, e-commerce, SMAs, content creators)
- **Platforms:** Instagram Reels, TikTok, LinkedIn, Carousels, Threads, Email, Skool community
- **Funnel:** Skool community → Discovery call → Service packages (Daily Tidy $497/mo, Deep Clean $997/mo, Full Estate $2,497/mo)
- **Content types:** Talking head videos, street interviews, carousels, email sequences, community posts

## The 8 Agents

| # | Agent | Role |
|---|-------|------|
| 01 | Brand Voice | Enforces tone, language, banned words, brand consistency |
| 02 | Content Strategy | Plans content calendars, pillars, topic batches |
| 03 | Script Writer | Writes IG Reel/TikTok scripts, talking head scripts, AI clone scripts |
| 04 | Long-Form Writer | LinkedIn posts, newsletters, blog content |
| 05 | Visual Content | Carousel outlines, Canva asset briefs, visual direction |
| 06 | Email & Funnel | Email sequences, welcome flows, nurture campaigns |
| 07 | Community & Engagement | Skool posts, DM scripts, comment templates, event copy |
| 08 | Analytics & Strategy | KPI tracking, performance review, optimization recommendations |

## Folder Structure
```
manasa-content-agency/
├── CLAUDE.md                    <- you are here
├── agents/
│   ├── 01-brand-voice/
│   ├── 02-content-strategy/
│   ├── 03-script-writer/
│   ├── 04-long-form-writer/
│   ├── 05-visual-content/
│   ├── 06-email-funnel/
│   ├── 07-community-engagement/
│   └── 08-analytics-strategy/
├── shared-knowledge/            <- 7 knowledge files uploaded to each GPT
├── content-output/              <- save generated content here by type
│   ├── reels/
│   ├── linkedin/
│   ├── carousels/
│   ├── emails/
│   ├── community/
│   └── analytics/
└── workflows/                   <- repeatable operating procedures
```

## Working with This System
- Each agent folder has an `instructions.md` (paste into GPT Builder > Instructions) and a `knowledge/` subfolder (upload those files to GPT Builder > Knowledge).
- All agents share and reference `shared-knowledge/` files — keep those updated as the brand evolves.
- Save completed content to the appropriate `content-output/` subfolder.
- Run the weekly workflow from `workflows/weekly-content-workflow.md`.

## Key Tools in Use
- **Scheduling:** RecurPost / Buffer / Later
- **Automation:** Make (Integromat) / Zapier
- **Project mgmt:** Notion / ClickUp / Airtable
- **Community:** Skool
- **Design:** Canva AI
- **CRM:** HubSpot / Pipedrive
