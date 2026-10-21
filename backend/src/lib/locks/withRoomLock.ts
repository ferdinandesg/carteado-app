/**
 * Mutex em memória por sala: ações sobre o mesmo `roomHash` rodam em fila
 * (FIFO); salas diferentes seguem em paralelo. Vale para uma única instância
 * do backend — com várias réplicas, trocar por lock no Redis (`SET NX PX`).
 * Não é reentrante: chamar `withRoomLock` da mesma sala dentro de `fn` trava.
 */
const tails = new Map<string, Promise<unknown>>();

export async function withRoomLock<T>(
  roomHash: string,
  fn: () => Promise<T>
): Promise<T> {
  const previous = tails.get(roomHash) ?? Promise.resolve();
  const run = previous.then(fn, fn);
  const tail = run.catch(() => undefined);
  tails.set(roomHash, tail);

  try {
    return await run;
  } finally {
    if (tails.get(roomHash) === tail) tails.delete(roomHash);
  }
}

export function pendingRoomLocks(): number {
  return tails.size;
}
