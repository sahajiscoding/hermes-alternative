import { useState } from 'react'
import {
  CaretDownIcon,
  ProjectIcon,
} from './icons'
import { ThemeToggle } from './theme-toggle'
import { useDashboardNavigation } from './navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { navigationGroups, projects, type Project } from '../../data'
import { QrCode, Smartphone } from 'lucide-react'

const navigationItems = navigationGroups.flatMap((group) => group.items)

export function DashboardTopbar() {
  const { pathname, navigate } = useDashboardNavigation()
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0])

  const currentPage =
    navigationItems.find(({ href }) =>
      href === '/'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    ) ?? navigationItems[0]

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 px-4 border-b border-border bg-background/80 backdrop-blur-md md:h-16 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="size-9 md:hidden" />
        <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
          <span className="font-semibold text-foreground">Hermes</span>
          <span className="text-border">/</span>
          <span>{selectedProject.name}</span>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground">{currentPage.name}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/mobile-link')}
          className="h-9 gap-1.5 px-3 text-xs font-normal"
        >
          <QrCode className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Pair Phone</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              className="h-9 max-w-48 justify-between gap-2 px-3 text-xs data-open:[&>svg]:rotate-180 md:w-48"
            >
              <span className="flex items-center gap-1.5 overflow-hidden">
                <ProjectIcon className="size-4" />
                <span className="truncate">{selectedProject.name}</span>
              </span>
              <CaretDownIcon className="transition-transform size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="agndex-dashboard w-56">
            <DropdownMenuRadioGroup
              value={selectedProject.id}
              onValueChange={(id) => {
                const project = projects.find((item) => item.id === id)
                if (project) setSelectedProject(project)
              }}
            >
              {projects.map((project) => (
                <DropdownMenuRadioItem
                  key={project.id}
                  value={project.id}
                  className="font-normal text-muted-foreground data-[state=checked]:font-medium data-[state=checked]:text-foreground text-xs"
                >
                  {project.name}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />
      </div>
    </header>
  )
}
