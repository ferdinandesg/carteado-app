import { getCardValue, getNextRank } from "./helpers";
import type { Card } from "./types";

describe("getCardValue", () => {
  it("retorna valor alto para manilha", () => {
    const manilha: Card = {
      suit: "diamonds",
      rank: "7",
      value: 7,
      secondaryValue: null,
      toString: "7 of diamonds",
    };
    expect(getCardValue(manilha, "7")).toBe(100); // suitValueMap diamonds = 0
  });

  it("ordena manilhas por naipe corretamente", () => {
    const ouros: Card = {
      suit: "diamonds",
      rank: "7",
      value: 7,
      secondaryValue: null,
      toString: "7 of diamonds",
    };
    const espadas: Card = {
      suit: "spades",
      rank: "7",
      value: 7,
      secondaryValue: null,
      toString: "7 of spades",
    };
    expect(getCardValue(ouros, "7")).toBe(100);
    expect(getCardValue(espadas, "7")).toBe(101);
  });

  it("retorna valor baseado em TRUCO_RANK_ORDER para não-manilha", () => {
    const tres: Card = {
      suit: "hearts",
      rank: "3",
      value: 3,
      secondaryValue: null,
      toString: "3 of hearts",
    };
    expect(getCardValue(tres, "4")).toBeGreaterThan(0);
  });
});

describe("getNextRank", () => {
  it("retorna próximo rank na ordem do truco", () => {
    expect(getNextRank("3")).toBe("4");
    expect(getNextRank("2")).toBe("3");
    expect(getNextRank("A")).toBe("2");
    expect(getNextRank("K")).toBe("A");
    expect(getNextRank("Q")).toBe("J");
  });

  it("retorna J como default para rank desconhecido", () => {
    expect(getNextRank("xyz")).toBe("J");
  });
});
