// Contrato dos payloads de `game_updated` entre backend e frontend.
// A fixture compartilhada (shared/testFixtures/gameStatePayloads.json) é
// consumida pelos testes de integração do frontend; este teste garante que
// ela continua idêntica ao que o backend realmente produz.
//
// Se a forma do estado mudar de propósito, regenere a fixture com:
//   UPDATE_GAME_FIXTURES=1 npx jest src/tests/gameStateContract.test.ts

import fs from "node:fs";
import path from "node:path";
import { buildContractStates } from "./helpers/buildContractStates";

const FIXTURE_PATH = path.resolve(
  __dirname,
  "../../../shared/testFixtures/gameStatePayloads.json"
);

describe("Contrato de payloads game_updated (backend <-> frontend)", () => {
  it("a fixture compartilhada está em sincronia com a serialização real do backend", () => {
    const states = buildContractStates();

    if (process.env.UPDATE_GAME_FIXTURES) {
      fs.mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
      fs.writeFileSync(FIXTURE_PATH, JSON.stringify(states, null, 2) + "\n");
    }

    expect(fs.existsSync(FIXTURE_PATH)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf-8"));
    expect(saved).toEqual(states);
  });
});
