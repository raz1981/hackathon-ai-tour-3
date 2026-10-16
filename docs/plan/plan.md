# Token Exploration Web Application

## Objective

Build **Token Exploration**, a responsive web application on top of the existing Node.js (Express) + React (Vite) monorepo. A user asks any question once (a single one-shot prompt) and the app runs that exact prompt against multiple LLMs, then shows a **Model Comparison** table of cost, time, and output quality.

The application helps users learn the trade-offs between quality, speed, and cost, and discover which model works best for their use case.

The application is lightweight and stateless. **Do not use a database or persist any data.**

## User Story

As a user, I want to enter a prompt once and execute it across multiple AI models so that I can compare which model provides the best balance of quality, speed, and cost.

## Scope and Status

- Status: implemented and deployed to Azure App Service.
- Reuses the existing app: Express API in `server/`, React + Vite UI in `client/`, npm workspaces, ES modules.
- Replaces the original Next.js, TypeScript, Tailwind CSS, and shadcn/ui requirement. The conventions in `.github/copilot-instructions.md` apply.
- Models are served by an existing Azure AI Foundry resource (`raminzarghany-ai-test-resource` in `rz-ai-first-rg`), so the app compares the chat models deployed there. GPT-4o, Claude, Gemini, and Llama are not deployed on that resource and are out of scope.
- Architecture, class, sequence, and data flow diagrams live in [architecture.md](architecture.md).

## Supported Models

The app compares the Foundry deployments listed in `FOUNDRY_MODELS` (default below). Currently deployed chat models:

- GPT-4.1 (`gpt-4.1`)
- GPT-4.1 mini (`gpt-4.1-mini`)
- GPT-4o (`gpt-4o`, version 2024-11-20)

Adding a model must only require a new provider adapter and a pricing entry; no changes to the route, the UI table, or the judge.

## UI Design: Model Comparison Component

The UI is a single **Model Comparison** card that matches the reference image (Token Exploration infographic, item 4).

### Card layout

1. **Header bar**: dark navy background, a small brand icon on the left, the title "Model Comparison" in white, and a collapse chevron on the right. Clicking the chevron collapses or expands the card body.
2. **Body**: white background, rounded corners, light shadow.
3. **Prompt row**:
   - Label "Prompt" above a single text input (a multi-line textarea that starts one row tall and grows).
   - A blue primary button labelled **Run across models** to the right of the input.
4. **Results table** (shown after a run):

   | Model | Cost | Time | Output quality |
   | --- | --- | --- | --- |
   | GPT-4.1 | $0.00036 | 7.2s | 5 stars |
   | GPT-4.1 mini | $0.0001 | 6.7s | 4.5 stars |

   - Header row is bold with a light grey background; rows are separated by thin borders.
   - Cost is formatted as USD (for example `$0.03`; values under one cent show more precision, for example `$0.004`).
   - Time is formatted in seconds (for example `12s`, or `1.8s` under 10 seconds).
   - Output quality is a five-star rating in gold with half-star support.
5. **Row details**: each model row can be expanded to show the full generated response, input/output/total tokens, and tokens per second. This keeps the main table identical to the image while still exposing token analytics.

### Behavior and states

- One shot only: the user submits one prompt per run. There is no chat history; a new run replaces the previous results.
- Run button is disabled while running or when the prompt is empty. While running it shows a loading state, and each model row shows a spinner until its result arrives (or the whole table appears when the response returns).
- A failing model shows an inline error in its row (cost, time, and quality shown as an em dash); other models still display.
- Empty state before the first run: short hint text under the prompt.
- Character count and estimated token count are shown under the prompt input (estimate: characters / 4).
- Quality stars map from the judge score: stars = score / 2, rounded to the nearest half star. If not scored, show "Not scored".
- Accessible: the table uses real table semantics, stars have a text alternative (for example "3.5 out of 5"), the button and input have labels, keyboard operable (Ctrl+Enter submits).
- Responsive: on narrow screens the prompt row stacks and the table scrolls horizontally.

## Core Workflow

1. The user types a question in the Prompt field and clicks **Run across models**.
2. The client calls `POST /api/compare` with the prompt.
3. The server sends the identical prompt to all configured models in parallel and captures, per model:
   - Model name
   - Input, output, and total token counts
   - Response time (latency) and tokens per second
   - Estimated cost
   - Full generated output
   - Error, if the call failed (one failing model must not fail the comparison)
