import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Download, Mail, Printer, Save, FileText } from 'lucide-react'
import type { QuoteData } from './types'
import { productDatabase } from './data'
import {
  calculateProductTotal,
  calculateRoomTotal,
  calculateSubtotal,
  calculateDiscount,
  calculateTax,
  calculateTotal,
} from './calculations'

interface Step6Props {
  quoteData: QuoteData
  onSaveQuote: () => void
  onGeneratePDF: () => void
}

export function Step6({ quoteData, onSaveQuote, onGeneratePDF }: Step6Props) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quote Preview</h3>
        <div className="flex gap-2">
          <Button
            onClick={onSaveQuote}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Save className="w-4 h-4" />
            Save Quote
          </Button>
          <Button onClick={onGeneratePDF} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blinds Quotation</CardTitle>
          <div className="text-sm text-muted-foreground">
            Quote Date: {quoteData.quoteDate} | Valid Until:{' '}
            {new Date(
              Date.now() + quoteData.validityPeriod * 24 * 60 * 60 * 1000,
            ).toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Name:</strong> {quoteData.customer.name}
                <br />
                <strong>Email:</strong> {quoteData.customer.email}
                <br />
                <strong>Phone:</strong> {quoteData.customer.phone}
              </div>
              <div>
                {quoteData.customer.address && (
                  <>
                    <strong>Address:</strong>
                    <br />
                    {quoteData.customer.address}
                  </>
                )}
              </div>
            </div>
            {quoteData.customer.projectAddress && (
              <div className="mt-2 text-sm">
                <strong>Project Address:</strong>
                <br />
                {quoteData.customer.projectAddress}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-4">Room Breakdown</h4>
            {quoteData.rooms.map((room) => (
              <div key={room.id} className="mb-6">
                <h5 className="font-medium mb-2">
                  {room.name} ({room.type})
                </h5>
                <div className="space-y-2">
                  {room.products.map((product) => {
                    const productInfo = productDatabase.products.find(
                      (p) => p.id === product.productId,
                    )
                    const sqm = product.width * product.height
                    const total = calculateProductTotal(product)

                    return (
                      <div
                        key={product.id}
                        className="flex justify-between items-start text-sm border-l-2 border-muted pl-4"
                      >
                        <div>
                          <div className="font-medium">{productInfo?.name}</div>
                          <div className="text-muted-foreground">
                            {product.width}m × {product.height}m (
                            {sqm.toFixed(2)} sqm) × {product.quantity}
                            {product.color !== 'White' && ` • ${product.color}`}
                            {product.controlType !== 'Cord' &&
                              ` • ${product.controlType}`}
                          </div>
                          {product.specialFeatures && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {product.specialFeatures}
                            </div>
                          )}
                        </div>
                        <div className="font-medium">${total.toFixed(2)}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end mt-2 pt-2 border-t">
                  <div className="font-semibold">
                    Room Total: ${calculateRoomTotal(room).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(quoteData.addOns.length > 0 ||
            quoteData.installationService ||
            quoteData.siteMeasurement ||
            quoteData.deliveryOption === 'express') && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">
                  Additional Items & Services
                </h4>
                <div className="space-y-1 text-sm">
                  {quoteData.addOns.map((addOn) => (
                    <div key={addOn.id} className="flex justify-between">
                      <span>
                        {addOn.name} ({addOn.quantity} × ${addOn.unitPrice})
                      </span>
                      <span>
                        ${(addOn.quantity * addOn.unitPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {quoteData.installationService && (
                    <div className="flex justify-between">
                      <span>Installation Service</span>
                      <span>$150.00</span>
                    </div>
                  )}
                  {quoteData.siteMeasurement && (
                    <div className="flex justify-between">
                      <span>Site Measurement</span>
                      <span>$75.00</span>
                    </div>
                  )}
                  {quoteData.deliveryOption === 'express' && (
                    <div className="flex justify-between">
                      <span>Express Delivery</span>
                      <span>$50.00</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Pricing Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal(quoteData).toFixed(2)}</span>
              </div>
              {quoteData.discountValue > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>
                    Discount (
                    {quoteData.discountType === 'percentage'
                      ? `${quoteData.discountValue}%`
                      : `$${quoteData.discountValue}`}
                    )
                    {quoteData.discountReason &&
                      ` - ${quoteData.discountReason}`}
                    :
                  </span>
                  <span>-${calculateDiscount(quoteData).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax ({quoteData.taxRate}%):</span>
                <span>${calculateTax(quoteData).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${calculateTotal(quoteData).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-sm">
            <div>
              <strong>Payment Terms:</strong> {quoteData.paymentTerms}
            </div>
            <div className="mt-2 text-muted-foreground">
              This quote is valid for {quoteData.validityPeriod} days from the
              quote date.
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2">
        <Button
          onClick={() => alert('Quote emailed!')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Email Quote
        </Button>
        <Button
          onClick={() => window.print()}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print
        </Button>
        <Button
          onClick={() => alert('Converting to order...')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Convert to Order
        </Button>
      </div>
    </div>
  )
}
