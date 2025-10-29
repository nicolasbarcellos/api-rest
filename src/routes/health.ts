import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { formatUpTime } from "../utils/formatUpTime.js";

export async function healthRoutes(app: FastifyInstance) {
  const zapp = app.withTypeProvider<ZodTypeProvider>();

  zapp.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        tags: ["Health"],
        response: {
          200: z.object({
            status: z.literal("ok"),
            timestamp: z.string(),
            uptime: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      return {
        status: "ok" as const,
        timestamp: new Date().toISOString(),
        uptime: formatUpTime(process.uptime()),
      };
    }
  );
}
