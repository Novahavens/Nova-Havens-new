import { Router, type IRouter } from "express";
import { Client } from "@replit/object-storage";

/**
 * Serves the Meet the Team data synced daily by
 * artifacts/nova-havens/scripts/sync-team.js into Object Storage:
 *
 *   GET /api/team/team.json       — the synced member list (fallback: the
 *                                   frontend uses its hardcoded list)
 *   GET /api/team/images/:file    — a synced profile photo (object key
 *                                   team/<file>)
 *
 * Both are read-only and public. Responses are cached briefly so a daily
 * sync shows up within minutes without hammering the bucket.
 */

const TEAM_JSON_KEY = "team/team.json";
const TEAM_PREFIX = "team/";
const CACHE_CONTROL = "public, max-age=300";

// Mirrors the browser-safe whitelist in scripts/sync-team.js — the sync only
// uploads these formats, so nothing else should ever be requested.
const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const storage = new Client();

const router: IRouter = Router();

router.get("/team/team.json", async (_req, res) => {
  const result = await storage.downloadAsText(TEAM_JSON_KEY);
  if (!result.ok) {
    res.status(404).json({ error: "team data not synced yet" });
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", CACHE_CONTROL);
  res.send(result.value);
});

router.get("/team/images/:file", async (req, res) => {
  const file = req.params.file;
  // Single flat segment only — no traversal out of the team/ prefix.
  if (!file || file.includes("/") || file.includes("..")) {
    res.status(400).json({ error: "invalid file" });
    return;
  }
  const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
  const mime = EXT_MIME[ext];
  if (!mime) {
    res.status(400).json({ error: "unsupported file type" });
    return;
  }

  const result = await storage.downloadAsBytes(`${TEAM_PREFIX}${file}`);
  if (!result.ok) {
    res.status(404).json({ error: "photo not found" });
    return;
  }
  res.setHeader("Content-Type", mime);
  res.setHeader("Cache-Control", CACHE_CONTROL);
  res.send(result.value[0]);
});

export default router;
