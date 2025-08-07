import { FileSpreadsheetIcon, HistoryIcon, Package } from 'lucide-react'

import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { NavMain, type NavMainProps } from './nav-main'
import { useMatchRoute } from '@tanstack/react-router'

export function AppSidebar() {
	const route = useMatchRoute()
	const items: NavMainProps['items'] = [
		{
			title: 'Form',
			icon: FileSpreadsheetIcon,
			href: { to: '/dashboard/form' },
			isActive: !!route({ to: '/dashboard/form', fuzzy: true }),
		},
		{
			title: 'History',
			icon: HistoryIcon,
			href: { to: '/dashboard/history' },
			isActive: !!route({ to: '/dashboard/history', fuzzy: true }),
		},
		{
			title: 'Products',
			icon: Package,
			href: { to: '/dashboard/products' },
			isActive: !!route({ to: '/dashboard/products', fuzzy: true }),
		},
	]
	return (
		<Sidebar collapsible='icon' variant='sidebar'>
			<SidebarContent>
				<NavMain items={items} />
			</SidebarContent>
		</Sidebar>
	)
}
