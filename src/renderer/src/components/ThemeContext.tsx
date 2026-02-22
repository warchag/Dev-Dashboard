import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeColor = 'blue' | 'purple' | 'neon-green' | 'orange' | 'pink'
export type FontFamily = 'Inter' | 'Roboto' | 'Fira Code'

interface ThemeContextType {
  themeColor: ThemeColor
  fontFamily: FontFamily
  setThemeColor: (color: ThemeColor) => void
  setFontFamily: (font: FontFamily) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('theme-color') as ThemeColor) || 'blue'
  })

  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem('font-family') as FontFamily) || 'Inter'
  })

  useEffect(() => {
    localStorage.setItem('theme-color', themeColor)
    document.documentElement.setAttribute('data-theme', themeColor)
  }, [themeColor])

  useEffect(() => {
    localStorage.setItem('font-family', fontFamily)
    let fontString = "'Inter', system-ui, sans-serif"
    if (fontFamily === 'Roboto') fontString = "'Roboto', sans-serif"
    if (fontFamily === 'Fira Code') fontString = "'Fira Code', monospace"

    document.documentElement.style.setProperty('--font-family', fontString)
  }, [fontFamily])

  return (
    <ThemeContext.Provider value={{ themeColor, fontFamily, setThemeColor, setFontFamily }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
