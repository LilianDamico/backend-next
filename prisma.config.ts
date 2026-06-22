import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL deve estar definida no .env para migrations/runtime
// Para prisma generate, um placeholder vazio é aceito
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
