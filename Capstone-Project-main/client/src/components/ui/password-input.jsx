import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
const passwordFieldStyle = "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-600";
function PasswordInput({ groupClassName, className, ...props }) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs(InputGroup, { className: cn(passwordFieldStyle, "overflow-hidden", groupClassName), children: [
    /* @__PURE__ */ jsx(
      InputGroupInput,
      {
        type: visible ? "text" : "password",
        className,
        ...props
      }
    ),
    /* @__PURE__ */ jsx(InputGroupAddon, { align: "inline-end", children: /* @__PURE__ */ jsx(
      InputGroupButton,
      {
        type: "button",
        variant: "ghost",
        size: "icon-sm",
        onClick: () => setVisible((v) => !v),
        "aria-label": visible ? "Hide password" : "Show password",
        "aria-pressed": visible,
        children: visible ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" })
      }
    ) })
  ] });
}
export {
  PasswordInput,
  passwordFieldStyle
};
