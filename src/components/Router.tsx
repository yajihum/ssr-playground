import { useState, useEffect, startTransition, lazy, Suspense } from "react";

function shouldNotIntercept(navigationEvent: NavigateEvent): boolean {
  return (
    !navigationEvent.canIntercept ||
    navigationEvent.hashChange ||
    navigationEvent.downloadRequest !== null ||
    navigationEvent.formData !== null
  );
}

type Route = {
  path: string;
  component: React.ComponentType;
};

export const routes: Route[] = [
  { path: "/", component: lazy(() => import("./Home")) },
  { path: "/about", component: lazy(() => import("./About")) },
] as const;

export function Router({ initialPath }: { initialPath: string }) {
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    const handler = (event: NavigateEvent) => {
      if (shouldNotIntercept(event)) return;

      const url = new URL(event.destination.url);

      const matched = routes.find((r) => r.path === url.pathname);
      if (!matched) return;

      event.intercept({
        handler: () => {
          setPath(url.pathname);
        },
      });
    };

    window.navigation.addEventListener("navigate", handler);
    return () => window.navigation.removeEventListener("navigate", handler);
  }, []);

  const matched = routes.find((r) => r.path === path);
  if (!matched) return null;

  const Component = matched.component;
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Component />
    </Suspense>
  );
}
