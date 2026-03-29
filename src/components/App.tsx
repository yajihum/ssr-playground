import { Router } from "./Router";

export function App({ path }: { path: string }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>SSR Playground</title>
      </head>
      <body>
        <Router initialPath={path} />
      </body>
    </html>
  );
}
