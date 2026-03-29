import { jsx } from "react/jsx-runtime";
import { memo } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { cn } from "@/lib/utils";
const components = {
  // Headings - using tracking-tight for Vercel-style typography
  h1: ({ children }) => /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold tracking-tight mt-8 mb-4 first:mt-0", children }),
  h2: ({ children }) => /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold tracking-tight mt-8 mb-3 first:mt-0", children }),
  h3: ({ children }) => /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold tracking-tight mt-6 mb-3 first:mt-0", children }),
  h4: ({ children }) => /* @__PURE__ */ jsx("h4", { className: "text-lg font-semibold mt-6 mb-2 first:mt-0", children }),
  // Text elements
  p: ({ children }) => /* @__PURE__ */ jsx("p", { className: "mb-4 leading-7 last:mb-0", children }),
  a: ({ href, children }) => /* @__PURE__ */ jsx(
    "a",
    {
      href,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "underline underline-offset-4 decoration-muted-foreground/50 hover:decoration-foreground transition-colors",
      children
    }
  ),
  strong: ({ children }) => /* @__PURE__ */ jsx("strong", { className: "font-semibold", children }),
  em: ({ children }) => /* @__PURE__ */ jsx("em", { className: "italic", children }),
  // Lists
  ul: ({ children }) => /* @__PURE__ */ jsx("ul", { className: "list-disc pl-6 mb-4 space-y-2", children }),
  ol: ({ children }) => /* @__PURE__ */ jsx("ol", { className: "list-decimal pl-6 mb-4 space-y-2", children }),
  li: ({ children }) => /* @__PURE__ */ jsx("li", { className: "leading-7", children }),
  // Block elements
  blockquote: ({ children }) => /* @__PURE__ */ jsx("blockquote", { className: "border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground my-4", children }),
  hr: () => /* @__PURE__ */ jsx("hr", { className: "border-border my-8" }),
  // Tables - with responsive wrapper
  table: ({ children }) => /* @__PURE__ */ jsx("div", { className: "overflow-x-auto my-4", children: /* @__PURE__ */ jsx("table", { className: "w-full border-collapse text-sm", children }) }),
  thead: ({ children }) => /* @__PURE__ */ jsx("thead", { children }),
  tbody: ({ children }) => /* @__PURE__ */ jsx("tbody", { children }),
  tr: ({ children }) => /* @__PURE__ */ jsx("tr", { className: "border-b border-border", children }),
  th: ({ children }) => /* @__PURE__ */ jsx("th", { className: "border border-border bg-muted px-4 py-2 text-left font-semibold", children }),
  td: ({ children }) => /* @__PURE__ */ jsx("td", { className: "border border-border px-4 py-2", children }),
  // Media
  img: ({ src, alt }) => /* @__PURE__ */ jsx("img", { src, alt: alt || "", className: "max-w-full h-auto rounded-lg my-4" })
};
const Markdown = memo(function Markdown2({
  className,
  children,
  components: customComponents,
  shikiTheme = ["github-light", "github-dark"],
  controls = true,
  enableCode = true,
  enableMermaid = true,
  ...props
}) {
  const plugins = {};
  if (enableCode) plugins.code = code;
  if (enableMermaid) plugins.mermaid = mermaid;
  return /* @__PURE__ */ jsx(
    Streamdown,
    {
      className: cn("text-foreground leading-relaxed", className),
      components: { ...components, ...customComponents },
      plugins,
      shikiTheme,
      controls,
      ...props,
      children
    }
  );
});
var stdin_default = Markdown;
export {
  Markdown,
  stdin_default as default,
  components as markdownComponents
};
