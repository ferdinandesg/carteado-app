// Gera estados de jogo determinísticos, no formato exato em que o backend
// os emite no evento `game_updated` (JSON da instância, como o socket.io faz).
// Usado pelo teste de contrato do backend e pela fixture consumida no frontend.

import { CarteadoGame } from "@/game/CarteadoGameRules";
import { TrucoGame } from "@/game/TrucoGameRules";
import { Card } from "shared/cards";
import {
  card,
  forceHidden,
  installSeededRandom,
  makePlayers,
  rigDeck,
} from "./gameTestHarness";

const USER_A = "user-a";
const USER_B = "user-b";

/** Mesma transformação que o socket.io aplica ao emitir a instância. */
const snapshot = (game: unknown): Record<string, unknown> =>
  JSON.parse(JSON.stringify(game));

function buildCarteadoStates() {
  const aHand = [
    card("3", "hearts"),
    card("3", "spades"),
    card("3", "diamonds"),
  ];
  const aVisible = [
    card("5", "hearts"),
    card("5", "spades"),
    card("5", "diamonds"),
  ];
  const aHidden = [
    card("A", "hearts"),
    card("2", "hearts"),
    card("10", "hearts"),
  ];
  const bHand = [
    card("4", "hearts"),
    card("4", "spades"),
    card("4", "diamonds"),
  ];
  const bVisible = [
    card("6", "hearts"),
    card("6", "spades"),
    card("6", "diamonds"),
  ];
  const bHidden = [
    card("A", "spades"),
    card("K", "spades"),
    card("Q", "spades"),
  ];

  const spy = installSeededRandom();
  const game = new CarteadoGame(makePlayers([USER_A, USER_B]));
  rigDeck(game.deck, [
    ...aHand,
    ...aVisible,
    ...aHidden,
    ...bHand,
    ...bVisible,
    ...bHidden,
  ]);
  game.startGame();
  spy.mockRestore();
  game.playerTurn = USER_A;
  forceHidden(game.getPlayer(USER_A)!, aHidden);
  forceHidden(game.getPlayer(USER_B)!, bHidden);

  const choosing = snapshot(game);

  game.rules.pickHand(game, USER_A, aHand);
  game.rules.pickHand(game, USER_B, bHand);
  const handsPicked = snapshot(game);

  const playTurn = (userId: string, cards: Card[]) => {
    cards.forEach((c) => game.playCard(userId, c));
    game.endTurn(userId);
  };

  playTurn(USER_A, aHand.slice());
  playTurn(USER_B, bHand.slice());
  const midgame = snapshot(game);

  playTurn(USER_A, aVisible.slice());
  playTurn(USER_B, bVisible.slice());
  playTurn(USER_A, [card("A", "hearts", true)]);
  playTurn(USER_B, [card("A", "spades", true)]);
  playTurn(USER_A, [card("2", "hearts", true)]);
  playTurn(USER_A, [card("10", "hearts", true)]);
  const finished = snapshot(game);

  return { choosing, handsPicked, midgame, finished };
}

function buildTrucoStates() {
  const game = new TrucoGame(makePlayers([USER_A, USER_B]));

  // Estado de rodada fixado manualmente (sem deal aleatório)
  const normalizeRound = () => {
    rigDeck(game.deck, []);
    game.vira = card("7", "clubs");
    game.manilha = "Q";
    game.playerTurn = USER_A;
    game.getPlayer(USER_A)!.hand = [
      card("K", "hearts"),
      card("A", "hearts"),
      card("4", "diamonds"),
    ];
    game.getPlayer(USER_B)!.hand = [
      card("J", "spades"),
      card("J", "diamonds"),
      card("5", "clubs"),
    ];
    game.players.forEach((p) => (p.playedCards = []));
  };

  game.status = "playing" as TrucoGame["status"];
  game.rounds = 1;
  normalizeRound();
  const roundStart = snapshot(game);

  game.rules.askTruco(game, USER_A);
  const trucoPending = snapshot(game);

  game.rules.acceptTruco(game, USER_B);
  const trucoAccepted = snapshot(game);

  // user-a vence duas mãos e fecha a rodada valendo 3;
  // a nova rodada (deal aleatório) é normalizada para manter o determinismo.
  game.playCard(USER_A, card("K", "hearts"));
  game.playCard(USER_B, card("J", "spades"));
  game.playCard(USER_A, card("A", "hearts"));
  game.playCard(USER_B, card("J", "diamonds"));
  normalizeRound();
  const roundScored = snapshot(game);

  return { roundStart, trucoPending, trucoAccepted, roundScored };
}

export function buildContractStates() {
  return {
    carteado: buildCarteadoStates(),
    truco: buildTrucoStates(),
  };
}
