// src/game/rules/CarteadoGameRules.test.ts

import { Card } from "shared/cards";
import { CarteadoGame, CarteadoGameRules } from "./CarteadoGameRules";
import { BasePlayer, GameStatus, PlayerStatus } from "shared/game";

// Helper para criar cartas facilmente nos testes
const card = (
  rank: string,
  suit: string,
  value: number,
  isHidden = false
): Card =>
  ({
    rank,
    suit,
    value,
    isHidden,
    toString: `${rank}${suit}`,
  }) as Card;

describe("CarteadoGameRules", () => {
  let rules: CarteadoGameRules;
  let players: BasePlayer[];
  let game: CarteadoGame;

  // Roda antes de cada 'it' block, garantindo um estado limpo
  beforeEach(() => {
    rules = new CarteadoGameRules();
    players = [
      {
        userId: "player1",
        hand: [],
        table: [],
        playedCards: [],
        status: PlayerStatus.PLAYING,
      },
      {
        userId: "player2",
        hand: [],
        table: [],
        playedCards: [],
        status: PlayerStatus.PLAYING,
      },
    ] as unknown as BasePlayer[];
    game = new CarteadoGame(players);
    game.status = GameStatus.PLAYING;
    game.playerTurn = "player1";

    // Mockar o baralho para não depender da aleatoriedade
    game.deck.getCards = jest.fn(() => [card("K", "C", 13)]); // Simula que ainda há cartas
  });

  describe("applyPlayCard", () => {
    it("should allow a player to play a higher card", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const fiveOfHearts = card("5", "H", 5);
      player1.hand = [fiveOfHearts];
      game.bunch = [card("4", "S", 4)];

      // Act
      rules.applyPlayCard(game, "player1", fiveOfHearts);

      // Assert
      expect(player1.hand).toHaveLength(0);
      expect(game.bunch).toHaveLength(2);
      expect(game.bunch.at(-1)).toEqual(fiveOfHearts);
    });

    it("should throw an error if the player plays a lower card", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const threeOfClubs = card("3", "C", 3);
      player1.hand = [threeOfClubs];
      game.bunch = [card("A", "D", 14)]; // Ás é alto

      // Act & Assert
      // Verificamos se a ação de jogar a carta lança o erro esperado
      expect(() => {
        rules.applyPlayCard(game, "player1", threeOfClubs);
      }).toThrow("LOWER_RANK");
    });

    it("should allow a player to play a 10 on any card", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const tenOfSpades = card("10", "S", 10);
      player1.hand = [tenOfSpades];
      game.bunch = [card("K", "H", 13)]; // Uma carta alta

      // Act
      rules.applyPlayCard(game, "player1", tenOfSpades);

      // Assert
      expect(player1.hand).toHaveLength(0);
      expect(game.bunch.at(-1)).toEqual(tenOfSpades);
    });

    it("should allow playing a 4th card of the same rank out of turn", () => {
      // Arrange
      game.playerTurn = "player1"; // É a vez do player 1
      const player2 = game.getPlayer("player2")!;
      const sevenOfDiamonds = card("7", "D", 7);
      player2.hand = [sevenOfDiamonds];
      game.bunch = [card("7", "H", 7), card("7", "S", 7), card("7", "C", 7)];

      // Act
      // O player 2 joga, mesmo não sendo sua vez
      rules.canPlayCard(game, "player2", sevenOfDiamonds); // Isso não deve lançar erro
      rules.applyPlayCard(game, "player2", sevenOfDiamonds);

      // Assert
      expect(player2.hand).toHaveLength(0);
      expect(game.bunch).toHaveLength(4);
    });
  });
  describe("applyEndTurn", () => {
    it("should clear the bunch if the last card played was a 10", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const tenOfSpades = card("10", "S", 10);
      player1.playedCards = [tenOfSpades]; // Simula que a carta foi jogada neste turno
      game.bunch = [card("5", "H", 5), tenOfSpades];

      // Act
      rules.applyEndTurn(game, "player1");

      // Assert
      expect(game.bunch).toHaveLength(0);
    });

    it("should skip the next player if a 2 was played", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const twoOfClubs = card("2", "C", 2);
      player1.playedCards = [twoOfClubs];
      game.bunch = [twoOfClubs];
      // Adicionamos um 3º jogador para o teste de pulo ser mais claro
      players.push({
        userId: "player3",
        hand: [],
        table: [],
        playedCards: [],
        status: PlayerStatus.PLAYING,
      } as unknown as BasePlayer);

      // Act
      rules.applyEndTurn(game, "player1");

      // Assert
      // O turno deveria ir do player1 para o player3, pulando o player2
      expect(game.playerTurn).toBe("player3");
    });

    it("should refill the players hand to 3 cards if deck has cards", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      player1.hand = [card("J", "D", 11)]; // Apenas 1 carta na mão
      player1.playedCards = [card("Q", "C", 12)];
      // Mock para o baralho retornar 2 cartas
      game.deck.draw = jest
        .fn()
        .mockReturnValueOnce(card("8", "H", 8))
        .mockReturnValueOnce(card("9", "S", 9));

      // Act
      rules.applyEndTurn(game, "player1");

      // Assert
      expect(player1.hand).toHaveLength(3);
    });

    it("should declare a winner if a player has no more cards (hand and table)", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      player1.hand = []; // Sem cartas na mão
      player1.table = []; // Sem cartas na mesa
      player1.playedCards = [card("A", "S", 14)]; // Acabou de jogar a última
      game.deck.getCards = jest.fn(() => []); // Baralho vazio

      // Act
      rules.applyEndTurn(game, "player1");

      // Assert
      expect(game.status).toBe(GameStatus.FINISHED);
      expect(game.playerTurn).toBe("player1"); // O vencedor é o último a jogar
    });
  });
  // Copie este novo `it` para dentro do seu `describe("applyEndTurn", ...)`

  it("should clear the bunch if four of a kind were played", () => {
    // Arrange
    const player1 = game.getPlayer("player1")!;
    const eightOfClubs = card("8", "C", 8);
    // Simula que a 4ª carta igual foi a última jogada no turno
    player1.playedCards = [eightOfClubs];
    game.bunch = [
      card("K", "D", 13), // Lixo no monte
      card("8", "H", 8),
      card("8", "S", 8),
      card("8", "D", 8),
      eightOfClubs, // A quarta carta
    ];

    // Act
    rules.applyEndTurn(game, "player1");

    // Assert
    // O efeito especial deve limpar o monte inteiro
    expect(game.bunch).toHaveLength(0);
  });
  it("should burn the pile up to and including the four-of-a-kind sequence, keeping cards played after", () => {
    // Arrange
    const player1 = game.getPlayer("player1")!;

    // A carta que o jogador acabou de jogar para completar a sequência
    const fourthEight = card("8", "C", 8);
    player1.playedCards = [fourthEight];

    // A carta "sobrevivente" que foi jogada DEPOIS da sequência de 4
    const survivorCard = card("J", "S", 11);

    // Montamos o monte para simular o cenário exato
    game.bunch = [
      card("K", "D", 13), // 1. Lixo no início
      card("8", "H", 8), // 2. Início da sequência
      card("8", "S", 8),
      card("8", "D", 8),
      fourthEight, // 3. Fim da sequência
      survivorCard, // 4. A carta que deve sobrar
    ];

    // Act
    // O applyEndTurn irá chamar a lógica interna de removeFourOfAKind
    rules.applyEndTurn(game, "player1");

    // Assert
    // Verificamos se o monte agora contém APENAS a carta sobrevivente
    expect(game.bunch).toHaveLength(1);
    expect(game.bunch[0]).toEqual(survivorCard);
    // Uma verificação ainda mais robusta:
    expect(game.bunch).toEqual([survivorCard]);
  });
  // Adicione este novo `it` no `describe('applyPlayCard', ...)` para testar a validação
  it("should throw an error if trying to play a hidden card while having cards in hand", () => {
    // Arrange
    const player1 = game.getPlayer("player1")!;
    const hiddenCard = card("A", "C", 14, true);
    player1.hand = [card("5", "H", 5)]; // Jogador ainda tem cartas na mão
    player1.table = [hiddenCard];

    // Act & Assert
    expect(() => {
      rules.canPlayCard(game, "player1", hiddenCard);
    }).toThrow("CANT_PLAY_HIDDEN_YET");
  });

  // Adicione estes novos blocos `describe` ao final do seu arquivo de teste

  describe("pickUpBunch", () => {
    it("should move all cards from the bunch to the player's hand", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      player1.hand = [];
      game.bunch = [card("5", "H", 5), card("J", "D", 11)];
      player1.playedCards = [card("3", "S", 3)]; // Simula uma jogada anterior

      // Act
      rules.pickUpBunch(game, "player1");

      // Assert
      expect(player1.hand).toHaveLength(2);
      expect(player1.hand.map((c) => c.rank)).toEqual(
        expect.arrayContaining(["5", "J"])
      );
      expect(game.bunch).toHaveLength(0);
      expect(player1.playedCards).toHaveLength(0); // Garante que as jogadas também são limpas
    });

    it("should throw an error if it's not the player's turn", () => {
      // Arrange
      game.playerTurn = "player2";

      // Act & Assert
      expect(() => {
        rules.pickUpBunch(game, "player1");
      }).toThrow("NOT_YOUR_TURN");
    });
  });

  describe("Game Setup and Flow", () => {
    it("should deal 9 cards to each player and set status to CHOOSING", () => {
      // Arrange
      // Mock para a função que dá as 9 cartas iniciais
      const initialCards = Array.from({ length: 9 }, (_, i) =>
        card(`${i + 2}`, "H", i + 2)
      );
      game.deck.giveTableCards = jest.fn().mockReturnValue(initialCards);

      // Act
      rules.dealInitialHands(game);

      // Assert
      const player1 = game.getPlayer("player1")!;
      expect(player1.status).toBe(PlayerStatus.CHOOSING);
      expect(player1.hand).toHaveLength(9);
      expect(game.deck.giveTableCards).toHaveBeenCalledTimes(players.length);
    });

    it("should correctly set hand and table cards after a player chooses", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const allCards = [
        card("A", "S", 14),
        card("K", "S", 13),
        card("Q", "S", 12),
        card("J", "S", 11),
        card("10", "S", 10),
        card("9", "S", 9),
      ];
      player1.hand = allCards; // Simula a mão antes da escolha
      player1.status = PlayerStatus.CHOOSING;
      const chosenHand = [
        card("A", "S", 14),
        card("K", "S", 13),
        card("Q", "S", 12),
      ];

      // Act
      rules.pickHand(game, "player1", chosenHand);

      // Assert
      expect(player1.hand).toHaveLength(3);
      expect(player1.hand.map((c) => c.rank)).toEqual(["A", "K", "Q"]);
      expect(player1.table).toHaveLength(3);
      expect(player1.table.map((c) => c.rank)).toEqual(["J", "10", "9"]);
      expect(player1.status).toBe(PlayerStatus.PLAYING);
    });

    it("should move visible table cards to hand when deck is empty and hand is empty", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      player1.hand = [];
      player1.table = [card("J", "H", 11, false), card("Q", "S", 12, true)]; // Uma visível, uma escondida
      player1.playedCards = [card("A", "C", 14)]; // Simula que ele acabou de jogar
      game.deck.getCards = jest.fn(() => []); // Baralho está vazio

      // Act
      rules.applyEndTurn(game, "player1");

      // Assert
      // A carta visível da mesa deve ir para a mão
      expect(player1.hand).toHaveLength(1);
      expect(player1.hand[0].rank).toBe("J");
      // A carta escondida deve permanecer na mesa
      expect(player1.table).toHaveLength(1);
      expect(player1.table[0].rank).toBe("Q");
    });
  });
  it("should skip multiple players if multiple 2s were played in the same turn", () => {
    // Arrange
    players.push({
      userId: "player3",
      hand: [],
      table: [],
      playedCards: [],
      status: PlayerStatus.PLAYING,
    } as any);
    players.push({
      userId: "player4",
      hand: [],
      table: [],
      playedCards: [],
      status: PlayerStatus.PLAYING,
    } as any);

    const player1 = game.getPlayer("player1")!;
    const twoOfClubs = card("2", "C", 2);
    const twoOfDiamonds = card("2", "D", 2);

    // O jogador jogou dois "2" no mesmo turno
    player1.playedCards = [twoOfClubs, twoOfDiamonds];
    game.bunch = [twoOfClubs, twoOfDiamonds];

    // Act
    rules.applyEndTurn(game, "player1");

    // Assert
    // O turno deve pular o player2 e o player3, caindo no player4
    expect(game.playerTurn).toBe("player4");
  });

  it("should allow playing a hidden card when hand and visible table cards are empty", () => {
    // Arrange
    const player1 = game.getPlayer("player1")!;
    const hiddenCard = card("A", "C", 14, true);
    player1.hand = []; // Mão vazia
    player1.table = [hiddenCard]; // Apenas cartas escondidas na mesa
    game.deck.getCards = jest.fn(() => []); // Baralho vazio

    // Act
    // A validação não deve lançar erro
    rules.canPlayCard(game, "player1", hiddenCard);
    rules.applyPlayCard(game, "player1", hiddenCard);

    // Assert
    expect(player1.table).toHaveLength(0); // A carta foi jogada da mesa
    expect(game.bunch).toContainEqual(
      expect.objectContaining({ rank: "A", isHidden: false })
    ); // A carta está no monte e agora é visível
  });

  it("should throw an error if a player tries to play when it is not their turn", () => {
    // Arrange
    game.playerTurn = "player2"; // É a vez do jogador 2
    const player1 = game.getPlayer("player1")!;
    const cardToPlay = card("5", "H", 5);
    player1.hand = [cardToPlay];

    // Act & Assert
    expect(() => {
      rules.applyPlayCard(game, "player1", cardToPlay);
    }).toThrow("NOT_YOUR_TURN");
  });

  it("should throw an error if a player plays a card they do not have", () => {
    // Arrange
    const player1 = game.getPlayer("player1")!;
    player1.hand = [card("J", "C", 11)];
    const cardNotInHand = card("Q", "D", 12);

    // Act & Assert
    expect(() => {
      // Note: Sua lógica atual pode não ter um erro customizado para isso,
      // o teste vai expor se um erro genérico acontece ou se o estado quebra.
      // O ideal é que sua applyPlayCard valide se o jogador possui a carta.
      rules.applyPlayCard(game, "player1", cardNotInHand);
    }).toThrow(); // Pode ser um erro como 'CARD_NOT_FOUND'
  });

  // Adicione este teste ao seu describe("applyEndTurn", ...)

  it("should throw an error if a player tries to end the turn without playing a card", () => {
    // Arrange
    const player1 = game.getPlayer("player1")!;
    player1.playedCards = []; // O jogador não jogou nada neste turno

    // Act & Assert
    expect(() => {
      rules.applyEndTurn(game, "player1");
    }).toThrow("MUST_PLAY_FIRST");
  });
  describe("undoPlay", () => {
    it("should return the played card from the bunch back to the players hand", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      const cardToUndo = card("8", "S", 8);
      player1.hand = []; // Mão estava vazia
      player1.playedCards = [cardToUndo]; // Jogou a carta
      game.bunch = [card("7", "H", 7), cardToUndo];

      // Act
      rules.undoPlay(game, "player1");

      // Assert
      expect(player1.hand).toHaveLength(1);
      expect(player1.hand[0]).toEqual(cardToUndo);
      expect(game.bunch).toHaveLength(1);
      expect(game.bunch[0].rank).toBe("7");
      expect(player1.playedCards).toHaveLength(0);
    });

    it("should throw an error if the player has not played any cards in the turn", () => {
      // Arrange
      const player1 = game.getPlayer("player1")!;
      player1.playedCards = [];

      // Act & Assert
      expect(() => {
        rules.undoPlay(game, "player1");
      }).toThrow("MUST_PLAY_FIRST");
    });
  });
});
