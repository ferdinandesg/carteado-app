jest.mock("i18next", () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
  changeLanguage: jest.fn(),
  t: (key: string) => key,
  language: "en",
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn().mockReturnValue({
    data: {
      user: { name: "Jane Doe", email: "jane@example.com" },
      status: "authenticated",
    },
    status: "authenticated",
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest
    .fn()
    .mockReturnValue({ data: [], error: null, isLoading: false }),
  useMutation: jest.fn(),
  QueryClient: jest.fn().mockImplementation(() => ({
    getQueryData: jest.fn(),
    setQueryData: jest.fn(),
    fetchQuery: jest.fn(),
  })),
}));

jest.mock("react-toastify", () => ({
  ToastContainer: jest.fn(() => null),
  toast: jest.fn(),
}));

// Mock global do RedisClass
jest.mock("./redis/client", () => {
  return {
    getDataClient: jest.fn().mockResolvedValue("mocked-redis-client"), // Mocka o comportamento do Redis
  };
});

// Mock global do SocketClass
jest.mock("./socket/socket", () => {
  return {
    init: jest.fn(), // Mocka o método de inicialização do Socket
  };
});

// Mock global do express-rate-limit
jest.mock("express-rate-limit", () => {
  return jest.fn().mockImplementation(() => {
    return (req: any, res: any, next: any) => next(); // Mocka a função rate-limiting para passar sem limitações
  });
});

// Mocka a função routes (caso precise verificar chamadas a ela)
jest.mock("./routes", () => {
  return jest.fn(); // Mocka a função de rotas
});
