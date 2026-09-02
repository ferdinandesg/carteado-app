import {
  BasePlayer,
  GameStatus,
  GameType,
  IGameState,
  PlayerStatus,
} from "shared/game";
import { Participant, RoomInterface } from "shared/types";

import {
  buildParticipantViews,
  getParticipantBadgeStatus,
} from "./participantDisplayStatus";

const makeParticipant = (
  overrides: Partial<Participant> = {}
): Participant => ({
  userId: "user-1",
  socketId: "socket-1",
  name: "Player",
  status: PlayerStatus.NOT_READY,
  isRegistered: true,
  isOnline: true,
  ...overrides,
});

const makePlayer = (overrides: Partial<BasePlayer> = {}): BasePlayer => ({
  userId: "user-1",
  name: "Player",
  hand: [],
  playedCards: [],
  table: [],
  teamId: "",
  status: PlayerStatus.WAITING,
  ...overrides,
});

describe("getParticipantBadgeStatus", () => {
  it("returns away when participant is offline", () => {
    expect(
      getParticipantBadgeStatus(makeParticipant({ isOnline: false }))
    ).toBe("away");
  });

  it("uses participant status in lobby (no game player)", () => {
    expect(
      getParticipantBadgeStatus(makeParticipant({ status: PlayerStatus.READY }))
    ).toBe("ready");
    expect(getParticipantBadgeStatus(makeParticipant())).toBe("waiting");
  });

  it("prefers game player status when in a match", () => {
    expect(
      getParticipantBadgeStatus(
        makeParticipant({ status: PlayerStatus.READY }),
        makePlayer({ status: PlayerStatus.PLAYING })
      )
    ).toBe("playing");

    expect(
      getParticipantBadgeStatus(
        makeParticipant({ status: PlayerStatus.READY }),
        makePlayer({ status: PlayerStatus.WAITING })
      )
    ).toBe("waiting");
  });

  it("returns playing for choosing phase", () => {
    expect(
      getParticipantBadgeStatus(
        makeParticipant(),
        makePlayer({ status: PlayerStatus.CHOOSING })
      )
    ).toBe("playing");
  });
});

describe("buildParticipantViews", () => {
  const room: RoomInterface = {
    id: "r",
    hash: "h",
    name: "Sala",
    status: "playing",
    size: 2,
    participants: [makeParticipant({ userId: "you", name: "Você" })],
    rule: "TrucoGameRules",
    createdAt: "",
    ownerId: "you",
  };

  it("appends bots from the game that are not room participants", () => {
    const views = buildParticipantViews(
      room,
      {
        status: GameStatus.PLAYING,
        playerTurn: "you",
        type: GameType.TRUCO,
        rulesName: "TrucoGameRules",
        players: [
          makePlayer({ userId: "you", name: "Você" }),
          makePlayer({
            userId: "bot-1",
            name: "Bot 1",
            isBot: true,
            status: PlayerStatus.WAITING,
          }),
        ],
        teams: [
          { id: "TEAM_A", userIds: ["you"], roundWins: 0, score: 0 },
          { id: "TEAM_B", userIds: ["bot-1"], roundWins: 0, score: 0 },
        ],
      } as IGameState,
      "you"
    );

    expect(views).toHaveLength(2);
    expect(views[1].participant.name).toBe("Bot 1");
    expect(views[1].isGuest).toBe(false);
    expect(views[1].team).toBe("rival");
  });
});
