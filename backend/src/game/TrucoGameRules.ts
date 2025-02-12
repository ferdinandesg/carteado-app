import Deck, {
  Card,
  getCardValue,
  getNextRank,
  TRUCO_RANK_ORDER,
} from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game, GamePlayer, GameStatus, PlayerStatus } from "./game";
import { HandResult, Team } from "shared/types";

export class TrucoGame extends Game<TrucoGame, ITrucoGameRules> {
  public vira: Card | null = null;
  public manilha: string = "";
  public currentBet = 1;
  public trucoAskedBy = "";
  public rounds = 0;
  public trucoAcceptedBy: string = "";
  public teams: Team[] = [];
  public handsResults: HandResult[] = [];

  constructor(players: GamePlayer[], rules: ITrucoGameRules) {
    super(players, rules, "TrucoGameRules");
    if (players.length === 2) {
      this.teams = [
        {
          id: "TEAM_A",
          userIds: [players[0].userId],
          roundWins: 0,
          score: 0,
        },
        {
          id: "TEAM_B",
          userIds: [players[1].userId],
          roundWins: 0,
          score: 0,
        },
      ];
    } else if (players.length === 4) {
      this.teams = [
        {
          id: "TEAM_A",
          userIds: [players[0].userId, players[2].userId],
          roundWins: 0,
          score: 0,
        },
        {
          id: "TEAM_B",
          userIds: [players[1].userId, players[3].userId],
          roundWins: 0,
          score: 0,
        },
      ];
    }
  }

  public override serialize(): string {
    const baseData = JSON.parse(super.serialize());
    baseData.vira = this.vira;
    baseData.manilha = this.manilha;
    baseData.currentBet = this.currentBet;
    baseData.trucoAskedBy = this.trucoAskedBy;
    baseData.rounds = this.rounds;
    baseData.trucoAcceptedBy = this.trucoAcceptedBy;
    baseData.teams = this.teams;
    baseData.handsResults = this.handsResults;

    return JSON.stringify(baseData);
  }
}

type ITrucoGameRules = IGameRules<TrucoGame> & {
  askTruco(game: TrucoGame, userId: string): void;
  acceptTruco(game: TrucoGame, userId: string): void;
  rejectTruco(game: TrucoGame, userId: string): void;
  findTeamByUserId(game: TrucoGame, userId: string): string | null;
  isTrucoPending(game: TrucoGame): boolean;
};

