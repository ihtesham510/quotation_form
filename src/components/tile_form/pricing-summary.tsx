import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from './calculations'
import type { CalculationResult } from './types'

interface PricingSummaryProps {
	pricing: CalculationResult
	className?: string
}

export function PricingSummary({ pricing, className }: PricingSummaryProps) {
	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className='text-lg'>Pricing Summary</CardTitle>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex justify-between text-sm'>
					<span>Material Cost:</span>
					<span>{formatCurrency(pricing.materialCost)}</span>
				</div>

				{/* {pricing.markupAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span>Markup:</span>
            <span>{formatCurrency(pricing.markupAmount)}</span>
          </div>
        )} */}

				{pricing.customItemsCost > 0 && (
					<div className='flex justify-between text-sm'>
						<span>Custom Items:</span>
						<span>{formatCurrency(pricing.customItemsCost)}</span>
					</div>
				)}

				{pricing.customServicesCost > 0 && (
					<div className='flex justify-between text-sm'>
						<span>Custom Services:</span>
						<span>{formatCurrency(pricing.customServicesCost)}</span>
					</div>
				)}

				<div className='flex justify-between font-medium border-t pt-2'>
					<span>Subtotal:</span>
					<span>{formatCurrency(pricing.subtotal)}</span>
				</div>

				{pricing.discountAmount > 0 && (
					<div className='flex justify-between text-sm text-green-600'>
						<span>Discount:</span>
						<span>-{formatCurrency(pricing.discountAmount)}</span>
					</div>
				)}

				{pricing.gstAmount > 0 && (
					<div className='flex justify-between text-sm'>
						<span>GST:</span>
						<span>{formatCurrency(pricing.gstAmount)}</span>
					</div>
				)}

				<div className='flex justify-between text-lg font-bold border-t pt-2'>
					<span>Total:</span>
					<span>{formatCurrency(pricing.finalTotal)}</span>
				</div>
			</CardContent>
		</Card>
	)
}
