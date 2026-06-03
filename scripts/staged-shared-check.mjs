import { execSync } from "node:child_process";

execSync("npm run ts-check -w shared", { stdio: "inherit" });
