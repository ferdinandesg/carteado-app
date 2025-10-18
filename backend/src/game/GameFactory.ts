import { GameError } from "@/errors/GameError";
import { CarteadoGame } from "@/game/CarteadoGameRules";
import { TrucoGame } from "@/game/TrucoGameRules";
import Deck from "shared/cards";
import {
  BasePlayer,
  GameType,
  ICarteadoGameState,
  IGameState,
  ITrucoGameState,
} from "shared/game";

// Type mapping from GameType to Game Instance
type GameInstance<T extends GameType> = T extends "TRUCO"
  ? TrucoGame
  : T extends "CARTEADO"
    ? CarteadoGame
    : never;

// Registry for game constructors
const gameRegistry = {
  TRUCO: TrucoGame,
  CARTEADO: CarteadoGame,
};

export class GameFactory {
  public static create<T extends GameType>(
    gameType: T,
    players: BasePlayer[]
  ): GameInstance<T> {
    const GameClass = gameRegistry[gameType];
    if (!GameClass) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Game type not found",
      });
    }
    // This cast is still a bit of a smell, but it's contained.
    // CarteadoGame expects CarteadoPlayer[], but since it's just a type alias for BasePlayer, this is fine at runtime.
    return new GameClass(players) as GameInstance<T>;
  }

  public static recreate(gameData: IGameState): TrucoGame | CarteadoGame {
    if (isTrucoState(gameData)) {
      const game = new TrucoGame(gameData.players);

      // Safe hydration
      game.bunch = gameData.bunch;
      game.status = gameData.status;
      game.playerTurn = gameData.playerTurn;
      game.deck = Deck.deserialize(gameData.deck);
      game.vira = gameData.vira;
      game.manilha = gameData.manilha;
      game.currentBet = gameData.currentBet;
      game.trucoState = gameData.trucoState;
      game.trucoAskerId = gameData.trucoAskerId;
      game.rounds = gameData.rounds;
      game.teams = gameData.teams;
      game.handsResults = gameData.handsResults;

      return game;
    }

    if (isCarteadoState(gameData)) {
      const game = new CarteadoGame(gameData.players);
      // Safe hydration
      game.bunch = gameData.bunch;
      game.status = gameData.status;
      game.playerTurn = gameData.playerTurn;
      game.deck = Deck.deserialize(gameData.deck);

      return game;
    }

    throw new GameError({
      code: "INVALID_ACTION",
      message: "Could not recreate game",
    });
  }
  public static deserialize(
    serializedGame: string
  ): ITrucoGameState | ICarteadoGameState {
    return JSON.parse(serializedGame);
  }
}

// Type guards
function isTrucoState(state: IGameState): state is ITrucoGameState {
  return state.rulesName === "TrucoGameRules";
}

function isCarteadoState(state: IGameState): state is ICarteadoGameState {
  return state.rulesName === "CarteadoGameRules";
}
