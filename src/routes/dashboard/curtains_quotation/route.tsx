import { AppSidebar } from '@/components/sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createFileRoute, Outlet, useMatchRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth'
import type { NavMainProps } from '@/components/sidebar/nav-main'
import { FileSpreadsheetIcon, HistoryIcon, Package } from 'lucide-react'

export const Route = createFileRoute('/dashboard/curtains_quotation')({
	component: RouteComponent,
})

function RouteComponent() {
	const route = useMatchRoute()
	const items: NavMainProps['items'] = [
		{
			title: 'Form',
			icon: FileSpreadsheetIcon,
			href: { to: '/dashboard/curtains_quotation/form' },
			isActive: !!route({ to: '/dashboard/curtains_quotation/form', fuzzy: true }),
		},
		{
			title: 'History',
			icon: HistoryIcon,
			href: { to: '/dashboard/curtains_quotation/history' },
			isActive: !!route({ to: '/dashboard/curtains_quotation/history', fuzzy: true }),
		},
		{
			title: 'Products',
			icon: Package,
			href: { to: '/dashboard/curtains_quotation/products' },
			isActive: !!route({ to: '/dashboard/curtains_quotation/products', fuzzy: true }),
		},
	]
	const { signOut } = useAuth()
	return (
		<SidebarProvider defaultOpen={false}>
			<AppSidebar items={items} />
			<div className='flex flex-col w-full'>
				<header className='base-padding flex justify-between items-center mt-2 py-2 w-full'>
					<SidebarTrigger />
					<Button variant='secondary' onClick={async () => await signOut()}>
						Log Out
					</Button>
				</header>
				<div className='p-4 md:p-8 mb-12'>
					<Outlet />
				</div>
			</div>
		</SidebarProvider>
	)
}
