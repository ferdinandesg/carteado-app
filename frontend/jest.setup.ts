// jest.setup.ts
import "@testing-library/jest-dom";

// Mock do logger (pino usa setImmediate, não disponível em jsdom)
jest.mock("@//tests/utils/logger", () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  },
}));

// 1. MOCKS DE BIBLIOTECAS DE UI E TRADUÇÃO (MANTIDOS)
// Esses mocks são perfeitos para evitar side-effects visuais e de tradução.

jest.mock("i18next", () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn(),
  changeLanguage: jest.fn(),
  t: (key: string) => key, // Retorna a própria chave, ideal para asserts
  language: "en",
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
  // Se você usar o Trans component, pode ser útil mocká-lo também
  // Trans: ({ i18nKey }) => i18nKey,
}));

jest.mock("react-toastify", () => ({
  ToastContainer: jest.fn(() => null), // Mocka o componente para não renderizar
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// 2. MOCK DE AUTENTICAÇÃO (MANTIDO, COM SUGESTÃO)
// Este é um ótimo mock padrão para um usuário autenticado.
// Lembre-se que você pode (e deve) sobrescrevê-lo dentro de
// testes específicos para testar cenários de "loading" ou "unauthenticated".
jest.mock("next-auth/react", () => ({
  useSession: jest.fn().mockReturnValue({
    data: {
      user: {
        name: "Test User",
        email: "test@example.com",
        image: "/avatar.png",
      },
    },
    status: "authenticated",
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));
