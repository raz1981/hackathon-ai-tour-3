# hackathon-ai-tour-3

**Token Exploration**: enter one prompt and compare the models deployed on an Azure AI Foundry resource (GPT-4.1, GPT-4.1 mini, and GPT-4o by default) on cost, time, and judged output quality. Nothing is stored.

Node.js (Express) API in `server/` and React (Vite) UI in `client/`. See [docs/plan/plan.md](docs/plan/plan.md) and [docs/plan/architecture.md](docs/plan/architecture.md).

## Getting started

```bash
npm install
cp .env.example .env   # set FOUNDRY_ENDPOINT
az login               # local auth uses your Azure identity (needs the Cognitive Services OpenAI User role)
npm run dev
```

- UI: http://localhost:5173 (proxies `/api` to the server)
- API: http://localhost:3001 (`GET /api/health`, `POST /api/compare`)

A model that fails shows an inline error in its row; the other models still run.

## Configuration

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (Azure provides this) |
| `CORS_ORIGIN` | Allowed origin in development |
| `FOUNDRY_ENDPOINT` | Foundry resource endpoint, for example `https://<resource>.openai.azure.com` |
| `FOUNDRY_API_KEY` | Optional; when unset, Entra ID is used |
| `FOUNDRY_MODELS` | Comma-separated deployment names to compare (default `gpt-4.1,gpt-4.1-mini,gpt-4o`) |
| `JUDGE_MODEL` | Judge deployment name (default `gpt-4.1`) |
| `MAX_PROMPT_CHARS` | Prompt length limit (default 4000) |

Pricing per model is in `server/src/config/pricing.js`. To add a model, deploy it in Foundry, add it to `FOUNDRY_MODELS`, and add a pricing entry.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start API and UI together |
| `npm run build` | Build the client |
| `npm start` | Run the API; with `NODE_ENV=production` it also serves `client/dist` |
| `npm test` | Run server and client tests with a 90% coverage threshold |
| `npm run lint` | Lint the repo |

## Copilot setup

Shared instructions, the Full Stack Developer agent, and context engineering guidelines live in [.github](.github).
