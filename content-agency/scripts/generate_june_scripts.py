"""
Generate all 12 DigiMAIDS scripts for June 2-14 and save to content-output/reels/
Run: python scripts/generate_june_scripts.py
"""
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUTPUT_DIR = ROOT / "content-output" / "reels"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SCRIPTS = [
    {
        "date": "2026-06-02",
        "day": "Monday",
        "topic": "3 reasons I quit my 9-5 to build an AI agency",
        "content_type": "Why Content",
        "script": """[HOOK — 0:00–0:05]
I quit my corporate job to build an AI agency. Three things had to be true before I did it.

[VALUE — 0:05–0:45]
Number one — I had a skill that AI could multiply, not replace.

I wasn't competing with AI. I was using AI to do in 2 hours what used to take 20.

Number two — my clients' problems were repeatable.

Coaches. Service providers. Women-owned businesses. They all had the same bottleneck: content, operations, follow-up.

That meant I could build systems once and deploy them everywhere.

Number three — I had proof of concept before I quit.

I ran three client pilots while still employed. Only then did I walk out.

Here's the truth nobody tells you: AI doesn't replace the founder. It replaces the junior tasks that were keeping you small.

When I stopped doing $15-an-hour work, my revenue tripled in 90 days.

[CTA — 0:45–0:50]
If you want to see how this works for your business, grab the free AI audit at the link in bio.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-03",
        "day": "Tuesday",
        "topic": "This new AI tool just made virtual assistants obsolete",
        "content_type": "Trending AI News",
        "script": """[HOOK — 0:00–0:05]
The AI tool that just dropped this week is making traditional virtual assistants obsolete. Here's what it actually does.

[VALUE — 0:05–0:45]
OpenAI's new agent framework can now handle multi-step tasks autonomously.

Not just answering questions. Actually executing workflows.

Book a call. Draft the follow-up. Update the CRM. Send the invoice.

All from one instruction.

For coaches and service providers, this changes everything.

Your VA was doing scheduling, client communication, content repurposing, inbox management.

These tools can now handle all of it — at 5% of the cost.

But here's what the headlines miss: the businesses that win are the ones who already have their systems documented.

If your processes are in your head, AI can't automate them.

That's what we build at DigiMAIDS — documented, repeatable systems ready to hand off to AI.

[CTA — 0:45–0:50]
Follow for weekly AI business breakdowns that actually matter to your bottom line.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-04",
        "day": "Wednesday",
        "topic": "How I automated my entire client onboarding in 48 hours",
        "content_type": "Workflow I Built",
        "script": """[HOOK — 0:00–0:05]
I automated my entire client onboarding in 48 hours. Here's the exact workflow.

[VALUE — 0:05–0:45]
Step one: Client signs contract → Zapier triggers a welcome sequence in HubSpot.

They get a branded welcome email, onboarding checklist, and Calendly link — all automatic.

Step two: They book their kickoff call → Google Calendar auto-generates the agenda doc.

Pre-filled with their business goals from the intake form.

Step three: After the call → Claude AI drafts the first month content calendar.

Based on their niche, offers, and audience. Ready for review in 10 minutes.

Step four: I review and approve → it posts directly to their Notion workspace.

The whole thing took me 48 hours to build.

It saves me 4 hours per new client.

I have 12 clients. That's 48 hours back every month.

The tools: Zapier, HubSpot, Calendly, Claude API, Notion.

All connected. All automated.

[CTA — 0:45–0:50]
Want to see the full system? Grab the free AI audit link in my bio and let's map it out for your business.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-05",
        "day": "Thursday",
        "topic": "Watch me build a complete AI content system for a real client",
        "content_type": "Show Don't Tell",
        "script": """[HOOK — 0:00–0:05]
I'm going to show you exactly what it looks like when we build an AI content system for a client. No fluff. Real screen.

[VALUE — 0:05–0:45]
This is Sarah. She's a business coach. Before us, she was spending 12 hours a week on content.

Watch what we set up in one session.

First — we built her Brand Voice document. Her tone, her stories, her banned phrases. Fed it to Claude.

Now every piece of content sounds like her. Not like an AI.

Second — we set up her Trend Scout agent. Every Monday morning, it scrapes the top-performing content in her niche and sends her three hook ideas.

She picks one. That's her only job.

Third — the Script Writer agent takes that hook and writes a full 60-second script. Format. Timing. CTA.

She records once. We repurpose to LinkedIn, email, and her community.

Before DigiMAIDS: 12 hours of content work per week.

After DigiMAIDS: 45 minutes.

[CTA — 0:45–0:50]
If you're ready to stop doing content the hard way, book your free AI audit call at the link in bio. calendly.com/mamidoju-manasa/ai-audit-call-w-digimaids

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-06",
        "day": "Friday",
        "topic": "5 AI tools that changed how women-owned businesses operate this week",
        "content_type": "Weekly AI Recap",
        "script": """[HOOK — 0:00–0:05]
Five AI tools that women-owned businesses were talking about this week. Let's rank them.

[VALUE — 0:05–0:45]
Number five: Descript's new AI voice cloning. Record once. Repurpose forever. Good for coaches with existing content libraries.

Number four: Notion AI's new database agent. It can now write, sort, and update your project management database from a simple prompt. Huge for ops.

Number three: HeyGen Studio upgrade. AI avatar videos now support real-time lip sync in 30+ languages. If you have a global audience, this is a game-changer.

Number two: Claude's new Projects feature. Persistent memory across conversations. Your AI assistant now actually remembers your brand, clients, and context.

Number one: n8n's visual AI agent builder. No-code. Connects to everything. This is what we use to build client automation systems at DigiMAIDS.

The pattern: every tool this week is about doing more with less hands-on time.

That's the trend. Businesses that adapt now will look back on this year as the moment everything changed.

[CTA — 0:45–0:50]
Follow to stay ahead of what's actually moving the needle for service-based businesses.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-07",
        "day": "Saturday",
        "topic": "The AI strategy nobody is talking about for service businesses",
        "content_type": "Trending AI Outlier",
        "script": """[HOOK — 0:00–0:05]
The most powerful AI strategy for service businesses right now? Nobody in my feed is talking about it.

[VALUE — 0:05–0:45]
It's not ChatGPT. It's not automation. It's something simpler.

It's building your AI before you need it.

Here's what I mean.

Most business owners start using AI when they're overwhelmed. Drowning in work. Trying to offload at the worst possible moment.

The businesses that win are the ones who build AI systems during the slow season.

They document their processes when there's time to do it right.

They train their AI tools on actual brand voice — not generic prompts.

They set up the workflows before the bottleneck hits.

So when growth comes — and it always comes — they're already automated.

The bottleneck never becomes a crisis.

That's what we help you build at DigiMAIDS. Not emergency AI. Infrastructure AI.

Systems that scale before you need them to.

[CTA — 0:45–0:50]
Follow to see how we build it.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-09",
        "day": "Monday",
        "topic": "Why most women-owned businesses are leaving $10K per month on the table",
        "content_type": "Why Content",
        "script": """[HOOK — 0:00–0:05]
Most women-owned service businesses are leaving $10,000 a month on the table. Not because they lack skill. Because of this one bottleneck.

[VALUE — 0:05–0:45]
The bottleneck is fulfillment capacity.

You can only take on as many clients as you can personally serve.

And because everything lives in your head — your process, your frameworks, your client communication — you can't delegate it.

So you hit a ceiling.

Here's what that ceiling is costing you:

The average service business owner spends 60% of their time on execution. Delivery. The work itself.

And only 10% on sales.

When you flip that ratio — when AI handles 60% of execution — your calendar opens up.

More calls booked. More clients closed. More revenue.

We've seen clients go from 4 clients at $1,500/mo to 9 clients at $2,500/mo in one quarter.

Not by working harder. By removing the bottleneck.

The $10K isn't missing. It's stuck behind tasks AI can do.

[CTA — 0:45–0:50]
Grab the free AI audit at the link in bio to see exactly where your bottleneck is.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-10",
        "day": "Tuesday",
        "topic": "AI just changed the game for solopreneurs — here's what's new",
        "content_type": "Trending AI News",
        "script": """[HOOK — 0:00–0:05]
Big week in AI for solopreneurs. Three things just dropped that are genuinely useful. Let me break them down.

[VALUE — 0:05–0:45]
First: Claude's Projects feature is now available to all Pro users.

This means your AI has persistent memory of your business context. Brand voice. Client history. Recurring workflows.

You stop re-explaining yourself every conversation. This alone saves 30 minutes a day.

Second: Google's NotebookLM added audio overviews to team workspaces.

Upload your SOPs, offer docs, client notes. It creates a briefing you can listen to on the go.

I'm using this for client onboarding prep.

Third: Perplexity launched a business tier with team knowledge bases.

For solopreneurs who need a research assistant that actually knows your industry — this is worth testing.

The pattern this week: AI tools are getting context-aware.

Less setup friction every week.

If you tried an AI tool six months ago and it felt generic — try again.

[CTA — 0:45–0:50]
Follow for the tools that actually move the needle, not just the hype.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-11",
        "day": "Wednesday",
        "topic": "The exact workflow I use to create 30 pieces of content in 2 hours",
        "content_type": "Workflow I Built",
        "script": """[HOOK — 0:00–0:05]
Thirty pieces of content. Two hours. One workflow. Here's exactly how I do it.

[VALUE — 0:05–0:45]
It starts on Monday morning with the Trend Scout agent.

It pulls the top-performing content in our niche from the past 7 days. Ranks by outlier score. Sends me five hook ideas.

I pick one. That takes three minutes.

The Script Writer agent takes that hook and writes a 60-second script. Formatted. Timed. CTA included.

I record the video once. That's my 45 minutes.

Then the repurposing stack kicks in.

The long-form video gets clipped into three short-form pieces.

The script becomes a LinkedIn post — adapted for professional tone.

The key insight from the script becomes a carousel with five slides.

The carousel becomes three Threads.

The hook becomes a subject line for this week's email.

That's 30 pieces from one piece of source content.

The tech stack: Claude for writing. Descript for video. Canva for carousels. n8n to connect everything.

The human input: picking the hook and pressing record.

[CTA — 0:45–0:50]
Want the full system built for your business? Book your free audit at the link in bio.

[ESTIMATED DURATION: 55s]
""",
    },
    {
        "date": "2026-06-12",
        "day": "Thursday",
        "topic": "I built a client an entire content system while they slept",
        "content_type": "Show Don't Tell",
        "script": """[HOOK — 0:00–0:05]
My client went to sleep. By the time she woke up, her entire content system for the next two weeks was ready to post.

[VALUE — 0:05–0:45]
Here's what happened.

We had her kickoff call at 8pm Thursday.

She gave me two things: her brand voice doc and her offer.

That night, while she slept, the DigiMAIDS system ran.

The Trend Scout pulled the top five trending hooks in the coaching niche.

The Script Writer wrote 12 scripts — two weeks of content — matched to her brand voice.

The Caption Writer created matching captions for Instagram, TikTok, and LinkedIn.

Everything went straight into her Notion content calendar. Publish dates. Platform tags. Status: Ready to Film.

She woke up Friday morning to a fully loaded two-week content plan.

She recorded all 12 videos in a single Saturday session.

That's how her first month went from "I don't know what to post" to 24 pieces scheduled.

[CTA — 0:45–0:50]
This is what we do. Book your free AI audit call at the link in bio. calendly.com/mamidoju-manasa/ai-audit-call-w-digimaids

[ESTIMATED DURATION: 55s]
""",
    },
    {
        "date": "2026-06-13",
        "day": "Friday",
        "topic": "The AI tools that actually save time vs the ones that are just hype",
        "content_type": "Weekly AI Recap",
        "script": """[HOOK — 0:00–0:05]
Not every AI tool saves time. Some of them add work. Here's my honest weekly breakdown — what's worth it, what isn't.

[VALUE — 0:05–0:45]
Worth it: Claude Projects.

If you have a service business, the persistent context feature is genuinely useful. Your brand voice, your client profiles, your SOPs — always accessible. Real time savings.

Worth it: n8n for automation.

Steep learning curve but once it's built, it runs forever. We use it for every client system.

Worth it: Descript for video editing.

The AI script-matching feature alone saves 2 hours per edit.

Overhyped right now: Most AI image tools for marketing.

The output still requires heavy editing to look professional. Not yet a plug-and-play save.

Overhyped: AI "strategy" tools that just repackage ChatGPT.

If it doesn't connect to your actual data, it's just fancy prompting. Build your own instead.

The rule I use: if I have to babysit the AI, it's not saving me time. Real ROI comes from set-and-run systems.

[CTA — 0:45–0:50]
Follow for honest breakdowns every Friday on what's actually moving the needle.

[ESTIMATED DURATION: 50s]
""",
    },
    {
        "date": "2026-06-14",
        "day": "Saturday",
        "topic": "This one shift will make your content 10x more effective in 2026",
        "content_type": "Trending AI Outlier",
        "script": """[HOOK — 0:00–0:05]
The content creators winning in 2026 all made the same shift. It's not about posting more. It's about this.

[VALUE — 0:05–0:45]
The shift: from broadcasting to demonstrating.

Old approach: tell people what you know.

Post a tip. Share a framework. Give value.

New approach: show them what you do.

Film the workflow running. Record the results loading. Walk them through the actual system.

The difference in engagement? Roughly 3x to 5x.

Because audiences are drowning in tips.

They're not drowning in proof.

When you show the Notion database auto-filling with content. When you show the AI writing a client's caption in real-time. When you show the before and after — not just describe it.

That's when the DMs come.

This is why 80% of our client content strategy is built around show-don't-tell formats.

Talking head tips are easy to scroll past.

A screen recording of your AI system saving someone 10 hours? That stops the scroll.

[CTA — 0:45–0:50]
Follow for more on what's actually working in content right now.

[ESTIMATED DURATION: 50s]
""",
    },
]


def save_script(entry):
    slug = entry["topic"].lower()
    import re
    slug = re.sub(r"[^a-z0-9]+", "-", slug)[:50].strip("-")
    filename = f"{entry['date']}_digimaids_{slug}.md"
    path = OUTPUT_DIR / filename

    content = f"""# Script: {entry['topic']}

**Account:** @digimaids
**Day:** {entry['day']}
**Content Type:** {entry['content_type']}
**Estimated Duration:** 50s
**Generated:** 2026-06-02

---

{entry['script']}
"""
    path.write_text(content, encoding="utf-8")
    return path


if __name__ == "__main__":
    for entry in SCRIPTS:
        path = save_script(entry)
        print(f"Saved: {path.name}")
    print(f"\nDone. All {len(SCRIPTS)} scripts saved to content-output/reels/")
