import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { LayoutDashboard, LogOut, PanelLeft, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
const menuItems = [
  { icon: LayoutDashboard, label: "Page 1", path: "/" },
  { icon: Users, label: "Page 2", path: "/some-path" }
];
const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
function DashboardLayout({
  children
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();
  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);
  if (loading) {
    return /* @__PURE__ */ jsx(DashboardLayoutSkeleton, {});
  }
  if (!user) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-8 p-8 max-w-md w-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-6", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight text-center", children: "Sign in to continue" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center max-w-sm", children: "Access to this dashboard requires authentication. Continue to launch the login flow." })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: () => {
            window.location.href = getLoginUrl();
          },
          size: "lg",
          className: "w-full shadow-lg hover:shadow-xl transition-all",
          children: "Sign in"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsx(
    SidebarProvider,
    {
      style: {
        "--sidebar-width": `${sidebarWidth}px`
      },
      children: /* @__PURE__ */ jsx(DashboardLayoutContent, { setSidebarWidth, children })
    }
  );
}
function DashboardLayoutContent({
  children,
  setSidebarWidth
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const activeMenuItem = menuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", ref: sidebarRef, children: [
      /* @__PURE__ */ jsxs(
        Sidebar,
        {
          collapsible: "icon",
          className: "border-r-0",
          disableTransition: isResizing,
          children: [
            /* @__PURE__ */ jsx(SidebarHeader, { className: "h-16 justify-center", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-2 transition-all w-full", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: toggleSidebar,
                  className: "h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0",
                  "aria-label": "Toggle navigation",
                  children: /* @__PURE__ */ jsx(PanelLeft, { className: "h-4 w-4 text-muted-foreground" })
                }
              ),
              !isCollapsed ? /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 min-w-0", children: /* @__PURE__ */ jsx("span", { className: "font-semibold tracking-tight truncate", children: "Navigation" }) }) : null
            ] }) }),
            /* @__PURE__ */ jsx(SidebarContent, { className: "gap-0", children: /* @__PURE__ */ jsx(SidebarMenu, { className: "px-2 py-1", children: menuItems.map((item) => {
              const isActive = location === item.path;
              return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(
                SidebarMenuButton,
                {
                  isActive,
                  onClick: () => setLocation(item.path),
                  tooltip: item.label,
                  className: `h-10 transition-all font-normal`,
                  children: [
                    /* @__PURE__ */ jsx(
                      item.icon,
                      {
                        className: `h-4 w-4 ${isActive ? "text-primary" : ""}`
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { children: item.label })
                  ]
                }
              ) }, item.path);
            }) }) }),
            /* @__PURE__ */ jsx(SidebarFooter, { className: "p-3", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring", children: [
                /* @__PURE__ */ jsx(Avatar, { className: "h-9 w-9 border shrink-0", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "text-xs font-medium", children: user?.name?.charAt(0).toUpperCase() }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 group-data-[collapsible=icon]:hidden", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate leading-none", children: user?.name || "-" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate mt-1.5", children: user?.email || "-" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", className: "w-48", children: /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  onClick: logout,
                  className: "cursor-pointer text-destructive focus:text-destructive",
                  children: [
                    /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Sign out" })
                  ]
                }
              ) })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: `absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`,
          onMouseDown: () => {
            if (isCollapsed) return;
            setIsResizing(true);
          },
          style: { zIndex: 50 }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(SidebarInset, { children: [
      isMobile && /* @__PURE__ */ jsx("div", { className: "flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(SidebarTrigger, { className: "h-9 w-9 rounded-lg bg-background" }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1", children: /* @__PURE__ */ jsx("span", { className: "tracking-tight text-foreground", children: activeMenuItem?.label ?? "Menu" }) }) })
      ] }) }),
      /* @__PURE__ */ jsx("main", { className: "flex-1 p-4", children })
    ] })
  ] });
}
export {
  DashboardLayout as default
};
