import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Production-ready CORS configuration
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? [
      'https://www.bytewisenutritionist.com',
      'https://bytewisenutritionist.com'
    ]
  : ['http://localhost:3000', 'http://localhost:5173', '*'];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!isProduction || (origin && allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Security headers for production
  if (isProduction) {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy
  const cspPolicy = isProduction
    ? "default-src 'self'; " +
      "img-src 'self' https: data: blob:; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
      "connect-src 'self' https://api.stripe.com https://*.supabase.co wss://*.supabase.co https://www.bytewisenutritionist.com; " +
      "font-src 'self' https://fonts.gstatic.com data:; " +
      "frame-src 'self' https://js.stripe.com; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    : "default-src 'self'; " +
      "img-src 'self' https: data: blob:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "connect-src 'self' https: wss:; " +
      "font-src 'self' https: data:; " +
      "media-src 'self' https: data:; " +
      "object-src 'none'; " +
      "base-uri 'self';";
      
  res.header('Content-Security-Policy', cspPolicy);
  
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
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen(port, host, () => {
    const appUrl = isProduction 
      ? 'https://www.bytewisenutritionist.com'
      : `http://${host}:${port}`;
    
    log(`✅ Server successfully started`);
    log(`🌐 Host: ${host}`);
    log(`🔌 Port: ${port}`);
    log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`🔗 URL: ${appUrl}`);
    log(`💓 Health check: ${appUrl}/health`);
    log(`✅ Ready check: ${appUrl}/ready`);
    
    // Startup verification
    if (isProduction) {
      log(`🚀 Production deployment ready for Replit Autoscale`);
    } else {
      log(`🔧 Development server ready`);
    }
  });

  // Configure server timeout and keep-alive settings
  server.timeout = 0; // Disable server timeout
  server.keepAliveTimeout = 120000; // 2 minutes keep-alive
  server.headersTimeout = 120000; // 2 minutes headers timeout
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Graceful shutdown initiated...');
    server.close(() => {
      log('Server closed gracefully');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('🛑 Termination signal received...');
    server.close(() => {
      log('✅ Server terminated gracefully');
      process.exit(0);
    });
  });

})();
