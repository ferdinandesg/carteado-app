// Testes de fluxo completo do CARTEADO: simulam uma partida inteira,
// do deal inicial até a vitória, sem mocks das regras — apenas o deck
// e o Math.random são tornados determinísticos.

import { Card } from "shared/cards";
import { GameStatus, PlayerStatus } from "shared/game";
import { CarteadoGame } from "./CarteadoGameRules";
import { GameFactory } from "./GameFactory";
import {
  card,
  forceHidden,
  installSeededRandom,
  makePlayers,
  rigDeck,
} from "@/tests/helpers/gameTestHarness";

describe("CarteadoGame — fluxo completo de partida", () => {
  // Fixtures frescas por teste: o jogo muta as cartas/arrays durante a partida
  const makeFixtures = () => ({
    // Jogador A (9): mão escolhida, visíveis na mesa e ocultas
    aHand: [card("3", "hearts"), card("3", "spades"), card("3", "diamonds")],
    aVisible: [card("5", "hearts"), card("5", "spades"), card("5", "diamonds")],
    aHidden: [card("A", "hearts"), card("2", "hearts"), card("10", "hearts")],
    // Jogador B (9)
    bHand: [card("4", "hearts"), card("4", "spades"), card("4", "diamonds")],
    bVisible: [card("6", "hearts"), card("6", "spades"), card("6", "diamonds")],
    bHidden: [card("A", "spades"), card("K", "spades"), card("Q", "spades")],
  });
  type Fixtures = ReturnType<typeof makeFixtures>;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Cria um jogo com deck rigado (18 cartas, esvazia após o deal),
   * executa o deal inicial e normaliza quais cartas ficam ocultas.
   */
  const setupDealtGame = (): { game: CarteadoGame; f: Fixtures } => {
    const f = makeFixtures();
    installSeededRandom();
    const game = new CarteadoGame(makePlayers(["A", "B"]));
    rigDeck(game.deck, [
      ...f.aHand,
      ...f.aVisible,
      ...f.aHidden,
      ...f.bHand,
      ...f.bVisible,
      ...f.bHidden,
    ]);
    game.startGame();
    game.playerTurn = "A";
    forceHidden(game.getPlayer("A")!, f.aHidden);
    forceHidden(game.getPlayer("B")!, f.bHidden);
    return { game, f };
  };

  it("deve bloquear jogadas até todos escolherem a mão e liberar o jogador da vez", () => {
    const { game, f } = setupDealtGame();

    expect(game.getPlayer("A")!.status).toBe(PlayerStatus.CHOOSING);
    expect(game.getPlayer("A")!.hand).toHaveLength(9);

    game.rules.pickHand(game, "A", f.aHand);
    expect(game.getPlayer("A")!.status).toBe(PlayerStatus.WAITING);

    // B ainda está escolhendo: ninguém pode jogar
    expect(() => game.playCard("A", f.aHand[0])).toThrow("PLAYERS_NOT_READY");

    game.rules.pickHand(game, "B", f.bHand);

    // Último pickHand promove o jogador da vez para PLAYING
    expect(game.getPlayer("A")!.status).toBe(PlayerStatus.PLAYING);
    expect(game.getPlayer("B")!.status).toBe(PlayerStatus.WAITING);

    // Agora a jogada é aceita
    game.playCard("A", f.aHand[0]);
    expect(game.bunch).toHaveLength(1);
  });

  it("deve jogar uma partida inteira até a vitória, sobrevivendo a um ciclo de serialização", () => {
    const setup = setupDealtGame();
    const { f } = setup;
    let game = setup.game;
    game.rules.pickHand(game, "A", f.aHand);
    game.rules.pickHand(game, "B", f.bHand);

    const play = (userId: string, ...cardsToPlay: Card[]) => {
      cardsToPlay.forEach((c) => game.playCard(userId, c));
      game.endTurn(userId);
    };

    // Turno 1 — A joga os três 3s; deck vazio, então as visíveis viram a mão
    play("A", ...f.aHand.slice());
    expect(game.getPlayer("A")!.hand.map((c) => c.rank)).toEqual([
      "5",
      "5",
      "5",
    ]);
    expect(game.getPlayer("A")!.table.every((c) => c.isHidden)).toBe(true);
    expect(game.playerTurn).toBe("B");

    // Turno 2 — B joga os três 4s por cima dos 3s
    play("B", ...f.bHand.slice());
    expect(game.getPlayer("B")!.hand.map((c) => c.rank)).toEqual([
      "6",
      "6",
      "6",
    ]);

    // Ciclo Redis no meio da partida: serialize -> recreate -> continuar jogando
    game = GameFactory.recreate(
      GameFactory.deserialize(game.serialize())
    ) as CarteadoGame;
    expect(game.playerTurn).toBe("A");
    expect(game.bunch).toHaveLength(6);

    // Turno 3 — A joga os 5s; fica só com as ocultas na mesa
    play("A", ...f.aVisible.slice());
    expect(game.getPlayer("A")!.hand).toHaveLength(0);
    expect(game.getPlayer("A")!.table).toHaveLength(3);

    // Turno 4 — B joga os 6s
    play("B", ...f.bVisible.slice());

    // Turno 5 — A joga a oculta A♥ (mão vazia permite carta oculta)
    play("A", card("A", "hearts", true));
    expect(game.bunch.at(-1)).toEqual(
      expect.objectContaining({ rank: "A", isHidden: false })
    );

    // Turno 6 — B joga a oculta A♠ (mesmo valor, não é menor)
    play("B", card("A", "spades", true));

    // Turno 7 — A joga a oculta 2♥: com 2 jogadores, pular 2 volta para A
    play("A", card("2", "hearts", true));
    expect(game.playerTurn).toBe("A");

    // Turno 8 — A joga a última oculta, o 10♥: queima o monte e vence
    play("A", card("10", "hearts", true));

    expect(game.bunch).toHaveLength(0);
    expect(game.status).toBe(GameStatus.FINISHED);
    expect(game.playerTurn).toBe("A"); // vencedor
    expect(game.getPlayer("A")!.hand).toHaveLength(0);
    expect(game.getPlayer("A")!.table).toHaveLength(0);
    expect(game.getPlayer("B")!.table).toHaveLength(2); // B ainda tinha cartas
  });

  it("deve impedir cartas de rank diferente no mesmo turno, exceto especiais", () => {
    const game = new CarteadoGame(makePlayers(["A", "B"]));
    game.status = GameStatus.PLAYING;
    game.players.forEach((p) => (p.status = PlayerStatus.PLAYING));
    game.playerTurn = "A";

    const playerA = game.getPlayer("A")!;
    const five = card("5", "hearts");
    const nine = card("9", "clubs");
    const ten = card("10", "diamonds");
    playerA.hand = [five, nine, ten];
    game.bunch = [card("4", "spades")];

    game.playCard("A", five);

    // Rank diferente no mesmo turno é rejeitado
    expect(() => game.playCard("A", nine)).toThrow("DIFFERENT_CARD");

    // Mas carta especial (10) passa por cima da restrição
    game.playCard("A", ten);
    expect(game.bunch.at(-1)).toEqual(expect.objectContaining({ rank: "10" }));
  });
});
