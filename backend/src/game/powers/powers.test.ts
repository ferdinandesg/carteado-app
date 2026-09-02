import { Card } from "shared/cards";
import { BasePlayer, GameStatus, PlayerStatus, PowerId } from "shared/game";
import { TrucoGame } from "../TrucoGameRules";
import { executePower } from "./PowerExecutor";

const card = (rank: string, suit: string): Card =>
  ({ rank, suit, toString: `${rank} of ${suit}` }) as unknown as Card;

const makePlayers = (ids: string[]): BasePlayer[] =>
  ids.map(
    (userId) =>
      ({
        userId,
        name: userId,
        hand: [],
        playedCards: [],
        table: [],
        status: PlayerStatus.PLAYING,
      }) as unknown as BasePlayer
  );

describe("Truco powers", () => {
  let game: TrucoGame;

  beforeEach(() => {
    game = new TrucoGame(makePlayers(["p1", "p2"]));
    game.status = GameStatus.PLAYING;
    game.rounds = 1;
    game.playerTurn = "p1";
    game.vira = card("7", "clubs");
    game.manilha = "Q";
    game.getPlayer("p1")!.hand = [card("K", "hearts"), card("4", "diamonds")];
    game.getPlayer("p2")!.hand = [
      card("3", "spades"),
      card("Q", "clubs"),
      card("5", "hearts"),
    ];
  });

  describe("executor guards", () => {
    it("rejects when the game is not playing", () => {
      game.status = GameStatus.FINISHED;
      expect(() =>
        executePower(game, "p1", { powerId: PowerId.CHANGE_TRUMP })
      ).toThrow("A partida não está em andamento.");
    });

    it("rejects unknown power ids", () => {
      expect(() =>
        executePower(game, "p1", { powerId: "NOPE" as PowerId })
      ).toThrow("Poder desconhecido.");
    });

    it("requires an opponent target for targeted powers", () => {
      expect(() =>
        executePower(game, "p1", { powerId: PowerId.X_RAY })
      ).toThrow("Este poder exige um alvo.");
      expect(() =>
        executePower(game, "p1", {
          powerId: PowerId.X_RAY,
          targetUserId: "p1",
        })
      ).toThrow("O alvo deve ser um adversário.");
    });

    it("allows each power once per round per player and records usage", () => {
      executePower(game, "p1", { powerId: PowerId.CHANGE_TRUMP });
      expect(game.powerUsages).toEqual([
        expect.objectContaining({
          powerId: PowerId.CHANGE_TRUMP,
          userId: "p1",
          round: 1,
          trigger: "MANUAL",
        }),
      ]);
      expect(() =>
        executePower(game, "p1", { powerId: PowerId.CHANGE_TRUMP })
      ).toThrow("Você já usou este poder nesta rodada.");

      game.rounds = 2;
      expect(() =>
        executePower(game, "p1", { powerId: PowerId.CHANGE_TRUMP })
      ).not.toThrow();
    });
  });

  describe("X_RAY", () => {
    it("returns one of the target's cards as a private result", () => {
      const result = executePower(game, "p1", {
        powerId: PowerId.X_RAY,
        targetUserId: "p2",
      });
      expect(result.privateResult?.powerId).toBe(PowerId.X_RAY);
      expect(result.privateResult?.targetUserId).toBe("p2");
      expect(game.getPlayer("p2")!.hand).toContainEqual(
        result.privateResult?.card
      );
    });
  });

  describe("SILENCER", () => {
    it("blocks the target from asking truco until the round resets", () => {
      executePower(game, "p1", {
        powerId: PowerId.SILENCER,
        targetUserId: "p2",
      });

      expect(() => game.rules.askTruco(game, "p2")).toThrow(
        "Você foi silenciado e não pode pedir truco nesta rodada."
      );
      expect(() => game.rules.askTruco(game, "p1")).not.toThrow();

      game.rules.dealInitialHands(game);
      expect(game.activeEffects).toHaveLength(0);
    });
  });

  describe("CHANGE_TRUMP", () => {
    it("draws a new vira and recomputes the manilha", () => {
      game.deck.cards = [card("A", "spades"), card("8", "hearts")];

      executePower(game, "p1", { powerId: PowerId.CHANGE_TRUMP });

      expect(game.vira).toEqual(card("A", "spades"));
      expect(game.manilha).toBe("2");
    });
  });

  describe("MAGNETIC_PULL", () => {
    it("forces the target to play its highest card, then expires", () => {
      executePower(game, "p1", {
        powerId: PowerId.MAGNETIC_PULL,
        targetUserId: "p2",
      });
      game.playerTurn = "p2";

      expect(() => game.playCard("p2", card("5", "hearts"))).toThrow(
        "Atração magnética: você deve jogar sua carta mais alta."
      );

      // Q of clubs is the manilha, the highest card in p2's hand.
      game.playCard("p2", card("Q", "clubs"));
      expect(game.activeEffects).toHaveLength(0);
      expect(game.bunch).toContainEqual(card("Q", "clubs"));
    });
  });

  describe("GRAVEDIGGER", () => {
    it("swaps a hand card with the last played card still on the table", () => {
      game.playCard("p1", card("4", "diamonds"));

      executePower(game, "p1", {
        powerId: PowerId.GRAVEDIGGER,
        card: card("K", "hearts"),
      });

      const p1 = game.getPlayer("p1")!;
      expect(p1.hand).toEqual([card("4", "diamonds")]);
      expect(p1.playedCards).toEqual([card("K", "hearts")]);
      expect(game.bunch).toEqual([card("K", "hearts")]);
    });

    it("fails when the player has not played yet", () => {
      expect(() =>
        executePower(game, "p1", {
          powerId: PowerId.GRAVEDIGGER,
          card: card("K", "hearts"),
        })
      ).toThrow("Você ainda não jogou nenhuma carta.");
    });

    it("fails when the last played card already left the table", () => {
      game.playCard("p1", card("4", "diamonds"));
      game.playCard("p2", card("5", "hearts")); // resolves the hand, clears bunch

      expect(() =>
        executePower(game, "p1", {
          powerId: PowerId.GRAVEDIGGER,
          card: card("K", "hearts"),
        })
      ).toThrow("Sua última carta já saiu da mesa.");
    });
  });

  it("round-trips power state through serialize", () => {
    executePower(game, "p1", {
      powerId: PowerId.SILENCER,
      targetUserId: "p2",
    });
    const data = JSON.parse(game.serialize());
    expect(data.activeEffects).toHaveLength(1);
    expect(data.powerUsages).toHaveLength(1);
  });
});
