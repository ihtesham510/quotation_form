import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { NavMain, type NavMainProps } from './nav-main'

export function AppSidebar({ items }: { items: NavMainProps['items'] }) {
	return (
		<Sidebar collapsible='icon' variant='sidebar'>
			<SidebarContent>
				<NavMain items={items} />
			</SidebarContent>
		</Sidebar>
	)
}
