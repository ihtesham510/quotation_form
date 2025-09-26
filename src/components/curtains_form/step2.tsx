import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CommandSelect, type CommandSelectOption } from '@/components/ui/command-select'
import { Plus, Trash2, Calculator, Edit, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import type { QuoteData, QuoteProduct, ProductDatabase, Id } from './types'
import { controlTypes } from './data'
import { calculateProductTotal, calculateProductGST } from './calculations'

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

const convertFromMeters = (valueInMeters: number, unit: MeasurementUnit): number => {
	if (unit === 'cm') return valueInMeters * 100
	if (unit === 'mm') return valueInMeters * 1000
	return valueInMeters // Already in meters
}

export function Step2ProductSelection({ quoteData, setQuoteData, errors, productDatabase }: Step2Props) {
	const [productUnits, setProductUnits] = useState<Record<string, MeasurementUnit>>({})
	const [editingProductId, setEditingProductId] = useState<string | null>(null)
	const [tempProductName, setTempProductName] = useState<string>('')
	const [matrixValidation, setMatrixValidation] = useState<Record<string, { isValid: boolean; message: string }>>({})

	const getDefaultMatrixDimensions = (productInfo: any) => {
		if (productInfo?.priceType === 'matrix' && productInfo.priceMatrix && productInfo.priceMatrix.length > 0) {
			const firstMatrix = productInfo.priceMatrix[0]
			return { width: firstMatrix.width, height: firstMatrix.height }
		}
		return { width: 0, height: 0 }
	}

	const addProduct = () => {
		const firstProduct = productDatabase.products[0]
		const defaultDimensions = getDefaultMatrixDimensions(firstProduct)

		const newProduct: QuoteProduct = {
			id: Date.now().toString(),
			productId: firstProduct._id,
			width: defaultDimensions.width || 1,
			height: defaultDimensions.height || 1,
			quantity: 1,
			color: 'White',
			controlType: 'Cord',
			installation: false,
			specialFeatures: '',
			label: `Product ${quoteData.products.length + 1}`,
		}

		setQuoteData(prev => ({
			...prev,
			products: [...prev.products, newProduct],
		}))
		setProductUnits(prev => ({ ...prev, [newProduct.id]: 'm' }))

		// Validate matrix dimensions for the new product
		if (firstProduct.priceType === 'matrix') {
			validateMatrixDimensions(newProduct.id, defaultDimensions.width || 0, defaultDimensions.height || 0, firstProduct)
		}
	}

	const validateMatrixDimensions = (productId: string, width: number, height: number, productInfo: any): boolean => {
		if (!productInfo || productInfo.priceType !== 'matrix') {
			// Clear validation for non-matrix products
			setMatrixValidation(prev => {
				const newValidation = { ...prev }
				delete newValidation[productId]
				return newValidation
			})
			return true
		}

		// If no price matrix exists, show error
		if (!productInfo.priceMatrix || productInfo.priceMatrix.length === 0) {
			setMatrixValidation(prev => ({
				...prev,
				[productId]: {
					isValid: false,
					message: 'No pricing matrix available for this product',
				},
			}))
			return false
		}

		// Check if exact dimensions exist in matrix
		const exactMatch = productInfo.priceMatrix.find((matrix: any) => matrix.width === width && matrix.height === height)

		if (exactMatch) {
			setMatrixValidation(prev => ({
				...prev,
				[productId]: {
					isValid: true,
					message: `Price available: $${exactMatch.price.toFixed(2)}`,
				},
			}))
			return true
		} else {
			const availableSizes = productInfo.priceMatrix
				.map((m: any) => `${m.width}m×${m.height}m ($${m.price})`)
				.join(', ')

			setMatrixValidation(prev => ({
				...prev,
				[productId]: {
					isValid: false,
					message: `No pricing available for ${width}m × ${height}m. Available sizes: ${availableSizes}`,
				},
			}))
			return false
		}
	}

	const updateProduct = (productId: string, updates: Partial<QuoteProduct>) => {
		// Handle product change - reset dimensions to matrix defaults
		if (updates.productId) {
			const newProductInfo = productDatabase.products.find(p => p._id === updates.productId)
			if (newProductInfo?.priceType === 'matrix') {
				const defaultDimensions = getDefaultMatrixDimensions(newProductInfo)
				updates.width = defaultDimensions.width || 0
				updates.height = defaultDimensions.height || 0
			}
		}

		setQuoteData(prev => ({
			...prev,
			products: prev.products.map(product => (product.id === productId ? { ...product, ...updates } : product)),
		}))

		// Validate matrix dimensions after update
		const currentProduct = quoteData.products.find(p => p.id === productId)
		if (currentProduct) {
			const productInfo = productDatabase.products.find(p => p._id === (updates.productId || currentProduct.productId))
			const newWidth = updates.width ?? currentProduct.width
			const newHeight = updates.height ?? currentProduct.height

			if (productInfo) {
				validateMatrixDimensions(productId, newWidth, newHeight, productInfo)
			}
		}
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
		setMatrixValidation(prev => {
			const newValidation = { ...prev }
			delete newValidation[productId]
			return newValidation
		})
	}

	const handleUnitChange = (productId: string, unit: MeasurementUnit) => {
		setProductUnits(prev => ({ ...prev, [productId]: unit }))
	}

	const handleEditClick = (productId: string, currentName: string) => {
		setEditingProductId(productId)
		setTempProductName(currentName)
	}

	const handleSave = (productId: string) => {
		const trimmedName = tempProductName.trim()
		if (trimmedName) {
			updateProduct(productId, { label: trimmedName })
		}
		setEditingProductId(null)
		setTempProductName('')
	}

	const handleCancel = () => {
		setEditingProductId(null)
		setTempProductName('')
	}

	const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTempProductName(e.target.value)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, productId: string) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSave(productId)
		} else if (e.key === 'Escape') {
			e.preventDefault()
			handleCancel()
		}
	}

	const categoryOptions: CommandSelectOption[] = productDatabase.categories.map(category => ({
		value: category._id,
		label: category.name,
		description: category.description,
	}))

	const getProductOptions = (categoryId: Id<'categories'>): CommandSelectOption[] => {
		return productDatabase.products
			.filter(product => product.categoryId === categoryId)
			.map(product => {
				return {
					value: product._id,
					label: product.name,
					description:
						product.priceType === 'matrix'
							? `${product.priceMatrix?.length} sizes`
							: `$${product.basePrice}/${product.priceType}`,
				}
			})
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h3 className='text-lg font-semibold'>Product Selection</h3>
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
				const productInfo = productDatabase.products.find(p => p._id === product.productId)
				const currentUnit = productUnits[product.id] || 'm'
				const sqm = product.width * product.height
				const baseTotal = calculateProductTotal(product, false, 0, productDatabase, quoteData)
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

				const currentProductName = product.label || productInfo?.name || `Product ${productIndex + 1}`
				const matrixStatus = matrixValidation[product.id]

				return (
					<Card key={product.id} className={`mb-4 ${matrixStatus && !matrixStatus.isValid ? 'border-red-500' : ''}`}>
						<CardHeader>
							<div className='flex justify-between items-start'>
								<div className='flex-1'>
									{editingProductId === product.id ? (
										<div className='flex items-center gap-2'>
											<Input
												value={tempProductName}
												onChange={handleNameInputChange}
												onKeyDown={e => handleKeyDown(e, product.id)}
												autoFocus
												onBlur={() => handleSave(product.id)}
												className='text-base font-bold max-w-md'
												placeholder='Enter product name...'
											/>
											<Button variant='ghost' size='sm' onClick={() => handleSave(product.id)}>
												<Save className='w-4 h-4' />
											</Button>
										</div>
									) : (
										<CardTitle className='text-base'>{currentProductName}</CardTitle>
									)}
								</div>
								<div className='flex gap-2'>
									{editingProductId !== product.id && (
										<Button variant='ghost' size='sm' onClick={() => handleEditClick(product.id, currentProductName)}>
											<Edit className='w-4 h-4' />
										</Button>
									)}
									<Button
										variant='ghost'
										size='sm'
										onClick={() => removeProduct(product.id)}
										className='text-red-600 hover:text-red-700'
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Product Selection Row */}
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label>Category</Label>
									<CommandSelect
										options={categoryOptions}
										value={productInfo?.categoryId || ''}
										onValueChange={categoryId => {
											const firstProductInCategory = productDatabase.products.find(p => p.categoryId === categoryId)
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
										options={getProductOptions(productInfo?.categoryId || productDatabase.categories[0]._id)}
										value={product.productId}
										onValueChange={productId => {
											updateProduct(product.id, {
												productId: productId as Id<'products'>,
											})
										}}
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

							{/* Dimensions Section */}
							{(productInfo?.priceType === 'sqm' || productInfo?.priceType === 'matrix') && (
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
										<div className='space-y-2'>
											<Label>Width ({currentUnit}) *</Label>
											<Input
												type='number'
												step='0.01'
												min='0.001'
												value={convertFromMeters(product.width, currentUnit)}
												onChange={e => {
													const newWidth = convertToMeters(Number.parseFloat(e.target.value) || 0, currentUnit)
													updateProduct(product.id, { width: newWidth })
												}}
												className={errors[`product${productIndex}Width`] ? 'border-red-500' : ''}
											/>
											{errors[`product${productIndex}Width`] && (
												<p className='text-red-500 text-sm'>{errors[`product${productIndex}Width`]}</p>
											)}
										</div>

										<div className='space-y-2'>
											<Label>Height ({currentUnit}) *</Label>
											<Input
												type='number'
												step='0.01'
												min='0.01'
												value={convertFromMeters(product.height, currentUnit)}
												onChange={e => {
													const newHeight = convertToMeters(Number.parseFloat(e.target.value) || 0, currentUnit)
													updateProduct(product.id, { height: newHeight })
												}}
												className={errors[`product${productIndex}Height`] ? 'border-red-500' : ''}
											/>
											{errors[`product${productIndex}Height`] && (
												<p className='text-red-500 text-sm'>{errors[`product${productIndex}Height`]}</p>
											)}
										</div>

										<div className='space-y-2'>
											<Label>Unit</Label>
											<Select
												value={currentUnit}
												onValueChange={(value: MeasurementUnit) => handleUnitChange(product.id, value)}
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

										{productInfo?.priceType === 'sqm' && (
											<div className='space-y-2'>
												<Label>Area</Label>
												<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
													<Calculator className='w-4 h-4 mr-2' />
													{sqm.toFixed(2)} sqm
												</div>
											</div>
										)}
									</div>

									{/* Matrix Pricing Validation */}
									{productInfo?.priceType === 'matrix' && matrixStatus && (
										<Alert variant={matrixStatus.isValid ? 'default' : 'destructive'}>
											{matrixStatus.isValid ? (
												<CheckCircle className='h-4 w-4' />
											) : (
												<AlertTriangle className='h-4 w-4' />
											)}
											<AlertDescription>{matrixStatus.message}</AlertDescription>
										</Alert>
									)}
								</div>
							)}

							{/* Linear Meter Dimensions Section */}
							{productInfo?.priceType === 'linear_meter' && (
								<div className='space-y-4'>
									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<div className='space-y-2'>
											<Label>Linear Meters ({currentUnit}) *</Label>
											<Input
												type='number'
												step='0.01'
												min='0.001'
												value={convertFromMeters(product.width, currentUnit)}
												onChange={e => {
													const newWidth = convertToMeters(Number.parseFloat(e.target.value) || 0, currentUnit)
													updateProduct(product.id, { width: newWidth })
												}}
												className={errors[`product${productIndex}Width`] ? 'border-red-500' : ''}
											/>
											{errors[`product${productIndex}Width`] && (
												<p className='text-red-500 text-sm'>{errors[`product${productIndex}Width`]}</p>
											)}
										</div>

										<div className='space-y-2'>
											<Label>Unit</Label>
											<Select
												value={currentUnit}
												onValueChange={(value: MeasurementUnit) => handleUnitChange(product.id, value)}
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
											<Label>Total Length</Label>
											<div className='flex items-center h-10 px-3 border rounded-md bg-muted'>
												<Calculator className='w-4 h-4 mr-2' />
												{convertFromMeters(product.width, currentUnit).toFixed(2)} {currentUnit}
											</div>
										</div>
									</div>

									<Alert>
										<AlertDescription>
											<strong>Linear Meter Pricing:</strong> This product is priced per linear meter. Enter the total
											length required.
										</AlertDescription>
									</Alert>
								</div>
							)}

							{/* Per Unit Pricing Info */}
							{productInfo?.priceType === 'each' && (
								<Alert>
									<AlertDescription>
										<strong>Per Unit Pricing:</strong> This product is priced per unit. Dimensions are not required.
									</AlertDescription>
								</Alert>
							)}

							{/* Product Details */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='space-y-2'>
									<Label>Color/Finish</Label>
									<Input value={product.color} onChange={e => updateProduct(product.id, { color: e.target.value })} />
								</div>

								<div className='space-y-2'>
									<Label>Control Type</Label>
									<Select
										value={product.controlType}
										onValueChange={value => updateProduct(product.id, { controlType: value })}
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

							{/* Notes */}
							<div className='space-y-2'>
								<Label htmlFor={`notes-${product.id}`}>Notes</Label>
								<Textarea
									id={`notes-${product.id}`}
									value={product.specialFeatures}
									onChange={e => updateProduct(product.id, { specialFeatures: e.target.value })}
									placeholder='Any special requirements or notes...'
								/>
							</div>

							{/* Installation Checkbox */}
							<div className='flex items-center space-x-2'>
								<Checkbox
									id={`installation-${product.id}`}
									checked={product.installation}
									onCheckedChange={checked => updateProduct(product.id, { installation: checked as boolean })}
								/>
								<Label htmlFor={`installation-${product.id}`}>Requires Installation</Label>
							</div>

							{/* Special Conditions */}
							{productInfo?.specialConditions && (
								<Alert>
									<AlertDescription>
										<strong>Note:</strong> {productInfo.specialConditions}
									</AlertDescription>
								</Alert>
							)}

							{/* Pricing Summary */}
							<div className='flex justify-between items-center pt-4 border-t'>
								<div className='text-sm text-muted-foreground'>
									{productInfo?.priceType === 'sqm' && productInfo.minimumQty > sqm && (
										<span>Minimum {productInfo.minimumQty} sqm applies</span>
									)}
									{productInfo?.priceType === 'each' && productInfo.minimumQty > product.quantity && (
										<span>Minimum {productInfo.minimumQty} units required</span>
									)}
									{productInfo?.priceType === 'linear_meter' && productInfo.minimumQty > product.width && (
										<span>Minimum {productInfo.minimumQty} linear meters applies</span>
									)}
									{productInfo?.priceType === 'matrix' && matrixStatus && !matrixStatus.isValid && (
										<span className='text-red-500'>Invalid dimensions - no pricing available</span>
									)}
								</div>

								<div className='text-right'>
									<div className='text-lg font-semibold'>${totalWithGST.toFixed(2)}</div>
									{quoteData.gstEnabled && (
										<div className='text-sm text-muted-foreground'>
											Base: ${baseTotal.toFixed(2)} + GST: ${gstAmount.toFixed(2)}
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
					<p>No products added to this quote yet.</p>
					<Button onClick={addProduct} variant='outline' className='mt-4'>
						<Plus className='w-4 h-4 mr-2' />
						Add Your First Product
					</Button>
				</div>
			)}
		</div>
	)
}
