import { z } from 'zod';
import { formatUpTime } from '../utils/formatUpTime';
export async function healthRoutes(app) {
    const zapp = app.withTypeProvider();
    zapp.get('/health', {
        schema: {
            description: 'Health check endpoint',
            tags: ['Health'],
            response: {
                200: z.object({
                    status: z.literal('ok'),
                    timestamp: z.string(),
                    uptime: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: formatUpTime(process.uptime())
        };
    });
}
//# sourceMappingURL=health.js.map