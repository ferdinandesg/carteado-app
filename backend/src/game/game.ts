import Deck, { Card } from "shared/cards";
import { IGameRules } from "./IGameRules";
import { BasePlayer, GameRuleNames, GameStatus } from "shared/game";

export class Game<
  G extends Game<G, R, P>,
  R extends IGameRules<G>,
  P extends BasePlayer,
> {
  public rulesName: GameRuleNames;
  public players: P[];
  public deck: Deck;
  public bunch: Card[];
  public status: GameStatus;
  public playerTurn: string;
  public rules: R;

  constructor(players: P[], rules: R, rulesName: GameRuleNames) {
    this.players = players;
    this.rules = rules;
    this.rulesName = rulesName;

    this.deck = new Deck();
    this.bunch = [];
    this.status = GameStatus.OPEN;
    this.playerTurn =
      players[Math.floor(Math.random() * players.length)].userId;
  }

  private self(): G {
    return this as unknown as G;
  }

  public getPlayer(userId: string): P | undefined {
    return this.players.find((p) => p.userId === userId);
  }

  public startGame() {
    this.rules.dealInitialHands(this.self());
  }

  public playCard(userId: string, card: Card) {
    this.rules.canPlayCard(this.self(), userId, card);
    this.rules.applyPlayCard(this.self(), userId, card);
  }

  public endTurn(userId: string) {
    this.rules.validateEndTurn(this.self(), userId);
    this.rules.applyEndTurn(this.self(), userId);
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
