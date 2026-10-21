# Agent Guides

This folder contains versioned guidance for AI agents and contributors working
on Carteado.

The Cursor rules in `.cursor/rules/` are still the source of always-on IDE
context. These docs are broader references that can be read before larger work,
planning, refactors, or reviews.

## Guides

- [Frontend Agent Guide](FRONTEND_AGENT_GUIDE.md)
- [Backend Agent Guide](BACKEND_AGENT_GUIDE.md)

## Repository Shape

Carteado is an npm workspace monorepo:

- `shared/`: isomorphic TypeScript for game rules, cards, and shared types.
- `backend/`: Express, Socket.IO, Prisma, MongoDB, Redis.
- `frontend/`: Next.js App Router, NextAuth, Socket.IO client, React.

Build order matters when shared contracts change:

```bash
npm run build -w shared
npm run validate
```

## Agent Defaults

- Keep diffs focused and avoid unrelated refactors.
- Prefer existing local patterns over introducing new abstractions.
- Use shared types from `shared/` instead of duplicating frontend/backend DTOs.
- Do not commit unless explicitly asked.
- On Windows, prefer `npm.cmd` if PowerShell blocks npm scripts.
