import { findLastCardIndex } from "shared/cards";
import { findGravediggerCandidates, pickRandom, PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { TrucoGame } from "../../TrucoGameRules";
import { PowerContext, PowerResult, PowerStrategy } from "../PowerStrategy";

/**
 * Coveiro: devolve a última carta jogada ao baralho e traz do restante uma
 * carta de valor de truco maior ou igual. Só vale se a jogada ainda está na
 * mesa. Atualiza `playedCards` e `bunch` para manter `resolveHand` coerente.
 */
export class GravediggerPower implements PowerStrategy {
  readonly id = PowerId.GRAVEDIGGER;
  readonly targeting = "NONE" as const;

  execute(game: TrucoGame, ctx: PowerContext): PowerResult {
    const player = game.getPlayer(ctx.userId)!;

    const lastPlayed = player.playedCards[player.playedCards.length - 1];
    if (!lastPlayed) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Você ainda não jogou nenhuma carta.",
      });
    }

    const bunchIndex = findLastCardIndex(game.bunch, lastPlayed);
    if (bunchIndex === -1) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Sua última carta já saiu da mesa.",
      });
    }

    const deckIndex = pickRandom(
      findGravediggerCandidates(game.deck.cards, lastPlayed, game.manilha)
    );
    if (deckIndex === undefined) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Não há carta restante com valor maior ou igual.",
      });
    }

    const [replacement] = game.deck.cards.splice(deckIndex, 1);
    delete replacement.powerId;
    game.deck.cards.unshift(lastPlayed);

    player.playedCards[player.playedCards.length - 1] = replacement;
    game.bunch[bunchIndex] = replacement;

    return { returnedCard: lastPlayed, replacementCard: replacement };
  }
}
