import { hydrateRoot } from "react-dom/client";
import { Content } from "./Content";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

hydrateRoot(rootElement, <Content />);
