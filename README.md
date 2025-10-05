<h1 align="center">Welcome to carteado-app 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0-blue.svg?cacheSeconds=2592000" />
</p>

> Carteado card game
> Project created with the aim of learning more about Docker, deployment, socket, redis and other technologies

## Install

To carry out the installation you just need to run the docker-compose file

```sh
npm run start:dev
```

and soon after the web application will be available on port `:3000`

## Author

👤 **Ferdinandes Guimaraes**

- Website: ferdinandes.com.br
- Github: [@ferdinandesg](https://github.com/ferdinandesg)
- LinkedIn: [@ferdinandes-nascimento](https://linkedin.com/in/ferdinandes-nascimento)

## Show your support

Give a ⭐️ if this project helped you!

---

## Architecture & Stack Decisions

### Data Stores

- MongoDB: (Explain intended usage: e.g., player profiles / persistence?)
- Redis: Ephemeral fast storage for game state, rooms, real-time pub/sub.
- Prisma (DATABASE_URL): Used for relational data. If both Mongo + relational persist same concepts, plan consolidation.

### Shared Package

`shared/` contains isomorphic card & game logic consumed by both backend and frontend. Planned to become a proper workspace package with versioning to prevent type drift.

### Error Handling

Custom `GameError` with typed codes -> unified HTTP mapping (see `backend/src/errors/GameError.ts`). Express middleware serializes consistent error shape.

### Environment Configuration

Env variables validated at startup using Zod (`backend/src/config/env.ts`). Application crashes fast on invalid config.

### Testing Strategy (Planned)

- Domain/game rules: pure unit tests colocated near implementation (fast).
- Integration: Redis / Prisma / socket under `backend/src/tests/integration`.
- Frontend: component + hooks tests in-component folders.
- Contract (future): generated API types or tRPC/OpenAPI.

### Tooling Roadmap

- Workspaces (pnpm) for shared build & caching.
- Central Jest + ESLint presets.
- CI (lint, type-check, test, build) + security scans.

### Security

- Secrets (e.g., service account) removed from VCS; use environment inject (Docker secrets / cloud secret manager).

### Naming & Layers (Target)

`domain` (pure rules) → `application` (use-cases) → `infrastructure` (Express, Redis, DB, Socket). Current code being migrated incrementally.

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
