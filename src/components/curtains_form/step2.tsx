import type React from 'react'
import { useState } from 'react' // Import useState

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
	CommandSelect,
	type CommandSelectOption,
} from '@/components/ui/command-select'
import { Plus, Trash2, Calculator } from 'lucide-react'
import type { QuoteData, QuoteProduct, ProductDatabase, Id } from './types'
import { controlTypes } from './data'
import {
	calculateProductTotal,
	calculateProductGST,
	// calculateProductEffectiveBasePrice,
	calculateProductOriginalBasePrice,
} from './calculations'

interface Step2Props {
	quoteData: QuoteData
	setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
	errors: Record<string, string>
	productDatabase: ProductDatabase
}

type MeasurementUnit = 'm' | 'cm' | 'mm'

const convertToMeters = (value: number, unit: MeasurementUnit): number => {
	if (unit === 'cm') return value / 100
	if (unit === 'mm') return value / 1000
	return value // Already in meters
}

const convertFromMeters = (
	valueInMeters: number,
	unit: MeasurementUnit,
): number => {
	if (unit === 'cm') return valueInMeters * 100
	if (unit === 'mm') return valueInMeters * 1000
	return valueInMeters // Already in meters
}

export function Step2ProductSelection({
	quoteData,
	setQuoteData,
	errors,
	productDatabase,
}: Step2Props) {
	// State to manage the selected unit for each product's dimensions
	const [productUnits, setProductUnits] = useState<
		Record<string, MeasurementUnit>
	>({})

	const addProduct = () => {
		const newProduct: QuoteProduct = {
			id: Date.now().toString(),
			productId: productDatabase.products[0]._id,
			width: 1,
			height: 1,
			quantity: 1,
			color: 'White',
			controlType: 'Cord',
			installation: false,
			specialFeatures: '',
		}

		setQuoteData(prev => ({
			...prev,
			products: [...prev.products, newProduct],
		}))
		setProductUnits(prev => ({ ...prev, [newProduct.id]: 'm' })) // Default to meters
	}

	const updateProduct = (productId: string, updates: Partial<QuoteProduct>) => {
		setQuoteData(prev => ({
			...prev,
			products: prev.products.map(product =>
				product.id === productId ? { ...product, ...updates } : product,
			),
		}))
	}

	const removeProduct = (productId: string) => {
		setQuoteData(prev => ({
			...prev,
			products: prev.products.filter(product => product.id !== productId),
		}))
		setProductUnits(prev => {
			const newUnits = { ...prev }
			delete newUnits[productId]
			return newUnits
		})
	}

	const handleUnitChange = (productId: string, unit: MeasurementUnit) => {
		setProductUnits(prev => ({ ...prev, [productId]: unit }))
	}

	// Prepare category options for CommandSelect
	const categoryOptions: CommandSelectOption[] = productDatabase.categories.map(
		category => ({
			value: category._id,
			label: category.name,
			description: category.description,
		}),
	)

	// Get product options for a specific category
	const getProductOptions = (
		categoryId: Id<'categories'>,
	): CommandSelectOption[] => {
		return productDatabase.products
			.filter(product => product.categoryId === categoryId)
			.map(product => ({
				value: product._id,
				label: product.name,
				description: `$${product.basePrice}/${product.priceType}`,
			}))
	}

	return (
		<div className='space-y-6'>
			<h3 className='text-lg font-semibold'>Product Selection</h3>

			<div className='flex justify-end mb-4'>
				<Button onClick={addProduct} className='flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Add Product
				</Button>
			</div>

			{errors.products && (
				<Alert>
					<AlertDescription>{errors.products}</AlertDescription>
				</Alert>
			)}

			{quoteData.products.map((product, productIndex) => {
				const productInfo = productDatabase.products.find(
					p => p._id === product.productId,
				)
				const currentUnit = productUnits[product.id] || 'm' // Default to 'm' if not set
				const sqm = product.width * product.height
				const originalBasePrice = calculateProductOriginalBasePrice(
					product,
					productDatabase,
				)
				// const effectiveBasePrice = calculateProductEffectiveBasePrice(
				// 	product,
				// 	quoteData,
				// 	productDatabase,
				// )

				const baseTotal = calculateProductTotal(
					product,
					false,
					0,
					productDatabase,
					quoteData,
				)
				const gstAmount = calculateProductGST(
					product,
					quoteData.gstEnabled,
					quoteData.gstRate,
					productDatabase,
					quoteData,
				)
				const totalWithGST = calculateProductTotal(
					product,
					quoteData.gstEnabled,
					quoteData.gstRate,
					productDatabase,
					quoteData,
				)

				return (
					<Card key={product.id} className='mb-4'>
						<CardHeader>
							<div className='flex justify-between items-center'>
								<CardTitle className='text-base'>
									Product {productIndex + 1}
								</CardTitle>
								<Button
									variant='outline'
									size='sm'
									onClick={() => removeProduct(product.id)}
									className='text-red-600 hover:text-red-700'
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label>Category</Label>
									<CommandSelect
										options={categoryOptions}
										value={productInfo?.categoryId || ''}
										onValueChange={categoryId => {
											const firstProductInCategory =
												productDatabase.products.find(
													p => p.categoryId === categoryId,
												)
											if (firstProductInCategory) {
												updateProduct(product.id, {
													productId: firstProductInCategory._id,
												})
											}
										}}
										placeholder='Select category...'
										searchPlaceholder='Search categories...'
										emptyMessage='No category found.'
									/>
								</div>

								<div className='space-y-2'>
									<Label>Product</Label>
									<CommandSelect
										options={getProductOptions(
											productInfo?.categoryId ||
												productDatabase.categories[0]._id,
										)}
										value={product.productId}
										onValueChange={productId =>
											updateProduct(product.id, {
												productId: productId as Id<'products'>,
											})
										}
										placeholder='Select product...'
										searchPlaceholder='Search products...'
										emptyMessage='No product found.'
									/>
								</div>

								<div className='space-y-2'>
									<Label>Quantity</Label>
									<Input
										type='number'
										min='1'
										value={product.quantity}
										onChange={e =>
											updateProduct(product.id, {
												quantity: Number.parseInt(e.target.value) || 1,
											})
										}
									/>
								</div>
							</div>

							{productInfo?.priceType === 'sqm' && (
								<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
									<div className='space-y-2'>
										<Label>Width ({currentUnit}) *</Label>
										<Input
											type='number'
											step='0.01'
											min='0.01'
											value={convertFromMeters(product.width, currentUnit)}
											onChange={e =>
												updateProduct(product.id, {
													width: convertToMeters(
														Number.parseFloat(e.target.value) || 0,
														currentUnit,
													),
												})
											}
											className={
												errors[`product${productIndex}Width`]
													? 'border-red-500'
													: ''
											}
										/>
										{errors[`product${productIndex}Width`] && (
											<p className='text-red-500 text-sm'>
												{errors[`product${productIndex}Width`]}
											</p>
										)}
									</div>

									<div className='space-y-2'>
										<Label>Height ({currentUnit}) *</Label>
										<Input
											type='number'
											step='0.01'
											min='0.01'
											value={convertFromMeters(product.height, currentUnit)}
											onChange={e =>
												updateProduct(product.id, {
													height: convertToMeters(
														Number.parseFloat(e.target.value) || 0,
														currentUnit,
													),
												})
											}
											className={
												errors[`product${productIndex}Height`]
													? 'border-red-500'
													: ''
											}
										/>
										{errors[`product${productIndex}Height`] && (
											<p className='text-red-500 text-sm'>
												{errors[`product${productIndex}Height`]}
											</p>
										)}
									</div>

									<div className='space-y-2'>
										<Label>Unit</Label>
										<Select
											value={currentUnit}
											onValueChange={(value: MeasurementUnit) =>
												handleUnitChange(product.id, value)
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='m'>Meters (m)</SelectItem>
												<SelectItem value='cm'>Centimeters (cm)</SelectItem>
												<SelectItem value='mm'>Millimeters (mm)</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className='space-y-2'>
										<Label>Area</Label>
										<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
											<Calculator className='w-4 h-4 mr-2' />
											{sqm.toFixed(2)} sqm
										</div>
									</div>
								</div>
							)}

							{productInfo?.priceType === 'each' && (
								<div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
									<p className='text-sm text-blue-700'>
										<strong>Per Unit Pricing:</strong> This product is priced
										per unit. Dimensions are not required.
									</p>
								</div>
							)}

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Color/Finish</Label>
									<Input
										value={product.color}
										onChange={e =>
											updateProduct(product.id, { color: e.target.value })
										}
									/>
								</div>

								<div className='space-y-2'>
									<Label>Control Type</Label>
									<Select
										value={product.controlType}
										onValueChange={value =>
											updateProduct(product.id, { controlType: value })
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{controlTypes.map(type => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className='space-y-2'>
								<Label>Special Features</Label>
								<Textarea
									value={product.specialFeatures}
									onChange={e =>
										updateProduct(product.id, {
											specialFeatures: e.target.value,
										})
									}
									placeholder='Any special requirements or features...'
								/>
							</div>

							<div className='flex items-center space-x-2'>
								<Checkbox
									id={`installation-${product.id}`}
									checked={product.installation}
									onCheckedChange={checked =>
										updateProduct(product.id, {
											installation: checked as boolean,
										})
									}
								/>
								<Label htmlFor={`installation-${product.id}`}>
									Requires Installation
								</Label>
							</div>

							{productInfo?.specialConditions && (
								<Alert>
									<AlertDescription>
										<strong>Note:</strong> {productInfo.specialConditions}
									</AlertDescription>
								</Alert>
							)}

							<div className='flex justify-between items-center pt-2 border-t'>
								<div className='text-sm text-muted-foreground'>
									{productInfo?.priceType === 'sqm' &&
										productInfo.minimumQty > sqm && (
											<span>Minimum {productInfo.minimumQty} sqm applies</span>
										)}
									{productInfo?.priceType === 'each' &&
										productInfo.minimumQty > product.quantity && (
											<span>
												Minimum {productInfo.minimumQty} units required
											</span>
										)}
								</div>
								<div className='text-right'>
									{quoteData.markupEnabled && (
										<div className='text-sm text-muted-foreground'>
											Original: ${originalBasePrice.toFixed(2)}{' '}
											{productInfo?.priceType === 'sqm' ? '/sqm' : '/each'}
										</div>
									)}
									<div className='text-lg font-semibold'>
										${totalWithGST.toFixed(2)}
									</div>
									{quoteData.gstEnabled && (
										<div className='text-sm text-muted-foreground'>
											Base: ${baseTotal.toFixed(2)} + GST: $
											{gstAmount.toFixed(2)}
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				)
			})}

			{quoteData.products.length === 0 && (
				<div className='text-center py-8 text-muted-foreground'>
					No products added to this quote yet.
				</div>
			)}
		</div>
	)
}
