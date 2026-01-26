import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    // Server
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z.string().default("3004"),

    // DATABASE MONGODB
    MONGODB: z.string(),
    DB_NAME: z.string(),

    // URLS
    BASE_URL: z.string(),
    FRONTEND_URL: z.string(),

    // JWT
    JWT_SECRET: z.string(),
});

const env = envSchema.safeParse(process.env!);

if (!env.success) {
    console.error("❌ Invalid environment variables:", env.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}

const config = {
    // Server
    nodeEnv: env.data.NODE_ENV,
    port: env.data.PORT,

    // DATABASE MONGODB
    mongodb: env.data.MONGODB,
    dbName: env.data.DB_NAME,

    // URLS
    baseUrl: env.data.BASE_URL,
    frontendUrl: env.data.FRONTEND_URL,

    // JWT
    jwtSecret: env.data.JWT_SECRET,
} as const;

export default config;
