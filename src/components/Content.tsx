import { Suspense, useState, use } from "react";
import { ErrorBoundary } from "react-error-boundary";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </>
  );
}

function fetchMessage(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Hello, world!");
    }, 5000);
  });
}

const messagePromise = fetchMessage();

export function SlowMessage() {
  const message = use(messagePromise);
  return <p>{message}</p>;
}

export function Content() {
  return (
    <div>
      <Counter />

      <ErrorBoundary fallback={<p>SlowMessage failed to load</p>}>
        <Suspense fallback={<p>Loading...</p>}>
          <SlowMessage />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
