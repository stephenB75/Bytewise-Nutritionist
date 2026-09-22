import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`[${formattedTime}] ${message}`);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Never serve the SPA shell for API or health probes
  app.use((req, res, next) => {
    const pathName = req.path || '';
    if (pathName.startsWith('/api') || pathName === '/health' || pathName === '/ready') {
      return res.status(404).json({
        error: 'Not found',
        path: pathName,
      });
    }
    next();
  });

  app.use((_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}