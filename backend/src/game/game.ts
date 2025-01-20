import { Player, Card } from "@prisma/client";
import Deck from "./cards";

interface GamePlayer extends Player {
  cardsPlayed: Card[];
}

export default class GameClass {
  playerTurn: string;
  deck: Deck;
  bunch: Card[] = [];
  players: GamePlayer[] = [];
  status: "open" | "playing" | "finished" = "open";

  constructor(players: Player[]) {
    const gamePlayers: GamePlayer[] = players.map((x) => ({
      ...x,
      cardsPlayed: [],
    }));
    this.players = gamePlayers;
    this.deck = new Deck();
    const playerTurn = gamePlayers[Math.floor(Math.random() * gamePlayers.length)];

    this.playerTurn = playerTurn.userId;
  }

  givePlayerCards(userId: string) {
    const foundPlayer = this.players.find((x) => x.userId === userId);
    if (!foundPlayer) return;
    foundPlayer.table = this.deck.giveTableCards() as Card[];
    return foundPlayer.table;
  }

  canPlayCard(card: Card, userId: string): boolean {
    const foundPlayer = this.players.find((x) => x.userId === userId);
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
      const foundPlayer = this.players.find((x) => x.userId === userId);
      if (!this.canPlayCard(card, userId)) return;
      const result = this.applyRules(card, foundPlayer);
      return result;
    } catch (error) {
      throw error;
    }
  }

  applyRules(card: Card, player: GamePlayer) {
    try {
      const [lastCard] = this.bunch.slice(-1);
      if (card.rank !== "2" && card.rank !== "10") {
        if (lastCard && lastCard.value! > card.value)
          throw "Você está jogando uma carta mais baixa que a da mesa";
        if (player.cardsPlayed.length > 0 && lastCard?.value !== card.value) {
          throw "Sua carta é diferente da anterior!";
        }
      }
      switch (card.rank) {
        case "2":
          card.value = 1;
          break;
        case "10":
          card.value = 1;
          break;
        default:
          break;
      }

      this.bunch.push(card);
      player.hand = player.hand.filter((x) => x.toString !== card.toString);
      player.cardsPlayed.push(card);
      player.hand = [
        ...player.hand.filter((x) => x.toString !== card.toString),
      ];
      return { error: false, player, bunch: this.bunch };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  handlePickCards(cards: Card[], userId: string) {
    const foundPlayer = this.players.find((x) => x.userId === userId);
    foundPlayer.cardsPlayed = [...cards];
    this.bunch = [
      ...this.bunch.filter(
        (x) => !cards.some((y) => y.toString === x.toString)
      ),
    ];
  }
  endTurn(userId: string) {
    try {
      const foundPlayer = this.players.find((x) => x.userId === userId);
      if (foundPlayer.cardsPlayed.length === 0)
        throw "Você precisa jogar alguma carta para poder pular a vez";
      let index = this.players.findIndex((x) => x.userId === this.playerTurn);
      let skip = 1;
      if (foundPlayer.cardsPlayed.some((card) => card.rank === "2")) {
        skip += foundPlayer.cardsPlayed.reduce(
          (ac, x) => (ac += x.rank === "2" ? 1 : 0),
          0
        );
      }
      while (skip !== 0) {
        index = index + 1 > this.players.length - 1 ? 0 : index + 1;
        skip -= 1;
      }
      this.playerTurn = this.players[index].userId;

      if (this.bunch.some((x) => x.rank === "10"))
        this.bunch = this.bunch.slice(
          this.bunch.findIndex((card) => card.rank === "10") + 1
        );
      foundPlayer.cardsPlayed = [];
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
    if (player.hand.length >= 4) return;
    for (let i = player.hand.length; i < 3; i++) {
      const draweeCard = this.deck!.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      player.hand.push(draweeCard as Card);
    }
    return;
  }

  drawTable(userId: string) {
    try {
      if (userId !== this.playerTurn) throw "Ainda não é sua vez!";
      const foundPlayer = this.players.find((x) => x.userId === userId);
      this.bunch.forEach((card) => foundPlayer.hand.push(card));
      foundPlayer.cardsPlayed = [];
      this.bunch = [];
      return { error: false, player: foundPlayer };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  retrieveCard(card: Card, userId: string) {
    try {
      if (userId !== this.playerTurn) throw "Ainda não é sua vez!";
      const foundPlayer = this.players.find((x) => x.userId === userId);
      if (!foundPlayer.cardsPlayed.some((x) => x.toString === card.toString))
        throw "Parece que você não jogou esta carta!";
      (foundPlayer.cardsPlayed = foundPlayer.cardsPlayed.filter(
        (x) => x.toString !== card.toString
      )),
        (foundPlayer.hand as Card[]).push(card);
      this.bunch = this.bunch.filter((x) => x.toString !== card.toString);
      return { error: true, player: foundPlayer, bunch: this.bunch };
    } catch (error) {
      throw { error: true, message: error };
    }
  }
  pickHand(userId: string, cards: Card[]) {
    const foundPlayer = this.players.find((x) => x.userId === userId);
    (foundPlayer.hand as Card[]) = cards;
    foundPlayer.table = foundPlayer.table.filter(
      (x) => !cards.some((y) => x.toString === y.toString)
    );
    return {
      player: foundPlayer,
      turn: this.playerTurn,
      isFinished: this.players.every((x) => x.hand.length),
    };
  }

  public serialize(): string {
    return JSON.stringify({
      players: this.players,
      deck: this.deck,
      playerTurn: this.playerTurn,
      status: this.status
    });
  }

  public static deserialize(serializedGame: string): GameClass {
    const data = JSON.parse(serializedGame);
    const game = new GameClass(data.players);
    game.deck = data.deck;
    game.playerTurn = data.playerTurn;
    game.status = data.status;
    return game;
  }
}
