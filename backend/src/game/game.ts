import { Player, Card } from "@prisma/client";
import Deck from "./cards";

interface GamePlayer extends Player {
  cardsPlayed: Card[];
}

export default class GameClass {
  static playerTurn: string;
  static deck: Deck;
  static bunch: Card[] = [];
  static players: GamePlayer[] = [];

  constructor(players: Player[]) {
    const gamePlayers: GamePlayer[] = players.map((x) => ({
      ...x,
      cardsPlayed: [],
    }));
    GameClass.players = gamePlayers;
    GameClass.deck = new Deck();
    GameClass.playerTurn =
      gamePlayers[
        Math.floor(Math.random() * (players.length - 1 - 0 + 1) + 0)
      ].userId;
  }

  static givePlayerCards(userId: string) {
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    if (!foundPlayer) return;
    foundPlayer.table = GameClass.deck.giveTableCards() as Card[];
    return foundPlayer.table;
  }

  static playCard(card: Card, userId: string) {
    try {
      const foundPlayer = GameClass.players.find((x) => x.userId === userId);
      if (!foundPlayer) return;

      const lastThree = GameClass.bunch.slice(-3);
      if (
        lastThree.length === 3 &&
        lastThree.every((x) => x.rank === card.rank)
      ) {
        const result = GameClass.applyRules(card, foundPlayer);
        return result;
      }

      if (foundPlayer.userId !== GameClass.playerTurn)
        throw { message: "Ainda não é sua vez!" };

      const result = GameClass.applyRules(card, foundPlayer);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static applyRules(card: Card, player: GamePlayer) {
    try {
      const [lastCard] = GameClass.bunch.slice(-1);
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

      GameClass.bunch.push(card);
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

  static handlePickCards(cards: Card[], userId: string) {
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    foundPlayer.cardsPlayed = [...cards];
    GameClass.bunch = [
      ...GameClass.bunch.filter(
        (x) => !cards.some((y) => y.toString === x.toString)
      ),
    ];
  }
  static endTurn(userId: string) {
    try {
      const foundPlayer = GameClass.players.find((x) => x.userId === userId);
      if (foundPlayer.cardsPlayed.length === 0)
        throw "Você precisa jogar alguma carta para poder pular a vez";
      let index = GameClass.players.findIndex(
        (x) => x.userId === GameClass.playerTurn
      );
      let skip = 1;
      if (foundPlayer.cardsPlayed.some((card) => card.rank === "2")) {
        skip += foundPlayer.cardsPlayed.reduce(
          (ac, x) => (ac += x.rank === "2" ? 1 : 0),
          0
        );
      }
      while (skip !== 0) {
        index = index + 1 > GameClass.players.length - 1 ? 0 : index + 1;
        skip -= 1;
      }
      GameClass.playerTurn = GameClass.players[index].userId;

      if (GameClass.bunch.some((x) => x.rank === "10"))
        GameClass.bunch = GameClass.bunch.slice(
          GameClass.bunch.findIndex((card) => card.rank === "10") + 1
        );
      foundPlayer.cardsPlayed = [];
      GameClass.drawCards(foundPlayer);
      return { player: foundPlayer, bunch: this.bunch, turn: GameClass.playerTurn };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  static drawCards(player: GamePlayer) {
    if (player.hand.length >= 4) return;
    for (let i = player.hand.length; i < 3; i++) {
      const draweeCard = GameClass.deck!.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      player.hand.push(draweeCard as Card);
    }
    return;
  }

  static drawTable(userId: string) {
    try {
      if (userId !== GameClass.playerTurn) throw "Ainda não é sua vez!";
      const foundPlayer = GameClass.players.find((x) => x.userId === userId);
      GameClass.bunch.forEach((card) => foundPlayer.hand.push(card));
      foundPlayer.cardsPlayed = [];
      GameClass.bunch = [];
      return { player: foundPlayer };
    } catch (error) {
      throw { error: true, message: error };
    }
  }

  static retrieveCard(card: Card, userId: string) {
    try {
      if (userId !== GameClass.playerTurn) throw "Ainda não é sua vez!";
      const foundPlayer = GameClass.players.find((x) => x.userId === userId);
      if (!foundPlayer.cardsPlayed.some((x) => x.toString === card.toString))
        throw "Parece que você não jogou esta carta!";
      (foundPlayer.cardsPlayed = foundPlayer.cardsPlayed.filter(
        (x) => x.toString !== card.toString
      )),
        (foundPlayer.hand as Card[]).push(card);
      GameClass.bunch = GameClass.bunch.filter(
        (x) => x.toString !== card.toString
      );
      return { player: foundPlayer, bunch: GameClass.bunch };
    } catch (error) {
      throw { error: true, message: error };
    }
  }
  static pickHand(userId: string, cards: Card[]) {
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    (foundPlayer.hand as Card[]) = cards;
    foundPlayer.table = foundPlayer.table.filter(
      (x) => !cards.some((y) => x.toString === y.toString)
    );
    return {
      player: foundPlayer,
      turn: GameClass.playerTurn,
      isFinished: this.players.every((x) => x.hand.length),
    };
  }
}
