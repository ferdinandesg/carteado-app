jest.mock(
  "pino-http",
  () => () => (_req: unknown, _res: unknown, next: () => void) => next()
);

jest.mock("prisma", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn(), findMany: jest.fn() },
    room: { findUnique: jest.fn(), findMany: jest.fn() },
    game: { findUnique: jest.fn(), findMany: jest.fn() },
    message: { create: jest.fn(), findMany: jest.fn() },
    chat: { findUnique: jest.fn(), findMany: jest.fn() },
  },
}));

const mockRedisClient = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  expire: jest.fn().mockResolvedValue(undefined),
  watch: jest.fn().mockResolvedValue(undefined),
  unwatch: jest.fn().mockResolvedValue(undefined),
  multi: jest.fn().mockReturnValue({
    set: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([[]]),
  }),
};

jest.mock("@/lib/redis/client", () => ({
  __esModule: true,
  default: {
    getDataClient: jest.fn(() => Promise.resolve(mockRedisClient)),
  },
}));

jest.mock("express-rate-limit", () => {
  return jest.fn().mockImplementation(() => {
    return (req: any, res: any, next: any) => next();
  });
});
