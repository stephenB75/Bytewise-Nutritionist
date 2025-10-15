# 📁 ByteWise Project Structure

## 🏗️ **Core Application**
```
📦 ByteWise-Nutrition-Tracker/
├── 📱 client/                     # React Frontend Application
│   ├── src/                       # Source code (components, pages, hooks)
│   ├── public/                    # Static assets
│   └── index.html                 # Main HTML entry point
├── 🖥️ server/                     # Express.js Backend
│   ├── routes.ts                  # API endpoints
│   ├── storage.ts                 # Database operations
│   ├── supabaseAuth.ts           # Authentication middleware
│   └── services/                  # External service integrations
├── 🔗 shared/                     # Shared TypeScript types
│   └── schema.ts                  # Database schema & types
└── 📊 supabase/                   # Database migrations & config
```

## 📱 **Mobile Development**
```
📱 Native Platforms/
├── 🍎 ios/                        # iOS Xcode Project
│   └── App/                       # Capacitor iOS wrapper
├── 🤖 android/                    # Android Studio Project
│   └── app/                       # Capacitor Android wrapper
├── ⚙️ capacitor.config.ts         # Cross-platform mobile config
└── 🔨 mobile-build.sh             # Mobile build automation
```

## 🌐 **Web Deployment**
```
🌐 Web Build/
├── 📦 dist/                       # Production build output
│   ├── public/                    # PWA files for web deployment
│   ├── index.html                 # Built app entry point
│   ├── manifest.json              # PWA configuration
│   └── sw.js                      # Service worker for offline
├── 🎨 assets/                     # Food images & media files
└── 📄 public/                     # Static files (icons, manifest)
```

## 📚 **Documentation**
```
📚 Documentation/
├── 📖 README.md                   # Main project documentation
├── 📱 MOBILE_DEPLOYMENT_GUIDE.md  # Mobile app deployment guide
├── 📝 replit.md                   # Project architecture & preferences
├── 📂 docs/                       # Additional documentation
│   └── deployment/                # Deployment guides & scripts
└── 🏛️ archive/                    # Legacy files & old builds
```

## 🔧 **Configuration**
```
⚙️ Configuration/
├── 📋 package.json                # Dependencies & scripts
├── 🎯 tsconfig.json               # TypeScript configuration
├── 🎨 tailwind.config.ts          # Styling configuration
├── ⚡ vite.config.ts              # Build tool configuration
├── 🗃️ drizzle.config.ts           # Database ORM configuration
└── 🔐 .env                        # Environment variables
```

## 🎯 **Key Features by Folder**

### **client/** - Frontend Features
- 🍽️ Meal tracking with real-time calorie calculation
- 📊 Progress visualization with interactive charts
- 👤 User authentication and profile management
- 📱 Mobile-first responsive design
- 🎨 shadcn/ui component library

### **server/** - Backend Services  
- 🔐 Supabase JWT authentication
- 🥗 USDA Food Database integration
- 💾 PostgreSQL data persistence
- 📡 Real-time API endpoints
- 🔄 Cross-platform sync

### **Mobile Platforms** - Native Apps
- 📷 Camera integration for meal photos
- 📳 Push notifications for meal reminders
- 💾 Offline data storage and sync
- 🎯 Native performance optimization
- 🏪 App Store ready builds

## 🚀 **Quick Commands**

```bash
# Development
npm run dev                        # Start development server
npm run build                      # Build for production

# Mobile Development  
./mobile-build.sh                  # Build & sync mobile
npx cap run ios --livereload       # iOS development
npx cap run android --livereload   # Android development

# Deployment
npx cap open ios                   # Open Xcode for iOS
npx cap open android               # Open Android Studio
```

## 📈 **Architecture Highlights**

✅ **Single Codebase** - React frontend works on web, iOS, and Android
✅ **Serverless Backend** - Supabase handles scaling and infrastructure  
✅ **Real-time Sync** - Data updates instantly across all devices
✅ **Offline First** - Full functionality without internet connection
✅ **PWA Ready** - Installable web app with service worker caching
✅ **Type Safe** - End-to-end TypeScript for reliability

This structure supports the full development lifecycle from coding to app store deployment.