import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.resona.tefwriting',
  appName: 'TEF Ecriture',
  webDir: 'dist',
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
