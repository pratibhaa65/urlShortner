import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { users } from "../drizzle/schema.js";

export const createUser = async (email: string, password: string) => {
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.insert(users).values({ email, password: hashed }).$returningId();
  return result;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const verifyPassword = async (plain: string, hashed: string) => {
  return bcrypt.compare(plain, hashed);
};