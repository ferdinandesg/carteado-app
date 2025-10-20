// src/game/rules/TrucoGameRules.test.ts

import { Card } from "shared/cards";
import { TrucoGame, TrucoGameRules } from "./TrucoGameRules";
import { BasePlayer, GameStatus, PlayerStatus } from "shared/game";

// Helper para criar cartas facilmente nos testes
const card = (rank: string, suit: string, isHidden = false): Card =>
  ({
    rank,
    suit,
    isHidden,
    toString: () => `${rank}${suit}`,
  }) as unknown as Card;

describe("TrucoGameRules", () => {
  let rules: TrucoGameRules;
  let players: BasePlayer[];
  let game: TrucoGame;

  // Roda antes de cada 'it' block, garantindo um estado limpo
  beforeEach(() => {
    rules = new TrucoGameRules();
    players = [
      { userId: "p1", hand: [], playedCards: [], status: PlayerStatus.PLAYING },
      { userId: "p2", hand: [], playedCards: [], status: PlayerStatus.PLAYING },
      { userId: "p3", hand: [], playedCards: [], status: PlayerStatus.PLAYING },
      { userId: "p4", hand: [], playedCards: [], status: PlayerStatus.PLAYING },
    ] as unknown as BasePlayer[];

    game = new TrucoGame(players);
    game.status = GameStatus.PLAYING;
    game.playerTurn = "p1";

    // Mockar o baralho para não depender da aleatoriedade
    // Definimos o 'vira' como um 7 de Paus, então a manilha será a Dama (Q)
    game.vira = card("7", "C");
    game.manilha = "Q";
  });

  // ===================================================================
  // TESTES DA LÓGICA DE TRUCO
  // ===================================================================
  describe("Truco Logic", () => {
    it("should allow a player to ask for truco, raising the bet to 3", () => {
      // Act
      rules.askTruco(game, "p1");

      // Assert
      expect(game.trucoState).toBe("PENDING");
      expect(game.currentBet).toBe(3);
      expect(game.trucoAskerId).toBe("p1");
    });

    it("should allow the challenged team to 'retruco' (ask for 6)", () => {
      // Arrange
      rules.askTruco(game, "p1"); // Time A pede truco

      // Act
      rules.askTruco(game, "p2"); // Time B retruca para 6

      // Assert
      expect(game.trucoState).toBe("PENDING");
      expect(game.currentBet).toBe(6);
      expect(game.trucoAskerId).toBe("p2");
    });

    it("should prevent the same team from asking for truco twice in a row", () => {
      // Arrange
      rules.askTruco(game, "p1"); // Time A pediu

      // Act & Assert
      expect(() => {
        rules.askTruco(game, "p3"); // Time A tenta pedir de novo
      }).toThrow("Seu time já pediu truco. Aguarde a resposta.");
    });

    it("should award 1 point to the asking team if the opponent rejects truco", () => {
      // Arrange
      rules.askTruco(game, "p1");
      const teamA = rules.findTeamByUserId(game, "p1")!;
      const initialScore = teamA.score;

      // Mock para a função de dar as mãos, para verificar se uma nova rodada começou
      rules.dealInitialHands = jest.fn();

      // Act
      rules.rejectTruco(game);

      // Assert
      expect(teamA.score).toBe(initialScore + 1);
      expect(rules.dealInitialHands).toHaveBeenCalled();
    });

    it("should prevent a player from playing a card while a truco call is pending", () => {
      // Arrange
      rules.askTruco(game, "p1");

      // Act & Assert
      expect(() => {
        rules.canPlayCard(game, "p2");
      }).toThrow();
    });
  });

  // ===================================================================
  // TESTES DE RESOLUÇÃO DE MÃO E RODADA
  // ===================================================================
  describe("Hand and Round Resolution", () => {
    // Helper para simular uma mão sendo jogada
    const playHand = (cardsPlayed: { userId: string; card: Card }[]) => {
      cardsPlayed.forEach((play) => {
        const player = game.getPlayer(play.userId)!;
        player.hand = [play.card];
        rules.applyPlayCard(game, play.userId, play.card);
      });
    };

    it("should award the hand to the player with the highest card", () => {
      // Arrange
      const king = card("K", "H"); // Carta mais forte
      const jack = card("J", "S"); // Carta mais fraca

      // Act
      playHand([
        { userId: "p1", card: king },
        { userId: "p2", card: jack },
        { userId: "p3", card: card("4", "D") },
        { userId: "p4", card: card("5", "C") },
      ]);

      // Assert
      const teamA = rules.findTeamByUserId(game, "p1")!;
      expect(teamA.roundWins).toBe(1);
      expect(game.playerTurn).toBe("p1"); // Vencedor da mão começa a próxima
    });

    it("should result in a tied hand if both teams play the highest card", () => {
      // Arrange
      const kingOfHearts = card("K", "H"); // Time A joga
      const kingOfSpades = card("K", "S"); // Time B joga a mesma força

      // Act
      playHand([
        { userId: "p1", card: kingOfHearts },
        { userId: "p2", card: kingOfSpades },
        { userId: "p3", card: card("4", "D") },
        { userId: "p4", card: card("5", "C") },
      ]);

      // Assert
      const teamA = rules.findTeamByUserId(game, "p1")!;
      const teamB = rules.findTeamByUserId(game, "p2")!;
      expect(teamA.roundWins).toBe(1);
      expect(teamB.roundWins).toBe(1);
    });

    it("should award the round to the team that wins the first two hands", () => {
      // Arrange - Mão 1 (Time A vence)
      playHand([
        { userId: "p1", card: card("K", "H") },
        { userId: "p2", card: card("J", "S") },
        { userId: "p3", card: card("4", "D") },
        { userId: "p4", card: card("5", "C") },
      ]);

      // Arrange - Mão 2 (Time A vence de novo)
      playHand([
        { userId: "p1", card: card("A", "H") }, // A carta mais forte
        // CORREÇÃO: Trocamos a Dama (manilha) por um Valete, que é mais fraco que o Ás.
        { userId: "p2", card: card("J", "S") },
        { userId: "p3", card: card("6", "D") },
        { userId: "p4", card: card("7", "C") }, // Corrigi o naipe para 'C' de Paus
      ]);

      // Assert
      const teamA = rules.findTeamByUserId(game, "p1")!;
      expect(teamA.score).toBe(1); // Agora o Time A ganha a rodada e 1 ponto.
    });

    it("should resolve the round for the winner of the second hand if the first was tied", () => {
      // Arrange - Mão 1 (Empate)
      playHand([
        { userId: "p1", card: card("K", "H") },
        { userId: "p2", card: card("K", "S") },
        { userId: "p3", card: card("4", "D") },
        { userId: "p4", card: card("5", "C") },
      ]);

      // Arrange - Mão 2 (Time B Vence)
      playHand([
        { userId: "p1", card: card("J", "H") },
        { userId: "p2", card: card("A", "S") },
        { userId: "p3", card: card("6", "D") },
        { userId: "p4", card: card("7", "P") },
      ]);

      // Assert
      const teamB = rules.findTeamByUserId(game, "p2")!;
      expect(teamB.score).toBe(1); // Ganhou a rodada pois a primeira empatou
      expect(game.handsResults).toHaveLength(2); // Rodada acaba na segunda mão
    });
    describe("Edge Case Resolution", () => {
      it("should award the round to the winner of the first hand if the second is tied", () => {
        // Captura o número da rodada que será jogada (inicialmente é 0)
        const roundThatWasPlayed = game.rounds;

        // Mão 1: Time A vence
        playHand([
          { userId: "p1", card: card("K", "H") },
          { userId: "p2", card: card("J", "S") },
          { userId: "p3", card: card("4", "D") },
          { userId: "p4", card: card("5", "C") },
        ]);

        // Mão 2: Empate
        playHand([
          { userId: "p1", card: card("A", "H") },
          { userId: "p2", card: card("A", "S") },
          { userId: "p3", card: card("6", "D") },
          { userId: "p4", card: card("7", "C") },
        ]);

        // Assert: Time A deve ganhar a rodada com 1 ponto.
        const teamA = rules.findTeamByUserId(game, "p1")!;
        expect(teamA.score).toBe(1);

        // Assert: O jogo avançou para a próxima rodada (0 -> 1).
        expect(game.rounds).toBe(roundThatWasPlayed + 1);

        // Assert: Os resultados da rodada que JOGAMOS (0) devem ter 2 entradas.
        expect(
          game.handsResults.filter((r) => r.round === roundThatWasPlayed)
        ).toHaveLength(2);
      });

      it("should award the round to team A if the first hand is tied and team A wins the second", () => {
        // Mão 1: Empate
        playHand([
          { userId: "p1", card: card("K", "H") },
          { userId: "p2", card: card("K", "S") },
          { userId: "p3", card: card("4", "D") },
          { userId: "p4", card: card("5", "C") },
        ]);

        // Mão 2: Time A vence
        playHand([
          { userId: "p1", card: card("A", "H") },
          { userId: "p2", card: card("J", "S") },
          { userId: "p3", card: card("6", "D") },
          { userId: "p4", card: card("7", "C") },
        ]);

        // Assert: Time A ganha a rodada com 1 ponto, pois a primeira empatou e ele venceu a segunda.
        // A rodada termina aqui.
        const teamA = rules.findTeamByUserId(game, "p1")!;
        const teamB = rules.findTeamByUserId(game, "p2")!;
        expect(teamA.score).toBe(1);
        expect(teamB.score).toBe(0);
      });

      it("should correctly handle the full truco bet progression (3, 6, 9, 12)", () => {
        // 1. Time A pede TRUCO (aposta vai para 3)
        rules.askTruco(game, "p1");
        expect(game.currentBet).toBe(3);

        // 2. Time B ACEITA
        rules.acceptTruco(game, "p2");

        // 3. Time B pede SEIS (aposta vai para 6)
        rules.askTruco(game, "p2");
        expect(game.currentBet).toBe(6);

        // 4. Time A ACEITA
        rules.acceptTruco(game, "p1");

        // 5. Time A pede NOVE (aposta vai para 9)
        rules.askTruco(game, "p1");
        expect(game.currentBet).toBe(9);

        // 6. Time B ACEITA
        rules.acceptTruco(game, "p2");

        // 7. Time B pede DOZE (aposta vai para 12)
        rules.askTruco(game, "p2");
        expect(game.currentBet).toBe(12);

        // 8. Time A FOGE
        rules.rejectTruco(game);

        // Assert: Time B ganha 9 pontos (a aposta anterior a 12)
        const teamB = rules.findTeamByUserId(game, "p2")!;
        expect(teamB.score).toBe(9);
      });

      it("should finish the game when a team reaches 12 points", () => {
        const teamA = rules.findTeamByUserId(game, "p1")!;
        teamA.score = 11; // Time A está a 1 ponto de vencer

        // ✅ CORREÇÃO: Adicione as jogadas de p3 e p4 para completar a mão
        // Time A vence a primeira mão
        playHand([
          { userId: "p1", card: card("K", "H") },
          { userId: "p2", card: card("J", "S") },
          { userId: "p3", card: card("4", "D") }, // Jogada adicionada
          { userId: "p4", card: card("5", "C") }, // Jogada adicionada
        ]);

        // Time A vence a segunda mão
        playHand([
          { userId: "p1", card: card("A", "H") },
          { userId: "p2", card: card("J", "C") },
          { userId: "p3", card: card("6", "D") }, // Jogada adicionada
          { userId: "p4", card: card("7", "S") }, // Jogada adicionada
        ]);

        // Assert
        expect(teamA.score).toBe(12);
        expect(game.status).toBe(GameStatus.FINISHED);
      });

      it("should not allow more points to be scored after the game is finished", () => {
        const teamA = rules.findTeamByUserId(game, "p1")!;
        teamA.score = 12; // O jogo já acabou
        game.status = GameStatus.FINISHED;

        // Tenta finalizar outra rodada para o Time A
        rules.finishRound(game, teamA, 3);

        // Assert: A pontuação não deve mudar
        expect(teamA.score).toBe(12);
      });
    });
  });
});
