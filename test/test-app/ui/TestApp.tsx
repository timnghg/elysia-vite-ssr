export function TestApp() {
    return (
        <div>
            <h1>I ❤ Bun ❤ Elysia ❤ Vite ❤ React</h1>
            <h2>Render by {import.meta.env.SSR ? "SSR" : "Client"} </h2>
        </div>
    );
}
