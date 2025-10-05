import { Card } from "shared/cards";

export interface IGameRules<T, _P> {
  dealInitialHands(game: T): void;

  canPlayCard(game: T, userId: string, card: Card): void;

  applyPlayCard(game: T, userId: string, card: Card): void;

  validateEndTurn(game: T, userId: string): void;

  applyEndTurn(game: T, userId: string): void;
}
