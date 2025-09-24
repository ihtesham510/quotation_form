import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { productSchema, type ProductFormValues } from './schemas'
import type { Product, Category } from './types'
import { Check, ChevronsUpDown, Plus, Trash2, Info } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface ProductFormSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSave: (data: ProductFormValues) => void
	categories: Category[]
	defaultValues?: Product
}

export function ProductFormSheet({ open, onOpenChange, onSave, categories, defaultValues }: ProductFormSheetProps) {
	const isEditing = !!defaultValues

	const form = useForm<ProductFormValues>({
		resolver: zodResolver(productSchema),
		defaultValues: {
			categoryId: defaultValues?.categoryId || ('' as Id<'categories'>),
			name: defaultValues?.name || '',
			priceType: defaultValues?.priceType || 'each',
			basePrice: defaultValues?.basePrice || 0.01,
			minimumQty: defaultValues?.minimumQty || 1,
			leadTime: defaultValues?.leadTime || '',
			specialConditions: defaultValues?.specialConditions || '',
			priceMatrix: defaultValues?.priceMatrix || [],
		},
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'priceMatrix',
	})

	const watchedPriceType = form.watch('priceType')

	const validatePriceMatrix = (data: ProductFormValues) => {
		if (data.priceType !== 'matrix') return true

		const { priceMatrix } = data
		if (!priceMatrix || priceMatrix.length === 0) {
			form.setError('priceMatrix', {
				type: 'manual',
				message: 'At least one price matrix entry is required for matrix pricing',
			})
			return false
		}
		const duplicates = new Set()
		for (let i = 0; i < priceMatrix.length; i++) {
			const entry = priceMatrix[i]
			const key = `${entry.width}-${entry.height}`

			if (duplicates.has(key)) {
				form.setError(`priceMatrix.${i}`, {
					type: 'manual',
					message: 'Duplicate dimensions detected',
				})
				return false
			}
			duplicates.add(key)
			if (entry.width <= 0 || entry.height <= 0 || entry.price <= 0) {
				form.setError(`priceMatrix.${i}`, {
					type: 'manual',
					message: 'Width, height, and price must be greater than 0',
				})
				return false
			}
		}

		return true
	}

	const handleSave = async (data: ProductFormValues) => {
		try {
			console.log('Form data before validation:', data)

			form.clearErrors()
			if (data.priceType !== 'matrix') {
				data.priceMatrix = []
			} else {
				if (!validatePriceMatrix(data)) {
					console.log('Price matrix validation failed')
					return
				}
			}

			console.log('Form data after cleanup:', data)
			console.log('Submitting form...')

			onSave(data)
			form.reset()
			onOpenChange(false)

			console.log('Form submitted successfully')
		} catch (error) {
			console.error('Form submission error:', error)
			toast.error('Failed to save product. Please try again.')
		}
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset()
			form.clearErrors()
		}
		onOpenChange(newOpen)
	}

	const addMatrixEntry = () => {
		append({ width: 0, height: 0, price: 0 })
	}

	const removeMatrixEntry = (index: number) => {
		remove(index)
		form.clearErrors(`priceMatrix.${index}`)
	}

	useEffect(() => {
		if (watchedPriceType !== 'matrix' && fields.length > 0) {
			for (let i = fields.length - 1; i >= 0; i--) {
				remove(i)
			}
		}
	}, [watchedPriceType, fields.length, remove])

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className='w-full sm:max-w-[640px] flex flex-col h-full'>
				<SheetHeader className='flex-shrink-0 px-6 pt-6'>
					<SheetTitle>{isEditing ? 'Edit Product' : 'Add Product'}</SheetTitle>
					<SheetDescription>
						{isEditing ? 'Update the product details below.' : 'Create a new product in your catalog.'}
					</SheetDescription>
				</SheetHeader>

				<div className='flex-1 flex flex-col min-h-0'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleSave)} className='flex flex-col h-full'>
							<div className='flex-1 overflow-y-auto px-6 py-4'>
								<div className='space-y-6'>
									{/* Basic Product Information */}
									<FormField
										control={form.control}
										name='name'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Product Name</FormLabel>
												<FormControl>
													<Input placeholder='Enter product name' {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name='categoryId'
										render={({ field }) => (
											<FormItem className='flex flex-col'>
												<FormLabel>Category</FormLabel>
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant='outline'
																role='combobox'
																className={cn('justify-between', !field.value && 'text-muted-foreground')}
															>
																{field.value
																	? categories.find(category => category._id === field.value)?.name
																	: 'Select category'}
																<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className='w-[calc(100vw-3rem)] sm:w-full p-0' align='start'>
														<Command>
															<CommandInput placeholder='Search categories...' />
															<CommandList>
																<CommandEmpty>No category found.</CommandEmpty>
																<CommandGroup>
																	{categories.map(category => (
																		<CommandItem
																			value={category.name}
																			key={category._id}
																			onSelect={() => {
																				field.onChange(category._id)
																			}}
																		>
																			<Check
																				className={cn(
																					'mr-2 h-4 w-4',
																					category._id === field.value ? 'opacity-100' : 'opacity-0',
																				)}
																			/>
																			<div className='flex flex-col'>
																				<span className='font-medium'>{category.name}</span>
																				<span className='text-sm text-muted-foreground'>{category.description}</span>
																			</div>
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Pricing Configuration */}
									<div className='space-y-4'>
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
											<FormField
												control={form.control}
												name='priceType'
												render={({ field }) => (
													<FormItem>
														<FormLabel>Price Type</FormLabel>
														<Select onValueChange={field.onChange} value={field.value}>
															<FormControl>
																<SelectTrigger>
																	<SelectValue />
																</SelectTrigger>
															</FormControl>
															<SelectContent>
																<SelectItem value='each'>Per Each</SelectItem>
																<SelectItem value='sqm'>Per SQM</SelectItem>
																<SelectItem value='matrix'>Matrix Pricing</SelectItem>
															</SelectContent>
														</Select>
														<FormMessage />
													</FormItem>
												)}
											/>

											{watchedPriceType !== 'matrix' && (
												<FormField
													control={form.control}
													name='basePrice'
													render={({ field }) => (
														<FormItem>
															<FormLabel>Base Price</FormLabel>
															<FormControl>
																<Input
																	type='number'
																	step='0.01'
																	min='0'
																	placeholder='0.00'
																	{...field}
																	onChange={e => field.onChange(Number.parseFloat(e.target.value) || 0)}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											)}
										</div>

										{/* Price Type Information */}
										<Alert>
											<Info className='h-4 w-4' />
											<AlertDescription>
												{watchedPriceType === 'each' && 'Product will be priced per unit. No dimensions required.'}
												{watchedPriceType === 'sqm' && 'Product will be priced per square meter. Dimensions required.'}
												{watchedPriceType === 'matrix' &&
													'Product will use dimension-specific pricing. Configure the price matrix below.'}
											</AlertDescription>
										</Alert>
									</div>

									{/* Price Matrix Configuration */}
									{watchedPriceType === 'matrix' && (
										<div className='space-y-4'>
											<div className='flex justify-between items-center'>
												<div>
													<h4 className='text-sm font-medium'>Price Matrix</h4>
													<p className='text-sm text-muted-foreground'>
														Configure specific prices for different dimensions
													</p>
												</div>
												<Button type='button' variant='outline' size='sm' onClick={addMatrixEntry}>
													<Plus className='w-4 h-4 mr-2' />
													Add Size
												</Button>
											</div>

											{form.formState.errors.priceMatrix && (
												<Alert variant='destructive'>
													<AlertDescription>{form.formState.errors.priceMatrix.message}</AlertDescription>
												</Alert>
											)}

											{fields.length === 0 && (
												<Alert>
													<AlertDescription>
														No price matrix entries configured. Add at least one size/price combination.
													</AlertDescription>
												</Alert>
											)}

											<div className='space-y-3 max-h-60 overflow-y-auto'>
												{fields.map((field, index) => (
													<Card key={field.id} className='p-4'>
														<div className='grid grid-cols-4 gap-3 items-start'>
															<FormField
																control={form.control}
																name={`priceMatrix.${index}.width`}
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className='text-xs'>Width (m)</FormLabel>
																		<FormControl>
																			<Input
																				type='number'
																				step='0.01'
																				min='0'
																				placeholder='0.00'
																				{...field}
																				onChange={e => field.onChange(Number.parseFloat(e.target.value) || 0)}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name={`priceMatrix.${index}.height`}
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className='text-xs'>Height (m)</FormLabel>
																		<FormControl>
																			<Input
																				type='number'
																				step='0.01'
																				min='0'
																				placeholder='0.00'
																				{...field}
																				onChange={e => field.onChange(Number.parseFloat(e.target.value) || 0)}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
															<FormField
																control={form.control}
																name={`priceMatrix.${index}.price`}
																render={({ field }) => (
																	<FormItem>
																		<FormLabel className='text-xs'>Price ($)</FormLabel>
																		<FormControl>
																			<Input
																				type='number'
																				step='0.01'
																				min='0'
																				placeholder='0.00'
																				{...field}
																				onChange={e => field.onChange(Number.parseFloat(e.target.value) || 0)}
																			/>
																		</FormControl>
																		<FormMessage />
																	</FormItem>
																)}
															/>
															<div className='flex items-end pb-1'>
																<Button
																	type='button'
																	variant='ghost'
																	size='sm'
																	onClick={() => removeMatrixEntry(index)}
																	className='text-red-600 hover:text-red-700'
																>
																	<Trash2 className='w-4 h-4' />
																</Button>
															</div>
														</div>
														{form.formState.errors.priceMatrix?.[index] && (
															<p className='text-red-500 text-xs mt-2'>
																{form.formState.errors.priceMatrix[index]?.message}
															</p>
														)}
													</Card>
												))}
											</div>
										</div>
									)}

									{/* Other Product Details */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
										<FormField
											control={form.control}
											name='minimumQty'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Minimum Quantity</FormLabel>
													<FormControl>
														<Input
															type='number'
															min='1'
															placeholder='1'
															{...field}
															onChange={e => field.onChange(Number.parseInt(e.target.value) || 1)}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='leadTime'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Lead Time</FormLabel>
													<FormControl>
														<Input placeholder='e.g., 2-3 weeks' {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name='specialConditions'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Special Conditions</FormLabel>
												<FormControl>
													<Textarea
														placeholder='Enter any special conditions or notes'
														className='min-h-[100px] resize-none'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>

							<SheetFooter className='flex-shrink-0 px-6 pb-6 pt-4 border-t bg-background'>
								<Button type='submit' disabled={form.formState.isSubmitting} className='w-full'>
									{form.formState.isSubmitting
										? isEditing
											? 'Updating...'
											: 'Creating...'
										: isEditing
											? 'Update Product'
											: 'Create Product'}
								</Button>
							</SheetFooter>
						</form>
					</Form>
				</div>
			</SheetContent>
		</Sheet>
	)
}
