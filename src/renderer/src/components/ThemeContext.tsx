import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeColor = 'blue' | 'purple' | 'neon-green' | 'orange' | 'pink'
export type FontFamily = 'Inter' | 'Roboto' | 'Fira Code'
export type FontSize = 'small' | 'medium' | 'large'
export type ColorScheme = 'dark' | 'light'

interface ThemeContextType {
  themeColor: ThemeColor
  fontFamily: FontFamily
  fontSize: FontSize
  colorScheme: ColorScheme
  setThemeColor: (color: ThemeColor) => void
  setFontFamily: (font: FontFamily) => void
  setFontSize: (size: FontSize) => void
  setColorScheme: (scheme: ColorScheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem('theme-color') as ThemeColor) || 'blue'
  })

  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem('font-family') as FontFamily) || 'Inter'
  })

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('font-size') as FontSize) || 'medium'
  })

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    return (localStorage.getItem('color-scheme') as ColorScheme) || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme-color', themeColor)
    document.documentElement.setAttribute('data-theme', themeColor)
  }, [themeColor])

  useEffect(() => {
    localStorage.setItem('color-scheme', colorScheme)
    document.documentElement.setAttribute('data-color-scheme', colorScheme)
  }, [colorScheme])

  useEffect(() => {
    localStorage.setItem('font-family', fontFamily)
    let fontString = "'Inter', system-ui, sans-serif"
    if (fontFamily === 'Roboto') fontString = "'Roboto', sans-serif"
    if (fontFamily === 'Fira Code') fontString = "'Fira Code', monospace"

    document.documentElement.style.setProperty('--font-family', fontString)
  }, [fontFamily])

  useEffect(() => {
    localStorage.setItem('font-size', fontSize)
    let scale = '1'
    if (fontSize === 'small') scale = '0.85'
    else if (fontSize === 'large') scale = '1.15'
    document.documentElement.style.setProperty('--font-scale', scale)
  }, [fontSize])

  return (
    <ThemeContext.Provider
      value={{
        themeColor,
        fontFamily,
        fontSize,
        colorScheme,
        setThemeColor,
        setFontFamily,
        setFontSize,
        setColorScheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
