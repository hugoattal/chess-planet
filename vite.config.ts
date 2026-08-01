import * as path from "node:path";

import ui from "@nuxt/ui/vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    dev: {
        sourcemap: false
    },
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
        tailwindcss()
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src")
        }
    }
});
