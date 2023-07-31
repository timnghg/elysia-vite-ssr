import Elysia from "elysia";
import {elysiaViteSsr} from "../../src/index.ts";

const app = new Elysia()
    .use(elysiaViteSsr({
        base: "/ssr",
        entryHtmlFile: "ui/index.html",
        entryClientFile: "ui/entry-client.tsx",
        entryServerFile: "ui/entry-server.tsx",
    }))
    .listen(3100);

console.log(
    `🦊 Elysia Vite SSR - Test App is running at ${app.server?.hostname}:${app.server?.port}`
);