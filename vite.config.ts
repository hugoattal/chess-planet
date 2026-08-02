import * as path from "node:path";

import ui from "@nuxt/ui/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

import { githubFallbackPlugin } from "@/githubFallback.plugin.ts";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ui({
            ui: {
                colors: {
                    neutral: "zinc",
                    primary: "indigo"
                }
            }
        }),
        githubFallbackPlugin()
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src")
        }
    }
});
