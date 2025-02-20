
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeProviderContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
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
  // Ensure proper initialization of useState
  const [theme, setTheme] = useState(defaultTheme);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setTheme(stored);
    } catch (error) {
      console.warn("LocalStorage access denied:", error);
    }
  }, [storageKey]);

  const applyTheme = useCallback((newTheme) => {
    const root = window.document.documentElement;
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
  }, []);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const setThemeWithStorage = useCallback((newTheme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn("LocalStorage access denied:", error);
    }
    setTheme(newTheme);
  }, [storageKey]);

  const value = {
    theme,
    setTheme: setThemeWithStorage,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
