'use client'

import { createContext, useContext, ReactNode } from 'react'

interface ThemeContextType {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = 'dark' // Fixed to dark theme for now
  const toggleTheme = () => {
    // Theme toggle functionality can be implemented here
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}