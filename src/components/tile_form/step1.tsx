import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { CustomerInfo } from './types'

interface Step1Props {
	customerInfo: CustomerInfo
	onCustomerInfoChange: (info: CustomerInfo) => void
	onNext: () => void
	isValid: boolean
	errors: Record<string, string>
}

export function Step1({ customerInfo, onCustomerInfoChange, onNext, isValid, errors }: Step1Props) {
	const handleInputChange = (field: keyof CustomerInfo, value: string) => {
		const updatedInfo = { ...customerInfo, [field]: value }
		onCustomerInfoChange(updatedInfo)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Customer Information</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Customer Name *</Label>
						<Input
							id='name'
							value={customerInfo.name}
							onChange={e => handleInputChange('name', e.target.value)}
							className={errors.name ? 'border-red-500' : ''}
						/>
						{errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='email'>Email *</Label>
						<Input
							id='email'
							type='email'
							value={customerInfo.email}
							onChange={e => handleInputChange('email', e.target.value)}
							className={errors.email ? 'border-red-500' : ''}
						/>
						{errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
					</div>
				</div>

				<div className='space-y-2'>
					<Label htmlFor='phone'>Phone Number *</Label>
					<Input
						id='phone'
						value={customerInfo.phone}
						onChange={e => handleInputChange('phone', e.target.value)}
						className={errors.phone ? 'border-red-500' : ''}
					/>
					{errors.phone && <p className='text-sm text-red-500'>{errors.phone}</p>}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='customerAddress'>Customer Address *</Label>
					<Input
						id='customerAddress'
						value={customerInfo.customerAddress}
						onChange={e => handleInputChange('customerAddress', e.target.value)}
						className={errors.customerAddress ? 'border-red-500' : ''}
					/>
					{errors.customerAddress && <p className='text-sm text-red-500'>{errors.customerAddress}</p>}
				</div>

				<div className='space-y-2'>
					<Label htmlFor='projectAddress'>Project Address (Optional)</Label>
					<Input
						id='projectAddress'
						value={customerInfo.projectAddress}
						onChange={e => handleInputChange('projectAddress', e.target.value)}
					/>
				</div>

				<div className='flex justify-end mt-6'>
					<Button onClick={onNext} disabled={!isValid}>
						Next
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
