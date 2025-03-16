"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    attribute?: string;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
                                  children,
                                  defaultTheme = "system",
                                  storageKey = "theme",
                                  attribute = "data-theme",
                                  enableSystem = true,
                                  disableTransitionOnChange = false,
                                  ...props
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (disableTransitionOnChange) {
            root.classList.add("disable-transitions");
        }

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
            root.setAttribute(attribute, systemTheme);
        } else {
            root.classList.add(theme);
            root.setAttribute(attribute, theme);
        }

        if (disableTransitionOnChange) {
            // Force a reflow
            window.getComputedStyle(root).color;
            root.classList.remove("disable-transitions");
        }
    }, [theme, systemTheme, attribute, disableTransitionOnChange]);

    useEffect(() => {
        if (!enableSystem) {
            return;
        }

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onMediaChange = () => {
            const newSystemTheme = media.matches ? "dark" : "light";
            setSystemTheme(newSystemTheme);
            if (theme === "system") {
                const root = window.document.documentElement;
                root.classList.remove("light", "dark");
                root.classList.add(newSystemTheme);
                root.setAttribute(attribute, newSystemTheme);
            }
        };

        onMediaChange();
        media.addEventListener("change", onMediaChange);
        return () => media.removeEventListener("change", onMediaChange);
    }, [theme, enableSystem, attribute]);

    useEffect(() => {
        // Initialize from localStorage
        const storedTheme = localStorage.getItem(storageKey);
        if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
            setTheme(storedTheme as Theme);
        }
    }, [storageKey]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};