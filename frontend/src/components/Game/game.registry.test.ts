import { gameComponents } from "@/components/Game/game.registry";

describe("gameComponents registry", () => {
  it("maps every supported rule to a component", () => {
    expect(Object.keys(gameComponents).sort()).toEqual([
      "CarteadoGameRules",
      "TrucoGameRules",
    ]);
  });

  it("provides renderable components for each rule", () => {
    expect(typeof gameComponents.CarteadoGameRules).toBe("function");
    expect(typeof gameComponents.TrucoGameRules).toBe("function");
  });
});
