import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
	ArrowLeft,
	ArrowRight,
	Home,
	Package,
	Plus,
	DollarSign,
	Eye,
} from 'lucide-react'
import type { QuoteData, QuoteCalculatedData, ProductDatabase } from './types'
import { Step1 } from './step1'
import { Step2 } from './step2'
import { Step3 } from './step3'
import { Step4 } from './step4'
import { Step5 } from './step5'
import { Step6 } from './step6'

export function CurtainsForm({
	onSaveQuote,
	onEmail,
	onPrint,
	onGeneratePDF,
	productDatabase,
}: {
	onSaveQuote?: (data: QuoteCalculatedData) => void
	onGeneratePDF?: (data: QuoteCalculatedData) => void
	onPrint?: (data: QuoteCalculatedData) => void
	onEmail?: (data: QuoteCalculatedData) => void
	productDatabase: ProductDatabase
}) {
	const [currentStep, setCurrentStep] = useState(1)
	const [quoteData, setQuoteData] = useState<QuoteData>({
		customer: {
			name: '',
			email: '',
			phone: '',
			address: '',
			projectAddress: '',
		},
		rooms: [],
		addOns: [],
		deliveryOption: 'standard',
		installationService: false,
		siteMeasurement: false,
		discountType: 'percentage',
		discountValue: 0,
		discountReason: '',
		taxRate: 10,
		paymentTerms: 'Net 30 days',
		quoteDate: new Date().toISOString().split('T')[0],
		gstEnabled: false,
		gstRate: 10,
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	const steps = [
		{ number: 1, title: 'Customer Info', icon: Home },
		{ number: 2, title: 'Room Setup', icon: Home },
		{ number: 3, title: 'Product Selection', icon: Package },
		{ number: 4, title: 'Add-ons & Services', icon: Plus },
		{ number: 5, title: 'Pricing & Discounts', icon: DollarSign },
		{ number: 6, title: 'Quote Preview', icon: Eye },
	]

	// Validation functions
	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {}

		switch (step) {
			case 1:
				if (!quoteData.customer.name)
					newErrors.customerName = 'Customer name is required'
				if (!quoteData.customer.email)
					newErrors.customerEmail = 'Email is required'
				if (!quoteData.customer.phone)
					newErrors.customerPhone = 'Phone is required'
				break
			case 2:
				if (quoteData.rooms.length === 0)
					newErrors.rooms = 'At least one room is required'
				break
			case 3:
				quoteData.rooms.forEach((room, roomIndex) => {
					if (room.products.length === 0) {
						newErrors[`room${roomIndex}Products`] =
							`${room.name} must have at least one product`
					}
					room.products.forEach((product, productIndex) => {
						if (!product.width || product.width <= 0) {
							newErrors[`room${roomIndex}Product${productIndex}Width`] =
								'Width must be greater than 0'
						}
						if (!product.height || product.height <= 0) {
							newErrors[`room${roomIndex}Product${productIndex}Height`] =
								'Height must be greater than 0'
						}
					})
				})
				break
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const nextStep = () => {
		if (validateStep(currentStep)) {
			setCurrentStep(prev => Math.min(prev + 1, 6))
		}
	}

	const prevStep = () => {
		setCurrentStep(prev => Math.max(prev - 1, 1))
	}

	const goToStep = (step: number) => {
		if (step <= currentStep || validateStep(currentStep)) {
			setCurrentStep(step)
		}
	}

	const renderStepContent = () => {
		switch (currentStep) {
			case 1:
				return (
					<Step1
						quoteData={quoteData}
						setQuoteData={setQuoteData}
						errors={errors}
					/>
				)
			case 2:
				return (
					<Step2
						quoteData={quoteData}
						setQuoteData={setQuoteData}
						errors={errors}
					/>
				)
			case 3:
				return (
					<Step3
						quoteData={quoteData}
						setQuoteData={setQuoteData}
						productDatabase={productDatabase}
						errors={errors}
					/>
				)
			case 4:
				return <Step4 quoteData={quoteData} setQuoteData={setQuoteData} />
			case 5:
				return (
					<Step5
						quoteData={quoteData}
						productDatabase={productDatabase}
						setQuoteData={setQuoteData}
					/>
				)
			case 6:
				return (
					<Step6
						productDatabase={productDatabase}
						quoteData={quoteData}
						onSaveQuote={onSaveQuote}
						onGeneratePDF={onGeneratePDF}
						onPrint={onPrint}
						onEmail={onEmail}
					/>
				)
			default:
				return null
		}
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto py-8'>
				<div className='mx-auto'>
					{/* Progress Indicator */}
					<div className='mb-8'>
						<div className='flex items-center justify-between mb-4'>
							{steps.map((step, index) => {
								const Icon = step.icon
								const isActive = currentStep === step.number
								const isCompleted = currentStep > step.number

								return (
									<div key={step.number} className='flex items-center'>
										<button
											onClick={() => goToStep(step.number)}
											className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
												isActive
													? 'border-primary bg-primary text-primary-foreground'
													: isCompleted
														? 'border-green-500 bg-green-500 text-white'
														: 'border-muted-foreground bg-background text-muted-foreground hover:border-primary'
											}`}
										>
											<Icon className='w-4 h-4' />
										</button>
										<div className='ml-2 hidden sm:block'>
											<div
												className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}
											>
												{step.title}
											</div>
										</div>
										{index < steps.length - 1 && (
											<div
												className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`}
											/>
										)}
									</div>
								)
							})}
						</div>
						<Progress value={(currentStep / 6) * 100} className='w-full' />
					</div>

					{/* Step Content */}
					<Card className='mb-8'>
						<CardContent className='p-6'>{renderStepContent()}</CardContent>
					</Card>

					{/* Navigation */}
					<div className='flex justify-between'>
						<Button
							onClick={prevStep}
							disabled={currentStep === 1}
							variant='outline'
							className='flex items-center gap-2 bg-transparent'
						>
							<ArrowLeft className='w-4 h-4' />
							Previous
						</Button>

						{currentStep < 6 && (
							<Button onClick={nextStep} className='flex items-center gap-2'>
								Next
								<ArrowRight className='w-4 h-4' />
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
