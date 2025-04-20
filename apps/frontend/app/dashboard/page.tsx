import AuthCheck from "@/components/authcheck"
import Dashboard from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <AuthCheck>
      <Dashboard />
    </AuthCheck>
  )
}
