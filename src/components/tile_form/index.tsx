import { useState, useEffect } from 'react'
import { StepNavigation } from './step-navigation'
import { Step1 } from './step1'
import { Step2 } from './step2'
import { Step3 } from './step3'
import { Step4 } from './step4'
import { Step5 } from './step5'
import { calculateQuotationPricing } from './calculations'
import {
	validateCustomerInfo,
	validateMaterialSelections,
	validateAddOns,
	validatePricingOptions,
	validateCompleteForm,
	canNavigateToStep,
} from './validation'
import type {
	TileQuotationIndexProps,
	FormData,
	CustomerInfo,
	Selections,
	AddOns,
	PricingOptions,
	CalculationResult,
	QuotationData,
} from './types'
import { toast } from 'sonner'
import { filterQuotationData } from './utils'

const stepLabels = ['Customer Info', 'Material Selection', 'Add-ons', 'Discount & GST', 'Review']

export function TileQuotation({ tileData, onSave, onEmail, onGeneratePDF }: TileQuotationIndexProps) {
	const [currentStep, setCurrentStep] = useState(1)
	const [formData, setFormData] = useState<FormData>({
		customerInfo: {
			name: '',
			email: '',
			phone: '',
			customerAddress: '',
			projectAddress: '',
		},
		selections: {
			materialItems: [],
		},
		addOns: {
			markup: undefined,
			customItems: [],
			customServices: [],
		},
		pricingOptions: {
			discount: {
				enabled: false,
				value: 0,
			},
			gst: {
				enabled: false,
				percentage: 13,
			},
		},
	})

	const [pricing, setPricing] = useState<CalculationResult>({
		materialCost: 0,
		markupAmount: 0,
		customItemsCost: 0,
		customServicesCost: 0,
		subtotal: 0,
		discountAmount: 0,
		afterDiscount: 0,
		gstAmount: 0,
		finalTotal: 0,
		breakdown: {
			tileTotal: 0,
			tileGST: 0,
			customItemsGST: 0,
			customServicesGST: 0,
		},
	})

	const [errors, setErrors] = useState<Record<string, Record<string, string>>>({
		step1: {},
		step2: {},
		step3: {},
		step4: {},
		step5: {},
	})

	// Calculate pricing whenever form data changes
	useEffect(() => {
		const newPricing = calculateQuotationPricing(formData.selections, formData.addOns, formData.pricingOptions)
		setPricing(newPricing)
	}, [formData.selections, formData.addOns, formData.pricingOptions])

	const validateStep1 = (): boolean => {
		const validation = validateCustomerInfo(formData.customerInfo)
		setErrors(prev => ({ ...prev, step1: validation.errors }))
		return validation.isValid
	}

	const validateStep2 = (): boolean => {
		const validation = validateMaterialSelections(formData.selections)
		setErrors(prev => ({ ...prev, step2: validation.errors }))
		return validation.isValid
	}

	const validateStep3 = (): boolean => {
		const validation = validateAddOns(formData.addOns)
		setErrors(prev => ({ ...prev, step3: validation.errors }))
		return validation.isValid
	}

	const validateStep4 = (): boolean => {
		const validation = validatePricingOptions(formData.pricingOptions)
		setErrors(prev => ({ ...prev, step4: validation.errors }))
		return validation.isValid
	}

	// Event handlers
	const handleCustomerInfoChange = (customerInfo: CustomerInfo) => {
		setFormData(prev => ({ ...prev, customerInfo }))
	}

	const handleSelectionsChange = (selections: Selections) => {
		setFormData(prev => ({ ...prev, selections }))
	}

	const handleAddOnsChange = (addOns: AddOns) => {
		setFormData(prev => ({ ...prev, addOns }))
	}

	const handlePricingOptionsChange = (pricingOptions: PricingOptions) => {
		setFormData(prev => ({ ...prev, pricingOptions }))
	}

	const handleNext = () => {
		let isValid = true

		switch (currentStep) {
			case 1:
				isValid = validateStep1()
				break
			case 2:
				isValid = validateStep2()
				break
			case 3:
				isValid = validateStep3()
				break
			case 4:
				isValid = validateStep4()
				break
			default:
				isValid = true
		}

		if (isValid && currentStep < 5) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePrevious = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleStepJump = (step: number) => {
		const canNavigate = canNavigateToStep(
			step,
			formData.customerInfo,
			formData.selections,
			formData.addOns,
			formData.pricingOptions,
		)

		if (canNavigate || step === currentStep) {
			setCurrentStep(step)
		}
	}

	const canUserNavigateToStep = (step: number): boolean => {
		return canNavigateToStep(step, formData.customerInfo, formData.selections, formData.addOns, formData.pricingOptions)
	}

	// Generate quotation data for callbacks
	const generateQuotationData = (): QuotationData => {
		return {
			customerInfo: formData.customerInfo,
			selections: formData.selections,
			addOns: formData.addOns,
			pricingOptions: formData.pricingOptions,
			pricing: pricing,
		}
	}

	const handleSave = () => {
		const validation = validateCompleteForm(
			formData.customerInfo,
			formData.selections,
			formData.addOns,
			formData.pricingOptions,
		)

		if (!validation.isValid) {
			toast.error('Please fix all validation errors before saving.')
			return
		}

		const quotationData = generateQuotationData()
		console.log('[v0] Saving quotation:', quotationData)
		onSave?.(filterQuotationData(quotationData))
	}

	const handleEmail = () => {
		const validation = validateCompleteForm(
			formData.customerInfo,
			formData.selections,
			formData.addOns,
			formData.pricingOptions,
		)

		if (!validation.isValid) {
			toast.error('Please fix all validation errors before emailing.')
			return
		}

		const quotationData = generateQuotationData()
		console.log('[v0] Emailing quotation:', quotationData)
		onEmail?.(filterQuotationData(quotationData))
	}

	const handleGeneratePDF = () => {
		const validation = validateCompleteForm(
			formData.customerInfo,
			formData.selections,
			formData.addOns,
			formData.pricingOptions,
		)

		if (!validation.isValid) {
			toast.error('Please fix all validation errors before generating PDF.')
			return
		}

		const quotationData = generateQuotationData()
		console.log('[v0] Generating PDF for quotation:', quotationData)
		onGeneratePDF?.(quotationData)
	}

	const step1Valid = validateCustomerInfo(formData.customerInfo).isValid
	const step2Valid = validateMaterialSelections(formData.selections).isValid

	return (
		<div className='mx-auto'>
			<div className='mb-8'>
				<h1 className='text-3xl font-boldmb-2'>Tile Quotation System</h1>
				<p className='description'>Create professional tile quotations with ease</p>
			</div>

			<StepNavigation
				currentStep={currentStep}
				totalSteps={5}
				stepLabels={stepLabels}
				onStepChange={handleStepJump}
				canNavigateToStep={canUserNavigateToStep}
			/>

			<div className='mt-8'>
				{currentStep === 1 && (
					<Step1
						customerInfo={formData.customerInfo}
						onCustomerInfoChange={handleCustomerInfoChange}
						onNext={handleNext}
						isValid={step1Valid}
						errors={errors.step1}
					/>
				)}

				{currentStep === 2 && (
					<Step2
						materials={tileData.materials}
						styles={tileData.styles}
						sizes={tileData.sizes}
						finishes={tileData.finishes}
						selections={formData.selections}
						onSelectionsChange={handleSelectionsChange}
						onNext={handleNext}
						onPrevious={handlePrevious}
						pricing={pricing}
						isValid={step2Valid}
						errors={errors.step2}
					/>
				)}

				{currentStep === 3 && (
					<Step3
						addOns={formData.addOns}
						onAddOnsChange={handleAddOnsChange}
						onNext={handleNext}
						onPrevious={handlePrevious}
						pricing={pricing}
					/>
				)}

				{currentStep === 4 && (
					<Step4
						pricingOptions={formData.pricingOptions}
						onPricingOptionsChange={handlePricingOptionsChange}
						onNext={handleNext}
						onPrevious={handlePrevious}
						pricing={pricing}
					/>
				)}

				{currentStep === 5 && (
					<Step5
						customerInfo={formData.customerInfo}
						selections={formData.selections}
						addOns={formData.addOns}
						pricingOptions={formData.pricingOptions}
						pricing={pricing}
						onPrevious={handlePrevious}
						onSave={handleSave}
						onEmail={handleEmail}
						onGeneratePDF={handleGeneratePDF}
						onStepJump={handleStepJump}
					/>
				)}
			</div>
		</div>
	)
}
