import { ThemeProvider } from "@/components/theme-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="bg-background h-[100dvh]">
        <Outlet />
        <div className="absolute flex bottom-0 left-0 p-2 bg-background">
          <ThemeIcon />
          {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </div>
      </div>
    </ThemeProvider>
  ),
});

const ThemeIcon = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="border rounded-full aspect-square p-1 hover:cursor-pointer text-primary/75"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
};
