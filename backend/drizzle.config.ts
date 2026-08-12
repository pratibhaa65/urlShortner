import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/migration',   // when we create migrate file, we get it in the drizzle folder
  schema: './drizzle/schema.ts',  // source of schema
  dialect: 'mysql',     // database dialect
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
