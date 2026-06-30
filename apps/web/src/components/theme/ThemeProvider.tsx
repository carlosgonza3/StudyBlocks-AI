import {
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ThemeContext,
    THEME_STORAGE_KEY,
    type Theme,
    type ThemeContextValue,
} from "./theme-context";

type ThemeProviderProps = {
    children: ReactNode;
};

function getInitialTheme(): Theme {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === "light" || storedTheme === "dark") {
        return storedTheme;
    }

    const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
    ).matches;

    return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        const root = window.document.documentElement;

        root.classList.remove("light", "dark");
        root.classList.add(theme);

        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            setTheme: setThemeState,
            toggleTheme: () => {
                setThemeState((currentTheme) =>
                    currentTheme === "dark" ? "light" : "dark",
                );
            },
        }),
        [theme],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}