import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getShortLinks,
  postURLShortener,
  patchShortLink,
  deleteShortCode,
} from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", requireAuth, getShortLinks);
router.post("/", requireAuth, postURLShortener);
router.patch("/:id", requireAuth, patchShortLink);
router.delete("/:id", requireAuth, deleteShortCode);

export default router;