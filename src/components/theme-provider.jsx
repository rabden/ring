
import * as React from "react";

const ThemeProviderContext = React.createContext({});

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}) {
  const [theme, setTheme] = React.useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    
    try {
      const stored = localStorage.getItem(storageKey);
      return stored || defaultTheme;
    } catch (error) {
      console.warn("LocalStorage access denied:", error);
      return defaultTheme;
    }
  });

  React.useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (newTheme) => {
      root.classList.remove("light", "dark");

      if (newTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
        root.style.colorScheme = systemTheme;
      } else {
        root.classList.add(newTheme);
        root.style.colorScheme = newTheme;
      }
    };

    applyTheme(theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme) => {
        try {
          localStorage.setItem(storageKey, newTheme);
        } catch (error) {
          console.warn("LocalStorage access denied:", error);
        }
        setTheme(newTheme);
      },
    }),
    [theme, storageKey]
  );

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