export class TrucoGameRules implements ITrucoGameRules {
  manilha: Card | null = null;
  currentBet = 1;
  trucoAskedBy = "";
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
    game.trucoAskedBy = "";
    game.trucoAcceptedBy = "";
    game.vira = null;
    game.teams.forEach((t) => (t.roundWins = 0));
  }

  private distributeHands(game: TrucoGame) {
    const allowedRanks = Object.keys(TRUCO_RANK_ORDER);

    for (const player of game.players) {
      player.status = PlayerStatus.PLAYING;
      player.playedCards = [];
      player.hand = [];

      for (let i = 0; i < 3; i++) {
        const card = this.drawValidCard(game.deck, allowedRanks);
        player.hand.push(card);
      }
    }
  }

  private setupViraAndManilha(game: TrucoGame) {
    const allowedRanks = Object.keys(TRUCO_RANK_ORDER);

    game.vira = this.drawValidCard(game.deck, allowedRanks);
    game.manilha = getNextRank(game.vira.rank);
  }

  private drawValidCard(deck: Deck, allowedRanks: string[]): Card {
    let card = deck.draw();
    while (card && !allowedRanks.includes(card.rank)) {
      card = deck.draw();
    }
    return card as Card;
  }

  findTeamByUserId(game: TrucoGame, userId: string): string | null {
    for (const team of game.teams) {
      if (team.userIds.includes(userId)) {
        return team.id;
      }
    }
    return null;
  }

  isTrucoPending(game: TrucoGame) {
    return Boolean(game.trucoAskedBy && !game.trucoAcceptedBy);
  }

  askTruco(game: TrucoGame, userId: string) {
    const teamId = this.findTeamByUserId(game, userId);
    const askingTeamId = this.findTeamByUserId(game, game.trucoAskedBy);
    if (teamId === askingTeamId) throw "CANT_ASK_TRUCO_SAME_TEAM";
    if (game.playerTurn !== userId && !this.isTrucoPending(game))
      throw "NOT_YOUR_TURN";
    if (game.currentBet === 12) throw "CANT_ASK_TRUCO_ANYMORE";
    if (game.currentBet === 9) game.currentBet = 12;
    else if (game.currentBet === 6) game.currentBet = 9;
    else if (game.currentBet === 3) game.currentBet = 6;
    else game.currentBet = 3;
    game.trucoAskedBy = userId;
    game.trucoAcceptedBy = "";
  }

  acceptTruco(game: TrucoGame, userId: string) {
    if (!this.isTrucoPending(game)) throw "CANT_ACCEPT_TRUCO";
    game.trucoAcceptedBy = userId;
  }

  rejectTruco(game: TrucoGame, _userId: string) {
    if (!this.isTrucoPending(game)) throw "CANT_ACCEPT_TRUCO";
    const askingTeamId = this.findTeamByUserId(game, game.trucoAskedBy);
    if (!askingTeamId) return;

    const team = game.teams.find((t) => t.id === askingTeamId);
    if (!team) throw "TEAM_NOT_FOUND";
    game.currentBet -= 3;
    this.finishRound(game, team);
  }

  canPlayCard(game: TrucoGame, userId: string, _card: Card) {
    if (this.isTrucoPending(game)) throw "CANT_PLAY_TRUCO_PENDING";
    if (game.playerTurn !== userId) {
      throw "NOT_YOUR_TURN";
    }
  }

  applyPlayCard(game: TrucoGame, userId: string, card: Card) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";
    const isFirstCard = game.players.every((p) => p.playedCards.length === 0);
    player.hand = player.hand.filter((c) => c.toString !== card.toString);
    player.playedCards.push(card);
    if (isFirstCard) game.bunch = [];
    game.bunch.push(card);
    game.endTurn(userId);
  }

  validateEndTurn(game: TrucoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";
    if (player.playedCards.length === 0) {
      throw "MUST_PLAY_FIRST";
    }
  }

  async applyEndTurn(game: TrucoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";

    const isEndOfTurn = game.players.every(
      (p) => p.playedCards.length === player.playedCards.length
    );
    if (!isEndOfTurn) {
      game.skipTurns(game.playerTurn, 1);
      return;
    }

    const [winningPlayerId, ...possibleTies] = this.findWinnerByHighestCard(
      game.bunch,
      game
    );
    const isTie = possibleTies.length > 0;

    let winningTeam: Team | undefined;
    let winningTeamId: string | null = null;

    if (!isTie && winningPlayerId) {
      winningTeamId = this.findTeamByUserId(game, winningPlayerId);
      if (!winningTeamId) throw "TEAM_NOT_FOUND";

      winningTeam = game.teams.find((t) => t.id === winningTeamId);
      if (!winningTeam) throw "TEAM_NOT_FOUND";
    }

    if (winningTeam) {
      winningTeam.roundWins += 1;
    }

    game.handsResults.push({
      winnerTeamId: winningTeamId,
      bunch: [...game.bunch],
      round: game.rounds,
    });

    if (this.checkRoundEnding(game, winningTeam)) {
      game.bunch = [];
      return;
    }

    this.moveTurn(game, isTie, winningPlayerId);

    game.bunch = [];
  }

  private moveTurn(game: TrucoGame, isTie: boolean, winningPlayerId?: string) {
    if (!isTie && winningPlayerId) {
      game.playerTurn = winningPlayerId;
    } else {
      game.skipTurns(game.playerTurn, 1);
    }
  }

  private finishRound(game: TrucoGame, winningTeam: Team) {
    winningTeam.score += game.currentBet;

    if (winningTeam.score >= 12) {
      game.status = GameStatus.FINISHED;
    } else {
      game.rules.dealInitialHands(game);
    }

    for (const t of game.teams) {
      t.roundWins = 0;
    }
  }

  private finishRoundWithoutWinner(game: TrucoGame) {
    game.rules.dealInitialHands(game);
    for (const t of game.teams) {
      t.roundWins = 0;
    }
  }

  private checkRoundEnding(game: TrucoGame, winningTeam?: Team): boolean {
    if (winningTeam && winningTeam.roundWins === 2) {
      this.finishRound(game, winningTeam);
      return true;
    }

    const gameResultsPerRound = game.handsResults.filter(
      (g) => g.round === game.rounds
    );

    if (gameResultsPerRound.length === 3) {
      const teamA = game.teams[0];
      const teamB = game.teams[1];

      if (teamA.roundWins === 1 && teamB.roundWins === 1) {
        const firstHand = gameResultsPerRound[0];
        if (firstHand.winnerTeamId) {
          const firstHandTeam = game.teams.find(
            (t) => t.id === firstHand.winnerTeamId
          );
          if (firstHandTeam) {
            this.finishRound(game, firstHandTeam);
          } else {
            this.finishRoundWithoutWinner(game);
          }
        } else {
          this.finishRoundWithoutWinner(game);
        }
        return true;
      }
      if (
        teamA.roundWins === 1 &&
        teamB.roundWins === 0 &&
        winningTeam === teamA
      ) {
        this.finishRound(game, teamA);
        return true;
      } else if (
        teamB.roundWins === 1 &&
        teamA.roundWins === 0 &&
        winningTeam === teamB
      ) {
        this.finishRound(game, teamB);
        return true;
      }

      this.finishRoundWithoutWinner(game);
      return true;
    }

    return false;
  }

  private findWinnerByHighestCard(bunch: Card[], game: TrucoGame): string[] {
    if (!bunch.length) return [];
    let bestValue = -1;
    let bestCards: Card[] = [];

    for (const card of bunch) {
      const value = getCardValue(card, game.manilha);
      if (value > bestValue) {
        bestValue = value;
        bestCards = [card];
      } else if (value === bestValue) {
        bestCards.push(card);
      }
    }

    if (!bestCards.length) return [];

    const winnerPlayers: GamePlayer[] = [];
    for (const p of game.players) {
      const found = p.playedCards.some((c) =>
        bestCards.some((bc) => bc.toString === c.toString)
      );
      if (found) {
        winnerPlayers.push(p);
      }
    }

    if (winnerPlayers.length === 1) return winnerPlayers.map((p) => p.userId);
    const getLastIndexForPlayer = (player: GamePlayer): number => {
      let lastIndex = -1;
      for (const card of player.playedCards) {
        if (bestCards.some((bc) => bc.toString === card.toString)) {
          const index = bunch.lastIndexOf(card);
          if (index > lastIndex) {
            lastIndex = index;
          }
        }
      }
      return lastIndex;
    };

    const sortedWinners = winnerPlayers.sort((a, b) => {
      const aIndex = getLastIndexForPlayer(a);
      const bIndex = getLastIndexForPlayer(b);
      return bIndex - aIndex;
    });

    return sortedWinners.map((p) => p.userId);
  }
}
