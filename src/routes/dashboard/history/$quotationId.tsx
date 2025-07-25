import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  Ruler,
  Palette,
  Settings,
  DollarSign,
} from 'lucide-react'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import {
  generateTilePDFfromDB,
  generateWindowQuotePdf,
  openPdf,
} from '@/lib/pdf'
import { productDatabase } from '@/components/curtains_form/data'

export const Route = createFileRoute('/dashboard/history/$quotationId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { quotationId } = Route.useParams()
  const quotation = useQuery(api.quotation.getQuotation, {
    quotationId: quotationId as Id<'quotation'>,
  })
  return <div>{quotation && <QuotationDetails quotation={quotation} />}</div>
}

function QuotationDetails({
  quotation,
}: {
  quotation: DataModel['quotation']['document'] & {
    title?: string
    description?: string
  }
}) {
  const router = useRouter()
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const TileQuotationView = ({ quote }: { quote: any }) => (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tile Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Material
            </label>
            <p className="font-semibold">{quote.tileMaterial}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Style
            </label>
            <p className="font-semibold">{quote.tileStyle}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Size
            </label>
            <p className="font-semibold">{quote.tileSize}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Finish
            </label>
            <p className="font-semibold">{quote.finishType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Application Area
            </label>
            <p className="font-semibold">{quote.applicationArea}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Square Footage
            </label>
            <p className="font-semibold">{quote.squareFootage} sq ft</p>
          </div>
        </CardContent>
      </Card>

      {/* Trim Pieces & Accessories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Accessories & Materials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.trimPieces.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Trim Pieces</h4>
              <div className="space-y-2">
                {quote.trimPieces.map((trim: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span>
                      {trim.type} (Qty: {trim.quantity})
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(trim.price * trim.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quote.transitionStrips.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Transition Strips</h4>
              <div className="space-y-2">
                {quote.transitionStrips.map((strip: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-muted rounded"
                  >
                    <span>
                      {strip.type} (Qty: {strip.quantity})
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(strip.price * strip.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quote.underlayment && (
            <div>
              <h4 className="font-semibold mb-2">Underlayment</h4>
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <span>{quote.underlayment.type}</span>
                <span className="font-semibold">
                  {formatCurrency(quote.underlayment.price)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Delivery Option
              </label>
              <p className="font-semibold">{quote.deliveryOption}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Permit Fees
              </label>
              <p className="font-semibold">
                {formatCurrency(quote.permitFees)}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Installation Complexity
            </label>
            <div className="flex gap-2 mt-1">
              {quote.installationComplexity.map(
                (complexity: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {complexity}
                  </Badge>
                ),
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Rush Order:</span>
              <Badge variant={quote.rushOrder ? 'default' : 'secondary'}>
                {quote.rushOrder ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Weekend Work:</span>
              <Badge variant={quote.weekendWork ? 'default' : 'secondary'}>
                {quote.weekendWork ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discount Information */}
      {(quote.discountPercentage > 0 || quote.discountAmount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Discount Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Discount Type
                </label>
                <p className="font-semibold capitalize">{quote.discountType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Discount Value
                </label>
                <p className="font-semibold">
                  {quote.discountType === 'percentage'
                    ? `${quote.discountPercentage}%`
                    : formatCurrency(quote.discountAmount)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Reason
                </label>
                <p className="font-semibold">{quote.discountReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const CurtainsQuotationView = ({ quote }: { quote: any }) => (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Name
            </label>
            <p className="font-semibold">{quote.customer.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {quote.customer.email}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Phone
            </label>
            <p className="font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {quote.customer.phone}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Project Address
            </label>
            <p className="font-semibold">{quote.customer.projectAddress}</p>
          </div>
        </CardContent>
      </Card>

      {/* Room Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Room Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quote.rooms.map((room: any) => (
            <div key={room.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">{room.name}</h4>
                <Badge variant="outline" className="capitalize">
                  {room.type}
                </Badge>
              </div>

              <div className="space-y-3">
                {room.products.map((product: any) => (
                  <div key={product.id} className="bg-muted p-3 rounded">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Dimensions
                        </label>
                        <p className="font-semibold">
                          {product.width}" × {product.height}"
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Color
                        </label>
                        <p className="font-semibold">{product.color}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Quantity
                        </label>
                        <p className="font-semibold">{product.quantity}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Control Type
                        </label>
                        <p className="font-semibold">{product.controlType}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Special Features
                        </label>
                        <p className="font-semibold">
                          {product.specialFeatures}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">
                          Price
                        </label>
                        <p className="font-semibold">
                          {formatCurrency(product.customPrice || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Add-ons */}
      {quote.addOns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Add-on Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quote.addOns.map((addon: any) => (
                <div
                  key={addon.id}
                  className="flex justify-between items-center p-3 bg-muted rounded"
                >
                  <div>
                    <p className="font-semibold">{addon.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {addon.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(addon.unitPrice * addon.quantity)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {addon.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Options
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Delivery Option
            </label>
            <p className="font-semibold">{quote.deliveryOption}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Payment Terms
            </label>
            <p className="font-semibold">{quote.paymentTerms}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Tax Rate
            </label>
            <p className="font-semibold">{quote.taxRate}%</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Quote Validity
            </label>
            <p className="font-semibold">{quote.validityPeriod} days</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Installation Service:</span>
            <Badge
              variant={quote.installationService ? 'default' : 'secondary'}
            >
              {quote.installationService ? 'Included' : 'Not Included'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Site Measurement:</span>
            <Badge variant={quote.siteMeasurement ? 'default' : 'secondary'}>
              {quote.siteMeasurement ? 'Included' : 'Not Included'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Discount Information */}
      {quote.discountValue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Discount Applied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Discount Type
                </label>
                <p className="font-semibold capitalize">{quote.discountType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Discount Value
                </label>
                <p className="font-semibold">
                  {quote.discountType === 'percentage'
                    ? `${quote.discountValue}%`
                    : formatCurrency(quote.discountValue)}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Reason
                </label>
                <p className="font-semibold">{quote.discountReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to History
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{quotation.title}</h1>
            <p className="text-muted-foreground mb-4">
              {quotation.description}
            </p>
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  quotation.quote.type === 'tile' ? 'default' : 'secondary'
                }
                className="text-sm"
              >
                {quotation.quote.type.toUpperCase()}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Created {formatDate(quotation._creationTime)}
              </div>
            </div>
          </div>
          <Button
            onClick={async () => {
              const { quote, title, description } = quotation
              if (title && description) {
                const blob =
                  quote.type === 'tile'
                    ? await generateTilePDFfromDB(quote, title, description)
                    : await generateWindowQuotePdf({
                        title,
                        description,
                        quoteData: quote,
                        productDatabase,
                      })
                openPdf(blob)
              }
            }}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Quotation Content */}
      {quotation.quote.type === 'tile' ? (
        <TileQuotationView quote={quotation.quote} />
      ) : (
        <CurtainsQuotationView quote={quotation.quote} />
      )}
    </div>
  )
}
