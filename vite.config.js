import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Expose to local network
    port: 5173, // Change if needed
    https: {
      key: "key.pem",
      cert: "cert.pem",
    },
  },
});
