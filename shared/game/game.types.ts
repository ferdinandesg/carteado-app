import { Card } from "../cards";
import { HandResult, Team } from "../types";
import { BasePlayer } from "./base.player";
import { CarteadoPlayer } from "./carteadoTypes";

export enum GameStatus {
  OPEN = "open",
  PLAYING = "playing",
  FINISHED = "finished",
}

export enum GameType {
  TRUCO = "TRUCO",
  CARTEADO = "CARTEADO",
}

export type GameRuleNames = "TrucoGameRules" | "CarteadoGameRules";

// Base state for all games
export interface IBaseGameState<P extends BasePlayer, R extends GameRuleNames> {
  players: P[];
  bunch: Card[];
  status: GameStatus;
  playerTurn: string;
  rulesName: R;
  deck: string; // Serialized deck
}

// Truco-specific state
export interface ITrucoGameState
  extends IBaseGameState<BasePlayer, "TrucoGameRules"> {
  type: GameType.TRUCO;
  vira: Card | null;
  manilha: string;
  currentBet: number;
  trucoState: "NONE" | "PENDING" | "ACCEPTED";
  trucoAskerId: string | null;
  rounds: number;
  teams: Team[];
  handsResults: HandResult[];
}

// Carteado-specific state
export interface ICarteadoGameState
  extends IBaseGameState<CarteadoPlayer, "CarteadoGameRules"> {
  type: GameType.CARTEADO;
  // No extra properties for now
}

// A union of all possible game states
export type IGameState = ITrucoGameState | ICarteadoGameState;

export const isTrucoGame = (
  game: IGameState | null
): game is ITrucoGameState => {
  return game?.type === GameType.TRUCO;
};

export const isCarteadoGame = (
  game: IGameState | null
): game is ICarteadoGameState => {
  return game?.type === GameType.CARTEADO;
};
