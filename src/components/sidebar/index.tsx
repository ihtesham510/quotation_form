import { SheetIcon } from 'lucide-react'

import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { NavMain, type NavMainProps } from './nav-main'
import { useMatchRoute } from '@tanstack/react-router'

export function AppSidebar() {
  const route = useMatchRoute()
  const items: NavMainProps['items'] = [
    {
      title: 'Forms',
      icon: SheetIcon,
      href: { to: '/dashboard/forms' },
      isActive: !!route({ to: '/dashboard/forms', fuzzy: true }),
    },
    {
      title: 'Your Forms',
      icon: SheetIcon,
      href: { to: '/dashboard/inventory' },
      isActive: !!route({ to: '/dashboard/inventory', fuzzy: true }),
    },
  ]
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <NavMain items={items} />
      </SidebarContent>
    </Sidebar>
  )
}
