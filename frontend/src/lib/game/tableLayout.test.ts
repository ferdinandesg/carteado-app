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
  it("places the only opponent on top in 2-player games", () => {
    const opponents = [makePlayer("user-2")];

    expect(resolveTableSeats(2, opponents)).toEqual({
      top: opponents[0],
      left: null,
      right: null,
    });
  });

  it("maps opponents to left, top and right in 4-player games", () => {
    const opponents = [
      makePlayer("user-2"),
      makePlayer("user-3"),
      makePlayer("user-4"),
    ];

    expect(resolveTableSeats(4, opponents)).toEqual({
      left: opponents[0],
      top: opponents[1],
      right: opponents[2],
    });
  });

  it("returns empty seats when there are no opponents", () => {
    expect(resolveTableSeats(1, [])).toEqual({
      top: null,
      left: null,
      right: null,
    });
  });
});
