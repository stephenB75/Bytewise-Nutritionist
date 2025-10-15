import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bytewise.nutritionist',
  appName: 'ByteWise Nutritionist',
  webDir: 'dist/public',
  backgroundColor: '#fef3c7',
  
  // iOS-specific configuration optimized for App Store with Swift Package Manager
  ios: {
    scheme: 'bytewise-nutritionist',
    path: 'ios',
    contentInset: 'automatic',
    scrollEnabled: true,
    allowsLinkPreview: false
  },
  
  // Android-specific configuration
  android: {
    path: 'android',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  

  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#fef3c7',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false
    },
    
    StatusBar: {
      style: 'light',
      backgroundColor: '#fef3c7',
      overlaysWebView: false
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
    },
    
  }
};

export default config;