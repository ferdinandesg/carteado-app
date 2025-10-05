import { GamePlayer, PlayerStatus } from "shared/game";
import { CarteadoGame, CarteadoGameRules } from "./CarteadoGameRules";
import { Card } from "shared/cards";

describe("CarteadoGameRules", () => {
  let rules: CarteadoGameRules;
  let players: GamePlayer[];
  let game: CarteadoGame;

  beforeEach(() => {
    // 1) Defina jogadores falsos
    players = [
      {
        userId: "player1",
        hand: [],
        name: "Player 1",
        table: [],
        playedCards: [],
        status: PlayerStatus.CHOOSING,
      },
      {
        userId: "player2",
        name: "Player 2",
        hand: [],
        table: [],
        playedCards: [],
        status: PlayerStatus.CHOOSING,
      },
    ];

    // 2) Cria uma instância de "CarteadoGameRules"
    rules = new CarteadoGameRules();

    // 3) Cria uma instância do "CarteadoGame"
    game = new CarteadoGame(players);
  });
  it("should deal initial hands", () => {});

  it("deve iniciar o jogo (dealInitialHands) com status PLAYING e as mãos preenchidas", () => {
    // Chama o método que deseja testar
    rules.dealInitialHands(game);

    // Verifica se o estado do jogo mudou
    expect(game.status).toBe("playing"); // ou GameStatus.PLAYING

    // Verifica se cada jogador recebeu cartas
    game.players.forEach((player) => {
      expect(player.hand.length).toBeGreaterThan(0);
      expect(player.status).toBe("choosing");
    });
  });

  it("deve marcar carta como especial se for '2' ou '10'", () => {
    // Setup
    const player1 = game.players[0];
    const cardDois: Card = {
      rank: "2",
      suit: "hearts",
      value: 2,
      secondaryValue: null,
      toString: "2 of hearts",
    };
    const cardDez: Card = {
      rank: "10",
      suit: "spades",
      value: 10,
      secondaryValue: null,
      toString: "10 of spades",
    };

    // Testa rank '2'
    let isSpecial = rules.isSpecialCard(game, player1, cardDois);
    expect(isSpecial).toBe(true);

    // Testa rank '10'
    isSpecial = rules.isSpecialCard(game, player1, cardDez);
    expect(isSpecial).toBe(true);
  });

  it("não deve permitir jogar carta oculta se o jogador ainda tiver cartas na mão", () => {
    const player1 = game.players[0];
    player1.hand = [
      {
        rank: "3",
        suit: "hearts",
        value: 3,
        secondaryValue: null,
        toString: "3 of hearts",
      },
    ];
    // O card "hidden" simula estar "virado para baixo"
    const hiddenCard: Card = {
      rank: "A",
      suit: "clubs",
      value: 12,
      secondaryValue: null,
      toString: "A of clubs",
      hidden: true,
    };

    // Esperamos que ao chamar canPlayCard dispare erro "CANT_PLAY_HIDDEN_YET"
    expect(() => {
      rules.canPlayCard(game, player1.userId, hiddenCard);
    }).toThrow("CANT_PLAY_HIDDEN_YET");
  });
});
