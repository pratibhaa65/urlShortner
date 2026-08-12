import crypto from "crypto";
import { Response } from "express";
import { AuthedRequest } from "../middleware/auth.middleware.js";
import {
    shortenerSchema,
    shortenerSearchParamsSchema,
    shortenerUpdateSchema
} from "../validators/shortenerValidator.js";

import {
    deleteShortCodeById,
    findShortLinkById,
    getAllShortLinks,
    getShortLinkByShortCode,
    insertShortLink,
    updateShortCode,
} from "../service/shortener.service.js";

export const getShortLinks = async (req: AuthedRequest, res: Response) => {
    try {
        const searchParams = shortenerSearchParamsSchema.parse(req.query);
        const { shortLinks, totalCount } = await getAllShortLinks({
            userId: req.user!.id,
            limit: 10,
            offset: (searchParams.page - 1) * 10,
        });

        res.json({
            links: shortLinks,
            currentPage: searchParams.page,
            totalPages: Math.ceil(totalCount / 10),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const postURLShortener = async (req: AuthedRequest, res: Response) => {
    try {
        const { data, error } = shortenerSchema.safeParse(req.body);
        if (error) {
            res.status(400).json({ error: error.issues[0].message });
            return;
        }

        const { url, shortCode } = data;
        const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");

        const existing = await getShortLinkByShortCode(finalShortCode);
        if (existing) {
            res.status(409).json({ error: "That shortcode is already taken" });
            return;
        }

        await insertShortLink({ url, shortCode: finalShortCode, userId: req.user!.id });
        res.status(201).json({ shortCode: finalShortCode });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const redirectToShortLink = async (req: AuthedRequest, res: Response) => {
    try {
        const { shortCode } = req.params;

        if (typeof shortCode !== "string") {
            res.status(400).send("Invalid short code");
            return;
        }

        const link = await getShortLinkByShortCode(shortCode);
        if (!link) {
            res.status(404).send("Not found");
            return;
        }
        res.redirect(link.url);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal server error");
    }
};

export const patchShortLink = async (req: AuthedRequest, res: Response) => {
    try {
        const id = Number(req.params.id);

        const { data, error } = shortenerUpdateSchema.safeParse(req.body);
        if (error) {
            res.status(400).json({ error: error.issues[0].message });
            return;
        }
        const { url, shortCode } = data;

        const link = await findShortLinkById(id);
        if (!link || link.userId !== req.user!.id) {
            res.status(404).json({ error: "Not found" });
            return;
        }

        await updateShortCode({ id, url, shortCode });
        res.json({ success: true });
    } catch (err: any) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).json({ error: "Shortcode already exists" });
            return;
        }
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteShortCode = async (req: AuthedRequest, res: Response) => {
    try {
        const id = Number(req.params.id);
        const link = await findShortLinkById(id);
        if (!link || link.userId !== req.user!.id) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        await deleteShortCodeById(id);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
