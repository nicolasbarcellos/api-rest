import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (app) => {
  await app.register(cors, {
    origin: (origin, callback) => {
      // Lista de origens permitidas
      const allowedOrigins = [
        "http://localhost:5173", // Vite dev
        "http://localhost:3000", // React dev
        process.env.FRONTEND_URL, // URL configurada (Lovable, Vercel, etc)
      ].filter(Boolean); // Remove undefined

      // Em desenvolvimento, aceita qualquer origem
      if (!origin || process.env.NODE_ENV === "development") {
        callback(null, true);
        return;
      }

      // Verifica se a origem está na lista ou é da Lovable
      if (
        allowedOrigins.includes(origin) ||
        origin.includes("lovable.app") ||
        origin.includes("lovable.dev")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true, // Permite cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  });
});
