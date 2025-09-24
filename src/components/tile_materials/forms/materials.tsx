import type React from 'react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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

	const [openPopovers, setOpenPopovers] = useState({
		styles: false,
		sizes: false,
		finishes: false,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (editing && material) {
			const updated_values = { ...formData, ...material }
			console.log('updated_values', updated_values)
			onUpdate?.(updated_values)
			return
		}
		onAdd?.({ ...formData, userId })
	}

	const handleSelection = (id: string, type: 'styleIds' | 'sizeIds' | 'finishIds') => {
		setFormData(prev => ({
			...prev,
			[type]: prev[type].includes(id as any) ? prev[type].filter(itemId => itemId !== id) : [...prev[type], id],
		}))
	}

	const handleRemoveSelection = (id: string, type: 'styleIds' | 'sizeIds' | 'finishIds') => {
		setFormData(prev => ({
			...prev,
			[type]: prev[type].filter(itemId => itemId !== id),
		}))
	}

	const getSelectedItems = (type: 'styleIds' | 'sizeIds' | 'finishIds') => {
		const items = type === 'styleIds' ? styles : type === 'sizeIds' ? sizes : finishes
		return items.filter(item => formData[type].includes(item._id as any))
	}

	const MultiSelectPopover = ({
		items,
		selectedIds,
		type,
		placeholder,
		emptyText,
		popoverKey,
	}: {
		items: any[]
		selectedIds: string[]
		type: 'styleIds' | 'sizeIds' | 'finishIds'
		placeholder: string
		emptyText: string
		popoverKey: keyof typeof openPopovers
	}) => (
		<Popover
			open={openPopovers[popoverKey]}
			onOpenChange={open => setOpenPopovers(prev => ({ ...prev, [popoverKey]: open }))}
		>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					role='combobox'
					aria-expanded={openPopovers[popoverKey]}
					className='w-full justify-between'
				>
					{selectedIds.length > 0 ? `${selectedIds.length} selected` : placeholder}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-full p-0'>
				<Command>
					<CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{items.map(item => (
								<CommandItem key={item._id} value={item.name} onSelect={() => handleSelection(item._id, type)}>
									<Check className={cn('mr-2 h-4 w-4', selectedIds.includes(item._id) ? 'opacity-100' : 'opacity-0')} />
									{item.name}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)

	return (
		<Card>
			<CardHeader>
				<CardTitle>{editing ? 'Edit Material' : 'Add New Material'}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className='space-y-6'>
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
						<MultiSelectPopover
							items={styles}
							selectedIds={formData.styleIds}
							type='styleIds'
							placeholder='Select styles'
							emptyText='No styles found'
							popoverKey='styles'
						/>
						{formData.styleIds.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-2'>
								{getSelectedItems('styleIds').map(style => (
									<Badge key={style._id} variant='secondary' className='flex items-center gap-1'>
										{style.name}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={() => handleRemoveSelection(style._id, 'styleIds')}
										/>
									</Badge>
								))}
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<Label>Sizes</Label>
						<MultiSelectPopover
							items={sizes}
							selectedIds={formData.sizeIds}
							type='sizeIds'
							placeholder='Select sizes'
							emptyText='No sizes found'
							popoverKey='sizes'
						/>
						{formData.sizeIds.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-2'>
								{getSelectedItems('sizeIds').map(size => (
									<Badge key={size._id} variant='secondary' className='flex items-center gap-1'>
										{size.name}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={() => handleRemoveSelection(size._id, 'sizeIds')}
										/>
									</Badge>
								))}
							</div>
						)}
					</div>

					<div className='space-y-2'>
						<Label>Finishes</Label>
						<MultiSelectPopover
							items={finishes}
							selectedIds={formData.finishIds}
							type='finishIds'
							placeholder='Select finishes'
							emptyText='No finishes found'
							popoverKey='finishes'
						/>
						{formData.finishIds.length > 0 && (
							<div className='flex flex-wrap gap-2 mt-2'>
								{getSelectedItems('finishIds').map(finish => (
									<Badge key={finish._id} variant='secondary' className='flex items-center gap-1'>
										{finish.name}
										<X
											className='h-3 w-3 cursor-pointer hover:text-destructive'
											onClick={() => handleRemoveSelection(finish._id, 'finishIds')}
										/>
									</Badge>
								))}
							</div>
						)}
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
