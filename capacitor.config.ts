import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bytewise.nutritionist',
  appName: 'bytewise nutritionist',
  webDir: 'dist',
  backgroundColor: '#fef7cd',
  
  // iOS-specific configuration
  ios: {
    scheme: 'bytewise-nutritionist',
    path: 'ios'
  },
  
  // Android-specific configuration
  android: {
    path: 'android',
    allowMixedContent: true,
    captureInput: true
  },
  
  // Server configuration for development
  server: {
    url: 'http://localhost:5000',
    cleartext: true
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#fef7cd',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#a8dadc',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    
    StatusBar: {
      style: 'light',
      backgroundColor: '#0a0a00',
      overlaysWebView: true
    },
    
    Keyboard: {
      resize: 'body' as any,
      style: 'dark' as any,
      resizeOnFullScreen: true
    },
    
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#a8dadc',
      sound: 'beep.wav'
    },
    
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    
    Haptics: {},
    
    Camera: {
      permissions: {
        camera: 'This app uses the camera to take photos of meals for nutrition tracking.',
        photos: 'This app accesses photos to select meal images for logging.'
      }
    },
    
    Filesystem: {
      permissions: {
        publicStorage: 'This app uses storage to save meal photos and export reports.'
      }
    }
  }
};

export default config;