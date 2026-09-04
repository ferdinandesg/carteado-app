import prisma from "@/prisma";
import { resolveCosmetics } from "@/services/cosmetics.service";
import { validateUser } from "./auth.service";

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: {
    user: { findFirst: jest.fn(), create: jest.fn() },
  },
}));

jest.mock("@/services/cosmetics.service", () => ({
  resolveCosmetics: jest.fn(),
}));

const mockedPrisma = prisma as unknown as {
  user: { findFirst: jest.Mock; create: jest.Mock };
};

const mockedResolveCosmetics = resolveCosmetics as jest.MockedFunction<
  typeof resolveCosmetics
>;

const dbUser = {
  id: "a".repeat(24),
  email: "ferdinandes@example.com",
  name: "Ferdinandes",
  image: "https://lh3.googleusercontent.com/photo",
  rank: 180,
  cash: 100,
  xp: 0,
  role: "user",
};

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateUser", () => {
    it("inclui a skin do loadout no perfil de login", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(dbUser);
      mockedResolveCosmetics.mockResolvedValue({
        skin: "baralho02",
        avatar: "/assets/avatars/avatar1.png",
      });

      const profile = await validateUser({
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
      });

      expect(mockedResolveCosmetics).toHaveBeenCalledWith(dbUser.id);
      expect(profile).toMatchObject({
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: "/assets/avatars/avatar1.png",
        rank: 180,
        cash: 100,
        xp: 0,
        role: "user",
        skin: "baralho02",
      });
    });

    it("cai na foto do provedor quando não há avatar equipado", async () => {
      mockedPrisma.user.findFirst.mockResolvedValue(dbUser);
      mockedResolveCosmetics.mockResolvedValue({
        skin: "baralho01",
        avatar: null,
      });

      const profile = await validateUser({
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
      });

      expect(profile.image).toBe(dbUser.image);
      expect(profile.skin).toBe("baralho01");
    });
  });
});
