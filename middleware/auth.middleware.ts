import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthedRequest extends Request {
  user?: { id: number; email: string };
}

export const signToken = (payload: { id: number; email: string }) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};