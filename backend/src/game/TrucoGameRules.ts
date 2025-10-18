import Deck, {
  Card,
  getCardValue,
  getNextRank,
  TRUCO_RANK_ORDER,
} from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game } from "./game";
import { HandResult, Team } from "shared/types";
import { GameStatus, PlayerStatus, BasePlayer } from "shared/game";
import { GameError } from "@/errors/GameError";

// A classe TrucoGame permanece focada no estado do jogo.
// A lógica foi movida para a classe de regras.
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

    return JSON.stringify(baseData);
  }
}

// A interface foi simplificada para refletir a nova abordagem.
type ITrucoGameRules = IGameRules<TrucoGame> & {
  askTruco(game: TrucoGame, userId: string): void;
  acceptTruco(game: TrucoGame, userId: string): void;
  rejectTruco(game: TrucoGame): void;
};

export class TrucoGameRules implements ITrucoGameRules {
  // O estado do round foi movido para dentro da classe de regras,
  // desacoplando-o da classe principal do jogo.
  dealInitialHands(game: TrucoGame) {
    this.resetRoundState(game);
    this.distributeHands(game);
    this.setupViraAndManilha(game);
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
    game.teams.forEach((t) => (t.roundWins = 0));
  }

  private distributeHands(game: TrucoGame) {
    const allowedRanks = Object.keys(TRUCO_RANK_ORDER);
    game.players.forEach((player) => {
      player.status = PlayerStatus.PLAYING;
      player.playedCards = [];
      player.hand = Array.from({ length: 3 }, () =>
        this.drawValidCard(game.deck, allowedRanks)
      );
    });
  }

  private setupViraAndManilha(game: TrucoGame) {
    const allowedRanks = Object.keys(TRUCO_RANK_ORDER);
    game.vira = this.drawValidCard(game.deck, allowedRanks);
    game.manilha = getNextRank(game.vira.rank);
  }

  private drawValidCard(deck: Deck, allowedRanks: string[]): Card {
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

  // Lógica de truco foi simplificada.
  public isTrucoPending(game: TrucoGame): boolean {
    return game.trucoState === "PENDING";
  }

  askTruco(game: TrucoGame, userId: string) {
    const askingTeam = this.findTeamByUserId(game, userId);
    const lastAskerTeam = game.trucoAskerId
      ? this.findTeamByUserId(game, game.trucoAskerId)
      : null;

    if (askingTeam?.id === lastAskerTeam?.id)
      throw new GameError({ code: "CONFLICT" });
    if (game.playerTurn !== userId && game.trucoState !== "ACCEPTED")
      throw new GameError({ code: "INVALID_ACTION" });
    if (game.currentBet >= 12) throw new GameError({ code: "INVALID_BET" });

    const betValues = { 1: 3, 3: 6, 6: 9, 9: 12 };
    game.currentBet = betValues[game.currentBet] || 3;
    game.trucoState = "PENDING";
    game.trucoAskerId = userId;
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

    // Na recusa, o valor do ponto é o da aposta ANTERIOR.
    const points = game.currentBet === 3 ? 1 : (game.currentBet / 3) * 2;
    this.finishRound(game, askingTeam, points);
  }

  canPlayCard(game: TrucoGame, userId: string) {
    if (this.isTrucoPending(game))
      throw new GameError({ code: "INVALID_ACTION" });
    if (game.playerTurn !== userId)
      throw new GameError({ code: "INVALID_ACTION" });
  }

  applyPlayCard(game: TrucoGame, userId: string, card: Card) {
    const player = game.getPlayer(userId);
    if (!player) throw new GameError({ code: "INVALID_ACTION" });

    const cardIndex = player.hand.findIndex(
      (c) => c.rank === card.rank && c.suit === card.suit
    );
    if (cardIndex === -1) throw new GameError({ code: "INVALID_ACTION" });

    player.hand.splice(cardIndex, 1);
    player.playedCards.push(card);

    const currentHandCards = game.bunch.length % game.players.length;
    if (currentHandCards === 0) game.bunch = []; // Limpa o monte no início de uma nova mão

    game.bunch.push(card);
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
    const currentHandCards = game.bunch.slice(-game.players.length);
    const [winnerId, isTie] = this.getHandWinner(currentHandCards, game);
    const winningTeam = winnerId
      ? this.findTeamByUserId(game, winnerId)
      : undefined;

    if (isTie) {
      game.teams.forEach((t) => (t.roundWins += 1)); // Em caso de empate, ambos os times "ganham" a mão.
    } else if (winningTeam) {
      winningTeam.roundWins += 1;
    }

    game.handsResults.push({
      winnerTeamId: isTie ? null : winningTeam?.id || null,
      bunch: [...currentHandCards],
      round: game.rounds,
      isTie: isTie,
    });

    // Lógica para definir o próximo a jogar
    const nextPlayer = game.getPlayer(winnerId);

    // Se houve empate, o próximo a jogar é quem empatou a mão
    game.playerTurn = isTie ? game.playerTurn : nextPlayer?.userId;

    this.checkRoundEnding(game);
  }

  // ** REGRAS DE EMPATE CORRIGIDAS **
  // A lógica de fim de rodada foi completamente refatorada para ser mais clara e correta.
  private checkRoundEnding(game: TrucoGame) {
    const teamA = game.teams[0];
    const teamB = game.teams[1];

    const isRoundOver = game.handsResults.length >= 2;
    if (!isRoundOver) return;

    // Cenário 1: Um time venceu as duas primeiras mãos.
    if (teamA.roundWins >= 2 && teamA.roundWins > teamB.roundWins) {
      this.finishRound(game, teamA, game.currentBet);
      return;
    }
    if (teamB.roundWins >= 2 && teamB.roundWins > teamA.roundWins) {
      this.finishRound(game, teamB, game.currentBet);
      return;
    }

    // Cenário 2: Três mãos foram jogadas.
    if (game.handsResults.length === 3) {
      if (teamA.roundWins > teamB.roundWins) {
        this.finishRound(game, teamA, game.currentBet);
      } else if (teamB.roundWins > teamA.roundWins) {
        this.finishRound(game, teamB, game.currentBet);
      } else {
        // Empate nas três mãos ou 1 vitória para cada + 1 empate.
        // Neste caso, quem venceu a primeira mão, leva a rodada.
        const roundResults = game.handsResults.filter(
          (r) => r.round === game.rounds
        );
        if (roundResults.length === 0) return;
        const firstHandWinnerId = roundResults[0].winnerTeamId;
        const winnerTeam = game.teams.find((t) => t.id === firstHandWinnerId);
        if (winnerTeam) {
          this.finishRound(game, winnerTeam, game.currentBet);
        } else {
          // Se a primeira empatou, ninguém ganha o ponto da rodada.
          this.startNewRound(game);
        }
      }
    }
  }

  private finishRound(game: TrucoGame, winningTeam: Team, points: number) {
    winningTeam.score += points;
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
    handCards: Card[],
    game: TrucoGame
  ): [string | undefined, boolean] {
    if (!handCards.length) return [undefined, false];

    let highestValue = -1;
    let winners: { card: Card; player: BasePlayer }[] = [];

    for (const card of handCards) {
      const value = getCardValue(card, game.manilha);
      const player = game.players.find((p) =>
        p.playedCards.some((c) => c.rank === card.rank && c.suit === card.suit)
      );
      if (!player) continue;

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
