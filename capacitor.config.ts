import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bytewise.nutritionist',
  appName: 'ByteWise Nutritionist',
  webDir: 'dist/public',
  backgroundColor: '#fef7cd',
  
  // iOS-specific configuration
  ios: {
    scheme: 'ByteWise Nutritionist',
    path: 'ios'
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
      backgroundColor: '#a8dadc'
    },
    
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#a8dadc',
      sound: 'beep.wav'
    },
    
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;