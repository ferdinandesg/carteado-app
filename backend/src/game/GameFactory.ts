import { TrucoGame, TrucoGameRules } from "./TrucoGameRules";
import { CarteadoGame, CarteadoGameRules } from "./CarteadoGameRules";
import { GamePlayer, GameStatus } from "./game";
import Deck from "shared/cards";

export class GameFactory {
  public static deserialize(json: string) {
    const obj = JSON.parse(json);

    const { rulesName } = obj;
    switch (rulesName) {
      case "TrucoGameRules":
        return this.makeTrucoGame(obj);

      case "CarteadoGameRules":
        return this.makeCarteadoGame(obj);

      default:
        throw new Error(`Unknown rulesName: ${rulesName}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static makeTrucoGame(obj: any): TrucoGame {
    const rules = new TrucoGameRules();
    const players = obj.players as GamePlayer[];

    const game = new TrucoGame(players, rules);

    game.deck = Deck.deserialize(obj.deck);
    game.bunch = obj.bunch;
    game.status = obj.status as GameStatus;
    game.playerTurn = obj.playerTurn;
    game.vira = obj.vira;
    game.manilha = obj.manilha;
    game.currentBet = obj.currentBet;
    game.trucoAskedBy = obj.trucoAskedBy;
    game.rounds = obj.rounds;
    game.trucoAcceptedBy = obj.trucoAcceptedBy;
    game.teams = obj.teams;
    game.handsResults = obj.handsResults;

    return game;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static makeCarteadoGame(obj: any): CarteadoGame {
    const rules = new CarteadoGameRules();
    const players = obj.players as GamePlayer[];
    const game = new CarteadoGame(players, rules);

    game.deck = Deck.deserialize(obj.deck);
    game.bunch = obj.bunch;
    game.status = obj.status as GameStatus;
    game.playerTurn = obj.playerTurn;

    return game;
  }
}
