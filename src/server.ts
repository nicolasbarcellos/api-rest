import "dotenv/config";
import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import corsPlugin from "./plugins/cors.js";
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { healthRoutes } from "./routes/health.js";
import { userRoutes } from "./routes/users.js";
import cookie from "@fastify/cookie";
import { mealsRoutesAuth } from "./routes/meals.js";
import { metricsRoutesAuth } from "./routes/metrics.js";

const app = Fastify({ logger: true });

// zod as validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// swagger reading from zod transforms
await app.register(swagger, {
  openapi: {
    info: { title: "API REST with Fastify", version: "1.0.0" },
  },
  transform: jsonSchemaTransform,
});

await app.register(corsPlugin);
await app.register(cookie);
await app.register(swaggerUi, { routePrefix: "/docs" });

// Allow type inference globally in all routes of the app below this line
const zapp = app.withTypeProvider<ZodTypeProvider>();

const port = Number(process.env.PORT ?? 3002);

await app.register(healthRoutes);

await app.register(userRoutes);

await app.register(mealsRoutesAuth);

await app.register(metricsRoutesAuth);

await app.listen({ port, host: "0.0.0.0" });

app.log.info(`Docs: http://localhost:${port}/docs`);
