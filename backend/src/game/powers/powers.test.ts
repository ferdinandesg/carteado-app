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
      expect(game.pendingPrivateResult).toEqual(result.privateResult);
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
    it("swaps the last played card with a remaining deck card of equal or greater value", () => {
      game.playCard("p1", card("4", "diamonds"));
      game.deck.cards = [card("A", "spades"), card("5", "clubs")];
      jest.spyOn(Math, "random").mockReturnValue(0);

      executePower(game, "p1", { powerId: PowerId.GRAVEDIGGER });
      jest.restoreAllMocks();

      const p1 = game.getPlayer("p1")!;
      expect(p1.hand).toEqual([card("K", "hearts")]);
      expect(p1.playedCards).toEqual([card("A", "spades")]);
      expect(game.bunch).toEqual([card("A", "spades")]);
      expect(game.deck.cards).toEqual([
        card("4", "diamonds"),
        card("5", "clubs"),
      ]);
      expect(game.powerUsages).toEqual([
        expect.objectContaining({
          powerId: PowerId.GRAVEDIGGER,
          userId: "p1",
          returnedCard: card("4", "diamonds"),
          replacementCard: card("A", "spades"),
        }),
      ]);
    });

    it("fails when no remaining deck card is strong enough", () => {
      game.getPlayer("p1")!.hand = [card("K", "hearts")];
      game.playCard("p1", card("K", "hearts"));
      game.deck.cards = [card("4", "diamonds")];

      expect(() =>
        executePower(game, "p1", { powerId: PowerId.GRAVEDIGGER })
      ).toThrow("Não há carta restante com valor maior ou igual.");
    });

    it("fails when the player has not played yet", () => {
      expect(() =>
        executePower(game, "p1", { powerId: PowerId.GRAVEDIGGER })
      ).toThrow("Você ainda não jogou nenhuma carta.");
    });

    it("fails when the last played card already left the table", () => {
      game.playCard("p1", card("4", "diamonds"));
      game.playCard("p2", card("5", "hearts")); // resolves the hand, clears bunch

      expect(() =>
        executePower(game, "p1", { powerId: PowerId.GRAVEDIGGER })
      ).toThrow("Sua última carta já saiu da mesa.");
    });
  });

  describe("card-stamped powers", () => {
    it("fires CHANGE_TRUMP when the played card is stamped", () => {
      game.deck.cards = [card("A", "spades")];
      const stamped = card("K", "hearts");
      stamped.powerId = PowerId.CHANGE_TRUMP;
      game.getPlayer("p1")!.hand = [stamped];

      game.playCard("p1", stamped);

      expect(game.vira).toEqual(card("A", "spades"));
      expect(game.manilha).toBe("2");
      expect(game.powerUsages).toEqual([
        expect.objectContaining({
          powerId: PowerId.CHANGE_TRUMP,
          userId: "p1",
          trigger: "CARD",
        }),
      ]);
      expect(game.bunch[0].powerId).toBeUndefined();
    });

    it("picks a random opponent for targeted powers", () => {
      const stamped = card("K", "hearts");
      stamped.powerId = PowerId.SILENCER;
      game.getPlayer("p1")!.hand = [stamped];

      game.playCard("p1", stamped);

      expect(game.activeEffects).toEqual([
        expect.objectContaining({
          powerId: PowerId.SILENCER,
          sourceUserId: "p1",
          targetUserId: "p2",
        }),
      ]);
    });

    it("fires GRAVEDIGGER when the played card is stamped", () => {
      const stamped = card("4", "diamonds");
      stamped.powerId = PowerId.GRAVEDIGGER;
      game.getPlayer("p1")!.hand = [stamped, card("K", "hearts")];
      game.deck.cards = [card("A", "spades")];

      game.playCard("p1", stamped);

      expect(game.bunch).toEqual([card("A", "spades")]);
      expect(game.getPlayer("p1")!.hand).toEqual([card("K", "hearts")]);
      expect(game.deck.cards).toEqual([card("4", "diamonds")]);
      expect(game.powerUsages).toEqual([
        expect.objectContaining({
          powerId: PowerId.GRAVEDIGGER,
          userId: "p1",
          trigger: "CARD",
          returnedCard: card("4", "diamonds"),
          replacementCard: card("A", "spades"),
        }),
      ]);
    });

    it("fires X_RAY when the played card is stamped and stores a private peek", () => {
      const stamped = card("K", "hearts");
      stamped.powerId = PowerId.X_RAY;
      game.getPlayer("p1")!.hand = [stamped];
      jest.spyOn(Math, "random").mockReturnValue(0);

      game.playCard("p1", stamped);
      jest.restoreAllMocks();

      expect(game.pendingPrivateResult).toEqual({
        powerId: PowerId.X_RAY,
        targetUserId: "p2",
        card: card("3", "spades"),
      });
    });

    it("does not consume the manual-use cooldown", () => {
      game.deck.cards = [card("A", "spades"), card("2", "hearts")];
      executePower(game, "p1", { powerId: PowerId.CHANGE_TRUMP });

      const stamped = card("4", "diamonds");
      stamped.powerId = PowerId.CHANGE_TRUMP;
      game.getPlayer("p1")!.hand = [stamped];
      game.playerTurn = "p1";

      expect(() => game.playCard("p1", stamped)).not.toThrow();
      expect(
        game.powerUsages.filter((u) => u.powerId === PowerId.CHANGE_TRUMP)
      ).toHaveLength(2);
    });

    it("stamps powers on hands and never on the vira or manilha", () => {
      game.rules.dealInitialHands(game);
      expect(game.vira?.powerId).toBeUndefined();
      const hands = game.players.flatMap((p) => p.hand);
      expect(
        hands.filter((c) => c.rank === game.manilha).every((c) => !c.powerId)
      ).toBe(true);
      const stampable = hands.filter((c) => c.rank !== game.manilha);
      expect(
        new Set(stampable.map((c) => c.powerId).filter(Boolean)).size
      ).toBe(Math.min(Object.values(PowerId).length, stampable.length));
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
