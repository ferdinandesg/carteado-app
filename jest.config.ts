import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  projects: ["<rootDir>/shared", "<rootDir>/backend", "<rootDir>/frontend"],
};

export default config;
