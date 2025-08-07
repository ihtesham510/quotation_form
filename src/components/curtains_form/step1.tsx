import type React from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { QuoteData } from './types'

interface Step1Props {
	quoteData: QuoteData
	setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
	errors: Record<string, string>
}

export function Step1({ quoteData, setQuoteData, errors }: Step1Props) {
	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div className='space-y-2'>
					<Label htmlFor='customerName'>Customer Name *</Label>
					<Input
						id='customerName'
						value={quoteData.customer.name}
						onChange={e =>
							setQuoteData(prev => ({
								...prev,
								customer: { ...prev.customer, name: e.target.value },
							}))
						}
						className={errors.customerName ? 'border-red-500' : ''}
					/>
					{errors.customerName && (
						<p className='text-red-500 text-sm'>{errors.customerName}</p>
					)}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='customerEmail'>Email *</Label>
					<Input
						id='customerEmail'
						type='email'
						value={quoteData.customer.email}
						onChange={e =>
							setQuoteData(prev => ({
								...prev,
								customer: { ...prev.customer, email: e.target.value },
							}))
						}
						className={errors.customerEmail ? 'border-red-500' : ''}
					/>
					{errors.customerEmail && (
						<p className='text-red-500 text-sm'>{errors.customerEmail}</p>
					)}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='customerPhone'>Phone *</Label>
					<Input
						id='customerPhone'
						value={quoteData.customer.phone}
						onChange={e =>
							setQuoteData(prev => ({
								...prev,
								customer: { ...prev.customer, phone: e.target.value },
							}))
						}
						className={errors.customerPhone ? 'border-red-500' : ''}
					/>
					{errors.customerPhone && (
						<p className='text-red-500 text-sm'>{errors.customerPhone}</p>
					)}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='quoteDate'>Quote Date</Label>
					<Input
						id='quoteDate'
						type='date'
						value={quoteData.quoteDate}
						onChange={e =>
							setQuoteData(prev => ({
								...prev,
								quoteDate: e.target.value,
							}))
						}
					/>
				</div>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='customerAddress'>Customer Address</Label>
				<Textarea
					id='customerAddress'
					value={quoteData.customer.address}
					onChange={e =>
						setQuoteData(prev => ({
							...prev,
							customer: { ...prev.customer, address: e.target.value },
						}))
					}
				/>
			</div>

			<div className='space-y-2'>
				<Label htmlFor='projectAddress'>Project Address</Label>
				<Textarea
					id='projectAddress'
					value={quoteData.customer.projectAddress}
					onChange={e =>
						setQuoteData(prev => ({
							...prev,
							customer: { ...prev.customer, projectAddress: e.target.value },
						}))
					}
				/>
			</div>
		</div>
	)
}
