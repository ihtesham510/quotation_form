import type React from 'react'

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
import { Separator } from '@/components/ui/separator'
import type { QuoteData, ProductDatabase } from './types' // Import ProductDatabase
import { paymentTerms } from './data'
import {
  calculateSubtotal,
  calculateDiscount,
  calculateTotalGST,
  calculateTotal,
} from './calculations'

interface Step5Props {
  quoteData: QuoteData
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>
  productDatabase: ProductDatabase // New prop
}

export function Step5({
  quoteData,
  setQuoteData,
  productDatabase,
}: Step5Props) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Pricing & Discounts</h3>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discount Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select
                value={quoteData.discountType}
                onValueChange={(value: 'percentage' | 'fixed') =>
                  setQuoteData((prev) => ({ ...prev, discountType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Discount Value{' '}
                {quoteData.discountType === 'percentage' ? '(%)' : '($)'}
              </Label>
              <Input
                type="number"
                step={quoteData.discountType === 'percentage' ? '0.1' : '0.01'}
                min="0"
                max={
                  quoteData.discountType === 'percentage' ? '100' : undefined
                }
                value={quoteData.discountValue}
                onChange={(e) =>
                  setQuoteData((prev) => ({
                    ...prev,
                    discountValue: Number.parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Discount Amount</Label>
              <div className="flex items-center h-10 px-3 border rounded-md bg-muted">
                -${calculateDiscount(quoteData, productDatabase).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Discount Reason</Label>
            <Input
              value={quoteData.discountReason}
              onChange={(e) =>
                setQuoteData((prev) => ({
                  ...prev,
                  discountReason: e.target.value,
                }))
              }
              placeholder="Reason for discount (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select
              value={quoteData.paymentTerms}
              onValueChange={(value) =>
                setQuoteData((prev) => ({ ...prev, paymentTerms: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentTerms.map((term) => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal {quoteData.gstEnabled ? `(incl. GST)` : ''}:</span>
              <span>
                ${calculateSubtotal(quoteData, productDatabase).toFixed(2)}
              </span>
            </div>
            {quoteData.gstEnabled && (
              <div className="flex justify-between text-muted-foreground">
                <span>Total GST ({quoteData.gstRate}%):</span>
                <span>
                  ${calculateTotalGST(quoteData, productDatabase).toFixed(2)}
                </span>
              </div>
            )}
            {quoteData.discountValue > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>
                  -${calculateDiscount(quoteData, productDatabase).toFixed(2)}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>
                ${calculateTotal(quoteData, productDatabase).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
