import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FileText, Mail, SaveIcon } from 'lucide-react'
import type {
  TileFormData as FormData,
  TilePricingBreakdown as PricingBreakdown,
} from '@/lib/types'
import { generateTilePdf, openPdf } from '@/lib/pdf'

interface Step7Props {
  formData: FormData
  title?: string
  description?: string
  pricing: PricingBreakdown
  onSave?: () => Promise<void> | void
}

const TILE_MATERIALS = {
  ceramic: 'Ceramic',
  porcelain: 'Porcelain',
  naturalStone: 'Natural Stone',
  glass: 'Glass',
}

const TILE_STYLES = {
  traditional: 'Traditional/Solid Colors',
  woodLook: 'Wood Look',
  subway: 'Subway Style',
  stoneLook: 'Stone/Marble Look',
  concrete: 'Concrete Look',
  decorative: 'Decorative/Patterned',
}

const TILE_SIZES = {
  small: 'Small tiles (under 6")',
  standard: 'Standard tiles (6"-12")',
  large: 'Large tiles (12"-24")',
  extraLarge: 'Extra large tiles (24"+)',
}

const FINISH_TYPES = {
  matte: 'Matte',
  polished: 'Polished',
  honed: 'Honed',
  textured: 'Textured',
}

const APPLICATION_AREAS = {
  floor: 'Floor',
  wall: 'Wall',
  countertop: 'Countertop',
  backsplash: 'Backsplash',
  outdoor: 'Outdoor/Patio',
}

export function Step7({
  formData,
  pricing,
  onSave,
  title,
  description,
}: Step7Props) {
  const generateQuote = async () => {
    if (title && description) {
      const blob = await generateTilePdf({
        title,
        description,
        formData,
        pricingBreakdown: pricing,
      })
      openPdf(blob)
    }
  }

  const downloadQuote = async () => {
    if (title && description) {
      const blob = await generateTilePdf({
        title,
        description,
        formData,
        pricingBreakdown: pricing,
      })
      openPdf(blob)
    }
  }

  const emailQuote = () => {
    alert('Email functionality would be implemented here.')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review & Final Quote</h3>
        <p className="text-muted-foreground">
          Review your selections and generate your quotation
        </p>
      </div>

      {/* Project Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Project Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-foreground">Tile Material</h4>
              <p className="text-muted-foreground">
                {
                  TILE_MATERIALS[
                    formData.tileMaterial as keyof typeof TILE_MATERIALS
                  ]
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Tile Style</h4>
              <p className="text-muted-foreground">
                {TILE_STYLES[formData.tileStyle as keyof typeof TILE_STYLES]}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Tile Size</h4>
              <p className="text-muted-foreground">
                {TILE_SIZES[formData.tileSize as keyof typeof TILE_SIZES]}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Finish Type</h4>
              <p className="text-muted-foreground">
                {FINISH_TYPES[formData.finishType as keyof typeof FINISH_TYPES]}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Application Area</h4>
              <p className="text-muted-foreground">
                {
                  APPLICATION_AREAS[
                    formData.applicationArea as keyof typeof APPLICATION_AREAS
                  ]
                }
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Square Footage</h4>
              <p className="text-muted-foreground">
                {formData.squareFootage} sq ft
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add-ons Summary */}
      {(formData.trimPieces.length > 0 ||
        formData.transitionStrips.length > 0 ||
        formData.underlayment ||
        formData.groutSealers.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Add-ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.trimPieces.map((trim, index) => (
              <div key={index} className="flex justify-between">
                <span>Trim piece ({trim.type})</span>
                <span>
                  {trim.quantity} × ${trim.price.toFixed(2)} = $
                  {(trim.quantity * trim.price).toFixed(2)}
                </span>
              </div>
            ))}
            {formData.transitionStrips.map((strip, index) => (
              <div key={index} className="flex justify-between">
                <span>Transition strip ({strip.type})</span>
                <span>
                  {strip.quantity} × ${strip.price.toFixed(2)} = $
                  {(strip.quantity * strip.price).toFixed(2)}
                </span>
              </div>
            ))}
            {formData.underlayment && (
              <div className="flex justify-between">
                <span>Underlayment ({formData.underlayment.type})</span>
                <span>
                  {formData.squareFootage} sq ft × $
                  {formData.underlayment.price.toFixed(2)} = $
                  {(
                    formData.squareFootage * formData.underlayment.price
                  ).toFixed(2)}
                </span>
              </div>
            )}
            {formData.groutSealers.map((grout, index) => (
              <div key={index} className="flex justify-between">
                <span>Grout/Sealer ({grout.type})</span>
                <span>
                  {formData.squareFootage} sq ft × ${grout.price.toFixed(2)} = $
                  {(formData.squareFootage * grout.price).toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Other Items */}
      {formData.otherItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.otherItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <span>
                  {item.quantity} × ${item.unitPrice.toFixed(2)} = $
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Complete Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Pricing Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Material Cost</span>
            <span>${pricing.materialCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Installation Cost</span>
            <span>${pricing.installationCost.toFixed(2)}</span>
          </div>
          {pricing.addOnsSubtotal > 0 && (
            <div className="flex justify-between">
              <span>Add-ons Subtotal</span>
              <span>${pricing.addOnsSubtotal.toFixed(2)}</span>
            </div>
          )}
          {pricing.otherItemsSubtotal > 0 && (
            <div className="flex justify-between">
              <span>Other Items Subtotal</span>
              <span>${pricing.otherItemsSubtotal.toFixed(2)}</span>
            </div>
          )}
          {pricing.additionalChargesSubtotal > 0 && (
            <div className="flex justify-between">
              <span>Additional Charges</span>
              <span>${pricing.additionalChargesSubtotal.toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Subtotal (before discount)</span>
            <span>${pricing.preDiscountSubtotal.toFixed(2)}</span>
          </div>

          {pricing.discountAmount > 0 && (
            <>
              <div className="flex justify-between text-primary">
                <span>Discount Applied</span>
                <span>-${pricing.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Subtotal (after discount)</span>
                <span>${pricing.afterDiscountSubtotal.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span>Tax (8.75%)</span>
            <span>${pricing.tax.toFixed(2)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-xl font-bold">
            <span>Final Total</span>
            <span>${pricing.finalTotal.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Quote Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Estimated Timeline:</span>
            <span>2-3 weeks standard delivery</span>
          </div>
          <div className="flex justify-between">
            <span>Quote Valid Until:</span>
            <span>
              {new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Quote Generated:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={generateQuote} className="flex-1">
          <FileText className="w-4 h-4 mr-2" />
          Generate Final Quote
        </Button>
        <Button
          variant="outline"
          onClick={onSave}
          className="flex-1 bg-transparent"
        >
          <SaveIcon className="w-4 h-4 mr-2" />
          Save Quote
        </Button>
        <Button
          variant="outline"
          onClick={emailQuote}
          className="flex-1 bg-transparent"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email Quote
        </Button>
      </div>

      {/* Contact Information */}
      <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Ready to Order?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Contact us to place your order or if you have any questions about
            this quote.
          </p>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Phone:</strong> 1-800-DALTILE
            </div>
            <div>
              <strong>Email:</strong> quotes@daltile.com
            </div>
            <div>
              <strong>Hours:</strong> Monday-Friday 8AM-6PM EST
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
