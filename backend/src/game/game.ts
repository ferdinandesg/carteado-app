import { Player } from "@prisma/client";
import Deck, { Card } from "./Cards";
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
        Math.floor(Math.random() * (0 + players.length - 1) + 1)
      ].userId;
  }

  static givePlayerCards(userId: string) {
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    if (!foundPlayer) return;
    (foundPlayer.table as Card[]) = GameClass.deck.giveTableCards();
    return foundPlayer.table;
  }

  static playCard(card: Card, userId: string) {
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    if (!foundPlayer) return;
    foundPlayer.hand = [
      ...foundPlayer.hand.filter((x) => x.toString !== card.toString),
    ];
    const lastThree = GameClass.bunch.slice(-3);
    if (
      lastThree.length === 3 &&
      lastThree.every((x) => x.rank === card.rank)
    ) {
      return;
    }

    if (foundPlayer.userId !== GameClass.playerTurn)
      return {
        error: true,
        message: "Ainda não é sua vez!",
        player: foundPlayer,
      };
    const result = GameClass.applyRules(card, foundPlayer);
    return result;
  }

  static applyRules(card: Card, player: GamePlayer, quantity: number = 1) {
    const [lastCard] = GameClass.bunch.slice(-1);
    if (lastCard && lastCard.value! > card.value!)
      return {
        error: true,
        message: "Você está jogando uma carta mais baixa que a da mesa",
        player,
      };
    const index = GameClass.players.findIndex(
      (x) => x.userId === GameClass.playerTurn
    );
    switch (card.rank) {
      case "2":
        GameClass.playerTurn =
          GameClass.players[
            Math.floor((quantity + index) / GameClass.players.length)
          ].userId;
        card.value = 1;
        break;
      case "10":
        card.value = 1;
        break;

      default:
        GameClass.playerTurn =
          GameClass.players[
            Math.floor((quantity + index) / GameClass.players.length)
          ].userId;
        break;
    }
    // if (player.cardsPlayed.length > 0 && lastCard && lastCard.value! !== card.value!) {
    //   console.log({lastCard});
    //   console.log({card});
    //   return alert("Your card rank different from your last played");
    // }
    GameClass.bunch.push(card);
    player.hand = player.hand.filter((x) => x.toString !== card.toString);
    player.cardsPlayed.push(card);
    return { error: false, player };
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
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    if (foundPlayer.cardsPlayed.length === 0)
      return {
        error: true,
        message: "Você precisa jogar alguma carta para poder pular a vez",
      };
    if (GameClass.bunch.some((x) => x.rank === "10"))
      GameClass.bunch.slice(
        GameClass.bunch.findIndex((card) => card.rank === "10") + 1
      );
    foundPlayer.cardsPlayed = [];
    const result = GameClass.drawCards(foundPlayer);
    return { error: false, player: result };
  }

  static drawCards(player: GamePlayer) {
    if (player.hand.length >= 4) return;
    for (let i = player.hand.length; i < 3; i++) {
      const draweeCard = GameClass.deck!.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      console.log("Comprou");
      (player.hand as Card[]).push(draweeCard);
    }

    return player;
  }

  static drawTable(userId: string) {
    if (userId !== GameClass.players[GameClass.playerTurn].id) return;
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    (foundPlayer.hand as Card[]).concat(GameClass.bunch);
    GameClass.bunch = [];
    foundPlayer.cardsPlayed = [];
  }

  static retrieveCard(userId: string, card: Card) {
    if (userId !== GameClass.players[GameClass.playerTurn].id) return;
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    if (!foundPlayer.cardsPlayed.some((x) => x.toString === card.toString))
      return;
    (foundPlayer.cardsPlayed = foundPlayer.cardsPlayed.filter(
      (x) => x.toString !== card.toString
    )),
      (foundPlayer.hand as Card[]).push(card);
    GameClass.bunch = GameClass.bunch.filter(
      (x) => x.toString !== card.toString
    );
  }
  static pickHand(userId: string, cards: Card[]) {
    const foundPlayer = GameClass.players.find((x) => x.userId === userId);
    (foundPlayer.hand as Card[]) = cards;
    foundPlayer.table = foundPlayer.table.filter(
      (x) => !cards.some((y) => x.toString === y.toString)
    );
    return {
      player: foundPlayer,
      isFinished: this.players.every((x) => x.hand.length),
    };
  }
}
