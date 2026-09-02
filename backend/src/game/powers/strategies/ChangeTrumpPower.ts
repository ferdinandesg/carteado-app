import { getNextRank, TRUCO_RANK_ORDER } from "shared/cards";
import { PowerId } from "shared/game";
import type { TrucoGame } from "../../TrucoGameRules";
import type { PowerResult, PowerStrategy } from "../PowerStrategy";

/** Vira-Casaca: revela a próxima carta do baralho como novo vira, mudando a manilha. */
export class ChangeTrumpPower implements PowerStrategy {
  readonly id = PowerId.CHANGE_TRUMP;
  readonly targeting = "NONE" as const;

  execute(game: TrucoGame): PowerResult {
    const vira = game.rules.drawValidCard(
      game.deck,
      Object.keys(TRUCO_RANK_ORDER)
    );
    game.vira = vira;
    game.manilha = getNextRank(vira.rank);
    return {};
  }
}
