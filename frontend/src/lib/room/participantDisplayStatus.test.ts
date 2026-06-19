import { PlayerStatus } from "shared/game";
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

describe("getParticipantBadgeStatus", () => {
  it("returns away when participant is offline", () => {
    expect(
      getParticipantBadgeStatus(makeParticipant({ isOnline: false }))
    ).toBe("away");
  });

  it("returns ready when participant is ready", () => {
    expect(
      getParticipantBadgeStatus(makeParticipant({ status: PlayerStatus.READY }))
    ).toBe("ready");
  });

  it("returns playing when participant is in game", () => {
    expect(
      getParticipantBadgeStatus(
        makeParticipant({ status: PlayerStatus.PLAYING })
      )
    ).toBe("playing");
  });

  it("returns waiting for not ready participants", () => {
    expect(getParticipantBadgeStatus(makeParticipant())).toBe("waiting");
  });
});
