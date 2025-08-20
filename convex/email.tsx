import {
	Body,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Text,
	Row,
	Column,
	Hr,
	Tailwind,
} from '@react-email/components'
import type { DataModel } from './_generated/dataModel'

export const QuoteEmail = (props: {
	quoteData: Omit<DataModel['quotation']['document'], 'userId' | '_creationTime' | '_id'>
}) => {
	const { quoteData } = props

	const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
	const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString()

	return (
		<Html lang='en' dir='ltr'>
			<Tailwind>
				<Head />
				<Preview>Your Quote #{quoteData.id} - Thank you for your interest</Preview>
				<Body className='bg-gray-100 font-sans py-[40px]'>
					<Container className='bg-white mx-auto px-[32px] py-[40px] max-w-[600px] rounded-[8px] shadow-sm'>
						{/* Header */}
						<Section>
							<Heading className='text-[32px] font-bold text-gray-900 mb-[8px] text-center'>Quote Confirmation</Heading>
							<Text className='text-[16px] text-gray-600 text-center mb-[32px]'>Quote #{quoteData.id}</Text>
						</Section>

						{/* Customer Information */}
						<Section className='mb-[32px]'>
							<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] border-b border-gray-200 pb-[8px]'>
								Customer Details
							</Heading>
							<Row>
								<Column className='w-1/2'>
									<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Name:</Text>
									<Text className='text-[14px] text-gray-900 mb-[12px]'>{quoteData.customer.name}</Text>

									<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Email:</Text>
									<Text className='text-[14px] text-gray-900 mb-[12px]'>{quoteData.customer.email}</Text>

									<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Phone:</Text>
									<Text className='text-[14px] text-gray-900 mb-[12px]'>{quoteData.customer.phone}</Text>
								</Column>
								<Column className='w-1/2'>
									<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Quote Date:</Text>
									<Text className='text-[14px] text-gray-900 mb-[12px]'>{formatDate(quoteData.quoteDate)}</Text>

									<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Payment Terms:</Text>
									<Text className='text-[14px] text-gray-900 mb-[12px]'>{quoteData.paymentTerms}</Text>
								</Column>
							</Row>

							<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Billing Address:</Text>
							<Text className='text-[14px] text-gray-900 mb-[12px]'>{quoteData.customer.address}</Text>

							<Text className='text-[14px] text-gray-600 mb-[4px] font-semibold'>Project Address:</Text>
							<Text className='text-[14px] text-gray-900 mb-[12px]'>{quoteData.customer.projectAddress}</Text>
						</Section>

						{/* Products */}
						{quoteData.products.length > 0 && (
							<Section className='mb-[32px]'>
								<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] border-b border-gray-200 pb-[8px]'>
									Products
								</Heading>
								{quoteData.products.map(product => (
									<div key={product.id} className='mb-[20px] p-[16px] bg-gray-50 rounded-[8px]'>
										<Row className='mb-[8px]'>
											<Column className='w-2/3'>
												<Text className='text-[16px] font-semibold text-gray-900 mb-[4px]'>{product.name}</Text>
												<Text className='text-[14px] text-gray-600 mb-[8px]'>{product.categoryName}</Text>
											</Column>
											<Column className='w-1/3 text-right'>
												<Text className='text-[16px] font-bold text-gray-900'>{formatCurrency(product.total)}</Text>
											</Column>
										</Row>

										<Row className='text-[12px] text-gray-600'>
											<Column className='w-1/2'>
												<Text className='mb-[4px]'>
													Dimensions: {product.width}" × {product.height}"
												</Text>
												<Text className='mb-[4px]'>Quantity: {product.quantity}</Text>
												<Text className='mb-[4px]'>Color: {product.color}</Text>
											</Column>
											<Column className='w-1/2'>
												<Text className='mb-[4px]'>Control: {product.controlType}</Text>
												<Text className='mb-[4px]'>
													Installation: {product.installation ? 'Included' : 'Not included'}
												</Text>
												<Text className='mb-[4px]'>
													Price: {formatCurrency(product.effectivePrice)} per {product.priceType}
												</Text>
											</Column>
										</Row>

										{product.specialFeatures && (
											<Text className='text-[12px] text-gray-600 mt-[8px]'>
												Special Features: {product.specialFeatures}
											</Text>
										)}
									</div>
								))}
							</Section>
						)}

						{/* Add-ons */}
						{quoteData.addOns.length > 0 && (
							<Section className='mb-[32px]'>
								<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] border-b border-gray-200 pb-[8px]'>
									Add-ons
								</Heading>
								{quoteData.addOns.map(addon => (
									<div key={addon.id} className='mb-[16px] p-[16px] bg-blue-50 rounded-[8px]'>
										<Row>
											<Column className='w-2/3'>
												<Text className='text-[16px] font-semibold text-gray-900 mb-[4px]'>{addon.name}</Text>
												<Text className='text-[14px] text-gray-600 mb-[8px]'>{addon.description}</Text>
												<Text className='text-[12px] text-gray-600'>
													{addon.quantity} {addon.unitType} × {formatCurrency(addon.unitPrice)}
												</Text>
											</Column>
											<Column className='w-1/3 text-right'>
												<Text className='text-[16px] font-bold text-gray-900'>{formatCurrency(addon.total)}</Text>
											</Column>
										</Row>
									</div>
								))}
							</Section>
						)}

						{/* Custom Services */}
						{quoteData.customServices.length > 0 && (
							<Section className='mb-[32px]'>
								<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] border-b border-gray-200 pb-[8px]'>
									Custom Services
								</Heading>
								{quoteData.customServices.map(service => (
									<div key={service.id} className='mb-[16px] p-[16px] bg-green-50 rounded-[8px]'>
										<Row>
											<Column className='w-2/3'>
												<Text className='text-[16px] font-semibold text-gray-900 mb-[4px]'>{service.name}</Text>
												<Text className='text-[14px] text-gray-600'>{service.description}</Text>
											</Column>
											<Column className='w-1/3 text-right'>
												<Text className='text-[16px] font-bold text-gray-900'>{formatCurrency(service.total)}</Text>
											</Column>
										</Row>
									</div>
								))}
							</Section>
						)}

						{/* Pricing Summary */}
						<Section className='mb-[32px]'>
							<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] border-b border-gray-200 pb-[8px]'>
								Quote Summary
							</Heading>
							<div className='bg-gray-50 p-[20px] rounded-[8px]'>
								<Row className='mb-[8px]'>
									<Column className='w-2/3'>
										<Text className='text-[14px] text-gray-700'>Subtotal:</Text>
									</Column>
									<Column className='w-1/3 text-right'>
										<Text className='text-[14px] text-gray-900'>
											{formatCurrency(
												quoteData.pricing.subtotalBeforeMarkupAndDiscount + quoteData.pricing.totalMarkup,
											)}
										</Text>
									</Column>
								</Row>

								{quoteData.pricing.discountAmount > 0 && (
									<Row className='mb-[8px]'>
										<Column className='w-2/3'>
											<Text className='text-[14px] text-gray-700'>Discount ({quoteData.pricing.discountReason}):</Text>
										</Column>
										<Column className='w-1/3 text-right'>
											<Text className='text-[14px] text-red-600'>
												-{formatCurrency(quoteData.pricing.discountAmount)}
											</Text>
										</Column>
									</Row>
								)}

								{quoteData.pricing.gstEnabled && (
									<Row className='mb-[8px]'>
										<Column className='w-2/3'>
											<Text className='text-[14px] text-gray-700'>GST ({quoteData.pricing.gstRate}%):</Text>
										</Column>
										<Column className='w-1/3 text-right'>
											<Text className='text-[14px] text-gray-900'>{formatCurrency(quoteData.pricing.totalGST)}</Text>
										</Column>
									</Row>
								)}

								<Hr className='my-[12px] border-gray-300' />

								<Row>
									<Column className='w-2/3'>
										<Text className='text-[18px] font-bold text-gray-900'>Total Amount:</Text>
									</Column>
									<Column className='w-1/3 text-right'>
										<Text className='text-[18px] font-bold text-gray-900'>
											{formatCurrency(quoteData.pricing.grandTotal)}
										</Text>
									</Column>
								</Row>
							</div>
						</Section>

						{/* Footer */}
						<Hr className='border-gray-300 my-[32px]' />
						<Section>
							<Text className='text-[14px] text-gray-600 text-center mb-[16px]'>
								Thank you for choosing our services. This quote is valid for 30 days from the quote date.
							</Text>
							<Text className='text-[12px] text-gray-500 text-center mb-[8px]'>
								Questions? Contact us at support@company.com or call (555) 123-4567
							</Text>
							<Text className='text-[12px] text-gray-500 text-center m-0'>
								© {new Date().getFullYear()} Your Company Name. All rights reserved.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}

