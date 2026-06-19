import { ComponentType } from "react";
import { GameRuleNames } from "shared/game";

import CarteadoGame from "./carteado.game";
import TrucoGame from "./truco.game";

export const gameComponents: Record<GameRuleNames, ComponentType> = {
  CarteadoGameRules: CarteadoGame,
  TrucoGameRules: TrucoGame,
};
