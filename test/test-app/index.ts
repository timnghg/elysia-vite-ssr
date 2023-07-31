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