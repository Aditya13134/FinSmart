"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define the Attribute type to match next-themes expectations
type Attribute = string | 'class' | 'data-theme' | 'data-mode';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
  forcedTheme?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
