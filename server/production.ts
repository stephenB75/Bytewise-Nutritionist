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
    console.error(
      `Could not find the build directory: ${distPath}. API routes still work; rebuild the client for the web UI.`
    );
    app.get('*', (_req, res) => {
      res
        .status(503)
        .type('text/html')
        .send(
          '<h1>Bytewise Nutritionist</h1><p>The app UI is rebuilding. API health: <a href="/api/health">/api/health</a></p>'
        );
    });
    return;
  }

  app.use(express.static(distPath, {
    setHeaders(res, filePath) {
      const name = path.basename(filePath);
      if (name === 'index.html' || name === 'sw.js') {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  }));

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
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}