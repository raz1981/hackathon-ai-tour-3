# Project Instructions

Full stack JavaScript monorepo: Node.js (Express) API in `server/` and React (Vite) UI in `client/`, managed with npm workspaces.

## Commands

- Install: `npm install` (run at repo root)
- Dev (API + UI): `npm run dev`
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`

## Structure

- `server/src/` - Express app (`app.js` builds the app, `index.js` starts it), `routes/`, `middleware/`
- `client/src/` - React app, `components/`, `api/` (all HTTP calls live here)
- `.github/` - Copilot instructions, agents, and context guidelines

## Conventions

- ES modules everywhere (`"type": "module"`); no CommonJS.
- API routes are mounted under `/api`; the Vite dev server proxies `/api` to the server.
- Configuration comes from environment variables; document new ones in `.env.example`. Never commit `.env` or secrets.
- Validate all external input at API boundaries; return consistent JSON errors `{ "error": { "message": string } }`.
- Function components and hooks only on the client; keep server state fetching in `client/src/api/`.
- Always add unit tests for new or changed code (server: `node:test` + `supertest`; client: Vitest + Testing Library), covering success and failure paths. Never finish a change without them.
- Keep changes small and scoped to the request.
- Do not add dependencies without a clear need; prefer the platform and existing packages.

## Workflow

- Plan before large changes; confirm the plan if requirements are ambiguous.
- Run `npm test` and `npm run lint` before declaring work done.
- See `.github/instructions/` for area-specific rules and `.github/agents/` for the full stack developer agent.
