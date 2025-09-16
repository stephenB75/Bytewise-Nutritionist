/**
 * Production Configuration for ByteWise Nutritionist
 * Fly.io deployment settings
 */

export const productionConfig = {
  // Server Configuration
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  
  // Application URL
  appUrl: process.env.APP_URL || 'https://www.bytewisenutritionist.com',
  
  // Database Configuration
  databaseUrl: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  
  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'https://ykgqcftrfvjblmqzbqvr.supabase.co',
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // USDA API Configuration
  usda: {
    apiKey: process.env.USDA_API_KEY,
  },
  
  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET,
    secure: true,
    sameSite: 'lax' as const,
    httpOnly: true,
  },
  
  // CORS Configuration
  cors: {
    origin: [
      'https://www.bytewisenutritionist.com',
      'https://bytewisenutritionist.com',
      'https://bytewise-nutritionist.railway.app',
      'https://bytewise-nutritionist.fly.dev',
    ],
    credentials: true,
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};