import Deck, { Card } from "shared/cards";
import { IGameRules } from "./IGameRules";
import { Game, GamePlayer, GameStatus, PlayerStatus } from "./game";

const TRUCO_RANK_ORDER: Record<string, number> = {
  "3": 14,
  "2": 13,
  A: 12,
  K: 11,
  J: 10,
  Q: 9,
  "7": 8,
  "6": 7,
  "5": 6,
  "4": 5,
};

const suitValueMap: Record<string, number> = {
  diamonds: 0,
  spades: 1,
  hearts: 2,
  clubs: 3,
};

export class TrucoGame extends Game<TrucoGame, ITrucoGameRules> {
  public vira: Card | null = null;
  public manilha: string = "";
  public currentBet = 1;
  public roundOwner = "";
  public rounds = 0;
  public trucoAcceptedBy: string = "";
  public teams: {
    id: string;
    userIds: string[];
    points: number;
  }[] = [];

  constructor(players: GamePlayer[], rules: ITrucoGameRules) {
    super(players, rules, "TrucoGameRules");
    if (players.length === 2) {
      this.teams = [
        { id: "TEAM_A", userIds: [players[0].userId], points: 0 },
        { id: "TEAM_B", userIds: [players[1].userId], points: 0 },
      ];
    } else if (players.length === 4) {
      this.teams = [
        {
          id: "TEAM_A",
          userIds: [players[0].userId, players[2].userId],
          points: 0,
        },
        {
          id: "TEAM_B",
          userIds: [players[1].userId, players[3].userId],
          points: 0,
        },
      ];
    }
  }

  public override serialize(): string {
    const baseData = JSON.parse(super.serialize());
    baseData.vira = this.vira;
    baseData.manilha = this.manilha;
    baseData.currentBet = this.currentBet;
    baseData.roundOwner = this.roundOwner;
    baseData.rounds = this.rounds;
    baseData.trucoAcceptedBy = this.trucoAcceptedBy;

    return JSON.stringify(baseData);
  }
}

type ITrucoGameRules = IGameRules<TrucoGame> & {
  askTruco(game: TrucoGame, userId: string): void;
  acceptTruco(game: TrucoGame, userId: string): void;
  rejectTruco(game: TrucoGame, userId: string): void;
  getNextRank(rank: string): string;
  findTeamByUserId(game: TrucoGame, userId: string): string | null;
};

export class TrucoGameRules implements ITrucoGameRules {
  manilha: Card | null = null;
  currentBet = 1;
  roundOwner = "";
  dealInitialHands(game: TrucoGame) {
    game.deck = new Deck();
    game.status = GameStatus.PLAYING;
    game.players.forEach((p) => {
      p.status = PlayerStatus.PLAYING;
      p.playedCards = [];
      p.hand = [];
      const allowedRanks = Object.keys(TRUCO_RANK_ORDER);
      for (let i = 0; i < 3; i++) {
        let c = game.deck.draw();
        if (c) {
          while (!allowedRanks.includes(c!.rank)) {
            c = game.deck.draw();
          }
        }
        p.hand.push(c as Card);
      }
    });
    game.vira = game.deck.draw() as Card;
    game.manilha = this.getNextRank(game.vira.rank);
  }

  findTeamByUserId(game: TrucoGame, userId: string): string | null {
    for (const team of game.teams) {
      if (team.userIds.includes(userId)) {
        return team.id;
      }
    }
    return null;
  }

  askTruco(game: TrucoGame, userId: string) {
    const teamId = this.findTeamByUserId(game, userId);
    const askingTeamId = this.findTeamByUserId(game, game.roundOwner);
    if (teamId === askingTeamId) throw "CANT_ASK_TRUCO_SAME_TEAM";
    if (game.currentBet === 12) throw "CANT_ASK_TRUCO";
    if (game.currentBet === 9) game.currentBet = 12;
    else if (game.currentBet === 6) game.currentBet = 9;
    else if (game.currentBet === 3) game.currentBet = 6;
    else game.currentBet = 3;
    game.roundOwner = userId;
    game.trucoAcceptedBy = "";
  }

