import { jsx } from "react/jsx-runtime";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
const Toaster = ({ ...props }) => {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsx(
    Sonner,
    {
      theme,
      className: "toaster group",
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)"
      },
      ...props
    }
  );
};
export {
  Toaster
};
