"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push('/signin?redirectUrl=' + encodeURIComponent(window.location.pathname))
    }
  }, [router])
  
  return <>{children}</>
}