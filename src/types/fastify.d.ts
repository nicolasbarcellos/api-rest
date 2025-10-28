import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}
