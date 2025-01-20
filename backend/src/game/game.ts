import { Player, Card } from "@prisma/client";
import Deck from "./cards";

interface GamePlayer extends Player {
  playedCards: Card[];
}

export default class GameClass {
  playerTurn: string;
  cards: Deck;
  bunch: Card[] = [];
  players: GamePlayer[] = [];
  status: "open" | "playing" | "finished" = "open";

  constructor(players: Player[]) {
    const gamePlayers: GamePlayer[] = players.map((x) => ({
      ...x,
      playedCards: [],
    }));
    this.players = gamePlayers;
    this.cards = new Deck();
    const playerTurn = gamePlayers[Math.floor(Math.random() * gamePlayers.length)];

    this.playerTurn = playerTurn.userId;
  }

  playerExists(userId: string) {
    const foundPlayer = this.players.find((x) => x.userId === userId);
    if (!foundPlayer) return false;
    return foundPlayer;
  }

  givePlayerCards(userId: string) {
    const foundPlayer = this.playerExists(userId);
    if (!foundPlayer) return;
    foundPlayer.table = this.cards.giveTableCards() as Card[];
    return foundPlayer.table;
  }

  canPlayCard(card: Card, userId: string): boolean {
    const foundPlayer = this.playerExists(userId);
    if (!foundPlayer) return false;
    const lastThree = this.bunch.slice(-3);
    if (
      lastThree.length === 3 &&
      lastThree.every((x) => x.rank === card.rank)
    ) {
      return true;
    }
    if (foundPlayer.userId !== this.playerTurn) return false;
    return true
  }

  playCard(card: Card, userId: string) {
    try {
      const foundPlayer = this.playerExists(userId);
      if (!foundPlayer || !this.canPlayCard(card, userId)) return;
      const result = this.applyRules(card, foundPlayer);
      return result;
    } catch (error) {
      throw error;
    }
  }

  isSpecialCard(card: Card) {
    return card.rank === "2" || card.rank === "10";
  }

  applyRules(card: Card, player: GamePlayer) {
    try {
      const [lastCard] = this.bunch.slice(-1);
      if (this.isSpecialCard(card)) {

      } else if (!this.isSpecialCard(lastCard)) {
        if (lastCard && lastCard.value! > card.value)
          throw "Você está jogando uma carta mais baixa que a da mesa";
        if (player.playedCards.length > 0 && lastCard?.rank !== card.rank) {
          throw "Sua carta é diferente da anterior!";
        }
      }

      this.bunch.push(card);
      player.hand = player.hand.filter((x) => x.toString !== card.toString);
      player.playedCards.push(card);
      if (player.hand.length === 0) this.status = "finished";
      return { error: false, player, bunch: this.bunch };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  skipTurns(fromUser: string, turns: number) {
    const currentPlayerIndex = this.players.findIndex(
      (x) => x.userId === fromUser
    );
    const nextPlayerIndex = (currentPlayerIndex + 1) % this.players.length;
    this.playerTurn = this.players[nextPlayerIndex].userId;
    if (turns > 1) this.skipTurns(this.playerTurn, turns - 1);
  }


  applySpecialCardRules(player: GamePlayer) {
    // find the current user and for each rank "2" card, should skip one turn
    const turnsToSkip = player.playedCards.filter((x) => x.rank === "2").length;
    this.skipTurns(player.id, turnsToSkip);

    // find the current user and for each rank "10" card, should pick the last one and split the bunch
    const lastTenIndex = player.playedCards.findIndex((x) => x.rank === "10");
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
      if (!foundPlayer) return
      if (foundPlayer.playedCards.length === 0)
        throw "Você precisa jogar alguma carta para poder pular a vez";

      this.applySpecialCardRules(foundPlayer);
      foundPlayer.playedCards = [];
      this.drawCards(foundPlayer);
      return {
        player: foundPlayer,
        bunch: this.bunch,
        turn: this.playerTurn,
        error: false
      };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  drawCards(player: GamePlayer) {
    if (player.hand.length > 3) return;
    for (let i = player.hand.length; i < 3; i++) {
      const draweeCard = this.cards!.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      player.hand.push(draweeCard as Card);
    }
    return;
  }

  drawTable(userId: string) {
    try {
      const foundPlayer = this.playerExists(userId);
      if (!foundPlayer) return
      if (userId !== this.playerTurn) throw "Ainda não é sua vez!";

      this.bunch.forEach((card) => foundPlayer.hand.push(card));
      foundPlayer.playedCards = [];
      this.bunch = [];
      return { error: false, player: foundPlayer };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  retrieveCard(card: Card, userId: string) {
    try {
      if (userId !== this.playerTurn) throw "Ainda não é sua vez!";
      const foundPlayer = this.playerExists(userId);
      if (!foundPlayer) return
      if (!foundPlayer.playedCards.some((x) => x.toString === card.toString))
        throw "Parece que você não jogou esta carta!";
      foundPlayer.playedCards = foundPlayer.playedCards.filter(
        (x) => x.toString !== card.toString
      );
      (foundPlayer.hand as Card[]).push(card);
      this.bunch = this.bunch.filter((x) => x.toString !== card.toString);
      return { error: false, player: foundPlayer, bunch: this.bunch };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  pickHand(userId: string, cards: Card[]) {
    const foundPlayer = this.playerExists(userId);
    if (!foundPlayer) return
    (foundPlayer.hand as Card[]) = cards;
    foundPlayer.table = foundPlayer.table.filter(c => !cards.some((y) => c.toString === y.toString));
    return {
      player: foundPlayer,
      turn: this.playerTurn,
      isFinished: this.players.every((x) => x.hand.length),
    };
  }

  public serialize(): string {
    return JSON.stringify({
      players: this.players,
      cards: this.cards,
      playerTurn: this.playerTurn,
      status: this.status
    });
  }

  public static deserialize(serializedGame: string): GameClass {
    const data = JSON.parse(serializedGame);
    const game = new GameClass(data.players);
    game.cards = data.cards;
    game.playerTurn = data.playerTurn;
    game.status = data.status;
    game.players = data.players;
    game.bunch = data.bunch;
    return game;
  }
}
