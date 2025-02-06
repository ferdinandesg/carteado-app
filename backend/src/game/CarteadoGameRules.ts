import { Card } from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game, GamePlayer, GameStatus, PlayerStatus } from "./game";

export class CarteadoGame extends Game<CarteadoGame, ICarteadoGameRules> {
  constructor(players: GamePlayer[], rules: ICarteadoGameRules) {
    super(players, rules, "CarteadoGameRules");
  }
}

export type ICarteadoGameRules = IGameRules<CarteadoGame> & {
  isSpecialCard(game: CarteadoGame, card: Card): boolean;
  applySpecialCardRules(game: CarteadoGame, player: GamePlayer): void;
  drawCards(game: CarteadoGame, player: GamePlayer): void;
  drawTable(game: CarteadoGame, userId: string): void;
  retrieveCard(game: CarteadoGame, userId: string): void;
  pickHand(game: CarteadoGame, userId: string, cards: Card[]): void;
  addHiddenCardToHand(player: GamePlayer, card: Card): void;
};

export class CarteadoGameRules implements ICarteadoGameRules {
  dealInitialHands(game: CarteadoGame) {
    game.status = GameStatus.PLAYING;
    game.players.forEach((p) => {
      p.status = PlayerStatus.CHOOSING;
      p.playedCards = [];
      p.table = [];
      p.hand = game.deck.giveTableCards();
    });
  }
  isSpecialCard(game: CarteadoGame, card?: Card) {
    if (!card) return false;
    const lastFour = game.bunch.slice(-4);
    const isLastFourSameRank = lastFour.every(
      (x) => x.rank === lastFour[0].rank
    );
    return card.rank === "2" || card.rank === "10" || isLastFourSameRank;
  }

  canPlayCard(game: CarteadoGame, userId: string, card: Card) {
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) throw "PLAYER_NOT_FOUND";
    if (card.hidden && foundPlayer.hand.length > 0)
      throw "CANT_PLAY_HIDDEN_YET";
    if (!game.players.every((p) => p.status === "playing"))
      throw "HAVE_NOT_STARTED";
    const lastThree = game.bunch.slice(-3);
    if (
      lastThree.length === 3 &&
      lastThree.every((x) => x.rank === card.rank)
    ) {
      return foundPlayer;
    }
    if (foundPlayer.userId !== game.playerTurn) throw "NOT_YOUR_TURN";
    return foundPlayer;
  }

  applySpecialCardRules(game: CarteadoGame, player: GamePlayer) {
    const turnsToSkip =
      player.playedCards.filter((x) => x.rank === "2").length + 1 || 1;
    game.skipTurns(player.userId, turnsToSkip);

    const lastTenIndex = game.bunch.map((b) => b.rank).lastIndexOf("10");
    if (lastTenIndex > -1) game.bunch = game.bunch.slice(lastTenIndex + 1);

    for (let i = 0; i < game.bunch.length - 3; i++) {
      const sequence = game.bunch.slice(i, i + 4);
      if (sequence.every((x) => x.rank === sequence[0].rank)) {
        game.bunch = game.bunch.slice(i + 4);
        break;
      }
    }
  }

  applyPlayCard(game: CarteadoGame, userId: string, card: Card) {
    const player = game.getPlayer(userId) as GamePlayer;
    try {
      const [lastCard] = game.bunch.slice(-1);
      const hasSpecialCard =
        this.isSpecialCard(game, lastCard) || this.isSpecialCard(game, card);
      if (lastCard && !hasSpecialCard) {
        if (lastCard.value! > card.value) throw "LOWER_RANK";
        if (lastCard?.rank !== card.rank && player.playedCards.length > 0) {
          throw "DIFFERENT_CARD";
        }
      }

      card.hidden = false;
      game.bunch.push(card);
      player.table = player.table.filter((x) => x.toString !== card.toString);
      player.hand = player.hand.filter((x) => x.toString !== card.toString);
      player.playedCards.push(card);
    } catch (error) {
      if (card.hidden && typeof error === "string")
        this.addHiddenCardToHand(player, card);
      throw error;
    }
  }

  addHiddenCardToHand(player: GamePlayer, card: Card) {
    card.hidden = false;
    player.hand.push(card);
    player.table = player.table.filter((x) => x.toString !== card.toString);
  }

  validateEndTurn(_game: CarteadoGame, _userId: string) {
    return;
  }

  public drawCards(game: CarteadoGame, player: GamePlayer) {
    if (player.hand.length > 3) return;
    const gameHasCards = game.deck.getCards().length > 0;
    while (player.hand.length < 3 && gameHasCards) {
      const draweeCard = game.deck.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      player.hand.push(draweeCard as Card);
    }
    if (player.hand.length === 0 && !gameHasCards) {
      player.hand = player.table.filter((x) => !x.hidden);
      player.table = player.table.filter((x) => x.hidden);
    }
  }

  public drawTable(game: CarteadoGame, userId: string) {
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) return;
    if (userId !== game.playerTurn) throw "NOT_YOUR_TURN";
    game.bunch.forEach((card) => foundPlayer.hand.push(card));
    foundPlayer.playedCards = [];
    game.bunch = [];
  }
  public retrieveCard(game: CarteadoGame, userId: string) {
    if (userId !== game.playerTurn) throw "NOT_YOUR_TURN";
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) return;
    if (!foundPlayer.playedCards.length) throw "HAVE_NOT_PLAYED";
    foundPlayer.hand.push(...foundPlayer.playedCards);
    game.bunch = game.bunch.filter((x) =>
      foundPlayer.playedCards.every((y) => y.toString !== x.toString)
    );
    foundPlayer.playedCards = [];
  }

  public pickHand(game: CarteadoGame, userId: string, cards: Card[]) {
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) return;
    foundPlayer.table = foundPlayer.hand.filter(
      (c) => !cards.some((y) => c.toString === y.toString)
    );
    foundPlayer.hand = cards;
    foundPlayer.status = PlayerStatus.PLAYING;
  }

  applyEndTurn(game: CarteadoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";
    if (player.playedCards.length === 0) throw "MUST_PLAY_FIRST";
    this.applySpecialCardRules(game, player);
    game.players.forEach((p) => (p.playedCards = []));
    this.drawCards(game, player);
    if (player.hand.length === 0 && player.table.length === 0) {
      game.status = GameStatus.FINISHED;
      game.playerTurn = player.userId;
    }
  }
}
