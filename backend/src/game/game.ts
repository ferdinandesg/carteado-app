import { Card, Prisma } from "@prisma/client";
import Deck from "shared/cards";

export type PopulatedPlayer = Prisma.PlayerGetPayload<{
  include: {
    user: true;
  };
}>;

interface GamePlayer extends PopulatedPlayer {
  playedCards: Card[];
  name?: string;
  image?: string;
  email?: string;
}

export default class GameClass {
  playerTurn: string;
  cards: Deck;
  bunch: Card[] = [];
  players: GamePlayer[] = [];
  status: "open" | "playing" | "finished" = "open";

  constructor(players: PopulatedPlayer[]) {
    const gamePlayers: GamePlayer[] = players?.map((x) => ({
      ...x,
      playedCards: [],
    }));
    this.players = gamePlayers;
    this.cards = new Deck();
    const playerTurn = gamePlayers[0];

    this.playerTurn = playerTurn.userId;
  }

  playerExists(userId: string) {
    const foundPlayer = this.players.find((x) => x.userId === userId);
    if (!foundPlayer) return false;
    return foundPlayer;
  }

  givePlayerCards(userId: string): Card[] | undefined {
    const foundPlayer = this.playerExists(userId);
    if (!foundPlayer) return;
    const hand = this.cards.giveTableCards();
    foundPlayer.table = [];
    foundPlayer.hand = hand as Card[];
    return hand as Card[];
  }

  canPlayCard(card: Card, userId: string): GamePlayer {
    const foundPlayer = this.playerExists(userId);
    if (!foundPlayer) throw "PLAYER_NOT_FOUND";
    if (!this.players.every((p) => p.status === "playing"))
      throw "HAVE_NOT_STARTED";
    const lastThree = this.bunch.slice(-3);
    if (
      lastThree.length === 3 &&
      lastThree.every((x) => x.rank === card.rank)
    ) {
      return foundPlayer;
    }
    if (foundPlayer.userId !== this.playerTurn) throw "NOT_YOUR_TURN";
    return foundPlayer;
  }

  playCard(card: Card, userId: string) {
    try {
      const foundPlayer = this.canPlayCard(card, userId);
      const result = this.applyRules(card, foundPlayer);
      return result;
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  isSpecialCard(card?: Card) {
    if (!card) return false;
    return card.rank === "2" || card.rank === "10";
  }

  applyRules(card: Card, player: GamePlayer) {
    try {
      const [lastCard] = this.bunch.slice(-1);
      const hasSpecialCard =
        this.isSpecialCard(lastCard) || this.isSpecialCard(card);
      if (lastCard && !hasSpecialCard) {
        // if the last card is not special, the current card should be higher
        if (lastCard.value! > card.value) throw "LOWER_RANK";

        // if the last card is not special, the current card should be the same rank
        if (lastCard?.rank !== card.rank && player.playedCards.length > 0) {
          throw "DIFFERENT_CARD";
        }
      }

      this.bunch.push(card);
      player.hand = player.hand.filter((x) => x.toString !== card.toString);
      player.playedCards.push(card);
      return { error: false, message: "SUCCESS" };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  skipTurns(fromUser: string, turns: number) {
    const currentPlayerIndex = this.players.findIndex(
      (x) => x.userId === fromUser
    );
    if (currentPlayerIndex === -1) throw "PLAYER_NOT_FOUND";
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
    this.playerTurn = this.players[nextPlayerIndex].userId;
    if (turns > 1) this.skipTurns(this.playerTurn, turns - 1);
  }

  applySpecialCardRules(player: GamePlayer) {
    // find the current user and for each rank "2" card, should skip one turn
    const turnsToSkip =
      player.playedCards.filter((x) => x.rank === "2").length + 1 || 1;
    this.skipTurns(player.userId, turnsToSkip);

    // find the current user and for each rank "10" card, should pick the last one and split the bunch
    const lastTenIndex = this.bunch.map((b) => b.rank).lastIndexOf("10");
    if (lastTenIndex > -1) this.bunch = this.bunch.slice(lastTenIndex + 1);

    // if in bunch we have a sequence in any place of four cards with the same rank, the bunch should be split
    for (let i = 0; i < this.bunch.length - 3; i++) {
      const sequence = this.bunch.slice(i, i + 4);
      if (sequence.every((x) => x.rank === sequence[0].rank)) {
        this.bunch = this.bunch.slice(i + 4);
        break;
      }
    }
  }

  endTurn(userId: string) {
    try {
      const foundPlayer = this.playerExists(userId);
      if (!foundPlayer) return;
      if (foundPlayer.playedCards.length === 0) throw "MUST_PLAY_FIRST";
      this.applySpecialCardRules(foundPlayer);
      this.players.forEach((p) => (p.playedCards = []));
      this.drawCards(foundPlayer);
      if (foundPlayer.hand.length === 0) {
        this.status = "finished";
        this.playerTurn = foundPlayer.userId;
        return { player: foundPlayer, status: this.status };
      }
      return {
        player: foundPlayer,
        bunch: this.bunch,
        turn: this.playerTurn,
        message: "SUCCESS",
      };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  drawCards(player: GamePlayer) {
    if (player.hand.length > 3) return;
    const gameHasCards = this.cards.getCards().length > 0;
    while (player.hand.length < 3 && gameHasCards) {
      const draweeCard = this.cards.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      player.hand.push(draweeCard as Card);
    }

    if (player.hand.length === 0 && !gameHasCards) {
      player.hand = player.table.filter((x) => !x.hidden);
      player.table = player.table.filter((x) => x.hidden);
    }

    return;
  }

  drawTable(userId: string) {
    try {
      const foundPlayer = this.playerExists(userId);
      if (!foundPlayer) return;
      if (userId !== this.playerTurn) throw "NOT_YOUR_TURN";
      this.bunch.forEach((card) => foundPlayer.hand.push(card));
      foundPlayer.playedCards = [];
      this.bunch = [];
      return { player: foundPlayer };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  retrieveCard(userId: string) {
    try {
      if (userId !== this.playerTurn) throw "NOT_YOUR_TURN";
      const foundPlayer = this.playerExists(userId);
      if (!foundPlayer) return;
      if (!foundPlayer.playedCards.length) throw "HAVE_NOT_PLAYED";
      foundPlayer.hand.push(...foundPlayer.playedCards);
      this.bunch = this.bunch.filter((x) =>
        foundPlayer.playedCards.every((y) => y.toString !== x.toString)
      );
      foundPlayer.playedCards = [];
      return { error: false, player: foundPlayer, bunch: this.bunch };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  pickHand(userId: string, cards: Card[]) {
    const foundPlayer = this.playerExists(userId);
    if (!foundPlayer) return;
    foundPlayer.table = foundPlayer.hand.filter(
      (c) => !cards.some((y) => c.toString === y.toString)
    );
    foundPlayer.hand = cards;
    foundPlayer.status = "playing";
    return {
      player: foundPlayer,
      turn: this.playerTurn,
      isFinished: this.players.every((x) => x.table.length),
    };
  }

  public serialize(): string {
    return JSON.stringify({
      players: this.players,
      cards: this.cards.serialize(),
      playerTurn: this.playerTurn,
      status: this.status,
      bunch: this.bunch,
    });
  }

  public static deserialize(serializedGame: string): GameClass {
    const data = JSON.parse(serializedGame);
    const game = new GameClass(data.players);
    const cards = Deck.deserialize(data.cards);
    game.cards = cards;
    game.playerTurn = data.playerTurn;
    game.status = data.status;
    game.players = data.players;
    game.bunch = data.bunch;
    return game;
  }
}
