---
description: "Use when writing or modifying Node.js Express API code, routes, middleware, or server tests."
applyTo: "server/**"
---

# Backend (Express)

- Keep `app.js` free of side effects (no `listen`) so tests can import it with supertest.
- One router per resource in `routes/`; mount under `/api`.
- Handlers are thin: validate input, call a service/function, return JSON. Put logic in separate modules.
- Use `async` handlers; Express 5 forwards rejected promises to the error middleware.
- Central error middleware returns `{ "error": { "message": string } }` with the correct status code; do not leak stack traces outside development.
- Read configuration from `process.env` in one place (`config.js`); never hard-code secrets.
- Tests use `node:test` and `supertest`; cover success and failure paths.
