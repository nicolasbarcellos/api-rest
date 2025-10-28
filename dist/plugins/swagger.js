import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, jsonSchemaTransformObject } from 'fastify-type-provider-zod';
export default fp(async (app) => {
    await app.register(swagger, {
        openapi: {
            info: { title: 'API REST with Fastify', version: '1.0.0' },
        },
        transform: jsonSchemaTransform,
        transformObject: jsonSchemaTransformObject
    });
    await app.register(swaggerUi, { routePrefix: '/docs' });
});
//# sourceMappingURL=swagger.js.map