import { Prisma } from "@prisma/client";

/** JSON não serializa `Error.message` (não enumerável); expõe mensagem/meta do Prisma para debug. */
export function serializeRouteError(error: unknown): Record<string, unknown> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    };
  }
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      name: error.name,
      message: error.message,
    };
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return { name: error.name, message: error.message };
  }
  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }
  if (typeof error === "string") {
    return { message: error };
  }
  return { message: String(error) };
}
