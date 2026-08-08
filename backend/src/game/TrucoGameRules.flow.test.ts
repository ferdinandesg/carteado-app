// Testes de fluxo completo do TRUCO: partidas inteiras (1v1) até 12 pontos,
// com deal real e mãos sobrescritas de forma determinística a cada rodada.

import { Card } from "shared/cards";
import { GameStatus } from "shared/game";
import { TrucoGame } from "./TrucoGameRules";
import { GameFactory } from "./GameFactory";
import { card, makePlayers } from "@/tests/helpers/gameTestHarness";

describe("TrucoGame — fluxo completo de partida (2 jogadores)", () => {
  let game: TrucoGame;

  beforeEach(() => {
    game = new TrucoGame(makePlayers(["p1", "p2"]));
    game.startGame();
    setupRound();
  });

  /** Fixa vira/manilha e o jogador da vez, para tornar a rodada previsível. */
  const setupRound = () => {
    game.vira = card("7", "clubs");
    game.manilha = "Q";
    game.playerTurn = "p1";
  };

  /** Cada jogador joga exatamente uma carta, na ordem do turno. */
  const playHand = (plays: { userId: string; card: Card }[]) => {
    plays.forEach(({ userId, card: c }) => {
      game.getPlayer(userId)!.hand = [c];
      game.playCard(userId, c);
    });
  };

  it("deve montar times 1v1 e distribuir 3 cartas válidas de truco por jogador", () => {
    expect(game.teams.map((t) => t.userIds)).toEqual([["p1"], ["p2"]]);
    for (const player of game.players) {
      expect(player.hand).toHaveLength(3);
      for (const c of player.hand) {
        expect(["8", "9", "10"]).not.toContain(c.rank);
      }
    }
    expect(game.vira).not.toBeNull();
    expect(game.status).toBe(GameStatus.PLAYING);
  });

  it("deve jogar uma partida completa até 12 pontos com truco aceito em cada rodada", () => {
    const teamA = game.teams[0];

    // 4 rodadas valendo 3 pontos cada (truco pedido e aceito) = 12
    for (let round = 1; round <= 4; round++) {
      setupRound();

      game.rules.askTruco(game, "p1");
      expect(game.trucoState).toBe("PENDING");
      expect(game.currentBet).toBe(3);

      // Com truco pendente ninguém joga
      expect(() => game.playCard("p1", card("K", "hearts"))).toThrow();

      game.rules.acceptTruco(game, "p2");
      expect(game.trucoState).toBe("ACCEPTED");

      // p1 vence as duas primeiras mãos e leva a rodada
      playHand([
        { userId: "p1", card: card("K", "hearts") },
        { userId: "p2", card: card("J", "spades") },
      ]);
      playHand([
        { userId: "p1", card: card("A", "hearts") },
        { userId: "p2", card: card("J", "diamonds") },
      ]);

      expect(teamA.score).toBe(round * 3);
    }

    expect(teamA.score).toBe(12);
    expect(game.status).toBe(GameStatus.FINISHED);
  });

  it("manilha deve vencer o 3, e entre manilhas decide o naipe (paus > ouros)", () => {
    const teamB = game.teams[1];

    // Mão 1: 3 (carta mais alta comum) perde para a manilha Q♦
    playHand([
      { userId: "p1", card: card("3", "hearts") },
      { userId: "p2", card: card("Q", "diamonds") },
    ]);
    expect(teamB.roundWins).toBe(1);
    expect(game.playerTurn).toBe("p2"); // vencedor abre a próxima mão

    // Mão 2: manilha de paus vence manilha de espadas
    playHand([
      { userId: "p2", card: card("Q", "spades") },
      { userId: "p1", card: card("Q", "clubs") },
    ]);
    expect(game.teams[0].roundWins).toBe(1);
    expect(game.playerTurn).toBe("p1");
    expect(game.status).toBe(GameStatus.PLAYING); // 1x1, rodada segue
  });

  it("três mãos empatadas devem iniciar nova rodada sem pontos para ninguém", () => {
    const roundPlayed = game.rounds;

    playHand([
      { userId: "p1", card: card("K", "hearts") },
      { userId: "p2", card: card("K", "spades") },
    ]);
    // Após uma mão empatada, o turno fica com quem jogou por último
    playHand([
      { userId: "p2", card: card("J", "spades") },
      { userId: "p1", card: card("J", "hearts") },
    ]);
    playHand([
      { userId: "p1", card: card("4", "hearts") },
      { userId: "p2", card: card("4", "spades") },
    ]);

    expect(game.teams[0].score).toBe(0);
    expect(game.teams[1].score).toBe(0);
    expect(game.rounds).toBe(roundPlayed + 1); // nova rodada foi distribuída
    expect(game.teams.every((t) => t.roundWins === 0)).toBe(true);
    expect(game.players.every((p) => p.hand.length === 3)).toBe(true);
  });

  it("deve continuar a rodada corretamente após serialize/recreate no meio da partida", () => {
    game.rules.askTruco(game, "p1");
    game.rules.acceptTruco(game, "p2");

    playHand([
      { userId: "p1", card: card("K", "hearts") },
      { userId: "p2", card: card("J", "spades") },
    ]);

    // Ciclo Redis: serialize -> recreate -> continuar a rodada
    const recreated = GameFactory.recreate(
      GameFactory.deserialize(game.serialize())
    ) as TrucoGame;

    expect(recreated.manilha).toBe("Q");
    expect(recreated.currentBet).toBe(3);
    expect(recreated.trucoState).toBe("ACCEPTED");
    expect(recreated.teams[0].roundWins).toBe(1);
    expect(recreated.playerTurn).toBe("p1");

    game = recreated;
    playHand([
      { userId: "p1", card: card("A", "hearts") },
      { userId: "p2", card: card("J", "diamonds") },
    ]);

    expect(game.teams[0].score).toBe(3); // rodada fechada valendo o truco
  });
});
