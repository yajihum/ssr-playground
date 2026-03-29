import { App } from "./components/App";
import { renderToReadableStream } from "react-dom/server";

const clientBuild = await Bun.build({
  entrypoints: ["./src/client.tsx"],
  outdir: "./dist",
  naming: "main.js",
});
const clientFile = await clientBuild.outputs[0]?.text();

async function logStream(stream: ReadableStream, decoder: TextDecoder) {
  const reader = stream.getReader();
  let i = 0;
  while (true) {
    const { done, value } = await reader.read(); // チャンクが届くまで待って読み出す
    if (done) break;
    console.log(`chunk ${i++}:`, decoder.decode(value));
  }
}

const server = Bun.serve({
  routes: {
    "/main.js": () =>
      new Response(clientFile, {
        headers: { "Content-Type": "application/javascript" },
      }),
  },
  async fetch(req) {
    const url = new URL(req.url);

    try {
      const stream = await renderToReadableStream(<App path={url.pathname} />, {
        bootstrapScripts: ["/main.js"],
        onError(error) {
          console.error("SSR streaming error:", error);
        },
      });

      const [stream1, stream2] = stream.tee();
      const decoder = new TextDecoder();
      logStream(stream2, decoder);

      return new Response(stream1, {
        headers: { "Content-Type": "text/html" },
      });
    } catch (error: unknown) {
      return new Response(`<h1>Something went wrong</h1>`, {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }
  },
});

console.log(`Listening on ${server.url}`);
