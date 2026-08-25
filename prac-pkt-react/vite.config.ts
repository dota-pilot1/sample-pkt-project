import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Fullstack Tauri 앱의 Next.js가 4300을 사용하므로 웹 실습 앱은 별도 포트를 사용한다.
    port: 4301,
    proxy: { "/api": "http://localhost:4201" },
  },
});
