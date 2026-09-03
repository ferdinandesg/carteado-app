import { CarteadoGame } from "@/game/CarteadoGameRules";
import { TrucoGame } from "@/game/TrucoGameRules";
import { GameStatus } from "shared/game";
import { makePlayers } from "@/tests/helpers/gameTestHarness";
import {
  applyEndOfMatchRewards,
  calculateRankGain,
  getMatchWinnerIds,
  GOLD_PER_LOSS,
  GOLD_PER_WIN,
  RANK_GAIN,
} from "./rewards.service";
import prisma from "@/prisma";

jest.mock("@/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

const mockedPrisma = prisma as unknown as {
  user: { findMany: jest.Mock; update: jest.Mock };
};

// Ids no formato ObjectId (usuários registrados)
const USER_1 = "a".repeat(24);
const USER_2 = "b".repeat(24);

describe("rewards.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateRankGain", () => {
    it("dá 15 quando a média do lobby é menor que o rank do jogador", () => {
      expect(calculateRankGain(100, 50)).toBe(RANK_GAIN.LOBBY_BELOW_PLAYER);
    });

    it("dá 20 quando a média do lobby é igual ao rank do jogador", () => {
      expect(calculateRankGain(100, 100)).toBe(RANK_GAIN.LOBBY_AT_PLAYER);
    });

    it("dá 25 quando a média do lobby é maior que o rank do jogador", () => {
      expect(calculateRankGain(100, 150)).toBe(RANK_GAIN.LOBBY_ABOVE_PLAYER);
    });
  });

  describe("getMatchWinnerIds", () => {
    it("no carteado o vencedor é o playerTurn ao finalizar", () => {
      const game = new CarteadoGame(makePlayers([USER_1, USER_2]));
      game.playerTurn = USER_1;
      expect(getMatchWinnerIds(game)).toEqual([USER_1]);
    });

    it("no truco vence o time que atingiu 12 pontos", () => {
      const game = new TrucoGame(makePlayers([USER_1, USER_2]));
      game.teams[1].score = 12;
      expect(getMatchWinnerIds(game)).toEqual([USER_2]);
    });
  });

  describe("applyEndOfMatchRewards", () => {
    const finishedGame = (players: string[]) => {
      const game = new CarteadoGame(makePlayers(players));
      game.status = GameStatus.FINISHED;
      game.playerTurn = players[0];
      return game;
    };

    it("não aplica nada se a partida não terminou", async () => {
      const game = new CarteadoGame(makePlayers([USER_1, USER_2]));
      expect(await applyEndOfMatchRewards(game)).toBe(false);
      expect(mockedPrisma.user.findMany).not.toHaveBeenCalled();
    });

    it("marca como aplicado sem tocar o banco quando só há convidados", async () => {
      const game = finishedGame(["guest-abc", "guest-def"]);
      expect(await applyEndOfMatchRewards(game)).toBe(true);
      expect(game.rewardsApplied).toBe(true);
      expect(mockedPrisma.user.findMany).not.toHaveBeenCalled();
    });

    it("aplica rank pela média do lobby e 200 de gold para todos", async () => {
      // Média: (100 + 200) / 2 = 150
      mockedPrisma.user.findMany.mockResolvedValue([
        { id: USER_1, rank: 100, cash: 1000 },
        { id: USER_2, rank: 200, cash: 0 },
      ]);
      const game = finishedGame([USER_1, USER_2]);

      expect(await applyEndOfMatchRewards(game)).toBe(true);
      expect(game.rewardsApplied).toBe(true);

      // USER_1: média (150) acima do rank (100) -> +25
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: USER_1 },
        data: { rank: 125, cash: 1000 + GOLD_PER_WIN },
      });
      // USER_2: média (150) abaixo do rank (200) -> +15
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: USER_2 },
        data: { rank: 215, cash: GOLD_PER_LOSS },
      });
    });

    it("é idempotente: não premia duas vezes a mesma partida", async () => {
      mockedPrisma.user.findMany.mockResolvedValue([
        { id: USER_1, rank: 0, cash: 0 },
      ]);
      const game = finishedGame([USER_1]);

      expect(await applyEndOfMatchRewards(game)).toBe(true);
      expect(await applyEndOfMatchRewards(game)).toBe(false);
      expect(mockedPrisma.user.update).toHaveBeenCalledTimes(1);
    });

    it("permite política de gold customizada por resultado", async () => {
      mockedPrisma.user.findMany.mockResolvedValue([
        { id: USER_1, rank: 0, cash: 0 },
        { id: USER_2, rank: 0, cash: 0 },
      ]);
      const game = finishedGame([USER_1, USER_2]); // USER_1 vence

      await applyEndOfMatchRewards(game, ({ isWinner }) =>
        isWinner ? 300 : 100
      );

      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: USER_1 },
        data: expect.objectContaining({ cash: 300 }),
      });
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: USER_2 },
        data: expect.objectContaining({ cash: 100 }),
      });
    });

    it("não marca como aplicado se a persistência falhar (permite retry)", async () => {
      mockedPrisma.user.findMany.mockRejectedValue(new Error("db down"));
      const game = finishedGame([USER_1]);

      expect(await applyEndOfMatchRewards(game)).toBe(false);
      expect(game.rewardsApplied).toBe(false);
    });
  });
});
