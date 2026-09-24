import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Head } from "@inertiajs/react";
function TestPage({ message }) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Head, { children: [
      /* @__PURE__ */ jsx("title", { children: "Test Inertia SSR — Tree of Unity" }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "Testing Inertia SSR setup" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { padding: "40px", fontFamily: "sans-serif" }, children: [
      /* @__PURE__ */ jsx("h1", { children: "Inertia + React + SSR Работает!" }),
      /* @__PURE__ */ jsx("p", { children: message })
    ] })
  ] });
}
export {
  TestPage as default
};
