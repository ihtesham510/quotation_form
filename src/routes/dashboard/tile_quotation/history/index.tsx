import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Eye, FileText, Calendar, User, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useAuth } from '@/context/auth'
import { LoaderComponent } from '@/components/loader-component'
import { format } from 'date-fns'

export const Route = createFileRoute('/dashboard/tile_quotation/history/')({
	component: RouteComponent,
})

function RouteComponent() {
	const { user } = useAuth()
	if (!user) return null
	return <RenderQuotations userId={user!._id} />
}

function RenderQuotations({ userId }: { userId: Id<'user'> }) {
	const mockQuotations = useQuery(api.quotation.getTileQuotations, { userId })
	if (!mockQuotations) return <LoaderComponent />
	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 py-8'>
				<div className='mx-auto'>
					<div className='flex justify-between items-center mb-8'>
						<div>
							<h1 className='text-3xl font-bold text-foreground mb-2'>All Quotations</h1>
							<p className='text-muted-foreground'>Manage and view all your saved quotations</p>
						</div>
						<Link to='/dashboard/tile_quotation/form'>
							<Button>
								<FileText className='h-4 w-4 mr-2' />
								New Quotation
							</Button>
						</Link>
					</div>

					<div className='grid gap-6'>
						{mockQuotations.map(quotation => (
							<Card key={quotation._id} className='hover:shadow-lg transition-shadow'>
								<CardHeader>
									<div className='flex justify-between items-start'>
										<div className='space-y-2'>
											<CardTitle className='flex items-center gap-2'>
												<User className='h-5 w-5' />
												{quotation.customerInfo.name}
											</CardTitle>
											<div className='flex items-center gap-4 text-sm text-muted-foreground'>
												<span className='flex items-center gap-1'>
													<Calendar className='h-4 w-4' />
													{format(quotation._creationTime, 'dd MMMM yyyy')}
												</span>
												<span className='flex items-center gap-1'>
													<MapPin className='h-4 w-4' />
													{quotation.customerInfo.customerAddress}
												</span>
											</div>
										</div>
										<div className='text-right space-y-2'>
											<div className='text-2xl font-bold text-primary'>
												${quotation.pricing.finalTotal.toLocaleString()}
											</div>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<div className='flex justify-between items-center'>
										<div className='space-y-1'>
											<p className='text-sm text-muted-foreground'>Email: {quotation.customerInfo.email}</p>
											<p className='text-sm text-muted-foreground'>Phone: {quotation.customerInfo.phone}</p>
											{quotation.customerInfo.projectAddress && (
												<p className='text-sm text-muted-foreground'>
													Project: {quotation.customerInfo.projectAddress}
												</p>
											)}
										</div>
										<Link
											to='/dashboard/tile_quotation/history/$quotationId'
											params={{
												quotationId: quotation._id,
											}}
										>
											<Button variant='outline'>
												<Eye className='h-4 w-4 mr-2' />
												Preview
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{mockQuotations.length === 0 && (
						<div className='text-center py-12'>
							<FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
							<h3 className='text-lg font-semibold text-foreground mb-2'>No quotations found</h3>
							<p className='text-muted-foreground mb-4'>Start by creating your first quotation</p>
							<Button>Create Quotation</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
