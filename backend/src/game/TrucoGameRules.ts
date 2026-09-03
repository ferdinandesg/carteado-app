import Deck, { Card, getNextRank, TRUCO_RANKS } from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game } from "./game";
import { HandResult, Team } from "shared/types";
import {
  ActiveEffect,
  BasePlayer,
  findTeamByUserId,
  GameStatus,
  getOpponentTeam,
  nextTrucoBet,
  PlayerStatus,
  PowerPrivateResult,
  PowerUsage,
  resolveRoundOutcome,
  resolveTrickWinner,
  restoreIllusions,
  stampPowersOnDeck,
  TRUCO_MAX_BET,
  TRUCO_WINNING_SCORE,
  trucoRejectPoints,
  UsePowerPayload,
} from "shared/game";
import { GameError } from "@/errors/GameError";
import { executePower, PowerResult } from "./powers/PowerExecutor";
import { applyPlayedCardPower } from "./powers/applyCardPower";
import * as powerEffects from "./powers/effects";

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
  rejectTruco(game: TrucoGame): void;
  usePower(
    game: TrucoGame,
    userId: string,
    payload: UsePowerPayload
  ): PowerResult;
  drawValidCard(deck: Deck, allowedRanks: readonly string[]): Card;
  findTeamByUserId(game: TrucoGame, userId: string): Team | undefined;
  getOpponentTeam(game: TrucoGame, userId: string): Team | undefined;
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
    game.players.forEach((player) => {
      player.status = PlayerStatus.WAITING;
      player.playedCards = [];
      player.hand = Array.from({ length: 3 }, () =>
        this.drawValidCard(game.deck, TRUCO_RANKS)
      );
    });
  }

  private setupViraAndManilha(game: TrucoGame) {
    game.vira = this.drawValidCard(game.deck, TRUCO_RANKS);
    delete game.vira.powerId;
    game.manilha = getNextRank(game.vira.rank);
  }

  public drawValidCard(deck: Deck, allowedRanks: readonly string[]): Card {
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

  public findTeamByUserId(game: TrucoGame, userId: string): Team | undefined {
    return findTeamByUserId(game.teams, userId);
  }

  public getOpponentTeam(game: TrucoGame, userId: string): Team | undefined {
    return getOpponentTeam(game.teams, userId);
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
    if (game.currentBet >= TRUCO_MAX_BET)
      throw new GameError({ code: "INVALID_BET" });

    game.currentBet = nextTrucoBet(game.currentBet);
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

  rejectTruco(game: TrucoGame) {
    if (!this.isTrucoPending(game) || !game.trucoAskerId)
      throw new GameError({ code: "INVALID_ACTION" });

    const askingTeam = this.findTeamByUserId(game, game.trucoAskerId);
    if (!askingTeam) throw new GameError({ code: "INVALID_ACTION" });

    // Efeitos do time que corre (ex.: Escudo de Prata) podem baratear a fuga.
    const defendingIds = game.teams
      .filter((team) => team.id !== askingTeam.id)
      .flatMap((team) => team.userIds);
    const points = powerEffects.adjustRejectPoints(
      game,
      defendingIds,
      trucoRejectPoints(game.currentBet)
    );

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
    // Só depois do registro em `powerUsages`: correr fecha a rodada e muda `rounds`.
    if (result.runFromTruco) this.rejectTruco(game);
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

    // Cada carta da vaza pertence ao jogador cuja última jogada é ela.
    const entries = game.bunch.slice(-game.players.length).map((card) => {
      const owner = game.players.find((p) => {
        const last = p.playedCards[p.playedCards.length - 1];
        return last && last.rank === card.rank && last.suit === card.suit;
      })!;
      return { card, userId: owner.userId };
    });

    const outcome = resolveTrickWinner(entries, game.manilha, game.teams);
    const winningTeam = outcome.winnerTeamId
      ? game.teams.find((team) => team.id === outcome.winnerTeamId)
      : undefined;

    if (outcome.isTie) {
      game.teams.forEach((t) => (t.roundWins += 1));
    } else if (winningTeam) {
      winningTeam.roundWins += 1;
    }

    game.handsResults.push({
      winnerTeamId: outcome.winnerTeamId,
      bunch: entries.map((entry) => entry.card),
      round: game.rounds,
      isTie: outcome.isTie,
    });

    // Quem venceu a vaza abre a próxima; em empate, mantém a ordem.
    game.playerTurn = outcome.winnerUserId ?? game.playerTurn;
    game.skipTurns(game.playerTurn, 0);
    this.checkRoundEnding(game);
  }

  private checkRoundEnding(game: TrucoGame) {
    const roundResults = game.handsResults.filter(
      (r) => r.round === game.rounds
    );
    const outcome = resolveRoundOutcome(game.teams, roundResults);
    if (outcome.kind === "won") {
      this.finishRound(game, outcome.team, game.currentBet);
    } else if (outcome.kind === "void") {
      this.startNewRound(game);
    }
  }

  public finishRound(game: TrucoGame, winningTeam: Team, points: number) {
    if (game.status === GameStatus.FINISHED) return;

    winningTeam.score += points;
    powerEffects.afterFinishRound(game, winningTeam);
    if (winningTeam.score >= TRUCO_WINNING_SCORE) {
      game.status = GameStatus.FINISHED;
    } else {
      this.startNewRound(game);
    }
  }

  private startNewRound(game: TrucoGame) {
    game.teams.forEach((t) => (t.roundWins = 0));
    this.dealInitialHands(game);
  }
}
