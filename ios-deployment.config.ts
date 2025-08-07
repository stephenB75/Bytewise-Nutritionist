import type { CapacitorConfig } from '@capacitor/cli';

// Production iOS Deployment Configuration
const config: CapacitorConfig = {
  appId: 'com.bytewise.nutritionist',
  appName: 'ByteWise Nutritionist',
  webDir: 'dist',
  backgroundColor: '#0a0a00',
  
  // iOS-specific configuration optimized for App Store
  ios: {
    scheme: 'bytewise-nutritionist',
    path: 'ios',
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false,
    handleApplicationURL: true
  },
  
  // Android configuration (kept for future)
  android: {
    path: 'android',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false // Disabled for production
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a0a00',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false, // Cleaner launch experience
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false // Better native experience
    },
    
    StatusBar: {
      style: 'light',
      backgroundColor: '#0a0a00',
      overlaysWebView: false // Better iOS experience
    },
    
    Keyboard: {
      resize: 'ionic' as any,
      style: 'dark' as any,
      resizeOnFullScreen: true
    },
    
    LocalNotifications: {
      smallIcon: 'ic_stat_nutrition',
      iconColor: '#faed39',
      sound: 'notification.wav'
    },
    
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    
    Haptics: {},
    
    Camera: {
      permissions: {
        camera: 'ByteWise uses the camera to photograph meals for accurate nutrition tracking and food recognition.',
        photos: 'ByteWise accesses your photo library to select meal images for nutrition logging and analysis.'
      }
    },
    
    Filesystem: {
      permissions: {
        publicStorage: 'ByteWise uses device storage to save meal photos, export nutrition reports, and cache data for offline use.'
      }
    }
  }
};

export default config;