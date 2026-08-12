import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import app from "../app.js";
import { db } from "../config/db.js";
import { users, shortLinks } from "../drizzle/schema.js";

const testEmail = `vitest-links-${Date.now()}@example.com`;
const testPassword = "password123";

let agent: ReturnType<typeof request.agent>;
let shortCode: string;
let linkId: number;

describe("Shortener API", () => {
    beforeAll(async () => {
        agent = request.agent(app);
        await agent.post("/api/auth/register").send({ email: testEmail, password: testPassword });
    });

    afterAll(async () => {
        const [user] = await db.select().from(users).where(eq(users.email, testEmail));
        if (user) {
            await db.delete(shortLinks).where(eq(shortLinks.userId, user.id));
            await db.delete(users).where(eq(users.id, user.id));
        }
    });

    it("rejects requests with no auth", async () => {
        const res = await request(app).get("/api/links");
        expect(res.status).toBe(401);
    });

    it("creates a short link", async () => {
        const res = await agent.post("/api/links").send({ url: "https://example.com" });

        expect(res.status).toBe(201);
        expect(res.body.shortCode).toBeTruthy();
        shortCode = res.body.shortCode;
    });

    it("rejects an invalid url", async () => {
        const res = await agent.post("/api/links").send({ url: "not-a-url" });
        expect(res.status).toBe(400);
    });

    it("rejects a missing url field entirely", async () => {
        const res = await agent.post("/api/links").send({});
        expect(res.status).toBe(400);
    });

    it("lists links for the current user and includes the new one", async () => {
        const res = await agent.get("/api/links");

        expect(res.status).toBe(200);
        const created = res.body.links.find((l: any) => l.shortCode === shortCode);
        expect(created).toBeDefined();
        linkId = created.id;
    });

    it("rejects a duplicate shortCode", async () => {
        const res = await agent
            .post("/api/links")
            .send({ url: "https://example.com", shortCode });

        expect(res.status).toBe(409);
    });

    it("redirects to the original url", async () => {
        const res = await request(app).get(`/${shortCode}`);
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe("https://example.com");
    });

    it("returns 404 for an unknown shortCode", async () => {
        const res = await request(app).get("/does-not-exist-xyz-123");
        expect(res.status).toBe(404);
    });

    it("updates a link's url", async () => {
        const res = await agent
            .patch(`/api/links/${linkId}`)
            .send({ url: "https://updated-example.com", shortCode });

        expect(res.status).toBe(200);

        const check = await agent.get("/api/links");
        const updated = check.body.links.find((l: any) => l.id === linkId);
        expect(updated.url).toBe("https://updated-example.com");
    });

    it("deletes a link", async () => {
        const res = await agent.delete(`/api/links/${linkId}`);
        expect(res.status).toBe(200);

        const check = await agent.get("/api/links");
        const deleted = check.body.links.find((l: any) => l.id === linkId);
        expect(deleted).toBeUndefined();
    });
});

describe("Cross-user link ownership", () => {
    const ownerEmail = `vitest-owner-${Date.now()}@example.com`;
    const intruderEmail = `vitest-intruder-${Date.now()}@example.com`;
    const password = "password123";

    let ownerAgent: ReturnType<typeof request.agent>;
    let intruderAgent: ReturnType<typeof request.agent>;
    let ownerLinkId: number;
    let ownerShortCode: string;

    beforeAll(async () => {
        ownerAgent = request.agent(app);
        intruderAgent = request.agent(app);

        await ownerAgent.post("/api/auth/register").send({ email: ownerEmail, password });
        await intruderAgent.post("/api/auth/register").send({ email: intruderEmail, password });

        const createRes = await ownerAgent.post("/api/links").send({ url: "https://owner-only.com" });
        ownerShortCode = createRes.body.shortCode;

        const listRes = await ownerAgent.get("/api/links");
        const created = listRes.body.links.find((l: any) => l.shortCode === ownerShortCode);
        ownerLinkId = created.id;
    });

    afterAll(async () => {
        for (const email of [ownerEmail, intruderEmail]) {
            const [user] = await db.select().from(users).where(eq(users.email, email));
            if (user) {
                await db.delete(shortLinks).where(eq(shortLinks.userId, user.id));
                await db.delete(users).where(eq(users.id, user.id));
            }
        }
    });

    it("blocks a different user from editing someone else's link", async () => {
        const res = await intruderAgent
            .patch(`/api/links/${ownerLinkId}`)
            .send({ url: "https://hijacked.com", shortCode: ownerShortCode });

        expect(res.status).toBe(404);
    });

    it("blocks a different user from deleting someone else's link", async () => {
        const res = await intruderAgent.delete(`/api/links/${ownerLinkId}`);
        expect(res.status).toBe(404);
    });

    it("confirms the owner's link was untouched by the blocked attempts", async () => {
        const res = await ownerAgent.get("/api/links");
        const link = res.body.links.find((l: any) => l.id === ownerLinkId);

        expect(link).toBeDefined();
        expect(link.url).toBe("https://owner-only.com");
    });

    it("does NOT show one user's links in another user's list", async () => {
        const res = await intruderAgent.get("/api/links");
        const leaked = res.body.links.find((l: any) => l.id === ownerLinkId);

        expect(leaked).toBeUndefined();
    });
});