  acceptTruco(game: TrucoGame, userId: string) {
    game.trucoAcceptedBy = userId;
  }

  rejectTruco(game: TrucoGame, _userId: string) {
    if (game.roundOwner && !game.trucoAcceptedBy) {
      const askingTeamId = this.findTeamByUserId(game, game.roundOwner);
      if (!askingTeamId) return;

      const team = game.teams.find((t) => t.id === askingTeamId);
      if (team) {
        team.points += game.currentBet;
        if (team.points >= 12) {
          game.status = GameStatus.FINISHED;
        }
      }
      game.rounds++;
      game.bunch = [];
      game.players.forEach((p) => (p.playedCards = []));
      game.rules.dealInitialHands(game);
    } else {
      throw "CANT_REJECT_TRUCO";
    }
  }

  canPlayCard(game: TrucoGame, userId: string, _card: Card) {
    if (game.roundOwner && !game.trucoAcceptedBy)
      throw "CANT_PLAY_TRUCO_PENDING";
    if (game.playerTurn !== userId) {
      throw "NOT_YOUR_TURN";
    }
  }

  applyPlayCard(game: TrucoGame, userId: string, card: Card) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";

    player.hand = player.hand.filter((c) => c.toString !== card.toString);
    player.playedCards.push(card);
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

  applyEndTurn(game: TrucoGame, userId: string) {
    const player = game.getPlayer(userId);
    if (!player) throw "PLAYER_NOT_FOUND";

    const isEndOfTurn = game.players.every((p) => p.playedCards.length > 0);
    if (!isEndOfTurn) {
      game.skipTurns(game.playerTurn, 1);
      return;
    }

    const winningPlayerId = this.findWinnerByHighestCard(game.bunch, game);
    if (winningPlayerId) {
      const winningTeamId = this.findTeamByUserId(game, winningPlayerId);
      if (!winningTeamId) throw "TEAM_NOT_FOUND";
      const team = game.teams.find((t) => t.id === winningTeamId);
      if (!team) throw "TEAM_NOT_FOUND";
      team.points += game.currentBet;
      if (team.points >= 12) {
        game.status = GameStatus.FINISHED;
      }
    }

    game.rounds++;
    game.bunch = [];
    game.players.forEach((p) => (p.playedCards = []));
    game.rules.dealInitialHands(game);
  }

  private findWinnerByHighestCard(
    bunch: Card[],
    game: TrucoGame
  ): string | null {
    if (!bunch.length) return null;
    let bestValue = -1;
    let bestCard: Card | null = null;

    for (const card of bunch) {
      const value = getCardValue(card, game.manilha);
      if (value > bestValue) {
        bestValue = value;
        bestCard = card;
      }
    }

    if (!bestCard) return null;

    let winnerPlayer: GamePlayer | undefined = undefined;
    for (const p of game.players) {
      const found = p.playedCards.some((c) => c === bestCard);
      if (found) {
        winnerPlayer = p;
        break;
      }
    }

    return winnerPlayer ? winnerPlayer.userId : null;
  }

  getNextRank(rank: string): string {
    switch (rank) {
      case "3":
        return "4";
      case "2":
        return "3";
      case "A":
        return "2";
      case "K":
        return "A";
      case "J":
        return "K";
      case "Q":
        return "J";
      case "7":
        return "6";
      case "6":
        return "5";
      case "5":
        return "4";
      case "4":
        return "3";
      default:
        return "J";
    }
  }
}

function getCardValue(card: Card, manilhaRank: string): number {
  const suitVal = suitValueMap[card.suit] ?? 0;

  if (card.rank === manilhaRank) {
    return 100 + suitVal;
  }

  const rankVal = TRUCO_RANK_ORDER[card.rank] ?? 0;
  return rankVal * 4 + suitVal;
}
