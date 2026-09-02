import { fireEvent, render, screen } from "@testing-library/react";
import { Card } from "shared/cards";

import CardFan from "./CardFan";

const card = (rank: Card["rank"], suit: Card["suit"]): Card => ({
  rank,
  suit,
  value: 1,
  secondaryValue: null,
  toString: `${rank} of ${suit}`,
});

describe("CardFan", () => {
  const cards = [card("A", "spades"), card("7", "hearts"), card("A", "spades")];

  it("renders every card with a stable, unique key (duplicates allowed)", () => {
    render(
      <CardFan
        cards={cards}
        testId="fan"
      />
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(screen.getByTestId("fan")).toHaveStyle({ "--n": "3" });
    expect(items[2]).toHaveStyle({ "--i": "2" });
  });

  it("calls onClick with the card on a pointer click", () => {
    const onClick = jest.fn();
    render(
      <CardFan
        cards={cards}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getAllByRole("listitem")[1]);
    expect(onClick).toHaveBeenCalledWith(cards[1]);
  });

  it("ignores clicks while disabled", () => {
    const onClick = jest.fn();
    render(
      <CardFan
        cards={cards}
        onClick={onClick}
        disabled
      />
    );

    fireEvent.click(screen.getAllByRole("listitem")[0]);
    expect(onClick).not.toHaveBeenCalled();
  });
});
