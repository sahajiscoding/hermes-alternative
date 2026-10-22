import {
  ArrowRightIcon,
  BillingIcon,
  CalendarIcon,
  PackageIcon,
  SettingsIcon,
} from './icons'
import { Button } from '@/components/ui/button'
import { resourceRows, subscription, usageStats } from '../../data'

export function BillingPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-4 md:gap-11 md:p-8">
      <div className="flex flex-col md:gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Billing & Quota Telemetry</h1>
        <p className="text-muted-foreground text-sm">
          Track BYOK model token consumption, local agent tasks, and hardware utilization
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BillingIcon />
            <h2 className="font-medium">Subscription Mode</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-2 px-4 text-xs font-normal"
          >
            <SettingsIcon />
            BYOK Mode Active
          </Button>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-card p-0.5 pb-3 dark:bg-sidebar border border-border">
          <div className="flex flex-col gap-3 rounded-lg bg-background p-4 dark:bg-card">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-medium tracking-tight">
                {subscription.tier}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-info/10 text-info font-medium">
                {subscription.plan}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarIcon />
                Current Cycle
              </div>
              <p className="text-xs font-medium tracking-tight">
                {subscription.billingCycle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-1">
            <p className="text-xs text-muted-foreground">Zero markup: direct billing via your own provider accounts</p>
            <button
              type="button"
              className="group flex items-center gap-1.5 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              Manage Provider Portals
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <PackageIcon />
            <h2 className="font-medium">Resource Usage & Caps</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {usageStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 dark:bg-sidebar"
              >
                <div className="flex items-center gap-2 text-xs">
                  <stat.icon className="text-foreground size-4" />
                  <span className="text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="text-2xl font-semibold leading-none">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="custom-scrollbar-x rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full min-w-xl text-left text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground border-b border-border">
                <th className="px-6 py-3 font-medium">Subsystem</th>
                <th className="px-6 py-3 font-medium">Allowance</th>
                <th className="px-6 py-3 font-medium">Execution Engine</th>
              </tr>
            </thead>
            <tbody>
              {resourceRows.map((row) => (
                <tr key={row.resource} className="border-t border-border/50 hover:bg-muted/20">
                  <td className="px-6 py-3.5 font-medium">{row.resource}</td>
                  <td className="px-6 py-3.5 text-muted-foreground">{row.included}</td>
                  <td className="px-6 py-3.5 text-xs font-mono text-emerald-500">{row.overage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