export const TileQuotationEmail = (props: {
	quotationData: Omit<DataModel['tile_quotation']['document'], '_id' | '_creationTime' | 'userId'>
}) => {
	const { quotationData } = props

	return (
		<Html lang='en' dir='ltr'>
			<Tailwind>
				<Head />
				<Preview>Your tile quotation is ready for confirmation</Preview>
				<Body className='bg-gray-100 font-sans py-[40px]'>
					<Container className='bg-white rounded-[8px] shadow-lg max-w-[600px] mx-auto p-[32px]'>
						{/* Header */}
						<Section className='text-center mb-[32px]'>
							<Heading className='text-[28px] font-bold text-gray-900 m-0 mb-[8px]'>Quotation Confirmation</Heading>
							<Text className='text-[16px] text-gray-600 m-0'>
								Please review and confirm your tile project quotation
							</Text>
						</Section>

						{/* Customer Information */}
						<Section className='mb-[32px]'>
							<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] m-0'>Customer Information</Heading>
							<div className='bg-gray-50 p-[16px] rounded-[8px]'>
								<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
									<strong>Name:</strong> {quotationData.customerInfo.name}
								</Text>
								<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
									<strong>Email:</strong> {quotationData.customerInfo.email}
								</Text>
								<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
									<strong>Phone:</strong> {quotationData.customerInfo.phone}
								</Text>
								<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
									<strong>Customer Address:</strong> {quotationData.customerInfo.customerAddress}
								</Text>
								{quotationData.customerInfo.projectAddress && (
									<Text className='text-[14px] text-gray-700 m-0'>
										<strong>Project Address:</strong> {quotationData.customerInfo.projectAddress}
									</Text>
								)}
							</div>
						</Section>

						{/* Material Items */}
						<Section className='mb-[32px]'>
							<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] m-0'>Selected Materials</Heading>
							{quotationData.selections.materialItems.map((item, index) => (
								<div key={index} className='border border-gray-200 rounded-[8px] p-[16px] mb-[12px]'>
									<Text className='text-[16px] font-semibold text-gray-900 m-0 mb-[8px]'>{item.label}</Text>
									<Row>
										<Column>
											{item.material && (
												<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
													<strong>Material:</strong> {item.material.name}
												</Text>
											)}
											{item.style && (
												<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
													<strong>Style:</strong> {item.style.name}
												</Text>
											)}
										</Column>
										<Column>
											{item.size && (
												<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
													<strong>Size:</strong> {item.size.name}
												</Text>
											)}
											{item.finish && (
												<Text className='text-[14px] text-gray-700 m-0 mb-[4px]'>
													<strong>Finish:</strong> {item.finish.name}
												</Text>
											)}
										</Column>
									</Row>
									<Text className='text-[14px] text-gray-700 m-0'>
										<strong>Square Footage:</strong> {item.squareFootage} sq ft
									</Text>
								</div>
							))}
						</Section>

						{/* Custom Items */}
						{quotationData.addOns.customItems.length > 0 && (
							<Section className='mb-[32px]'>
								<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] m-0'>Custom Items</Heading>
								{quotationData.addOns.customItems.map((item, index) => (
									<div key={index} className='border border-gray-200 rounded-[8px] p-[16px] mb-[12px]'>
										<Row>
											<Column>
												<Text className='text-[14px] font-semibold text-gray-900 m-0'>{item.name}</Text>
												<Text className='text-[14px] text-gray-600 m-0'>
													${item.price} per {item.unit}
												</Text>
											</Column>
											<Column className='text-right'>
												<Text className='text-[14px] text-gray-700 m-0'>Qty: {item.quantity}</Text>
												{item.measurement && (
													<Text className='text-[14px] text-gray-600 m-0'>
														{item.measurement} {item.unit}
													</Text>
												)}
											</Column>
										</Row>
									</div>
								))}
							</Section>
						)}

						{/* Custom Services */}
						{quotationData.addOns.customServices.length > 0 && (
							<Section className='mb-[32px]'>
								<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] m-0'>Additional Services</Heading>
								{quotationData.addOns.customServices.map((service, index) => (
									<div key={index} className='border border-gray-200 rounded-[8px] p-[16px] mb-[12px]'>
										<Row>
											<Column>
												<Text className='text-[14px] font-semibold text-gray-900 m-0'>{service.name}</Text>
											</Column>
											<Column className='text-right'>
												<Text className='text-[14px] text-gray-700 m-0'>${service.price.toFixed(2)}</Text>
											</Column>
										</Row>
									</div>
								))}
							</Section>
						)}

						{/* Pricing Breakdown */}
						<Section className='mb-[32px]'>
							<Heading className='text-[20px] font-bold text-gray-900 mb-[16px] m-0'>Pricing Summary</Heading>
							<div className='bg-gray-50 p-[16px] rounded-[8px]'>
								<Row className='mb-[8px]'>
									<Column>
										<Text className='text-[14px] text-gray-700 m-0'>Material Cost:</Text>
									</Column>
									<Column className='text-right'>
										<Text className='text-[14px] text-gray-700 m-0'>
											${quotationData.pricing.materialCost.toFixed(2)}
										</Text>
									</Column>
								</Row>

								{quotationData.pricing.markupAmount > 0 && (
									<Row className='mb-[8px]'>
										<Column>
											<Text className='text-[14px] text-gray-700 m-0'>Markup:</Text>
										</Column>
										<Column className='text-right'>
											<Text className='text-[14px] text-gray-700 m-0'>
												${quotationData.pricing.markupAmount.toFixed(2)}
											</Text>
										</Column>
									</Row>
								)}

								{quotationData.pricing.customItemsCost > 0 && (
									<Row className='mb-[8px]'>
										<Column>
											<Text className='text-[14px] text-gray-700 m-0'>Custom Items:</Text>
										</Column>
										<Column className='text-right'>
											<Text className='text-[14px] text-gray-700 m-0'>
												${quotationData.pricing.customItemsCost.toFixed(2)}
											</Text>
										</Column>
									</Row>
								)}

								{quotationData.pricing.customServicesCost > 0 && (
									<Row className='mb-[8px]'>
										<Column>
											<Text className='text-[14px] text-gray-700 m-0'>Additional Services:</Text>
										</Column>
										<Column className='text-right'>
											<Text className='text-[14px] text-gray-700 m-0'>
												${quotationData.pricing.customServicesCost.toFixed(2)}
											</Text>
										</Column>
									</Row>
								)}

								<Hr className='my-[12px]' />

								<Row className='mb-[8px]'>
									<Column>
										<Text className='text-[14px] font-semibold text-gray-900 m-0'>Subtotal:</Text>
									</Column>
									<Column className='text-right'>
										<Text className='text-[14px] font-semibold text-gray-900 m-0'>
											${quotationData.pricing.subtotal.toFixed(2)}
										</Text>
									</Column>
								</Row>

								{quotationData.pricingOptions.discount.enabled && quotationData.pricing.discountAmount > 0 && (
									<Row className='mb-[8px]'>
										<Column>
											<Text className='text-[14px] text-green-600 m-0'>Discount:</Text>
										</Column>
										<Column className='text-right'>
											<Text className='text-[14px] text-green-600 m-0'>
												-${quotationData.pricing.discountAmount.toFixed(2)}
											</Text>
										</Column>
									</Row>
								)}

								{quotationData.pricingOptions.gst.enabled && (
									<Row className='mb-[8px]'>
										<Column>
											<Text className='text-[14px] text-gray-700 m-0'>
												GST ({quotationData.pricingOptions.gst.percentage}%):
											</Text>
										</Column>
										<Column className='text-right'>
											<Text className='text-[14px] text-gray-700 m-0'>
												${quotationData.pricing.gstAmount.toFixed(2)}
											</Text>
										</Column>
									</Row>
								)}

								<Hr className='my-[12px]' />

								<Row>
									<Column>
										<Text className='text-[18px] font-bold text-gray-900 m-0'>Final Total:</Text>
									</Column>
									<Column className='text-right'>
										<Text className='text-[18px] font-bold text-blue-600 m-0'>
											${quotationData.pricing.finalTotal.toFixed(2)}
										</Text>
									</Column>
								</Row>
							</div>
						</Section>

						{/* Footer */}
						<Hr className='my-[32px]' />
						<Section className='text-center'>
							<Text className='text-[12px] text-gray-500 m-0 mb-[8px]'>
								Questions about your quotation? Reply to this email or contact us directly.
							</Text>
							<Text className='text-[12px] text-gray-500 m-0 mb-[8px]'>
								Tile Solutions Pro, 123 Business Street, Karachi, Pakistan
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
