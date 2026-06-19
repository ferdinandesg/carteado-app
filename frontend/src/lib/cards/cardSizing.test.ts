import { getCardWidth, resolveCardHeight, type CardSize } from "./cardSizing";

describe("cardSizing", () => {
  it("keeps poker card proportion", () => {
    expect(getCardWidth(140)).toBe(100);
    expect(getCardWidth(182)).toBe(130);
  });

  it("prefers explicit height over size preset", () => {
    expect(resolveCardHeight("sm", 150)).toBe(150);
    expect(resolveCardHeight("lg")).toBe(154);
  });
});
