"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loading from './loading'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push('/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
          return
        }
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.push('/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
      } finally {
        setIsChecking(false)
      }
    }

    const timer = setTimeout(checkAuth, 0)
    return () => clearTimeout(timer)
  }, [router])

  if (isChecking) {
    return <Loading text="Checking authentication..." fullScreen />
  }

  return isAuthenticated ? <>{children}</> : null
}