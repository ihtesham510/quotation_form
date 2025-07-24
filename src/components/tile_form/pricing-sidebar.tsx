import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator } from 'lucide-react'
import type {
  TileFormData as FormData,
  TilePricingBreakdown as PricingBreakdown,
} from '@/lib/types'

interface PricingSidebarProps {
  pricing: PricingBreakdown
  formData: FormData
}

export default function PricingSidebar({
  pricing,
  formData,
}: PricingSidebarProps) {
  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Calculator className="w-5 h-5 mr-2 text-primary" />
          Price Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {/* Material Cost */}
        {pricing.materialCost > 0 && (
          <div className="flex justify-between">
            <span>Material Cost</span>
            <span className="font-medium text-foreground">
              ${pricing.materialCost.toFixed(2)}
            </span>
          </div>
        )}

        {/* Installation Cost */}
        {pricing.installationCost > 0 && (
          <div className="flex justify-between">
            <span>Installation Cost</span>
            <span className="font-medium text-foreground">
              ${pricing.installationCost.toFixed(2)}
            </span>
          </div>
        )}

        {/* Add-ons */}
        {pricing.addOnsSubtotal > 0 && (
          <div className="flex justify-between">
            <span>Add-ons</span>
            <span className="font-medium text-foreground">
              ${pricing.addOnsSubtotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Other Items */}
        {pricing.otherItemsSubtotal > 0 && (
          <div className="flex justify-between">
            <span>Other Items</span>
            <span className="font-medium text-foreground">
              ${pricing.otherItemsSubtotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Additional Charges */}
        {pricing.additionalChargesSubtotal > 0 && (
          <div className="flex justify-between">
            <span>Additional Charges</span>
            <span className="font-medium text-foreground">
              ${pricing.additionalChargesSubtotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Subtotal */}
        {pricing.preDiscountSubtotal > 0 && (
          <>
            <Separator />
            <div className="flex justify-between font-medium text-foreground">
              <span>Subtotal</span>
              <span>${pricing.preDiscountSubtotal.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Discount */}
        {pricing.discountAmount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-500">
            <span>Discount</span>
            <span>- ${pricing.discountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Tax */}
        {pricing.tax > 0 && (
          <div className="flex justify-between">
            <span>Tax (8.75%)</span>
            <span className="font-medium text-foreground">
              ${pricing.tax.toFixed(2)}
            </span>
          </div>
        )}

        {/* Final Total */}
        {pricing.finalTotal > 0 && (
          <>
            <Separator />
            <div className="flex justify-between text-lg font-bold text-foreground">
              <span>Total</span>
              <span>${pricing.finalTotal.toFixed(2)}</span>
            </div>
          </>
        )}

        {/* Project Info */}
        {formData.squareFootage > 0 && (
          <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
            <div>Square Footage: {formData.squareFootage} sq ft</div>
            {pricing.finalTotal > 0 && (
              <div>
                Cost per sq ft: $
                {(pricing.finalTotal / formData.squareFootage).toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Quote Validity */}
        <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
          <div className="font-medium mb-1 text-foreground">
            Quote Valid For:
          </div>
          <div>30 days from generation</div>
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              Estimated Timeline: 2-3 weeks
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
