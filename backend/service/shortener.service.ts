import { count, desc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinks } from "../drizzle/schema.js";

type ShortLink = typeof shortLinks.$inferSelect;
type NewShortLink = typeof shortLinks.$inferInsert;

interface GetAllShortLinksParams {
  userId: number;
  limit?: number;
  offset?: number;
}

interface GetAllShortLinksResult {
  shortLinks: ShortLink[];
  totalCount: number;
}

interface InsertShortLinkParams {
  url: string;
  shortCode: string;
  userId: number;
}

interface UpdateShortCodeParams {
  id: number;
  url: string;
  shortCode: string;
}

// Queries 
export const getAllShortLinks = async ({
  userId,
  limit = 10,
  offset = 0,
}: GetAllShortLinksParams): Promise<GetAllShortLinksResult> => {
  const condition = eq(shortLinks.userId, userId);

  const results = await db
    .select()
    .from(shortLinks)
    .where(condition)
    .orderBy(desc(shortLinks.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(shortLinks)
    .where(condition);

  return { shortLinks: results, totalCount };
};

export const insertShortLink = async ({
  url,
  shortCode,
  userId,
}: InsertShortLinkParams): Promise<void> => {
  await db.insert(shortLinks).values({ url, shortCode, userId });
};

export const getShortLinkByShortCode = async (
  shortCode: string
): Promise<ShortLink | undefined> => {
  const [result] = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.shortCode, shortCode));

  return result;
};

export const findShortLinkById = async (
  id: number
): Promise<ShortLink | undefined> => {
  const [result] = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.id, id));

  return result;
};

export const updateShortCode = async ({
  id,
  url,
  shortCode,
}: UpdateShortCodeParams) => {
  return await db
    .update(shortLinks)
    .set({ url, shortCode })
    .where(eq(shortLinks.id, id));
};

export const deleteShortCodeById = async (id: number) => {
  return await db.delete(shortLinks).where(eq(shortLinks.id, id));
};