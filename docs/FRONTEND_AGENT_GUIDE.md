# Frontend Agent Guide

Use this guide when planning or implementing frontend changes in `frontend/`.

## Stack and Boundaries

- Next.js App Router lives in `frontend/src/app/`.
- Authenticated routes live under `frontend/src/app/(auth)/`.
- Use functional React components and SCSS modules.
- Imports use `@/` for `frontend/src` aliases. Never use `@//`.
- UI text should come from `react-i18next` keys in `frontend/public/locales/`.

## Authentication and Socket

- NextAuth stores the backend `accessToken` in the session.
- Do not sign JWTs in frontend code.
- The single Socket.IO client is `frontend/src/lib/socket/client.ts`.
- `SocketProvider` connects when the user is authenticated and has an access token.
- Room and chat events share the `/room` namespace.
- In socket effects, clean up with the same handler reference:

```tsx
socket.on("room_updated", onRoomUpdated);
return () => socket.off("room_updated", onRoomUpdated);
```

Avoid broad cleanup like `socket.off("event")` inside components because it can
remove listeners registered elsewhere.

## Shells and Layouts

Use the right shell for the screen type:

- `MenuShell`: menu/navigation screens with user panel, topbar, central card,
  footer, and friends panel.
- `RoomShell`: active room screens with chat, central lobby/game stage, and room
  info side panel.

Do not force gameplay/lobby screens into `MenuShell`; their collapse behavior
and live socket state are different.

## Components

- Prefer `ActionButton` for user actions and button sound behavior.
- `BackButton` composes `ActionButton`; keep its public props stable.
- Keep specialized panels small:
  - `Chat` owns chat socket events and message form behavior.
  - `RoomInfo` presents room metadata only.
  - `Lobby` owns ready/start-game actions.
  - `Participants` renders participant cards from room context.

## Styling

- Use SCSS modules from `frontend/src/styles/`.
- Reuse design tokens from `design-system/_tokens.scss` via `_variables.scss`.
- Current panel tokens include:
  - `$color-panel-blue`
  - `$color-panel-blue-hover`
  - `$color-panel-hover`
  - `$color-panel-deep`
  - `$color-border-subtle`
  - `$color-overlay`
  - `$color-ready`
- Keep layout responsibility separate from visual ownership. For example, grid
  containers should not fake a child panel background when the child component
  can own its own surface.

## Testing

- Jest tests are colocated as `*.test.tsx`.
- Use focused tests for behavioral changes:
  - socket event names and payloads;
  - form submit behavior;
  - collapsed/expanded render states;
  - route navigation.
- For frontend test runs on Windows, prefer:

```bash
npm.cmd test -- --runInBand <test-file>
```

## Current Room Event Contracts

Frontend room screens should align with backend `CHANNEL.CLIENT` values:

- join room: `join_room`
- leave room: `quit`
- join chat: `join_chat`
- send message: `send_message`
- set ready status: `set_player_status`
- start game: `start_game`

`start_game` currently relies on `socket.user.room` on the backend, so frontend
does not need to send a room payload.
