import { Content } from "./Content";

export function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>SSR Playground</title>
      </head>
      <body>
        <div id="root">
          <Content />
        </div>
      </body>
    </html>
  );
}
