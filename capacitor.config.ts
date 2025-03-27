import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.frameworkpro.app',
  appName: 'Framework Pro',
  webDir: 'dist/public',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0072FF",
      showSpinner: true,
      spinnerColor: "#FFFFFF"
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#0072FF"
    },
    Camera: {
      // Android-specific camera options
      androidPermissions: [
        "android.permission.CAMERA"
      ],
      // iOS-specific camera permissions
      ios: {
        usageDescription: "Camera is used to capture images for your learning progress"
      }
    },
    Geolocation: {
      // Android-specific geolocation options
      androidPermissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      // iOS-specific geolocation permissions
      ios: {
        usageDescription: "Location data is used to enhance your learning experience"
      }
    }
  },
  server: {
    url: 'http://localhost:5000',
    cleartext: true
  }
};

export default config;
