import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TileStyleFormData, StyleFormProps } from '../types'

export function StyleForm({ style, onAdd, onUpdate, onCancel, userId, editing = false }: StyleFormProps) {
	const [formData, setFormData] = useState<TileStyleFormData>({
		name: style?.name ?? '',
		multiplier: style?.multiplier ?? 0,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (style && editing) {
			onUpdate?.({ ...formData, ...style })
			return
		}
		onAdd?.({ ...formData, userId })
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{editing ? 'Edit Style' : 'Add New Style'}</CardTitle>
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
