import { resolveTableSeats } from "./tableLayout";
import { BasePlayer, PlayerStatus } from "shared/game";

const makePlayer = (userId: string): BasePlayer => ({
  userId,
  name: userId,
  status: PlayerStatus.PLAYING,
  hand: [],
  playedCards: [],
  table: [],
  teamId: "team-1",
});

describe("resolveTableSeats", () => {
  it("places the only opponent on slot 2 in 2-player games", () => {
    const opponents = [makePlayer("user-2")];

    expect(resolveTableSeats(2, opponents)).toEqual({
      slot2: opponents[0],
      slot4: null,
      slot6: null,
    });
  });

  it("fills slots 2 then 6 in 3-player games", () => {
    const opponents = [makePlayer("user-2"), makePlayer("user-3")];

    expect(resolveTableSeats(3, opponents)).toEqual({
      slot2: opponents[0],
      slot6: opponents[1],
      slot4: null,
    });
  });

  it("keeps clockwise order (4, 2, 6) in 4-player games so the partner faces me", () => {
    const opponents = [
      makePlayer("user-2"),
      makePlayer("user-3"),
      makePlayer("user-4"),
    ];

    expect(resolveTableSeats(4, opponents)).toEqual({
      slot4: opponents[0],
      slot2: opponents[1],
      slot6: opponents[2],
    });
  });

  it("returns empty seats when there are no opponents", () => {
    expect(resolveTableSeats(1, [])).toEqual({
      slot2: null,
      slot4: null,
      slot6: null,
    });
  });
});
