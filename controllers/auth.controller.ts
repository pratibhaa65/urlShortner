import { Response } from "express";
import { z } from "zod";
import { createUser, findUserByEmail, verifyPassword } from "../service/auth.service.js";
import { signToken, AuthedRequest } from "../middleware/auth.middleware.js";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const register = async (req: AuthedRequest, res: Response) => {
  const { data, error } = credentialsSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ error: error.issues[0].message });
    return;
  }

  const existing = await findUserByEmail(data.email);
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const user = await createUser(data.email, data.password);
  const token = signToken({ id: user.id, email: data.email });

  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.status(201).json({ id: user.id, email: data.email });
};

export const login = async (req: AuthedRequest, res: Response) => {
  const { data, error } = credentialsSchema.safeParse(req.body);
  if (error) {
    res.status(400).json({ error: error.issues[0].message });
    return;
  }

  const user = await findUserByEmail(data.email);
  if (!user || !(await verifyPassword(data.password, user.password))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ id: user.id, email: user.email });
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  res.json({ id: user.id, email: user.email });
};

export const logout = async (_req: AuthedRequest, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true });
};

export const me = async (req: AuthedRequest, res: Response) => {
  res.json(req.user);
};