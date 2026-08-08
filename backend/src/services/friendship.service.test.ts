import prisma from "@/prisma";
import {
  acceptFriendRequest,
  dismissFriendRequest,
  listFriends,
  removeFriend,
  sendFriendRequest,
} from "./friendship.service";

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn() },
    friendship: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock };
  friendship: Record<string, jest.Mock>;
};

const ME = "a".repeat(24);
const OTHER = "b".repeat(24);

describe("friendship.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendFriendRequest", () => {
    it("não permite se adicionar", async () => {
      await expect(sendFriendRequest(ME, ME)).rejects.toBe(
        "CANNOT_FRIEND_YOURSELF"
      );
    });

    it("exige que o destinatário exista", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      await expect(sendFriendRequest(ME, OTHER)).rejects.toBe("USER_NOT_FOUND");
    });

    it("rejeita duplicadas em qualquer direção", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({ id: OTHER });
      mockedPrisma.friendship.findFirst.mockResolvedValue({
        status: "PENDING",
      });
      await expect(sendFriendRequest(ME, OTHER)).rejects.toBe(
        "REQUEST_ALREADY_EXISTS"
      );

      mockedPrisma.friendship.findFirst.mockResolvedValue({
        status: "ACCEPTED",
      });
      await expect(sendFriendRequest(ME, OTHER)).rejects.toBe(
        "ALREADY_FRIENDS"
      );
    });

    it("cria a solicitação quando válida", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({ id: OTHER });
      mockedPrisma.friendship.findFirst.mockResolvedValue(null);
      mockedPrisma.friendship.create.mockResolvedValue({ id: "f1" });

      await sendFriendRequest(ME, OTHER);

      expect(mockedPrisma.friendship.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { requesterId: ME, addresseeId: OTHER },
        })
      );
    });
  });

  describe("acceptFriendRequest", () => {
    it("só o destinatário pode aceitar", async () => {
      mockedPrisma.friendship.findUnique.mockResolvedValue({
        id: "f1",
        requesterId: ME,
        addresseeId: OTHER,
        status: "PENDING",
      });
      await expect(acceptFriendRequest(ME, "f1")).rejects.toBe("NOT_ALLOWED");
    });

    it("não aceita solicitação já resolvida", async () => {
      mockedPrisma.friendship.findUnique.mockResolvedValue({
        id: "f1",
        requesterId: OTHER,
        addresseeId: ME,
        status: "ACCEPTED",
      });
      await expect(acceptFriendRequest(ME, "f1")).rejects.toBe(
        "REQUEST_ALREADY_RESOLVED"
      );
    });

    it("aceita marcando status e respondedAt", async () => {
      mockedPrisma.friendship.findUnique.mockResolvedValue({
        id: "f1",
        requesterId: OTHER,
        addresseeId: ME,
        status: "PENDING",
      });
      mockedPrisma.friendship.update.mockResolvedValue({});

      await acceptFriendRequest(ME, "f1");

      expect(mockedPrisma.friendship.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "f1" },
          data: expect.objectContaining({ status: "ACCEPTED" }),
        })
      );
    });
  });

  describe("dismissFriendRequest", () => {
    it("permite remetente cancelar ou destinatário recusar", async () => {
      mockedPrisma.friendship.findUnique.mockResolvedValue({
        id: "f1",
        requesterId: ME,
        addresseeId: OTHER,
        status: "PENDING",
      });

      await dismissFriendRequest(ME, "f1");
      expect(mockedPrisma.friendship.delete).toHaveBeenCalledWith({
        where: { id: "f1" },
      });
    });

    it("bloqueia terceiros", async () => {
      mockedPrisma.friendship.findUnique.mockResolvedValue({
        id: "f1",
        requesterId: OTHER,
        addresseeId: "c".repeat(24),
        status: "PENDING",
      });
      await expect(dismissFriendRequest(ME, "f1")).rejects.toBe("NOT_ALLOWED");
    });
  });

  describe("removeFriend", () => {
    it("remove amizade aceita em qualquer direção", async () => {
      mockedPrisma.friendship.deleteMany.mockResolvedValue({ count: 1 });
      await removeFriend(ME, OTHER);
      expect(mockedPrisma.friendship.deleteMany).toHaveBeenCalled();
    });

    it("falha se não são amigos", async () => {
      mockedPrisma.friendship.deleteMany.mockResolvedValue({ count: 0 });
      await expect(removeFriend(ME, OTHER)).rejects.toBe(
        "FRIENDSHIP_NOT_FOUND"
      );
    });
  });

  describe("listFriends", () => {
    it("retorna sempre o outro usuário da relação", async () => {
      mockedPrisma.friendship.findMany.mockResolvedValue([
        {
          id: "f1",
          requesterId: ME,
          addressee: { id: OTHER, name: "Other" },
          requester: { id: ME, name: "Me" },
          respondedAt: new Date(),
        },
        {
          id: "f2",
          requesterId: OTHER,
          addressee: { id: ME, name: "Me" },
          requester: { id: OTHER, name: "Other" },
          respondedAt: new Date(),
        },
      ]);

      const friends = await listFriends(ME);
      expect(friends.map((f) => f.user.id)).toEqual([OTHER, OTHER]);
    });
  });
});