describe("Pagination", () => {
    const pagerEmail = `vitest-pager-${Date.now()}@example.com`;
    const password = "password123";
    let pagerAgent: ReturnType<typeof request.agent>;

    beforeAll(async () => {
        pagerAgent = request.agent(app);
        await pagerAgent.post("/api/auth/register").send({ email: pagerEmail, password });

        // Create 12 links so a page size of 10 spans exactly 2 pages
        for (let i = 0; i < 12; i++) {
            await pagerAgent.post("/api/links").send({ url: `https://example.com/page-test-${i}` });
        }
    });

    afterAll(async () => {
        const [user] = await db.select().from(users).where(eq(users.email, pagerEmail));
        if (user) {
            await db.delete(shortLinks).where(eq(shortLinks.userId, user.id));
            await db.delete(users).where(eq(users.id, user.id));
        }
    });

    it("returns 10 links and correct totalPages on page 1", async () => {
        const res = await pagerAgent.get("/api/links?page=1");

        expect(res.status).toBe(200);
        expect(res.body.links.length).toBe(10);
        expect(res.body.currentPage).toBe(1);
        expect(res.body.totalPages).toBe(2);
    });

    it("returns the remaining 2 links on page 2", async () => {
        const res = await pagerAgent.get("/api/links?page=2");

        expect(res.status).toBe(200);
        expect(res.body.links.length).toBe(2);
        expect(res.body.currentPage).toBe(2);
    });

    it("defaults to page 1 when no page param is given", async () => {
        const res = await pagerAgent.get("/api/links");

        expect(res.status).toBe(200);
        expect(res.body.currentPage).toBe(1);
    });
});

describe("PATCH input validation (documents a known gap)", () => {
    const email = `vitest-patchval-${Date.now()}@example.com`;
    const password = "password123";
    let patchAgent: ReturnType<typeof request.agent>;
    let testLinkId: number;

    beforeAll(async () => {
        patchAgent = request.agent(app);
        await patchAgent.post("/api/auth/register").send({ email, password });

        const createRes = await patchAgent.post("/api/links").send({ url: "https://valid-start.com" });
        const listRes = await patchAgent.get("/api/links");
        const created = listRes.body.links.find((l: any) => l.shortCode === createRes.body.shortCode);
        testLinkId = created.id;
    });

    afterAll(async () => {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (user) {
            await db.delete(shortLinks).where(eq(shortLinks.userId, user.id));
            await db.delete(users).where(eq(users.id, user.id));
        }
    });

    it("should reject an invalid url on PATCH (currently does not)", async () => {
        const res = await patchAgent
            .patch(`/api/links/${testLinkId}`)
            .send({ url: "not-a-url", shortCode: "whatever123" });

        expect(res.status).toBe(400);
    });

    it("should reject a missing url on PATCH (currently does not)", async () => {
        const res = await patchAgent
            .patch(`/api/links/${testLinkId}`)
            .send({ shortCode: "whatever456" });

        expect(res.status).toBe(400);
    });
});