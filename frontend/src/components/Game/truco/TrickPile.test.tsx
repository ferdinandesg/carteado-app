import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Card } from "shared/cards";

import { testIds } from "@/tests/testIds";

import TrickPile from "./TrickPile";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({
  rank,
  suit,
  value: 1,
  secondaryValue: null,
  toString: `${rank} of ${suit}`,
});

describe("TrickPile", () => {
  it("fans the won-trick cards on hover", async () => {
    const user = userEvent.setup();
    render(
      <TrickPile
        side="ours"
        tricksWon={1}
        testId={testIds.game.trickPileOurs}
        cards={[card("A", "spades"), card("3", "hearts")]}
      />
    );

    const pile = screen.getByTestId(testIds.game.trickPileOurs);
    expect(pile).toHaveAttribute("data-expanded", "false");

    await user.hover(pile);
    expect(pile).toHaveAttribute("data-expanded", "true");

    await user.unhover(pile);
    expect(pile).toHaveAttribute("data-expanded", "false");
  });
});
