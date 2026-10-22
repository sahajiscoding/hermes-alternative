import { Moon } from 'lucide-react'

export function ThemeToggle() {
  return (
    <div
      className="flex items-center justify-center size-8 rounded-lg border border-border bg-card text-muted-foreground select-none"
      title="OLED Dark Mode (Active)"
    >
      <Moon className="size-4 text-emerald-500" />
    </div>
  )
}
