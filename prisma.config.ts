import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load Next.js-style env files (.env.local takes precedence over .env).
config({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
