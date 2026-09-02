import { render, screen } from "@testing-library/react";
import { Card } from "shared/cards";

import { SeatAnchorProvider } from "@/hooks/game/useSeatAnchors";
import { testIds } from "@/tests/testIds";

import TrucoTablePresenter from "./TrucoTablePresenter";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({
  rank,
  suit,
  value: 1,
  secondaryValue: null,
  toString: `${rank} of ${suit}`,
});

describe("TrucoTablePresenter", () => {
  it("plays the illusionist flip when a disguised card is revealed", () => {
    const real = card("4", "hearts");
    const zap = {
      ...card("Q", "clubs"),
      illusionReal: {
        rank: real.rank,
        suit: real.suit,
        toString: real.toString,
      },
    };

    render(
      <SeatAnchorProvider>
        <TrucoTablePresenter
          bunch={[
            {
              card: real,
              key: "4hearts",
              playerId: "p1",
              revealFrom: zap,
            },
          ]}
          departing={null}
          myUserId="p1"
        />
      </SeatAnchorProvider>
    );

    expect(screen.getByTestId(testIds.game.illusionReveal)).toBeInTheDocument();
  });
});
