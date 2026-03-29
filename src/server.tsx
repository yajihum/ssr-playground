import { App } from "./components/App";
import { renderToReadableStream } from "react-dom/server";

const build = await Bun.build({
  entrypoints: ["./src/client.tsx"],
  outdir: "./dist",
  splitting: true,
  naming: {
    entry: "[name]-[hash].[ext]",
    chunk: "[name]-[hash].[ext]",
  },
});

const entryFile = build.outputs.find((o) => o.kind === "entry-point");
if (!entryFile) {
  throw new Error("Entry file not found");
}
const entryFilePath = `/client-${entryFile.hash}.js`;

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
  async fetch(req) {
    const url = new URL(req.url);

    // dist/ 配下の JS ファイルを配信
    if (url.pathname.endsWith(".js")) {
      const file = Bun.file(`./dist${url.pathname}`);
      const isFileExists = await file.exists();
      if (isFileExists) {
        return new Response(file, {
          headers: {
            "Content-Type": "application/javascript",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    try {
      const stream = await renderToReadableStream(<App path={url.pathname} />, {
        bootstrapModules: [entryFilePath],
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
