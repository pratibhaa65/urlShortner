import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import app from "../app.js";
import { db } from "../config/db.js";
import { users } from "../drizzle/schema.js";

const testEmail = `vitest-auth-${Date.now()}@gmail.com`;
const testPassword = "password123";

describe("Auth API", () => {
    afterAll(async () => {
        await db.delete(users).where(eq(users.email, testEmail));
    });

    it("registers a new user and sets an auth cookie", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: testEmail, password: testPassword });

        expect(res.status).toBe(201);
        expect(res.body.email).toBe(testEmail);
        expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("rejects a duplicate email registration", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: testEmail, password: testPassword });

        expect(res.status).toBe(409);
    });

    it("rejects an invalid email format", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: "not-an-email", password: testPassword });

        expect(res.status).toBe(400);
    });

    it("rejects a password below the minimum length", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ email: `vitest-short-${Date.now()}@example.com`, password: "123" });

        expect(res.status).toBe(400);
    });

    it("logs in with correct credentials", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: testEmail, password: testPassword });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testEmail);
    });

    it("rejects login with the wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: testEmail, password: "wrongpassword" });

        expect(res.status).toBe(401);
    });

    it("rejects login for an unknown email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "nobody-vitest@example.com", password: testPassword });

        expect(res.status).toBe(401);
    });

    it("rejects /me with no session", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });

    it("allows /me with a valid session", async () => {
        const agent = request.agent(app);
        await agent.post("/api/auth/login").send({ email: testEmail, password: testPassword });

        const res = await agent.get("/api/auth/me");
        expect(res.status).toBe(200);
        expect(res.body.email).toBe(testEmail);
    });

    it("clears the session on logout", async () => {
        const agent = request.agent(app);
        await agent.post("/api/auth/login").send({ email: testEmail, password: testPassword });

        const logoutRes = await agent.post("/api/auth/logout");
        expect(logoutRes.status).toBe(200);

        const meRes = await agent.get("/api/auth/me");
        expect(meRes.status).toBe(401);
    });
});