4. The judge model scores each output.
5. The client renders the Model Comparison table.

## Output Quality Scoring

- A configurable judge model (default `gpt-4.1`, set with `JUDGE_MODEL`) scores each response from 1 to 10 against the original prompt.
- The judge returns structured JSON: `{ "score": number, "rationale": string }`. Invalid judge output is treated as "not scored".
- Responses are judged without revealing which model produced them.
- The UI converts the 1 to 10 score to a five-star rating.

## Cost Calculation

- Pricing is configuration, not code: `server/src/config/pricing.js`, USD per 1M input and output tokens per model.
- Cost = `inputTokens / 1e6 * inputPrice + outputTokens / 1e6 * outputPrice`.
- A model with no pricing entry reports cost as unavailable.

## Performance Metrics

Tracked per model and available in the row details: response time, tokens per second, token counts. Cost, time, and quality appear in the main table.

## Technical Requirements

### Frontend (`client/`)

- React function components and hooks, Vite, plain CSS (no new UI framework).
- Components: `ModelComparison` (card, header, collapse), `PromptForm`, `ResultsTable`, `ResultRow` (with expandable details), `StarRating`.
- All HTTP calls in `client/src/api/compare.js`; components never call `fetch` directly.

### Backend (`server/`)

- Express routes under `/api`.
- Provider/Adapter pattern in `server/src/providers/`:
  - Common interface: `run(prompt) -> { text, inputTokens, outputTokens }`.
  - One adapter for Azure AI Foundry (OpenAI-compatible v1 chat completions), instantiated once per deployment in `FOUNDRY_MODELS` by the provider registry.
  - Authentication: Entra ID through `DefaultAzureCredential` (managed identity in Azure, `az login` locally), or `FOUNDRY_API_KEY` when set.
  - Services: `compare` (parallel fan-out with `Promise.allSettled`), `judge`, `pricing`.
- Input validated at the API boundary (prompt required, trimmed, maximum length).
- Errors returned as `{ "error": { "message": string } }`.
- API keys only from environment variables; never logged or returned to the client.

### Configuration (documented in `.env.example`)

| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (Azure provides this) |
| `CORS_ORIGIN` | Allowed origin in development |
| `FOUNDRY_ENDPOINT` | Foundry resource endpoint, for example `https://<resource>.openai.azure.com` |
| `FOUNDRY_API_KEY` | Optional key; when unset, Entra ID is used |
| `FOUNDRY_MODELS` | Comma-separated deployment names to compare (default `gpt-4.1,gpt-4.1-mini,gpt-4o`) |
| `JUDGE_MODEL` | Judge deployment name (default `gpt-4.1`) |
| `MAX_PROMPT_CHARS` | Prompt length limit |

## API Endpoints

### Run Comparison

`POST /api/compare`

Request:

```json
{ "prompt": "string" }
```

Response:

```json
{
  "results": [
    {
      "model": "gpt-4.1",
      "name": "GPT-4.1",
      "inputTokens": 12,
      "outputTokens": 240,
      "totalTokens": 252,
      "latencyMs": 1830,
      "tokensPerSecond": 131.1,
      "costUsd": 0.0024,
      "output": "string",
      "quality": { "score": 8, "rationale": "string" },
      "error": null
    }
  ]
}
```

### Health Check

`GET /api/health` returns `{ "status": "ok" }`.

## Architecture and Diagrams

All architecture, class, sequence, and data flow diagrams are in [architecture.md](architecture.md). Keep them in sync with this plan when the design changes.

## Testing Requirements

- Server: `node:test` + `supertest`. Client: Vitest + Testing Library.
- Unit tests for every provider adapter (mocked vendor calls), registry, pricing, compare service, judge service, validation, and every UI component and API module (including `StarRating` half-star mapping, cost and time formatting, expand/collapse, and per-model error rows).
- Integration tests for `POST /api/compare` and `GET /api/health` with mocked providers, covering success, partial model failure, all models failing, invalid input, and judge failure.
- Coverage target: 90% or higher, enforced by the test scripts.
- **All unit and integration tests must pass successfully.** `npm test`, `npm run lint`, and `npm run build` must all exit with code 0 before the work is considered done or deployed.

## Documentation Requirements

- Update `README.md` with setup, environment variables, scripts, and deployment.
- Maintain [architecture.md](architecture.md) (Mermaid diagrams).

## Deployment Criteria (Azure App Service)

Deployment may proceed only when all of the following are true:

