import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TileFinishFormData, FinishFormProps } from '../types'

export function FinishForm({ finish, onAdd, onUpdate, onCancel, userId, editing = false }: FinishFormProps) {
	const [formData, setFormData] = useState<TileFinishFormData>({
		name: finish?.name ?? '',
		premium: finish?.premium ?? 0,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (finish && editing) {
			onUpdate?.({ ...formData, ...finish })
			return
		}
		onAdd?.({ ...formData, userId })
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{editing ? 'Edit Finish' : 'Add New Finish'}</CardTitle>
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
						<Label htmlFor='premium'>Premium</Label>
						<Input
							id='premium'
							type='number'
							step='0.01'
							value={formData.premium}
							onChange={e => setFormData(prev => ({ ...prev, premium: Number.parseFloat(e.target.value) }))}
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
