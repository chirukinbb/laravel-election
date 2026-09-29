import { jsx } from "react/jsx-runtime";
import createServer from "@inertiajs/react/server";
import { createInertiaApp } from "@inertiajs/react";
import ReactDOMServer from "react-dom/server";
async function resolvePageComponent(path, pages) {
  for (const p of Array.isArray(path) ? path : [path]) {
    const page = pages[p];
    if (typeof page === "undefined") {
      continue;
    }
    return typeof page === "function" ? page() : page;
  }
  throw new Error(`Page not found: ${path}`);
}
createServer(
  (page) => createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, /* @__PURE__ */ Object.assign({ "./Pages/ElectionPage.tsx": () => import("./assets/ElectionPage-CVAhaWvb.js").then((n) => n.E), "./Pages/HomePage.tsx": () => import("./assets/HomePage-Bv81nVzs.js"), "./Pages/TestPage.tsx": () => import("./assets/TestPage-D8U01PV7.js") })),
    setup: ({ App, props }) => /* @__PURE__ */ jsx(App, { ...props })
  })
);
