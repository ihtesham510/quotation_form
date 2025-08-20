import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TileSizeFormData, SizeFormProps } from '../types'

export function SizeForm({ size, onAdd, onUpdate, onCancel, editing = false, userId }: SizeFormProps) {
	const [formData, setFormData] = useState<TileSizeFormData>({
		name: editing && size?.name ? size.name : '',
		multiplier: editing && size?.multiplier ? size.multiplier : 1.0,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (size && editing) {
			onUpdate?.({ ...formData, ...size })
			return
		}
		onAdd?.({ ...formData, userId })
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
						<Label htmlFor='multiplier'>Multiplier</Label>
						<Input
							id='multiplier'
							type='number'
							step='0.01'
							value={formData.multiplier}
							onChange={e => setFormData(prev => ({ ...prev, multiplier: Number.parseFloat(e.target.value) }))}
							required
						/>
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
