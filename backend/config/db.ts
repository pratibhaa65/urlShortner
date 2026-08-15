import "dotenv/config";
import mysql from "mysql2";
import { drizzle } from "drizzle-orm/mysql2";

const pool = mysql.createPool(process.env.DATABASE_URL!);

pool.query("SET time_zone = '+00:00'");

export const db = drizzle({
  client: pool,
});