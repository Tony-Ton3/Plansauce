import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// const apiUrl = process.env.VITE_API_URL || "http://localhost:3000";
const apiUrl = "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: apiUrl,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
