import Deck, { Card } from "shared/cards";
import { IGameRules } from "./IGameRules";
import { BasePlayer, GameStatus } from "shared/game";

export class Game<
  G extends Game<G, R, P>,
  R extends IGameRules<G>,
  P extends BasePlayer,
> {
  public rulesName: string;
  public players: P[];
  public deck: Deck;
  public bunch: Card[];
  public status: GameStatus;
  public playerTurn: string;
  public rules: R;

  constructor(players: P[], rules: R, rulesName: string) {
    this.players = players;
    this.rules = rules;
    this.rulesName = rulesName;

    this.deck = new Deck();
    this.bunch = [];
    this.status = GameStatus.OPEN;
    this.playerTurn =
      players[Math.floor(Math.random() * players.length)].userId;
  }

  public getPlayer(userId: string): P | undefined {
    return this.players.find((p) => p.userId === userId);
  }

  public startGame() {
    this.rules.dealInitialHands(this as unknown as G);
  }

  public playCard(userId: string, card: Card) {
    this.rules.canPlayCard(this as unknown as G, userId, card);
    this.rules.applyPlayCard(this as unknown as G, userId, card);
  }

  public endTurn(userId: string) {
    this.rules.validateEndTurn(this as unknown as G, userId);
    this.rules.applyEndTurn(this as unknown as G, userId);
  }

  public skipTurns(fromUser: string, times: number) {
    const idx = this.players.findIndex((pl) => pl.userId === fromUser);
    if (idx < 0) throw new Error("PLAYER_NOT_FOUND");
    const nextIndex = (idx + times) % this.players.length;
    this.playerTurn = this.players[nextIndex].userId;
  }

  public serialize(): string {
    return JSON.stringify({
      players: this.players,
      deck: this.deck.serialize(),
      bunch: this.bunch,
      status: this.status,
      playerTurn: this.playerTurn,
      rulesName: this.rulesName,
    });
  }
}
