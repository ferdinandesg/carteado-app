import Deck, {
  Card,
  getNextRank,
  suitValueMap,
  TRUCO_RANK_ORDER,
} from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game } from "./game";
import { HandResult, Team } from "shared/types";
import {
  ActiveEffect,
  BasePlayer,
  GameStatus,
  PlayerStatus,
  PowerPrivateResult,
  PowerUsage,
  UsePowerPayload,
} from "shared/game";
import { GameError } from "@/errors/GameError";
import { executePower, PowerResult } from "./powers/PowerExecutor";
import { applyPlayedCardPower } from "./powers/applyCardPower";
import { stampPowersOnDeck } from "./powers/stampDeck";
import * as powerEffects from "./powers/effects";
import { restoreIllusions } from "./powers/strategies/IllusionistPower";

/** Hierarquia comum do Truco: 4, 5, 6, 7, Q, J, K, A, 2, 3. */
const TRUCO_COMMON_POWER: Record<string, number> = {
  "4": 1,
  "5": 2,
  "6": 3,
  "7": 4,
  Q: 5,
  J: 6,
  K: 7,
  A: 8,
  "2": 9,
  "3": 10,
};

/** Manilhas ficam acima de qualquer carta comum (3 = 10). */
const MANILHA_BASE_POWER = 20;

// A classe TrucoGame permanece focada no estado do jogo.
export class TrucoGame extends Game<TrucoGame, ITrucoGameRules, BasePlayer> {
  public vira: Card | null = null;
  public manilha: string = "";
  public currentBet = 1;
  public type = "TRUCO";
  public trucoState: "NONE" | "PENDING" | "ACCEPTED" = "NONE";
  public trucoAskerId: string | null = null;
  public rounds = 0;
  public teams: Team[] = [];
  public handsResults: HandResult[] = [];
  public activeEffects: ActiveEffect[] = [];
  public powerUsages: PowerUsage[] = [];
  /** Peek privado da última ação; não entra no serialize. */
  public pendingPrivateResult?: PowerPrivateResult;

  constructor(players: BasePlayer[]) {
    const rules = new TrucoGameRules();
    super(players, rules, "TrucoGameRules");
    this.initializeTeams(players);
  }

  // Otimização: A criação de times foi movida para um método privado.
  private initializeTeams(players: BasePlayer[]): void {
    if (players.length !== 2 && players.length !== 4) {
      throw new GameError({ code: "ROOM_NOT_FULL" });
    }

    const teamA_Ids =
      players.length === 2
        ? [players[0].userId]
        : [players[0].userId, players[2].userId];
    const teamB_Ids =
      players.length === 2
        ? [players[1].userId]
        : [players[1].userId, players[3].userId];

    this.teams = [
      { id: "TEAM_A", userIds: teamA_Ids, roundWins: 0, score: 0 },
      { id: "TEAM_B", userIds: teamB_Ids, roundWins: 0, score: 0 },
    ];
  }

  // A serialização foi otimizada para ser mais concisa.
  public override serialize(): string {
    const baseData = JSON.parse(super.serialize());
    baseData.vira = this.vira;
    baseData.manilha = this.manilha;
    baseData.currentBet = this.currentBet;
    baseData.trucoState = this.trucoState;
    baseData.trucoAskerId = this.trucoAskerId;
    baseData.rounds = this.rounds;
    baseData.teams = this.teams;
    baseData.handsResults = this.handsResults;
    baseData.activeEffects = this.activeEffects;
    baseData.powerUsages = this.powerUsages;

    return JSON.stringify(baseData);
  }
}

// A interface foi simplificada para refletir a nova abordagem.
type ITrucoGameRules = IGameRules<TrucoGame> & {
  askTruco(game: TrucoGame, userId: string): void;
  acceptTruco(game: TrucoGame, userId: string): void;
  rejectTruco(game: TrucoGame, pointsOverride?: number): void;
  usePower(
    game: TrucoGame,
    userId: string,
    payload: UsePowerPayload
  ): PowerResult;
  drawValidCard(deck: Deck, allowedRanks: string[]): Card;
  findTeamByUserId(game: TrucoGame, userId: string): Team | undefined;
  getOpponentTeam(game: TrucoGame, userId: string): Team | undefined;
  getCardTrucoPower(card: Card, vira: Card | null): number;
};

