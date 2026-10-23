import DashboardLayout from './dashboard-layout'
import { DashboardPage } from './components/agndex/dashboard-page'

export default function HermesApp() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  )
}