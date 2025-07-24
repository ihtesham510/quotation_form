import type React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type {
  TileFormData as FormData,
  TilePricingBreakdown as PricingBreakdown,
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface Step6Props {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  pricing: PricingBreakdown
}

export function Step6({ formData, updateFormData, pricing }: Step6Props) {
  const handleDiscountTypeChange = (value: string) => {
    updateFormData({
      discountType: value,
      discountPercentage: 0,
      discountAmount: 0,
    })
  }

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(
      50,
      Math.max(0, Number.parseFloat(e.target.value) || 0),
    )
    updateFormData({ discountPercentage: value })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(
      pricing.preDiscountSubtotal,
      Math.max(0, Number.parseFloat(e.target.value) || 0),
    )
    updateFormData({ discountAmount: value })
  }

  const calculateDiscountAmount = () => {
    if (formData.discountType === 'percentage') {
      return pricing.preDiscountSubtotal * (formData.discountPercentage / 100)
    } else if (formData.discountType === 'fixed') {
      return Math.min(formData.discountAmount, pricing.preDiscountSubtotal)
    }
    return 0
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Discount Application</h3>
        <p className="text-muted-foreground">
          Apply discounts if applicable to your project
        </p>
      </div>

      {/* Current Subtotal */}
      <Card className="bg-accent">
        <CardHeader>
          <CardTitle className="text-lg">Current Project Subtotal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            ${pricing.preDiscountSubtotal.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Total before any discounts applied
          </p>
        </CardContent>
      </Card>

      {/* Discount Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Discount Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={formData.discountType}
            onValueChange={handleDiscountTypeChange}
            className="space-y-3"
          >
            {[
              {
                id: 'no-discount',
                value: 'none',
                title: 'No discount',
                description: 'Apply no discount to this quote',
                badge: { text: 'Standard pricing', variant: 'secondary' },
              },
              {
                id: 'percentage-discount',
                value: 'percentage',
                title: 'Percentage discount',
                description: 'Apply a percentage discount to the total',
                badge: { text: '0-50%', variant: 'outline' },
              },
              {
                id: 'fixed-discount',
                value: 'fixed',
                title: 'Fixed dollar amount',
                description: 'Apply a fixed dollar discount',
                badge: { text: '$ Amount', variant: 'outline' },
              },
            ].map((option) => {
              const isActive = option.value === formData.discountType
              return (
                <div key={option.id}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className={cn(
                      'flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors',
                      isActive && 'border-primary bg-accent',
                    )}
                  >
                    <div>
                      <div
                        className={cn(
                          'font-medium',
                          isActive && 'text-primary',
                        )}
                      >
                        {option.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    <Badge variant={option.badge.variant as any}>
                      {option.badge.text}
                    </Badge>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Percentage Discount */}
      {formData.discountType === 'percentage' && (
        <Card>
          <CardHeader>
            <CardTitle>Percentage Discount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label htmlFor="discountPercentage">
                Discount percentage (0-50%)
              </Label>
              <Input
                id="discountPercentage"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={formData.discountPercentage || ''}
                onChange={handlePercentageChange}
                placeholder="0.0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum discount allowed is 50%
              </p>

              {formData.discountPercentage > 0 && (
                <div className="mt-3 p-3 bg-accent border rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Discount amount:</span>
                      <span className="font-medium text-primary">
                        -${calculateDiscountAmount().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>New total:</span>
                      <span className="font-bold text-primary">
                        $
                        {(
                          pricing.preDiscountSubtotal -
                          calculateDiscountAmount()
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Dollar Discount */}
      {formData.discountType === 'fixed' && (
        <Card>
          <CardHeader>
            <CardTitle>Fixed Dollar Discount</CardTitle>
            <CardDescription>Discount amount ($)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-4">
              <Input
                id="discountAmount"
                type="number"
                min="0"
                max={pricing.preDiscountSubtotal}
                step="0.01"
                value={formData.discountAmount || ''}
                onChange={handleAmountChange}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum discount: ${pricing.preDiscountSubtotal.toFixed(2)}
              </p>

              {formData.discountAmount > 0 && (
                <div className="mt-3 p-3 bg-accent border rounded-lg">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Discount amount:</span>
                      <span className="font-medium text-primary">
                        -${calculateDiscountAmount().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>New total:</span>
                      <span className="font-bold text-primary">
                        $
                        {(
                          pricing.preDiscountSubtotal -
                          calculateDiscountAmount()
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discount Reason */}
      {formData.discountType !== 'none' && (
        <Card>
          <CardHeader>
            <CardTitle>Discount Reason/Code</CardTitle>
            <CardDescription>Reason for discount (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="discountReason"
              value={formData.discountReason}
              onChange={(e) =>
                updateFormData({ discountReason: e.target.value })
              }
              placeholder="Enter discount reason, promotion code, or notes"
              rows={3}
            />
          </CardContent>
        </Card>
      )}

      {/* Discount Summary */}
      {formData.discountType !== 'none' && calculateDiscountAmount() > 0 && (
        <Card className="bg-accent border-accent">
          <CardHeader>
            <CardTitle className="text-lg">Discount Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>Subtotal before discount:</span>
                <span>${pricing.preDiscountSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg text-primary">
                <span>Discount applied:</span>
                <span>-${calculateDiscountAmount().toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-xl font-bold text-primary">
                  <span>New subtotal:</span>
                  <span>
                    $
                    {(
                      pricing.preDiscountSubtotal - calculateDiscountAmount()
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Tax will be calculated on the discounted amount
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