export class TrucoGameRules implements ITrucoGameRules {
  // O estado do round foi movido para dentro da classe de regras,
  // desacoplando-o da classe principal do jogo.
  dealInitialHands(game: TrucoGame) {
    this.resetRoundState(game);
    this.distributeHands(game);
    this.setupViraAndManilha(game);
    stampPowersOnDeck(
      game.players.flatMap((player) => player.hand),
      undefined,
      { excludeRanks: [game.manilha] }
    );
    // Marca o jogador da vez como PLAYING (os demais ficam WAITING).
    game.skipTurns(game.playerTurn, 0);
  }

  private resetRoundState(game: TrucoGame) {
    game.deck = new Deck();
    game.status = GameStatus.PLAYING;
    game.rounds++;
    game.currentBet = 1;
    game.trucoState = "NONE";
    game.bunch = [];
    game.trucoAskerId = null;
    game.vira = null;
    game.activeEffects = [];
    game.teams.forEach((t) => (t.roundWins = 0));
  }

  private distributeHands(game: TrucoGame) {
    const allowedRanks = Object.keys(TRUCO_RANK_ORDER);
    game.players.forEach((player) => {
      player.status = PlayerStatus.WAITING;
      player.playedCards = [];
      player.hand = Array.from({ length: 3 }, () =>
        this.drawValidCard(game.deck, allowedRanks)
      );
    });
  }

  private setupViraAndManilha(game: TrucoGame) {
    const allowedRanks = Object.keys(TRUCO_RANK_ORDER);
    game.vira = this.drawValidCard(game.deck, allowedRanks);
    delete game.vira.powerId;
    game.manilha = getNextRank(game.vira.rank);
  }

  public drawValidCard(deck: Deck, allowedRanks: string[]): Card {
    let card = deck.draw();
    // Adicionado um loop de segurança para evitar loop infinito em um baralho esgotado.
    while (
      card &&
      !allowedRanks.includes(card.rank) &&
      deck.getCards().length > 0
    ) {
      card = deck.draw();
    }
    if (!card) throw new GameError({ code: "INVALID_DECK" });
    return card;
  }

  // Métodos de busca foram otimizados.
  public findTeamByUserId(game: TrucoGame, userId: string): Team | undefined {
    return game.teams.find((team) => team.userIds.includes(userId));
  }

  public getOpponentTeam(game: TrucoGame, userId: string): Team | undefined {
    const playerTeamId = this.findTeamByUserId(game, userId)?.id;
    return game.teams.find((team) => team.id !== playerTeamId);
  }

  /**
   * Poder da carta na escala oficial do Truco Paulista.
   * Comuns: 4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3.
   * Manilhas (próximo rank do vira), em ordem absoluta de naipe:
   * Ouros < Espadas < Copas < Paus (Zap).
   */
  public getCardTrucoPower(card: Card, vira: Card | null): number {
    if (vira) {
      const manilhaRank = getNextRank(vira.rank);
      if (card.rank === manilhaRank) {
        return MANILHA_BASE_POWER + (suitValueMap[card.suit] ?? 0);
      }
    }
    return TRUCO_COMMON_POWER[card.rank] ?? 0;
  }

  // Lógica de truco foi simplificada.
  public isTrucoPending(game: TrucoGame): boolean {
    return game.trucoState === "PENDING";
  }

  askTruco(game: TrucoGame, userId: string) {
    powerEffects.beforeAskTruco(game, userId);

    const askingTeam = this.findTeamByUserId(game, userId);
    const lastAskerTeam = game.trucoAskerId
      ? this.findTeamByUserId(game, game.trucoAskerId)
      : null;

    if (askingTeam?.id === lastAskerTeam?.id) {
      throw new GameError({
        code: "INVALID_ACTION",
        message: "Seu time já pediu truco. Aguarde a resposta.",
      });
    }
    if (game.currentBet >= 12) throw new GameError({ code: "INVALID_BET" });

    const betValues: Record<number, number> = { 1: 3, 3: 6, 6: 9, 9: 12 };
    game.currentBet = betValues[game.currentBet] ?? 3;
    game.trucoState = "PENDING";
    game.trucoAskerId = userId; // Guarda quem fez o último pedido
  }

