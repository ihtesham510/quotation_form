import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/dashboard/')({
	beforeLoad: async () => {},
	component: RootComponent,
})

function RootComponent() {
	return (
		<div className='flex flex-col md:flex-row justify-center gap-7 items-center h-screen w-full'>
			<Link to='/dashboard/tile_quotation'>
				<Card className='min-w-[300px] w-auto'>
					<CardContent>
						<CardHeader>
							<CardTitle>Tile Quotation</CardTitle>
							<CardDescription>
								Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere rem hic fugit reprehenderit eaque id
								nisi numquam veniam saepe doloremque sit iste corrupti, rerum consequuntur nobis, illo voluptates.
								Architecto, sunt!
							</CardDescription>
						</CardHeader>
					</CardContent>
				</Card>
			</Link>
			<Link to='/dashboard/curtains_quotation'>
				<Card className='min-w-[300px] w-auto'>
					<CardContent>
						<CardHeader>
							<CardTitle>Curtain Quotation</CardTitle>
							<CardDescription>
								Lorem ipsum dolor sit, amet consectetur adipisicing elit. Facere rem hic fugit reprehenderit eaque id
								nisi numquam veniam saepe doloremque sit iste corrupti, rerum consequuntur nobis, illo voluptates.
								Architecto, sunt!
							</CardDescription>
						</CardHeader>
					</CardContent>
				</Card>
			</Link>
		</div>
	)
}
