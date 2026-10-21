// Motor de jogo isomórfico (backend hoje; sandbox do frontend na Fase 3).
// Importar só por `shared/engine`: caminhos relativos criam outra instância
// de módulo e quebram `instanceof TrucoGame` / `instanceof GameError`.
export * from "./game";
export * from "./IGameRules";
export * from "./TrucoGameRules";
export * from "./CarteadoGameRules";
export * from "./GameFactory";
export * from "./powers";
export * from "./bots/playTrucoBots";
