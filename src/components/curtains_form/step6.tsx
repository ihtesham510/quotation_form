import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Download, Mail, Printer, Save, FileText } from 'lucide-react'
import type { QuoteData, QuoteCalculatedData } from './types'
import { productDatabase } from './data'
import {
  calculateProductTotal,
  calculateProductGST,
  calculateRoomTotal,
  calculateRoomGST,
  calculateAddOnTotal,
  calculateAddOnGST,
  calculateServiceTotal,
  calculateServiceGST,
  calculateSubtotal,
  calculateDiscount,
  calculateTotalGST,
  calculateTotal,
} from './calculations'

interface Step6Props {
  quoteData: QuoteData
  onSaveQuote?: (data: QuoteCalculatedData) => void
  onGeneratePDF?: (data: QuoteCalculatedData) => void
  onPrint?: (data: QuoteCalculatedData) => void
  onEmail?: (data: QuoteCalculatedData) => void
}

export function Step6({
  quoteData,
  onSaveQuote,
  onGeneratePDF,
  onPrint,
  onEmail,
}: Step6Props) {
  const prepareQuoteData = (): QuoteCalculatedData => {
    const roomTotals = quoteData.rooms.map((room) => ({
      roomId: room.id,
      total: calculateRoomTotal(room, quoteData.gstEnabled, quoteData.gstRate),
    }))

    const productTotals = quoteData.rooms.flatMap((room) =>
      room.products.map((product) => ({
        roomId: room.id,
        productId: product.id,
        total: calculateProductTotal(
          product,
          quoteData.gstEnabled,
          quoteData.gstRate,
        ),
      })),
    )

    return {
      quoteData,
      calculations: {
        subtotal: calculateSubtotal(quoteData),
        discount: calculateDiscount(quoteData),
        tax: 0, // No longer using end-of-quote tax
        gst: calculateTotalGST(quoteData),
        total: calculateTotal(quoteData),
        roomTotals,
        productTotals,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        itemCount:
          quoteData.rooms.reduce(
            (count, room) => count + room.products.length,
            0,
          ) + quoteData.addOns.length,
        roomCount: quoteData.rooms.length,
      },
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Quote Preview</h3>
        <div className="flex gap-2">
          {onSaveQuote && (
            <Button
              onClick={() => onSaveQuote(prepareQuoteData())}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Save className="w-4 h-4" />
              Save Quote
            </Button>
          )}
          {onGeneratePDF && (
            <Button
              onClick={() => onGeneratePDF(prepareQuoteData())}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blinds Quotation</CardTitle>
          <div className="text-sm text-muted-foreground">
            Quote Date: {quoteData.quoteDate}
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
                    const baseTotal = calculateProductTotal(product, false, 0)
                    const gstAmount = calculateProductGST(
                      product,
                      quoteData.gstEnabled,
                      quoteData.gstRate,
                    )
                    const totalWithGST = calculateProductTotal(
                      product,
                      quoteData.gstEnabled,
                      quoteData.gstRate,
                    )

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
                        <div className="text-right">
                          <div className="font-medium">
                            ${totalWithGST.toFixed(2)}
                          </div>
                          {quoteData.gstEnabled && gstAmount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Base: ${baseTotal.toFixed(2)} + GST: $
                              {gstAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-end mt-2 pt-2 border-t">
                  <div className="text-right">
                    <div className="font-semibold">
                      Room Total: $
                      {calculateRoomTotal(
                        room,
                        quoteData.gstEnabled,
                        quoteData.gstRate,
                      ).toFixed(2)}
                    </div>
                    {quoteData.gstEnabled && (
                      <div className="text-xs text-muted-foreground">
                        (GST: $
                        {calculateRoomGST(
                          room,
                          quoteData.gstEnabled,
                          quoteData.gstRate,
                        ).toFixed(2)}
                        )
                      </div>
                    )}
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
                  {quoteData.addOns.map((addOn) => {
                    const baseTotal = addOn.quantity * addOn.unitPrice
                    const gstAmount = calculateAddOnGST(
                      addOn,
                      quoteData.gstEnabled,
                      quoteData.gstRate,
                    )
                    const totalWithGST = calculateAddOnTotal(
                      addOn,
                      quoteData.gstEnabled,
                      quoteData.gstRate,
                    )

                    return (
                      <div key={addOn.id} className="flex justify-between">
                        <span>
                          {addOn.name} ({addOn.quantity} × ${addOn.unitPrice})
                        </span>
                        <div className="text-right">
                          <div>${totalWithGST.toFixed(2)}</div>
                          {quoteData.gstEnabled && gstAmount > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Base: ${baseTotal.toFixed(2)} + GST: $
                              {gstAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {quoteData.installationService && (
                    <div className="flex justify-between">
                      <span>Installation Service</span>
                      <div className="text-right">
                        <div>
                          $
                          {calculateServiceTotal(
                            150,
                            quoteData.gstEnabled,
                            quoteData.gstRate,
                          ).toFixed(2)}
                        </div>
                        {quoteData.gstEnabled && (
                          <div className="text-xs text-muted-foreground">
                            Base: $150.00 + GST: $
                            {calculateServiceGST(
                              150,
                              quoteData.gstEnabled,
                              quoteData.gstRate,
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {quoteData.siteMeasurement && (
                    <div className="flex justify-between">
                      <span>Site Measurement</span>
                      <div className="text-right">
                        <div>
                          $
                          {calculateServiceTotal(
                            75,
                            quoteData.gstEnabled,
                            quoteData.gstRate,
                          ).toFixed(2)}
                        </div>
                        {quoteData.gstEnabled && (
                          <div className="text-xs text-muted-foreground">
                            Base: $75.00 + GST: $
                            {calculateServiceGST(
                              75,
                              quoteData.gstEnabled,
                              quoteData.gstRate,
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {quoteData.deliveryOption === 'express' && (
                    <div className="flex justify-between">
                      <span>Express Delivery</span>
                      <div className="text-right">
                        <div>
                          $
                          {calculateServiceTotal(
                            50,
                            quoteData.gstEnabled,
                            quoteData.gstRate,
                          ).toFixed(2)}
                        </div>
                        {quoteData.gstEnabled && (
                          <div className="text-xs text-muted-foreground">
                            Base: $50.00 + GST: $
                            {calculateServiceGST(
                              50,
                              quoteData.gstEnabled,
                              quoteData.gstRate,
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
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
                <span>
                  Subtotal {quoteData.gstEnabled ? `(incl. GST)` : ''}:
                </span>
                <span>${calculateSubtotal(quoteData).toFixed(2)}</span>
              </div>
              {quoteData.gstEnabled && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Total GST ({quoteData.gstRate}%):</span>
                  <span>${calculateTotalGST(quoteData).toFixed(2)}</span>
                </div>
              )}
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
            {quoteData.gstEnabled && (
              <div className="mt-2 text-muted-foreground">
                All prices include GST ({quoteData.gstRate}%) as requested.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(onEmail || onPrint) && (
        <div className="flex justify-center gap-2">
          {onEmail && (
            <Button
              onClick={() => onEmail(prepareQuoteData())}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email Quote
            </Button>
          )}
          {onPrint && (
            <Button
              onClick={() => onPrint(prepareQuoteData())}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          )}
          <Button
            onClick={() => alert('Converting to order...')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Convert to Order
          </Button>
        </div>
      )}
    </div>
  )
}
