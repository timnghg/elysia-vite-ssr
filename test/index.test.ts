import {describe, expect, it} from "bun:test";
import {Elysia} from "elysia";
import {elysiaViteSsr} from "../src";
import * as path from "path";

describe("elysia-vite-ssr", () => {
    it("should work", async () => {
        const testAppDir = path.join(import.meta.dir, "test-app");
        let app = new Elysia<any>();

        // set cwd to test app dir
        process.chdir(testAppDir);

        // @todo: better way to wait for vite server ready?
        await new Promise((resolve) => {
            app = app
                .use(elysiaViteSsr({
                    base: "/ssr",
                    root: testAppDir,
                    entryHtmlFile: "ui/index.html",
                    entryClientFile: "ui/entry-client.tsx",
                    entryServerFile: "ui/entry-server.tsx",
                    async onViteServerReady() {
                        setTimeout(() => {
                            resolve("ready");
                        }, 0)
                    }
                }))
                .get('/', () => 'Hello World');
        })

        const text = await app.handle(new Request(`http://localhost/ssr/`)).then(r => r.text());

        // ssr outlet should be replaced
        expect(text.indexOf("<!--ssr-outlet-->")).toBe(-1);

        expect(text.indexOf("I ❤ Bun ❤ Elysia ❤ Vite ❤ React")).toBeGreaterThan(0);
    })
})