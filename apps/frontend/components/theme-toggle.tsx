"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state from localStorage or default to dark
  const [theme, setTheme] = useState<Theme>(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Update localStorage whenever theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    // Update document theme if needed
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
           className={cn(
            theme === "light"
              ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
              : "bg-indigo-200 text-indigo-600 hover:bg-indigo-300",
          )}
            onClick={toggleTheme}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            <span className="sr-only">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{theme === "light" ? "Dark Mode" : "Light Mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