  acceptTruco(game: TrucoGame, userId: string) {
    const acceptingTeam = this.findTeamByUserId(game, userId);
    const askingTeam = game.trucoAskerId
      ? this.findTeamByUserId(game, game.trucoAskerId)
      : null;

    if (!this.isTrucoPending(game))
      throw new GameError({ code: "INVALID_ACTION" });
    if (acceptingTeam?.id === askingTeam?.id)
      throw new GameError({ code: "INVALID_ACTION" });

    game.trucoState = "ACCEPTED";
  }

  rejectTruco(game: TrucoGame, pointsOverride?: number) {
    if (!this.isTrucoPending(game) || !game.trucoAskerId)
      throw new GameError({ code: "INVALID_ACTION" });

    const askingTeam = this.findTeamByUserId(game, game.trucoAskerId);
    if (!askingTeam) throw new GameError({ code: "INVALID_ACTION" });

    const betValues: Record<number, number> = { 1: 3, 3: 6, 6: 9, 9: 12 };
    const matchingKey = Object.entries(betValues).find(
      ([, v]) => v === game.currentBet
    )?.[0];
    let points = pointsOverride ?? (matchingKey ? Number(matchingKey) : 1);

    if (pointsOverride === undefined) {
      const defendingIds = game.teams
        .filter((team) => team.id !== askingTeam.id)
        .flatMap((team) => team.userIds);
      points = powerEffects.adjustRejectPoints(game, defendingIds, points);
    }

    this.finishRound(game, askingTeam, points);
  }

  canPlayCard(game: TrucoGame, userId: string, card: Card) {
    if (this.isTrucoPending(game))
      throw new GameError({ code: "INVALID_ACTION" });
    if (game.playerTurn !== userId)
      throw new GameError({ code: "INVALID_ACTION" });
    powerEffects.beforePlayCard(game, userId, card);
  }

  usePower(game: TrucoGame, userId: string, payload: UsePowerPayload) {
    const result = executePower(game, userId, payload);
    if (result.rejectPoints !== undefined) {
      this.rejectTruco(game, result.rejectPoints);
    }
    return result;
  }

  applyPlayCard(game: TrucoGame, userId: string, card: Card) {
    const player = game.getPlayer(userId);
    if (!player) throw new GameError({ code: "INVALID_ACTION" });

    const cardIndex = player.hand.findIndex(
      (c) => c.rank === card.rank && c.suit === card.suit
    );
    if (cardIndex === -1) throw new GameError({ code: "INVALID_ACTION" });

    const played = player.hand[cardIndex];
    player.hand.splice(cardIndex, 1);
    player.playedCards.push(played);

    game.bunch.push(played);
    powerEffects.afterPlayCard(game, userId, played);
    applyPlayedCardPower(game, userId, played);
    game.endTurn(userId);
  }

