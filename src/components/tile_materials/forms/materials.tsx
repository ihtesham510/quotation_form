'use client'

import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import type { MaterialFormProps, MaterialFormData } from '../types'

export function MaterialForm({
	material,
	styles,
	sizes,
	finishes,
	onAdd,
	onUpdate,
	onCancel,
	userId,
	editing = false,
}: MaterialFormProps) {
	const [formData, setFormData] = useState<MaterialFormData>({
		name: editing ? material!.name : '',
		styleIds: editing ? material!.styleIds : [],
		sizeIds: editing ? material!.sizeIds : [],
		finishIds: editing ? material!.finishIds : [],
		basePrice: editing ? material!.basePrice : 0,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (editing && material) {
			onUpdate?.({ ...formData, ...material })
			return
		}
		onAdd?.({ ...formData, userId })
	}

	const handleCheckboxChange = (id: string, type: 'styleIds' | 'sizeIds' | 'finishIds', checked: boolean) => {
		setFormData(prev => ({
			...prev,
			[type]: checked ? [...prev[type], id] : prev[type].filter(itemId => itemId !== id),
		}))
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{editing ? 'Edit Material' : 'Add New Material'}</CardTitle>
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
						<Label htmlFor='basePrice'>Base Price</Label>
						<Input
							id='basePrice'
							type='number'
							step='0.01'
							value={formData.basePrice}
							onChange={e => setFormData(prev => ({ ...prev, basePrice: Number.parseFloat(e.target.value) }))}
							required
						/>
					</div>

					<div className='space-y-2'>
						<Label>Styles</Label>
						<div className='grid grid-cols-2 gap-2 mt-2'>
							{styles.length === 0 && <p className='text-sm text-primary/50'> No styles to select</p>}
							{styles.map(style => (
								<div key={style._id} className='flex items-center space-x-2'>
									<Checkbox
										id={`style-${style._id}`}
										checked={formData.styleIds.includes(style._id)}
										onCheckedChange={checked => handleCheckboxChange(style._id, 'styleIds', checked as boolean)}
									/>
									<Label htmlFor={`style-${style._id}`} className='text-sm'>
										{style.name}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Sizes</Label>
						<div className='grid grid-cols-2 gap-2 mt-2'>
							{sizes.length === 0 && <p className='text-sm text-primary/50'> No sizes to select</p>}
							{sizes.map(size => (
								<div key={size._id} className='flex items-center space-x-2'>
									<Checkbox
										id={`size-${size._id}`}
										checked={formData.sizeIds.includes(size._id)}
										onCheckedChange={checked => handleCheckboxChange(size._id, 'sizeIds', checked as boolean)}
									/>
									<Label htmlFor={`size-${size._id}`} className='text-sm'>
										{size.name}
									</Label>
								</div>
							))}
						</div>
					</div>

					<div className='space-y-2'>
						<Label>Finishes</Label>
						<div className='grid grid-cols-2 gap-2 mt-2'>
							{finishes.length === 0 && <p className='text-sm text-primary/50'> No Finishes to select</p>}
							{finishes.map(finish => (
								<div key={finish._id} className='flex items-center space-x-2'>
									<Checkbox
										id={`finish-${finish._id}`}
										checked={formData.finishIds.includes(finish._id)}
										onCheckedChange={checked => handleCheckboxChange(finish._id, 'finishIds', checked as boolean)}
									/>
									<Label htmlFor={`finish-${finish._id}`} className='text-sm'>
										{finish.name}
									</Label>
								</div>
							))}
						</div>
					</div>

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
