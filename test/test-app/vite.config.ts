import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    root: "ui",
    plugins: [react()],
    build: {
        ssr: true,
    },
});