  validateEndTurn(game: TrucoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) throw new GameError({ code: "INVALID_ACTION" });
    // A validação de "ter jogado" é inerente ao fluxo, essa validação extra pode ser removida se o fluxo for garantido.
  }

  applyEndTurn(game: TrucoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) return;

    // Verifica se todos já jogaram nesta mão da rodada
    const isEndOfHand = game.bunch.length % game.players.length === 0;
    if (!isEndOfHand) {
      game.skipTurns(game.playerTurn, 1);
      return;
    }

    this.resolveHand(game);

    if (game.status === GameStatus.PLAYING) {
      game.bunch = [];
      // Lógica de próximo turno após resolver a mão
    }
  }

  // Lógica de resolução da mão foi extraída para um método dedicado.
  private resolveHand(game: TrucoGame) {
    restoreIllusions(game);

    const currentHandCards = game.bunch
      .slice(-game.players.length)
      .map((card) => {
        const player = game.players.find(
          (p) =>
            p.playedCards.length > 0 &&
            p.playedCards[p.playedCards.length - 1].rank === card.rank &&
            p.playedCards[p.playedCards.length - 1].suit === card.suit
        )!;
        return { card, player };
      });

    // Passa a estrutura correta para getHandWinner
    const [winnerId, isTie] = this.getHandWinner(currentHandCards, game);

    const winningTeam = winnerId
      ? this.findTeamByUserId(game, winnerId)
      : undefined;

    if (isTie) {
      game.teams.forEach((t) => (t.roundWins += 1));
    } else if (winningTeam) {
      winningTeam.roundWins += 1;
    }

    game.handsResults.push({
      winnerTeamId: isTie ? null : winningTeam?.id || null,
      bunch: currentHandCards.map((c) => c.card), // Apenas as cartas
      round: game.rounds,
      isTie: isTie,
    });

    const nextPlayer = winnerId ? game.getPlayer(winnerId) : undefined;
    game.playerTurn = isTie
      ? game.playerTurn
      : (nextPlayer?.userId ?? game.playerTurn);
    game.skipTurns(game.playerTurn, 0);
    this.checkRoundEnding(game);
  }

  // ** REGRAS DE EMPATE CORRIGIDAS **
  // A lógica de fim de rodada foi completamente refatorada para ser mais clara e correta.
  private checkRoundEnding(game: TrucoGame) {
    const teamA = game.teams[0];
    const teamB = game.teams[1];

    const roundResults = game.handsResults.filter(
      (r) => r.round === game.rounds
    );

    // Se menos de 2 mãos foram jogadas neste round, não há nada a fazer.
    if (roundResults.length < 2) return;

    // Cenário 1: Vencedor claro após 2 mãos (ganhou-ganhou ou empatou-ganhou).
    if (teamA.roundWins >= 2 && teamA.roundWins > teamB.roundWins) {
      this.finishRound(game, teamA, game.currentBet);
      return;
    }
    if (teamB.roundWins >= 2 && teamB.roundWins > teamA.roundWins) {
      this.finishRound(game, teamB, game.currentBet);
      return;
    }

    // Cenário 2: Se 3 mãos foram jogadas, precisamos de um desempate.
    if (roundResults.length === 3) {
      if (teamA.roundWins > teamB.roundWins) {
        this.finishRound(game, teamA, game.currentBet);
      } else if (teamB.roundWins > teamA.roundWins) {
        this.finishRound(game, teamB, game.currentBet);
      } else {
        // ✅ LÓGICA DE DESEMPATE CORRIGIDA E SIMPLIFICADA
        // Se os 'roundWins' são iguais, o vencedor da primeira mão leva a rodada.
        const firstHandWinnerId = roundResults[0].winnerTeamId;
        const winnerTeam = game.teams.find((t) => t.id === firstHandWinnerId);

        if (winnerTeam) {
          this.finishRound(game, winnerTeam, game.currentBet);
        } else {
          // Se a primeira mão empatou, ninguém ganha a rodada.
          this.startNewRound(game);
        }
      }
    }
  }

  public finishRound(game: TrucoGame, winningTeam: Team, points: number) {
    if (game.status === GameStatus.FINISHED) return;

    winningTeam.score += points;
    powerEffects.afterFinishRound(game, winningTeam);
    if (winningTeam.score >= 12) {
      game.status = GameStatus.FINISHED;
    } else {
      this.startNewRound(game);
    }
  }

  private startNewRound(game: TrucoGame) {
    game.teams.forEach((t) => (t.roundWins = 0));
    this.dealInitialHands(game);
  }

  private getHandWinner(
    handCards: { card: Card; player: BasePlayer }[],
    game: TrucoGame
  ): [string | undefined, boolean] {
    if (!handCards.length) return [undefined, false];

    let highestValue = -1;
    let winners: { card: Card; player: BasePlayer }[] = [];

    for (const { card, player } of handCards) {
      const value = this.getCardTrucoPower(card, game.vira);

      if (value > highestValue) {
        highestValue = value;
        winners = [{ card, player }];
      } else if (value === highestValue) {
        winners.push({ card, player });
      }
    }

    if (winners.length === 0) return [undefined, false];

    // Verifica se os jogadores com a maior carta são do mesmo time.
    const firstWinnerTeamId = this.findTeamByUserId(
      game,
      winners[0].player.userId
    )?.id;
    const isTie = winners.some(
      (w) =>
        this.findTeamByUserId(game, w.player.userId)?.id !== firstWinnerTeamId
    );

    if (isTie) {
      return [undefined, true];
    }

    // Se não for empate, o vencedor é o primeiro jogador da lista.
    return [winners[0].player.userId, false];
  }
}
