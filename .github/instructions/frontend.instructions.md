---
description: "Use when writing or modifying React components, hooks, styles, client API calls, or client tests."
applyTo: "client/**"
---

# Frontend (React + Vite)

- Function components and hooks only; one component per file, named exports in PascalCase files.
- All HTTP calls go through `src/api/`; components never call `fetch` directly.
- Handle loading, error, and empty states for every async view.
- Keep state as local as possible; lift only when shared. Avoid adding a state library until needed.
- Use semantic HTML and accessible labels; do not rely on color alone.
- Never use `dangerouslySetInnerHTML` with unsanitized data.
- Tests use Vitest and Testing Library; query by role/label, not implementation details.
