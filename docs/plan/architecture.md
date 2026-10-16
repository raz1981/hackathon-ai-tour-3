# Token Exploration: Architecture and Diagrams

Companion to [plan.md](plan.md). All diagrams use Mermaid.

## System Architecture

```mermaid
flowchart LR
  User([User]) --> UI["React UI (client/dist)"]
  subgraph Azure["Azure App Service (Linux, Node)"]
    UI
    API["Express API (/api)"]
    UI -- "/api/compare" --> API
    API --> Compare["Compare service"]
    Compare --> Registry["Provider registry"]
    Compare --> Judge["Judge service"]
    Compare --> Pricing["Pricing config"]
    Registry --> FP["Foundry provider (one per deployment)"]
    FP --> Auth["Auth (Entra ID managed identity)"]
  end
  FP --> Foundry[("Azure AI Foundry resource")]
  Judge --> Foundry
```

## Client Component Structure

```mermaid
flowchart TD
  App --> MC["ModelComparison (card, header, collapse)"]
  MC --> PF["PromptForm (prompt input, counts, Run across models)"]
  MC --> RT["ResultsTable (Model, Cost, Time, Output quality)"]
  RT --> RR["ResultRow (expandable details)"]
  RR --> SR["StarRating"]
  MC --> API["api/compare.js"]
```

## Provider/Adapter Class Structure

```mermaid
classDiagram
  class Provider {
    <<interface>>
    +id string
    +run(prompt) ProviderResult
  }
  class FoundryProvider
  class ProviderRegistry {
    +createProviders(config, auth) Provider[]
  }
  Provider <|.. FoundryProvider
  ProviderRegistry ..> Provider
```

## Sequence Diagram: Run Comparison

```mermaid
sequenceDiagram
  actor U as User
  participant UI as Model Comparison UI
  participant API as Express /api/compare
  participant C as Compare service
  participant P as Provider adapters
  participant J as Judge service
  U->>UI: Enter prompt, click Run across models
  UI->>API: POST /api/compare { prompt }
  API->>API: Validate input
  API->>C: compare(prompt)
  par For each model
    C->>P: run(prompt)
    P-->>C: text, token counts, latency
  end
  C->>C: Compute cost and tokens per second
  C->>J: score(prompt, outputs)
  J-->>C: score and rationale per output
  C-->>API: results
  API-->>UI: 200 { results }
  UI-->>U: Table with Model, Cost, Time, Output quality stars
```

## Sequence Diagram: Partial Failure

```mermaid
sequenceDiagram
  participant UI as Model Comparison UI
  participant API as Express /api/compare
  participant C as Compare service
  participant P1 as Provider A
  participant P2 as Provider B
  UI->>API: POST /api/compare { prompt }
  API->>C: compare(prompt)
  par
    C->>P1: run(prompt)
    P1-->>C: result
  and
    C->>P2: run(prompt)
    P2--xC: error
  end
  C-->>API: results with one error entry
  API-->>UI: 200 { results }
  UI-->>UI: Failed row shows inline error, others render normally
```

## Data Flow Diagram

```mermaid
flowchart TD
  A["Prompt text (browser)"] --> B["Validate and trim (API boundary)"]
  B --> C["Fan out to provider adapters (parallel)"]
  C --> D["Raw output, token counts, latency per model"]
  D --> E["Pricing config"]
  E --> F["Cost and tokens per second"]
  D --> G["Judge model"]
  G --> H["Quality score 1 to 10 and rationale"]
  F --> I["Aggregate results (in memory only)"]
  H --> I
  D --> I
  I --> J["JSON response"]
  J --> K["Table: cost, time, star rating (score / 2)"]
  J --> L["Row details: response, tokens, tokens per second"]
```

No data is stored: prompts, outputs, and scores exist only in memory for the duration of the request and in client state.

## Deployment Topology

```mermaid
flowchart LR
  Dev["Developer machine"] -- "az webapp deploy (zip)" --> App
  subgraph RG["Resource group: rg-token-exploration"]
    Plan["App Service plan (Linux, B1)"] --> App["Web app (Node 22)"]
  end
  App -- "HTTPS" --> LLMs[("Azure AI Foundry (gpt-4.1, gpt-4.1-mini)")]
  Users([Users]) -- "HTTPS" --> App
```
