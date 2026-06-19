# Carteado Frontend

Next.js App Router frontend for Carteado.

For project-specific guidance, read:

- [Frontend Agent Guide](../docs/FRONTEND_AGENT_GUIDE.md)
- [Agent Guides Index](../docs/AGENTS.md)

## Development

From the repository root:

```bash
npm run dev:services
npm run dev:frontend
```

From this workspace:

```bash
npm run dev
npm run ts-check
npm test
```

On Windows, use `npm.cmd` if PowerShell blocks npm scripts.

## Key Patterns

- Authenticated routes live under `src/app/(auth)/`.
- Use `MenuShell` for menu-like screens.
- Use `RoomShell` for active room/lobby/game screens.
- Prefer `ActionButton` for user actions.
- Keep socket listener cleanup scoped to the handler that was registered.
