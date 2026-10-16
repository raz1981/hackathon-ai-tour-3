# hackathon-ai-tour-3

Full stack JavaScript monorepo: Node.js (Express) API in `server/` and React (Vite) UI in `client/`.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

- UI: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:3001 (`GET /api/health`)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and UI together |
| `npm run build` | Build the client |
| `npm test` | Run server and client tests |
| `npm run lint` | Lint the repo |

## Copilot setup

Shared instructions, the Full Stack Developer agent, and context engineering guidelines live in [.github](.github).
