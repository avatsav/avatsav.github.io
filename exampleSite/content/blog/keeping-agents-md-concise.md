+++
title = "Keep AGENTS.md Concise"
date = "2025-01-15"
description = "Why your AI agent instructions should be short, focused, and actionable—not encyclopedic documentation."
tags = [
    "ai",
    "documentation",
]
+++

When working with AI coding agents, there's a temptation to document everything in your `AGENTS.md` (or `CLAUDE.md`)
file. Every pattern, every convention, every edge case. Resist this urge.

## The Problem with Verbose Instructions

AI agents have context windows, but more importantly, they have attention spans. A 2000-line instruction file doesn't
make your agent smarter—it makes it slower and more confused. The signal-to-noise ratio drops as you add more "just in
case" guidance.

## What Actually Belongs in AGENTS.md

Your agent instructions should focus on:

- **Non-obvious conventions** - Things the agent can't infer from code
- **Project-specific patterns** - Your unique architecture decisions
- **Common pitfalls** - Mistakes you've seen repeatedly
- **Quick reference** - Commands, paths, key files

## What Doesn't Belong

Skip the basics. Your agent already knows:

- How JavaScript/TypeScript works
- Common framework patterns (React, Astro, etc.)
- General best practices
- Standard library documentation

## The 80/20 Rule

Focus on the 20% of information that solves 80% of common mistakes. Everything else can live in your actual
documentation, README files, or be discovered through code exploration.

## A Good Example

```markdown
# AGENTS.md

## Key Conventions

- Content dates must be quoted strings: "2024-01-15"
- Draft posts require `draft: true` flag
- Never import content utils in astro.config.ts

## Common Commands

pnpm dev # localhost:4321
pnpm build # Production build
```

Clear, actionable, memorable. That's what makes agents effective.

---

Remember: Your `AGENTS.md` is a reference card, not a manual. Keep it lean.
