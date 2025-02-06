jest.mock("./src/redis/client", () => {
  return {
    getDataClient: jest.fn().mockResolvedValue("mocked-redis-client"),
  };
});

jest.mock("./src/socket/socket", () => {
  return {
    init: jest.fn(),
  };
});

jest.mock("express-rate-limit", () => {
  return jest.fn().mockImplementation(() => {
    return (req: any, res: any, next: any) => next();
  });
});

jest.mock("./src/routes", () => {
  return jest.fn();
});
