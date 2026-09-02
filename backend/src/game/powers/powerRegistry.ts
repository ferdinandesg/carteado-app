import { PowerId } from "shared/game";
import { GameError } from "@/errors/GameError";
import type { PowerStrategy } from "./PowerStrategy";
import { XRayPower } from "./strategies/XRayPower";
import { SilencerPower } from "./strategies/SilencerPower";
import { ChangeTrumpPower } from "./strategies/ChangeTrumpPower";
import { MagneticPullPower } from "./strategies/MagneticPullPower";
import { GravediggerPower } from "./strategies/GravediggerPower";

// Mesmo padrão do `gameRegistry` em GameFactory: mapa estático id → strategy.
const powerRegistry: Record<PowerId, PowerStrategy> = {
  [PowerId.X_RAY]: new XRayPower(),
  [PowerId.SILENCER]: new SilencerPower(),
  [PowerId.CHANGE_TRUMP]: new ChangeTrumpPower(),
  [PowerId.MAGNETIC_PULL]: new MagneticPullPower(),
  [PowerId.GRAVEDIGGER]: new GravediggerPower(),
};

export function getPowerStrategy(powerId: PowerId): PowerStrategy {
  const strategy = powerRegistry[powerId];
  if (!strategy) {
    throw new GameError({
      code: "VALIDATION",
      message: "Poder desconhecido.",
      meta: { powerId },
    });
  }
  return strategy;
}
