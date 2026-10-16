---
description: "Use when writing prompts, planning large tasks, structuring work for Copilot agents, or deciding what context to give or load; best practices for context engineering."
---

# Context Engineering Best Practices

## Give the agent the right context

- State the goal, constraints, and definition of done up front. Say what is out of scope.
- Point to concrete files, symbols, and examples instead of describing them vaguely.
- Include the exact error message, command, or failing test when debugging.
- Prefer one small, relevant example of the desired pattern over long prose.

## Keep context small and focused

- Work on one task per chat session; start a new session when the topic changes.
- Break large work into steps that each fit comfortably in context; finish and verify one before starting the next.
- Use narrow `applyTo` globs for instruction files; reserve always-on instructions for rules that apply to every task.
- Let the agent search and read code on demand rather than pasting large files.
- Summarize and discard stale context (old logs, abandoned approaches) instead of carrying it forward.

## Plan, then execute

- Ask for a short plan before multi-file changes and review it before implementation.
- Track progress with a todo list so state survives long sessions.
- Persist decisions that matter (architecture, conventions) in `.github/copilot-instructions.md`, not in chat.

## Verify with ground truth

- Prefer running tests, linters, and builds over asking the model to "check" its own work.
- Give the agent a fast feedback loop: `npm test`, `npm run lint`, `npm run build`.
- Review diffs; treat generated code as a proposal.

## Maintain the instruction files

- Keep instructions short, imperative, and specific; remove rules that are obvious or outdated.
- Put commands, structure, and conventions in one place and avoid duplicating them across files.
- Descriptions of agents and instruction files should say "Use when..." with concrete trigger keywords.
- Never put secrets or personal data in instructions, prompts, or context.
