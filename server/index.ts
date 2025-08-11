import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { keepAliveMonitor } from "./keepAlive";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced headers for Chrome preview compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Additional security headers for Chrome compatibility
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy to allow external images
  res.header('Content-Security-Policy', 
    "default-src 'self'; " +
    "img-src 'self' https: data: blob:; " +
    "style-src 'self' 'unsafe-inline' https:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "connect-src 'self' https: wss:; " +
    "font-src 'self' https: data:; " +
    "media-src 'self' https: data:; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = "0.0.0.0";
  
  server.listen({
    port,
    host,
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    log(`🌐 External preview: https://${process.env.REPLIT_DEV_DOMAIN || 'localhost'}`);
    log(`🔧 Local dev: http://localhost:${port}`);
    log(`✅ Both external and development previews are accessible`);
    
    // Start keep-alive monitoring
    keepAliveMonitor.start();
    log(`🔄 Keep-alive monitoring started`);
  });

  // Configure server timeout and keep-alive settings
  server.timeout = 0; // Disable server timeout
  server.keepAliveTimeout = 120000; // 2 minutes keep-alive
  server.headersTimeout = 120000; // 2 minutes headers timeout
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('🛑 Graceful shutdown initiated...');
    keepAliveMonitor.stop();
    server.close(() => {
      log('✅ Server closed gracefully');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('🛑 Termination signal received...');
    keepAliveMonitor.stop();
    server.close(() => {
      log('✅ Server terminated gracefully');
      process.exit(0);
    });
  });
})();
