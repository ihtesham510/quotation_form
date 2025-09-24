import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus } from 'lucide-react'
import { ImportExportControls } from './import-export-controls'
import type { Material, Style, Size, Finish, MaterialsManagerProps } from './types'
import { FinishForm } from './forms/finish'
import { MaterialForm } from './forms/materials'
import { SizeForm } from './forms/size'
import { StyleForm } from './forms/style'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'

type EditingItem = (Material | Style | Size | Finish) & { type: string }

export function TileMaterialManager({ data, onAdd, onUpdate, onImport, onExport, userId }: MaterialsManagerProps) {
	const [editingItem, setEditingItem] = useState<EditingItem | null>(null)
	const [showAddForm, setShowAddForm] = useState<string | null>(null)
	// delete mutations
	const deleteMaterial = useMutation(api.tile_materials.delteMaterial)
	const deleteSize = useMutation(api.tile_materials.deleteSize)
	const deleteStyle = useMutation(api.tile_materials.deleteStyle)
	const deleteFinish = useMutation(api.tile_materials.deleteFinish)

	const handleEdit = (item: Material | Style | Size | Finish, type: string) => {
		setEditingItem({ ...item, type })
	}

	// Helper function to format size information
	const formatSizeInfo = (size: Size) => {
		const sizeData = size.size

		switch (sizeData.type) {
			case 'linear_meter':
				return `Linear Meter - $${sizeData.pricing.toFixed(2)}`
			case 'height_width':
				const priceType = sizeData.price_type === 'fixed_price' ? 'Fixed' : 'Multiplier'
				const priceValue =
					sizeData.price_type === 'fixed_price' ? `$${sizeData.pricing.toFixed(2)}` : `${sizeData.pricing}x`
				return `${sizeData.height}" × ${sizeData.width}" - ${priceType}: ${priceValue}`
			case 'custom':
				const customPriceType = sizeData.price_type === 'fixed_price' ? 'Fixed' : 'Multiplier'
				const customPriceValue =
					sizeData.price_type === 'fixed_price' ? `$${sizeData.pricing.toFixed(2)}` : `${sizeData.pricing}x`
				return `Custom - ${customPriceType}: ${customPriceValue}`
			default:
				return 'Unknown size type'
		}
	}

	const renderMaterials = () => (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold'>Materials</h3>
				<Button onClick={() => setShowAddForm('materials')}>
					<Plus className='w-4 h-4 mr-2' />
					Add Material
				</Button>
			</div>

			{showAddForm === 'materials' && (
				<MaterialForm
					userId={userId}
					styles={data.styles}
					sizes={data.sizes}
					finishes={data.finish}
					onAdd={data => {
						onAdd?.({ data, type: 'material' })
						setShowAddForm(null)
					}}
					onCancel={() => setShowAddForm(null)}
				/>
			)}

			{editingItem?.type === 'materials' && (
				<MaterialForm
					material={editingItem as Material}
					editing
					userId={userId}
					styles={data.styles}
					sizes={data.sizes}
					finishes={data.finish}
					onUpdate={data => {
						console.log(data)
						const { _creationTime, type, ...filteredData } = data as any
						console.log(filteredData)
						onUpdate?.({ data: filteredData, type: 'material' })
						setEditingItem(null)
					}}
					onCancel={() => setEditingItem(null)}
				/>
			)}

			<div className='grid gap-4'>
				{data.materials.map(material => (
					<Card key={material._id}>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div>
									<CardTitle>{material.name}</CardTitle>
									<CardDescription>Base Price: ${material.basePrice}</CardDescription>
								</div>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm' onClick={() => handleEdit(material, 'materials')}>
										<Edit className='w-4 h-4' />
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={async () =>
											await deleteMaterial({
												id: material._id,
											})
										}
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className='space-y-2'>
								<div>
									<Label className='text-sm font-medium'>Styles:</Label>
									<div className='flex flex-wrap gap-1 mt-1'>
										{material.styleIds.map(styleId => {
											const style = data.styles.find(s => s._id === styleId)
											return style ? (
												<Badge key={styleId} variant='secondary'>
													{style.name}
												</Badge>
											) : null
										})}
									</div>
								</div>
								<div>
									<Label className='text-sm font-medium'>Sizes:</Label>
									<div className='flex flex-wrap gap-1 mt-1'>
										{material.sizeIds.map(sizeId => {
											const size = data.sizes.find(s => s._id === sizeId)
											return size ? (
												<Badge key={sizeId} variant='outline'>
													{size.name}
												</Badge>
											) : null
										})}
									</div>
								</div>
								<div>
									<Label className='text-sm font-medium'>Finishes:</Label>
									<div className='flex flex-wrap gap-1 mt-1'>
										{material.finishIds.map(finishId => {
											const finish = data.finish.find(f => f._id === finishId)
											return finish ? (
												<Badge key={finishId} variant='default'>
													{finish.name}
												</Badge>
											) : null
										})}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)

	const renderStyles = () => (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold'>Styles</h3>
				<Button onClick={() => setShowAddForm('styles')}>
					<Plus className='w-4 h-4 mr-2' />
					Add Style
				</Button>
			</div>

			{showAddForm === 'styles' && (
				<StyleForm
					userId={userId}
					onAdd={data => {
						onAdd?.({ data, type: 'style' })
						setShowAddForm(null)
					}}
					onCancel={() => setShowAddForm(null)}
				/>
			)}

			{editingItem?.type === 'styles' && (
				<StyleForm
					style={editingItem as Style}
					editing
					userId={userId}
					onUpdate={data => {
						onUpdate?.({ data, type: 'style' })
						setEditingItem(null)
					}}
					onCancel={() => setEditingItem(null)}
				/>
			)}

			<div className='grid gap-4'>
				{data.styles.map(style => (
					<Card key={style._id}>
						<CardContent className='pt-6'>
							<div className='flex justify-between items-center'>
								<div>
									<h4 className='font-medium'>{style.name}</h4>
									<p className='text-sm text-muted-foreground'>Multiplier: {style.multiplier}x</p>
								</div>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm' onClick={() => handleEdit(style, 'styles')}>
										<Edit className='w-4 h-4' />
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={async () =>
											await deleteStyle({
												id: style._id,
											})
										}
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)

	const renderSizes = () => (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold'>Sizes</h3>
				<Button onClick={() => setShowAddForm('sizes')}>
					<Plus className='w-4 h-4 mr-2' />
					Add Size
				</Button>
			</div>

			{showAddForm === 'sizes' && (
				<SizeForm
					userId={userId}
					onAdd={data => {
						onAdd?.({ data, type: 'size' })
						setShowAddForm(null)
					}}
					onCancel={() => setShowAddForm(null)}
				/>
			)}

			{editingItem?.type === 'sizes' && (
				<SizeForm
					size={editingItem as Size}
					userId={userId}
					onUpdate={data => {
						onUpdate?.({ data, type: 'size' })
						setEditingItem(null)
					}}
					editing
					onCancel={() => setEditingItem(null)}
				/>
			)}

			<div className='grid gap-4'>
				{data.sizes.map(size => (
					<Card key={size._id}>
						<CardContent className='pt-6'>
							<div className='flex justify-between items-center'>
								<div>
									<h4 className='font-medium'>{size.name}</h4>
									<p className='text-sm text-muted-foreground'>{formatSizeInfo(size)}</p>
								</div>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm' onClick={() => handleEdit(size, 'sizes')}>
										<Edit className='w-4 h-4' />
									</Button>
									<Button
										variant='destructive'
										size='sm'
										onClick={async () =>
											await deleteSize({
												id: size._id,
											})
										}
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)

	const renderFinishes = () => (
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold'>Finishes</h3>
				<Button onClick={() => setShowAddForm('finishes')}>
					<Plus className='w-4 h-4 mr-2' />
					Add Finish
				</Button>
			</div>

			{showAddForm === 'finishes' && (
				<FinishForm
					userId={userId}
					onAdd={data => {
						onAdd?.({ data, type: 'finish' })
						setShowAddForm(null)
					}}
					onCancel={() => setShowAddForm(null)}
				/>
			)}

			{editingItem?.type === 'finishes' && (
				<FinishForm
					finish={editingItem as Finish}
					editing
					userId={userId}
					onUpdate={data => {
						onUpdate?.({ data, type: 'finish' })
						setEditingItem(null)
					}}
					onCancel={() => setEditingItem(null)}
				/>
			)}

			<div className='grid gap-4'>
				{data.finish.map(finish => (
					<Card key={finish._id}>
						<CardContent className='pt-6'>
							<div className='flex justify-between items-center'>
								<div>
									<h4 className='font-medium'>{finish.name}</h4>
									<p className='text-sm text-muted-foreground'>Premium: +${finish.premium}</p>
								</div>
								<div className='flex gap-2'>
									<Button variant='outline' size='sm' onClick={() => handleEdit(finish, 'finishes')}>
										<Edit className='w-4 h-4' />
									</Button>
									<Button variant='destructive' size='sm' onClick={async () => await deleteFinish({ id: finish._id })}>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	)

	return (
		<div className='container mx-auto p-6'>
			<div className='mb-6'>
				<h1 className='text-3xl font-bold'>Materials Management</h1>
				<p className='text-muted-foreground'>Manage your materials, styles, sizes, and finishes</p>
			</div>

			<ImportExportControls data={data} onImport={onImport} onExport={onExport} />

			<Tabs defaultValue='materials' className='mt-6'>
				<TabsList className='grid w-full grid-cols-4'>
					<TabsTrigger value='materials'>Materials</TabsTrigger>
					<TabsTrigger value='styles'>Styles</TabsTrigger>
					<TabsTrigger value='sizes'>Sizes</TabsTrigger>
					<TabsTrigger value='finishes'>Finishes</TabsTrigger>
				</TabsList>

				<TabsContent value='materials' className='mt-6'>
					{renderMaterials()}
				</TabsContent>

				<TabsContent value='styles' className='mt-6'>
					{renderStyles()}
				</TabsContent>

				<TabsContent value='sizes' className='mt-6'>
					{renderSizes()}
				</TabsContent>

				<TabsContent value='finishes' className='mt-6'>
					{renderFinishes()}
				</TabsContent>
			</Tabs>
		</div>
	)
}