1. `npm test` passes (unit and integration), coverage is at least 90%.
2. `npm run lint` and `npm run build` pass.
3. In production, Express serves the built client (`client/dist`) and `/api` from a single process, with SPA fallback for non-API routes.
4. The server listens on the port provided by Azure (`process.env.PORT`).
5. A root `npm start` script runs the server in production mode; the Node engine is declared in `package.json`.
6. No secrets in the repository; API keys are set as App Service application settings.
7. `GET /api/health` is configured as the App Service health check path.
8. HTTPS only is enabled.
9. After deployment, `/api/health` returns 200 and a real comparison runs end to end.

## Deployment Steps

Target: one Linux App Service running Node 22 that serves both UI and API. Method: Azure CLI zip deploy. The user signs in with `az login`; credentials are never shared in chat or committed.

Defaults (change before deploying if needed): region `westeurope`, SKU `B1`.

```text
Subscription    : e8f2b54a-b92d-410e-ba91-81fdc2cdcff5
Resource group  : rg-token-exploration
App Service plan: asp-token-exploration (Linux, B1)
Web app         : token-exploration-<unique-suffix>   (name must be globally unique)
```

1. Verify locally: `npm install`, `npm test`, `npm run lint`, `npm run build`.
2. Sign in and select the subscription:

   ```powershell
   az login
   az account set --subscription e8f2b54a-b92d-410e-ba91-81fdc2cdcff5
   ```

3. Create the resource group and plan:

   ```powershell
   az group create --name rg-token-exploration --location westeurope
   az appservice plan create --name asp-token-exploration --resource-group rg-token-exploration --is-linux --sku B1
   ```

4. Create the web app:

   ```powershell
   az webapp create --name <app-name> --resource-group rg-token-exploration --plan asp-token-exploration --runtime "NODE:22-lts"
   az webapp update --name <app-name> --resource-group rg-token-exploration --https-only true
   az webapp config set --name <app-name> --resource-group rg-token-exploration --startup-file "npm start" --generic-configurations '{"healthCheckPath": "/api/health"}'
   ```

5. Give the web app a managed identity, grant it access to the Foundry resource, and set application settings (no secrets are needed):

   ```powershell
   $principal = az webapp identity assign --name <app-name> --resource-group rg-token-exploration --query principalId -o tsv
   $foundryId = az cognitiveservices account show --name raminzarghany-ai-test-resource --resource-group rz-ai-first-rg --query id -o tsv
   az role assignment create --assignee-object-id $principal --assignee-principal-type ServicePrincipal --role "Cognitive Services OpenAI User" --scope $foundryId
   az webapp config appsettings set --name <app-name> --resource-group rg-token-exploration --settings NODE_ENV=production FOUNDRY_ENDPOINT=https://raminzarghany-ai-test-resource.openai.azure.com FOUNDRY_MODELS=gpt-4.1,gpt-4.1-mini,gpt-4o JUDGE_MODEL=gpt-4.1
   ```

6. Build and package: `npm run build`, then zip the app (server source, built `client/dist`, root and server `package.json` files, lockfile) excluding `node_modules`. Dependencies are installed by App Service during deployment.
7. Deploy:

   ```powershell
   az webapp deploy --name <app-name> --resource-group rg-token-exploration --src-path app.zip --type zip
   ```

8. Smoke test: open `https://<app-name>.azurewebsites.net`, confirm `/api/health` returns 200, and run a comparison.
9. Rollback: redeploy the previous zip, or delete the resource group `rg-token-exploration` to remove all resources.

## Implementation Phases (not started)

1. Server: config and pricing, provider interface and adapters, registry, compare and judge services, `POST /api/compare`, tests.
2. Client: `ModelComparison` card matching the reference image, `PromptForm`, `ResultsTable`, `ResultRow`, `StarRating`, `api/compare.js`, tests.
3. Production readiness: static serving of `client/dist`, start script, engines, `.env.example`, README.
4. Verification: tests, lint, build, coverage at least 90%.
5. Azure deployment following the steps above.

## Definition of Done

A user can enter a single one-shot prompt in the Model Comparison card, run it against the deployed Foundry models (GPT-4.1, GPT-4.1 mini, and GPT-4o), and see a comparison table with cost, time, and star-rated output quality (with response and token details on expand), without any database or persistent storage. The UI matches the reference image. All unit and integration tests pass, coverage is at least 90%, and the application is deployed and reachable on Azure App Service.
