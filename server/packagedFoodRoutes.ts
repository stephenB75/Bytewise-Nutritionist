import type { Express, Request, Response, NextFunction } from "express";
import { barcodeCandidates, lookupBarcode, searchPackagedFoods } from "./services/packagedFoodService";

// Both lookups call third-party APIs with shared quotas, so each client is throttled.
function perClientLimit(maxPerMinute: number) {
  const hits = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
    if (recent.length >= maxPerMinute) {
      return res.status(429).json({ message: "Too many lookups. Please wait a moment and try again." });
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 10_000) hits.clear();
    next();
  };
}

export function registerPackagedFoodRoutes(app: Express) {
  app.get("/api/foods/barcode/:code", perClientLimit(40), async (req, res) => {
    const candidates = barcodeCandidates(req.params.code);
    if (!candidates) {
      return res.status(400).json({ message: "That doesn't look like a valid barcode. Check the numbers and try again." });
    }
    try {
      const product = await lookupBarcode(candidates);
      if (!product) {
        return res.status(404).json({ message: "We couldn't find this barcode yet. Try searching by name instead." });
      }
      res.json({ product });
    } catch (error) {
      console.error("Barcode lookup failed:", error);
      res.status(502).json({ message: "Barcode lookup is unavailable right now. Please try again." });
    }
  });

  app.get("/api/foods/packaged/search", perClientLimit(30), async (req, res) => {
    const query = String(req.query.q || "");
    if (query.trim().length < 2) return res.json({ results: [] });
    try {
      res.json({ results: await searchPackagedFoods(query) });
    } catch (error) {
      console.error("Packaged food search failed:", error);
      res.status(502).json({ message: "Packaged food search is unavailable right now. Please try again." });
    }
  });
}
