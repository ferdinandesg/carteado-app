import { BasePlayer, PlayerStatus } from "shared/game";
import { Participant } from "shared/types";

import { getParticipantBadgeStatus } from "./participantDisplayStatus";

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
