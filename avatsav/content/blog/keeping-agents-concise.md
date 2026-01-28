+++
title = "Keep agents.md concise"
date = "2025-01-20"
slug = "keep-agents-concise"
description = "Best practices for writing effective AI agent instruction files"
tags = ["ai", "best-practices", "documentation"]
toc = true
+++

The `agents.md` or `AGENTS.md` file has become a common convention for providing context to AI coding assistants. However, there's a tendency to overload these files with information that reduces their effectiveness.

## Why Conciseness Matters

AI assistants have context windows. Every token in your agents.md file consumes part of that budget. A bloated file means less room for actual code context and conversation history.

### The Token Economy

Think of your context window as a budget. You want to spend tokens on:

- Relevant code snippets
- Current conversation
- Essential project context

Not on verbose documentation that could be discovered through the codebase itself.

### Cognitive Load

Even for AI, more information isn't always better. A focused, well-structured file helps the assistant quickly understand what matters most.

## What to Include

Keep your agents.md focused on information that isn't easily discoverable:

### Project-Specific Conventions

Document conventions that differ from common patterns:

- Unusual directory structures
- Custom naming conventions
- Non-standard build commands

### Critical Constraints

Highlight constraints that could cause issues:

- Security requirements
- Performance budgets
- Compatibility requirements

### Quick References

Include frequently needed commands:

```bash
# Run tests
npm test

# Build for production
npm run build

# Start dev server
npm run dev
```

## What to Avoid

Some content actively hurts more than it helps:

### Redundant Information

Don't document what's obvious from the code:

- Standard framework patterns
- Common library usage
- Self-documenting code structures

### Lengthy Explanations

Avoid walls of text explaining architecture. Instead, point to where the code lives and let the assistant read it directly.

### Stale Documentation

Outdated information is worse than no information. If you can't keep it updated, don't include it.

## A Template

Here's a minimal effective structure:

```markdown
# Project Name

Brief one-line description.

## Quick Start

Essential commands to get running.

## Key Conventions

- Convention 1
- Convention 2

## Important Constraints

- Constraint 1
- Constraint 2
```

## Conclusion

The best agents.md file is one that provides maximum value with minimum tokens. Focus on what's unique, essential, and not discoverable through normal code exploration.

Remember: the AI can read your code. Your job is to provide the context that code alone cannot convey.
