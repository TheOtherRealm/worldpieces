import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.otherrealm.worldpieces',
  appName: 'World Pieces',
  webDir: 'dist',
  server: {
    // For development with live reload, set this to your dev machine IP.
    // url: 'http://192.168.1.x:8100',
    // cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0d1b2a',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0d1b2a',
    },
  },
};

export default config;
