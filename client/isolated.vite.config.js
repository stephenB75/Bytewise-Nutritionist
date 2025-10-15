import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
      "@shared": path.resolve(process.cwd(), "../shared"),
      "@assets": path.resolve(process.cwd(), "../attached_assets"),
    },
  },
  base: "./",
  css: {
    postcss: {
      plugins: [
        require('tailwindcss')({
          content: [
            './src/**/*.{js,jsx,ts,tsx}',
            './index.html',
          ],
          darkMode: ["class"],
          theme: {
            extend: {
              colors: {
                border: "hsl(214.3 31.8% 91.4%)",
                input: "hsl(214.3 31.8% 91.4%)",
                ring: "hsl(221.2 83.2% 53.3%)",
                background: "hsl(0 0% 100%)",
                foreground: "hsl(222.2 84% 4.9%)",
                primary: {
                  DEFAULT: "hsl(221.2 83.2% 53.3%)",
                  foreground: "hsl(210 40% 98%)",
                },
                secondary: {
                  DEFAULT: "hsl(210 40% 96%)",
                  foreground: "hsl(222.2 84% 4.9%)",
                },
                muted: {
                  DEFAULT: "hsl(210 40% 96%)",
                  foreground: "hsl(215.4 16.3% 46.9%)",
                },
              },
            },
          },
          plugins: [],
        }),
        require('autoprefixer'),
      ],
    },
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      input: "./index.html"
    }
  }
});
