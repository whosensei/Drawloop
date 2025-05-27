"use client"

import { Suspense } from "react"
import AuthCheck from "@/components/authcheck"
import Loading from "@/components/loading"
import dynamic from "next/dynamic"

// Lazy load the Dashboard component for better performance
const Dashboard = dynamic(() => import("@/components/dashboard"), {
  loading: () => <Loading text="Loading dashboard..." fullScreen />
})

export default function DashboardPage() {
  return (
    <AuthCheck>
      <Suspense fallback={<Loading text="Loading dashboard..." fullScreen />}>
        <Dashboard />
      </Suspense>
    </AuthCheck>
  )
}
