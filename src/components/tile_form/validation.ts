import type { Selections, AddOns, PricingOptions, CustomerInfo } from './types'

// Validation result interface
interface ValidationResult {
	isValid: boolean
	errors: Record<string, string>
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	return emailRegex.test(email.trim())
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string): boolean {
	const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
	const cleanPhone = phone.replace(/[\s\-$$$$.]/g, '')
	return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone)
}

/**
 * Validate customer information (Step 1) - simplified validation
 */
export function validateCustomerInfo(customerInfo: CustomerInfo): ValidationResult {
	const errors: Record<string, string> = {}

	if (!customerInfo.name.trim()) {
		errors.name = 'Customer name is required'
	}

	if (!customerInfo.email.trim()) {
		errors.email = 'Email is required'
	}

	if (!customerInfo.phone.trim()) {
		errors.phone = 'Phone number is required'
	}

	if (!customerInfo.customerAddress.trim()) {
		errors.customerAddress = 'Customer address is required'
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

/**
 * Validate material selections (Step 2) - updated for materialItems array
 */
export function validateMaterialSelections(selections: Selections): ValidationResult {
	const errors: Record<string, string> = {}

	// Check if materialItems array exists and has at least one item
	if (!selections.materialItems || selections.materialItems.length === 0) {
		errors.materialItems = 'Please add at least one material item'
		return {
			isValid: false,
			errors,
		}
	}

	// Validate each material item
	selections.materialItems.forEach((item, index) => {
		if (!item.material) {
			errors[`materialItem_${index}_material`] = 'Please select a material'
		}

		if (!item.style) {
			errors[`materialItem_${index}_style`] = 'Please select a style'
		}

		if (!item.size) {
			errors[`materialItem_${index}_size`] = 'Please select a size'
		}

		if (!item.finish) {
			errors[`materialItem_${index}_finish`] = 'Please select a finish'
		}

		if (!item.squareFootage || item.squareFootage <= 0) {
			errors[`materialItem_${index}_squareFootage`] = 'Square footage must be greater than 0'
		} else if (item.squareFootage > 10000) {
			errors[`materialItem_${index}_squareFootage`] = 'Square footage seems unusually large. Please verify.'
		}
	})

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

/**
 * Validate add-ons (Step 3)
 */
export function validateAddOns(addOns: AddOns): ValidationResult {
	const errors: Record<string, string> = {}

	// Markup validation
	if (addOns.markup) {
		if (addOns.markup < 0) {
			errors.markup = 'Markup cannot be negative'
		}
	}

	// Custom items validation
	addOns.customItems.forEach((item, index) => {
		if (!item.name.trim()) {
			errors[`customItem_${index}_name`] = 'Item name is required'
		}
		if (item.price <= 0) {
			errors[`customItem_${index}_price`] = 'Item price must be greater than 0'
		}
		if (item.quantity <= 0) {
			errors[`customItem_${index}_quantity`] = 'Item quantity must be greater than 0'
		}
	})

	// Custom services validation
	addOns.customServices.forEach((service, index) => {
		if (!service.name.trim()) {
			errors[`customService_${index}_name`] = 'Service name is required'
		}
		if (service.price <= 0) {
			errors[`customService_${index}_price`] = 'Service price must be greater than 0'
		}
	})

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

/**
 * Validate pricing options (Step 4)
 */
export function validatePricingOptions(pricingOptions: PricingOptions): ValidationResult {
	const errors: Record<string, string> = {}

	// Discount validation
	if (pricingOptions.discount.enabled) {
		if (pricingOptions.discount.value < 0) {
			errors.discount = 'Discount cannot be negative'
		} else if (pricingOptions.discount.value > 100) {
			errors.discount = 'Discount cannot exceed 100%'
		}
	}

	// GST validation
	if (pricingOptions.gst.enabled) {
		if (pricingOptions.gst.percentage < 0) {
			errors.gst = 'GST percentage cannot be negative'
		} else if (pricingOptions.gst.percentage > 50) {
			errors.gst = 'GST percentage seems unusually high'
		}
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
	}
}

/**
 * Validate entire form for final submission
 */
export function validateCompleteForm(
	customerInfo: CustomerInfo,
	selections: Selections,
	addOns: AddOns,
	pricingOptions: PricingOptions,
): ValidationResult {
	const customerValidation = validateCustomerInfo(customerInfo)
	const selectionsValidation = validateMaterialSelections(selections)
	const addOnsValidation = validateAddOns(addOns)
	const pricingValidation = validatePricingOptions(pricingOptions)

	const allErrors = {
		...customerValidation.errors,
		...selectionsValidation.errors,
		...addOnsValidation.errors,
		...pricingValidation.errors,
	}

	return {
		isValid: Object.keys(allErrors).length === 0,
		errors: allErrors,
	}
}

/**
 * Check if a step can be navigated to (all previous steps are valid)
 */
export function canNavigateToStep(
	targetStep: number,
	customerInfo: CustomerInfo,
	selections: Selections,
	addOns: AddOns,
	pricingOptions: PricingOptions,
): boolean {
	if (targetStep <= 1) return true

	// Step 2 requires valid customer info
	if (targetStep >= 2) {
		const customerValidation = validateCustomerInfo(customerInfo)
		if (!customerValidation.isValid) return false
	}

	// Step 3 requires valid material selections
	if (targetStep >= 3) {
		const selectionsValidation = validateMaterialSelections(selections)
		if (!selectionsValidation.isValid) return false
	}

	// Step 4 requires valid add-ons (optional validation)
	if (targetStep >= 4) {
		const addOnsValidation = validateAddOns(addOns)
		if (!addOnsValidation.isValid) return false
	}

	// Step 5 requires valid pricing options
	if (targetStep >= 5) {
		const pricingValidation = validatePricingOptions(pricingOptions)
		if (!pricingValidation.isValid) return false
	}

	return true
}
