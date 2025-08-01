import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import { Step6 } from '@/components/curtains_form/step6'
import { generateQuotePDF } from '@/components/curtains_form/pdf'
import { openPdf } from '@/lib/pdf'
import { LoaderComponent } from '@/components/loader-component'

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
  const productDatabase = useQuery(
    api.product_categoreis.getProductAndCategories,
  )
  if (!productDatabase) return <LoaderComponent />
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Quote Details</h1>
          <Card>
            <CardContent className="p-6">
              <Step6
                productDatabase={productDatabase}
                quoteData={quotation.quoteData}
                onGeneratePDF={async (data) => {
                  const blob = await generateQuotePDF(data, productDatabase)
                  openPdf(blob)
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
