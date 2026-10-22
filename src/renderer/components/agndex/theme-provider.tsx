import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'

export type Theme = 'dark'

type ThemeProviderProps = {
  children: ReactNode
}

type ThemeProviderState = {
  theme: 'dark'
  resolvedTheme: 'dark'
  setTheme: (theme: 'dark') => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
})

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Enforce dark mode permanently on root
    const root = document.documentElement
    root.classList.remove('light')
    root.classList.add('dark')
    localStorage.setItem('hermes-theme', 'dark')
    localStorage.removeItem('agndex-theme')
  }, [])

  const value = useMemo(
    () => ({
      theme: 'dark' as const,
      resolvedTheme: 'dark' as const,
      setTheme: () => {},
    }),
    [],
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeProviderContext)
}
