import { Card } from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game, GamePlayer, GameStatus, PlayerStatus } from "./game";

export class CarteadoGame extends Game<CarteadoGame, ICarteadoGameRules> {
  constructor(players: GamePlayer[], rules: ICarteadoGameRules) {
    super(players, rules, "CarteadoGameRules");
  }
}

export type ICarteadoGameRules = IGameRules<CarteadoGame> & {
  isSpecialCard(game: CarteadoGame, player: GamePlayer, card?: Card): boolean;
  applySpecialCardRules(game: CarteadoGame, player: GamePlayer): void;
  drawCards(game: CarteadoGame, player: GamePlayer): void;
  pickUpBunch(game: CarteadoGame, userId: string): void;
  undoPlay(game: CarteadoGame, userId: string): void;
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

  private isRankTwoOrTen(card: Card): boolean {
    return card.rank === "2" || card.rank === "10";
  }

  private isLastFourSameRank(game: CarteadoGame): boolean {
    if (game.bunch.length < 4) return false;
    const lastFour = game.bunch.slice(-4);
    return lastFour.every((x) => x.rank === lastFour[0].rank);
  }

  private isHiddenAndEmpty(card: Card, player: GamePlayer): boolean {
    return Boolean(card.hidden && player.hand.length === 0);
  }

  isSpecialCard(game: CarteadoGame, player: GamePlayer, card?: Card): boolean {
    if (!card) return false;
    return (
      this.isRankTwoOrTen(card) ||
      this.isLastFourSameRank(game) ||
      this.isHiddenAndEmpty(card, player)
    );
  }

  canPlayCard(game: CarteadoGame, userId: string, card: Card) {
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) throw "PLAYER_NOT_FOUND";

    if (card.hidden && foundPlayer.hand.length > 0) {
      throw "CANT_PLAY_HIDDEN_YET";
    }

    if (!game.players.every((p) => p.status === PlayerStatus.PLAYING)) {
      throw "HAVE_NOT_STARTED";
    }

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

  private skipTurnsForTwos(game: CarteadoGame, player: GamePlayer) {
    const twosCount = player.playedCards.filter((x) => x.rank === "2").length;
    if (twosCount > 0) {
      game.skipTurns(player.userId, twosCount + 1);
    }
  }

  private removeBunchAfterTen(game: CarteadoGame) {
    const lastTenIndex = game.bunch.map((b) => b.rank).lastIndexOf("10");
    if (lastTenIndex > -1) {
      game.bunch = game.bunch.slice(lastTenIndex + 1);
    }
  }

  private removeFourOfAKind(game: CarteadoGame) {
    for (let i = 0; i < game.bunch.length - 3; i++) {
      const sequence = game.bunch.slice(i, i + 4);
      if (sequence.every((x) => x.rank === sequence[0].rank)) {
        game.bunch = [...game.bunch.slice(0, i), ...game.bunch.slice(i + 4)];
        break;
      }
    }
  }

  applySpecialCardRules(game: CarteadoGame, player: GamePlayer) {
    this.skipTurnsForTwos(game, player);
    this.removeBunchAfterTen(game);
    this.removeFourOfAKind(game);
  }

  private validatePlayCard(
    game: CarteadoGame,
    player: GamePlayer,
    card: Card,
    lastCard?: Card
  ) {
    const hasSpecialCard =
      this.isSpecialCard(game, player, lastCard) ||
      this.isSpecialCard(game, player, card);

    if (lastCard && !hasSpecialCard) {
      if (lastCard.value! > card.value) {
        throw "LOWER_RANK";
      }
      if (lastCard.rank !== card.rank && player.playedCards.length > 0) {
        throw "DIFFERENT_CARD";
      }
    }
  }

  private executePlayCard(game: CarteadoGame, player: GamePlayer, card: Card) {
    card.hidden = false;
    game.bunch.push(card);

    player.table = player.table.filter((x) => x.toString !== card.toString);
    player.hand = player.hand.filter((x) => x.toString !== card.toString);

    player.playedCards.push(card);
  }

  applyPlayCard(game: CarteadoGame, userId: string, card: Card) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";

    try {
      const lastCard = game.bunch[game.bunch.length - 1];
      this.validatePlayCard(game, player, card, lastCard);
      this.executePlayCard(game, player, card);
    } catch (error) {
      if (card.hidden && typeof error === "string") {
        this.addHiddenCardToHand(player, card);
      }
      throw error;
    }
  }

  addHiddenCardToHand(player: GamePlayer, card: Card) {
    card.hidden = false;
    player.hand.push(card);
    player.table = player.table.filter((x) => x.toString !== card.toString);
  }

  validateEndTurn(_game: CarteadoGame, _userId: string) {
    // Neste caso não faz nada
    return;
  }

  public drawCards(game: CarteadoGame, player: GamePlayer) {
    if (player.hand.length > 3) return;
    const gameHasCards = game.deck.getCards().length > 0;

    while (player.hand.length < 3 && gameHasCards) {
      const draweeCard = game.deck.draw();
      if (!draweeCard) return;
      delete draweeCard.hidden;
      player.hand.push(draweeCard);
    }

    if (player.hand.length === 0 && !gameHasCards) {
      player.hand = player.table.filter((x) => !x.hidden);
      player.table = player.table.filter((x) => x.hidden);
    }
  }

  public pickUpBunch(game: CarteadoGame, userId: string) {
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) throw "PLAYER_NOT_FOUND";
    if (userId !== game.playerTurn) throw "NOT_YOUR_TURN";

    game.bunch.forEach((card) => foundPlayer.hand.push(card));
    foundPlayer.playedCards = [];
    game.bunch = [];
  }

  public undoPlay(game: CarteadoGame, userId: string) {
    if (userId !== game.playerTurn) throw "NOT_YOUR_TURN";
    const foundPlayer = game.getPlayer(userId);
    if (!foundPlayer) throw "PLAYER_NOT_FOUND";
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

  private clearPlayersPlays(game: CarteadoGame) {
    game.players.forEach((p) => {
      p.playedCards = [];
    });
  }

  private checkGameFinished(game: CarteadoGame, player: GamePlayer) {
    if (player.hand.length === 0 && player.table.length === 0) {
      game.status = GameStatus.FINISHED;
      game.playerTurn = player.userId;
    }
  }

  applyEndTurn(game: CarteadoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";

    if (player.playedCards.length === 0) {
      throw "MUST_PLAY_FIRST";
    }

    this.applySpecialCardRules(game, player);

    this.clearPlayersPlays(game);

    this.drawCards(game, player);

    this.checkGameFinished(game, player);
  }
}
