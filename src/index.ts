import {Elysia} from "elysia"
import * as path from "path"
import {elysiaConnectDecorate} from "elysia-connect"
import {elysiaViteConfig, ViteConfig} from "elysia-vite"
import {createServer as createViteServer, UserConfig} from "vite";
import {html} from "@elysiajs/html";
import omit from "lodash.omit";

export const elysiaViteSsr = (
    options?: ViteConfig & { entryServerFile?: string, onViteServerReady?(): Promise<void> | void }
) => {
    const {entryServerFile = "entry-server.tsx", onViteServerReady, ...otherOptions} = options || {};
    return async (app: Elysia) => {
        const prefix = options?.base || "";
        const viteServerConfig = {
            server: {middlewareMode: true},
            appType: "custom",
            ...otherOptions,
            build: {
                ssrEmitAssets: true,
                ssr: true,
                // improve build performance
                minify: false,
                modulePreload: {polyfill: false},
                reportCompressedSize: false,
                ...otherOptions?.build,
            },
        } as UserConfig;
        const viteServer = await createViteServer(viteServerConfig);

        if (options?.onViteServerReady) {
            await options?.onViteServerReady();
        }

        return app
            .use(html())
            .use(elysiaViteConfig(options))
            .use(elysiaConnectDecorate())
            .group(prefix, (app) => {
                return app
                    .onBeforeHandle(async (context) => {
                        const handled = await context.elysiaConnect(
                            viteServer.middlewares,
                            context,
                        );

                        if (handled) {
                            return handled;
                        }
                    })
                    .get("*", async (context) => {
                        const url = context.request.url;
                        const entryHtmlPath =
                            options?.entryHtmlFile ||
                            path.resolve(
                                options?.appRootPath || import.meta.dir,
                                path.join(options?.root || "index.html")
                            );
                        const indexHtmlFile = Bun.file(entryHtmlPath);
                        if (!(await indexHtmlFile.exists())) {
                            throw new Error(`index.html not found at ${entryHtmlPath}`);
                        }
                        let template = await indexHtmlFile.text();
                        try {
                            // 2. Apply Vite HTML transforms. This injects the Vite HMR client,
                            //    and also applies HTML transforms from Vite plugins, e.g. global
                            //    preambles from @vitejs/plugin-react
                            template = await viteServer.transformIndexHtml(url, template);

                            // 3. Load the server entry. ssrLoadModule automatically transforms
                            //    ESM source code to be usable in Node.js! There is no bundling
                            //    required, and provides efficient invalidation similar to HMR.
                            const {render} = await viteServer.ssrLoadModule(
                                entryServerFile
                            );

                            // 4. render the app HTML. This assumes entry-server.js's exported
                            //     `render` function calls appropriate framework SSR APIs,
                            //    e.g. ReactDOMServer.renderToString()
                            const appHtml = await render(url);

                            // 5. Inject the app-rendered HTML into the template.
                            const html = template.replace(`<!--ssr-outlet-->`, appHtml);

                            // 6. Send the rendered HTML back.
                            return context.html(html);
                        } catch (e) {
                            // If an error is caught, let Vite fix the stack trace so it maps back
                            // to your actual source code.
                            viteServer.ssrFixStacktrace(e as Error);

                            // @todo: how to handle error?
                            throw e;
                        }
                    });
            });
    };
};