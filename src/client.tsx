import { hydrateRoot } from "react-dom/client";
import { App } from "./components/App";

hydrateRoot(document, <App path={window.location.pathname} />);
