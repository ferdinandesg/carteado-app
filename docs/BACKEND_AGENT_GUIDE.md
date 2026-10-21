# Backend Agent Guide

Use this guide when planning or implementing backend changes in `backend/`.

## Stack and Boundaries

- Backend stack: Express 5, Socket.IO, Prisma, MongoDB, Redis.
- Backend source lives in `backend/src/`.
- Imports use `@/` for `backend/src` aliases.
- Shared contracts should come from `shared/`, not copied into backend code.

## Layers

Keep responsibilities separated:

```text
routes/ -> controller/ -> services/ -> lib/ | prisma | redis/
socket/events/ -> handlers -> services/ | lib/redis/
```

- Controllers parse input and call services. Avoid business logic there.
- Services orchestrate persistence, factories, and domain operations.
- `lib/` holds JWT helpers, Redis adapters, and low-level integration helpers.
- Socket handlers should be one handler per event.

## Authentication

- Backend emits access tokens with `withAccessToken()`.
- HTTP and socket auth validate backend JWTs with `verifyJWTToken`.
- Do not move JWT signing to the frontend.
- Normalize persisted roles through shared helpers such as
  `normalizeRegisteredRole()` when needed.

## Socket.IO

- Main namespace is `/room`.
- Socket path is `/carteado_socket`.
- Chat and game room events run on the same room namespace.
- Socket auth uses `handshake.auth.token`.
- Use `ErrorHandler(error, socket)` for domain errors.
- Use emit helpers instead of duplicating `channel.to(...).emit(...)`:
  - `emitToRoom`
  - `emitToUser`

## Event Registration Pattern

Register socket events through `registerSafeSocketEvent` and pass a
`SocketContext` into handlers:

```ts
registerSafeSocketEvent<JoinRoomPayload>(
  socket,
  CHANNEL.CLIENT.JOIN_ROOM,
  (payload) => JoinRoomEventHandler({ socket, channel, payload })
);
```

Handlers should be exported as async functions:

```ts
export async function XxxEventHandler(
  context: SocketContext<Payload>
): Promise<void> {
  // ...
}
```

## Room and Chat Contracts

Source of truth: `backend/src/socket/channels.ts`.

Current client events:

- `join_room`
- `quit` for leaving a room
- `join_chat`
- `send_message`
- `set_player_status`
- `start_game`

Current server events:

- `room_updated`
- `game_updated`
- `load_messages`
- `receive_message`
- `join_chat`
- `info`

When changing event names, update frontend emit/listener code and tests in the
same change.

## Redis and Room State

- Room state updates should use `atomicallyUpdateRoomState`.
- Session state should use `storeSession`, `retrieveSession`, and `clearSession`.
- Redis keys and TTLs should come from central config. Do not add magic strings.
- `start_game` currently gets room identity from `socket.user.room`.
- Game state mutations go through `getAndRun` in `services/game.service.ts`,
  which runs load -> mutate -> save under `withRoomLock(roomHash)`
  (`lib/locks/withRoomLock.ts`). The truco bot tick uses the same lock. The lock
  is in-memory (single backend instance) and not reentrant.
- Every game action carries the acting `userId`; rules validate team/turn
  (for example, only the defending team can reject a truco call).
- See `.cursor/rules/production-safety.mdc` before touching socket events, game
  serialization, env vars or the production compose file.

## Factories and Shared Game Rules

- Add new game types through `GameFactory`/registry patterns instead of scattered
  conditionals.
- Use `createGameFromRuleName()` and `saveGameInstance()` for game lifecycle.
- Shared game entities live in `shared/game`.

## Logging and Tests

- Use `logger` from backend utilities; avoid `console.log`.
- Socket tests live in `backend/src/tests/socket/`.
- Prefer testing socket flows through emitted events rather than mocking only
  internals.
- When auth is involved, prefer real JWT helper flows or mock the project-level
  JWT wrapper, not only `jsonwebtoken`.
