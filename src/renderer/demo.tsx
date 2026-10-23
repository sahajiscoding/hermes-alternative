import DashboardLayout from './dashboard-layout'
import { DashboardPage } from './components/agndex/dashboard-page'
import { UpdateNotification } from './components/agndex/update-notification'

export default function HermesApp() {
  return (
    <DashboardLayout>
      <DashboardPage />
      <UpdateNotification />
    </DashboardLayout>
  )
}