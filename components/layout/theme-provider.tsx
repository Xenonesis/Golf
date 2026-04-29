'use client'

import { useEffect } from 'react'

export function ThemeProvider() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const root = document.documentElement
    
    if (savedTheme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else if (savedTheme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      // System preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      root.classList.remove(systemTheme === 'dark' ? 'light' : 'dark')
    }
  }, [])

  return null
}
