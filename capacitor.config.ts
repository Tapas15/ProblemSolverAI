import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.questionpro.ai',
  appName: 'QuestionPro AI',
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
    }
  },
  server: {
    url: 'http://localhost:5000',
    cleartext: true
  }
};

export default config;
