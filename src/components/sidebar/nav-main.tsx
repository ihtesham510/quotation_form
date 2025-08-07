import { type LucideIcon } from 'lucide-react'
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link, type LinkProps } from '@tanstack/react-router'

export interface NavMainProps {
	items: {
		title: string
		href: LinkProps
		isActive?: boolean
		hidden?: boolean
		icon?: LucideIcon
	}[]
}

export function NavMain({ items }: NavMainProps) {
	return (
		<SidebarGroup>
			<SidebarGroupContent className='flex flex-col gap-2'>
				<SidebarMenu>
					{items.map(item => {
						if (item.hidden) return null
						return (
							<Link {...item.href} key={item.title}>
								<SidebarMenuItem>
									<SidebarMenuButton
										isActive={item.isActive}
										tooltip={item.title}
									>
										{item.icon && <item.icon />}
										<span>{item.title}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</Link>
						)
					})}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
