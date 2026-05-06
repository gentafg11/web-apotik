import { defineConfig } from '@prisma/client';

export default defineConfig({
  datasource: {
    provider: 'mysql',
    url: process.env.DATABASE_URL || ''
  }
});