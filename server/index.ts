import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { registerRoutes } from "./routes";

// Simple logging function
function log(message: string) {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`[${formattedTime}] ${message}`);
}

const app = express();

// Apply JSON parsing to all routes except RevenueCat webhooks (which need raw body for signature verification)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/webhooks/revenuecat')) {
    // Skip JSON parsing for webhook routes - they use express.raw()
    next();
  } else {
    // Apply JSON parsing for all other routes
    express.json()(req, res, next);
  }
});

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
  
  // Content Security Policy - More permissive for production to eliminate eval blocking
  const cspPolicy = isProduction
    ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob: data: 'wasm-unsafe-eval' chrome-extension:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "font-src 'self' https: data:; " +
      "img-src 'self' https: data: blob:; " +
      "connect-src 'self' https: wss: data:; " +
      "media-src 'self' https: data: blob:; " +
      "worker-src 'self' blob:; " +
      "child-src 'self' blob:; " +
      "frame-src 'self' https:; " +
      "object-src 'none';"
    : "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob: data: 'wasm-unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "font-src 'self' https: data:; " +
      "img-src 'self' https: data: blob:; " +
      "connect-src 'self' https: wss: data:; " +
      "media-src 'self' https: data: blob:; " +
      "worker-src 'self' blob:; " +
      "child-src 'self' blob:; " +
      "frame-src 'self'; " +
      "object-src 'none';";
      
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
  if (process.env.NODE_ENV === "development") {
    // Dynamically import Vite setup only in development
    const { setupVite } = await import("./vite");
    
    // In development, serve static files from public directory before Vite
    const publicPath = path.resolve(import.meta.dirname, "../public");
    app.use(express.static(publicPath, {
      maxAge: '1d',
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (path.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json');
        } else if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      }
    }));
    await setupVite(app, server);
  } else {
    // Use production-only static serving (no Vite dependencies)
    const { serveStatic } = await import("./production");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || "0.0.0.0";
  
  // Add error handling for server startup
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      log(`❌ Port ${port} is already in use. Trying port ${port + 1}...`);
      server.listen(port + 1, host, () => {
        const appUrl = isProduction 
          ? 'https://www.bytewisenutritionist.com'
          : `http://${host}:${port + 1}`;
        
        log(`✅ Server successfully started on port ${port + 1}`);
        log(`🌐 Host: ${host}`);
        log(`🔌 Port: ${port + 1}`);
        log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        log(`🔗 URL: ${appUrl}`);
        log(`💓 Health check: ${appUrl}/health`);
        log(`✅ Ready check: ${appUrl}/ready`);
        
        if (isProduction) {
          log(`🚀 Production deployment ready for cloud hosting`);
        } else {
          log(`🔧 Development server ready`);
        }
      });
    } else {
      log(`❌ Server error: ${err.message}`);
      process.exit(1);
    }
  });
  
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
      log(`🚀 Production deployment ready for cloud hosting`);
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
