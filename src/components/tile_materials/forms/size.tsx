import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TileSizeFormData, SizeFormProps } from '../types'
import { useAuth } from '@/context/auth'

export function SizeForm({ size, onAdd, onUpdate, onCancel, editing = false, userId }: SizeFormProps) {
	const { user } = useAuth()
	const [formData, setFormData] = useState<TileSizeFormData>(() => {
		if (editing && size) {
			return {
				name: size.name,
				userId: size.userId,
				size: size.size,
			}
		}

		return {
			name: '',
			userId,
			size: {
				type: 'linear_meter',
				pricing: 0,
			},
		}
	})

	const handleSizeTypeChange = (newType: 'linear_meter' | 'height_width' | 'custom') => {
		let newSize

		switch (newType) {
			case 'linear_meter':
				newSize = {
					type: 'linear_meter' as const,
					value: 0,
					pricing: 0,
				}
				break
			case 'height_width':
				newSize = {
					type: 'height_width' as const,
					height: 0,
					width: 0,
					price_type: 'fixed_price' as const,
					pricing: 0,
				}
				break
			case 'custom':
				newSize = {
					type: 'custom' as const,
					price_type: 'fixed_price' as const,
					pricing: 0,
				}
				break
		}

		setFormData(prev => ({ ...prev, size: newSize }))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (user) {
			if (editing && size) {
				onUpdate?.({
					...formData,
					userId: user._id,
					_id: size._id,
				})
			} else {
				onAdd?.({
					...formData,
					userId: user._id,
				})
			}
		}
	}

	const renderSizeSpecificFields = () => {
		switch (formData.size.type) {
			case 'linear_meter':
				return (
					<>
						<div className='space-y-2'>
							<Label htmlFor='pricing'>Pricing</Label>
							<Input
								id='pricing'
								type='number'
								step='0.01'
								value={formData.size.pricing}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										size: { ...prev.size, pricing: Number.parseFloat(e.target.value) || 0 },
									}))
								}
								required
							/>
						</div>
					</>
				)

			case 'height_width':
				return (
					<>
						<div className='grid grid-cols-2 gap-4'>
							<div className='space-y-2'>
								<Label htmlFor='height'>Height</Label>
								<Input
									id='height'
									type='number'
									step='0.01'
									value={formData.size.height}
									onChange={e =>
										setFormData(prev => ({
											...prev,
											size: { ...prev.size, height: Number.parseFloat(e.target.value) || 0 },
										}))
									}
									required
								/>
							</div>
							<div className='space-y-2'>
								<Label htmlFor='width'>Width</Label>
								<Input
									id='width'
									type='number'
									step='0.01'
									value={formData.size.width}
									onChange={e =>
										setFormData(prev => ({
											...prev,
											size: { ...prev.size, width: Number.parseFloat(e.target.value) || 0 },
										}))
									}
									required
								/>
							</div>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='price_type'>Price Type</Label>
							<Select
								value={formData.size.price_type}
								onValueChange={(value: 'fixed_price' | 'multiplier') =>
									setFormData(prev => ({
										...prev,
										size: { ...prev.size, price_type: value },
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='fixed_price'>Fixed Price</SelectItem>
									<SelectItem value='multiplier'>Multiplier</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='pricing'>
								{formData.size.price_type === 'fixed_price' ? 'Fixed Price' : 'Multiplier'}
							</Label>
							<Input
								id='pricing'
								type='number'
								step='0.01'
								value={formData.size.pricing}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										size: { ...prev.size, pricing: Number.parseFloat(e.target.value) || 0 },
									}))
								}
								required
							/>
						</div>
					</>
				)

			case 'custom':
				return (
					<>
						<div className='space-y-2'>
							<Label htmlFor='price_type'>Price Type</Label>
							<Select
								value={formData.size.price_type}
								onValueChange={(value: 'fixed_price' | 'multiplier') =>
									setFormData(prev => ({
										...prev,
										size: { ...prev.size, price_type: value },
									}))
								}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='fixed_price'>Fixed Price</SelectItem>
									<SelectItem value='multiplier'>Multiplier</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='pricing'>
								{formData.size.price_type === 'fixed_price' ? 'Fixed Price' : 'Multiplier'}
							</Label>
							<Input
								id='pricing'
								type='number'
								step='0.01'
								value={formData.size.pricing}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										size: { ...prev.size, pricing: Number.parseFloat(e.target.value) || 0 },
									}))
								}
								required
							/>
						</div>
					</>
				)
		}
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{editing ? 'Edit Size' : 'Add New Size'}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Name</Label>
						<Input
							id='name'
							value={formData.name}
							onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='size_type'>Size Type</Label>
						<Select value={formData.size.type} onValueChange={handleSizeTypeChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='linear_meter'>Linear Meter</SelectItem>
								<SelectItem value='height_width'>Height & Width</SelectItem>
								<SelectItem value='custom'>Custom</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{renderSizeSpecificFields()}

					<div className='flex gap-2'>
						<Button type='submit'>Save</Button>
						<Button type='button' variant='outline' onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	)
}
