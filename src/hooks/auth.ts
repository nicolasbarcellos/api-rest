import type { FastifyReply, FastifyRequest } from "fastify";

export async function validateApiKey(req: FastifyRequest, res: FastifyReply) {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.code(401).send({
      error: "Unauthorized",
      message: 'Invalid API Key'
    })
  }
}