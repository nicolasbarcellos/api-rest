import 'dotenv/config'
import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import cors from '@fastify/cors'
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { healthRoutes } from './routes/health'

const app = Fastify({logger: true})

// zod as validator and serializer
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// swagger reading from zod transforms
await app.register(swagger, {
  openapi: {
    info: { title: 'API REST with Fastify', version: '1.0.0' },
  },
  transform: jsonSchemaTransform,
})

await app.register(swaggerUi, {routePrefix: '/docs'})

// Allow type inference globally in all routes of the app below this line
const zapp = app.withTypeProvider<ZodTypeProvider>()

const port = Number(process.env.PORT ?? 3000)

await app.register(healthRoutes)

await app.listen({port, host: '0.0.0.0'})

app.log.info(`Docs: http://localhost:${port}/docs`) 