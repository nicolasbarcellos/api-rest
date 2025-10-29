import { PrismaClient } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

const prisma = new PrismaClient();

export async function authValidate(req: FastifyRequest, res: FastifyReply) {
  // Aceita sessionId de múltiplas fontes (cookies, headers)
  const sessionId =
    req.cookies.sessionId ||
    req.headers['x-session-id'] as string ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.replace('Bearer ', '')
      : undefined);

  if (!sessionId) {
    return res.code(401).send({
      error: "Unauthorized",
      message: "You must be logged in to access this resource",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: sessionId,
    },
  });

  if (!user) {
    return res.code(401).send({
      error: "Unauthorized",
      message: "You must be logged in to access this resource",
    });
  }

  if (!user.emailVerified) {
    return res.code(403).send({
      error: "Forbidden",
      message: "You must active your account to access this resource",
    });
  }

  req.user = user;
}
