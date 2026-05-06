import "dotenv/config";
  import { defineConfig, env } from "prisma/config";   // <-- correct import

  export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
      provider: "mysql",
      url: env("DATABASE_URL"),
    },
  });