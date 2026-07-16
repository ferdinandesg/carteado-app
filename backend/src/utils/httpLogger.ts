import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";
import type { Options } from "pino-http";
import { logger } from "@/utils/logger";
import { userLogBindings } from "@/utils/logContext";
import type { AuthenticatedUser } from "shared/types";

type LoggedRequest = IncomingMessage & {
  id?: string;
  user?: AuthenticatedUser;
};

function requestPath(req: IncomingMessage): string {
  return req.url ?? "";
}

export const httpLoggerOptions: Options = {
  logger,
  genReqId(req, res) {
    const header = req.headers["x-request-id"];
    const id =
      typeof header === "string" && header.length > 0 ? header : randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customProps(req) {
    const logged = req as LoggedRequest;
    return {
      requestId: logged.id,
      ...(logged.user ? userLogBindings(logged.user) : {}),
    };
  },
  customSuccessMessage(req, res) {
    return `HTTP ${req.method} ${requestPath(req)} ${res.statusCode}`;
  },
  customErrorMessage(req, res) {
    return `HTTP ${req.method} ${requestPath(req)} ${res.statusCode}`;
  },
  customLogLevel(_req, res, err) {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[Redacted]",
  },
};
