import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.jgarapps.mateluz",
  appName: "MateLUZ",
  webDir: "dist",
  android: {
    backgroundColor: "#0b1220",
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
