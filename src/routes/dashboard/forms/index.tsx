import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/forms/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="mt-4">
      <div className="flex flex-col space-y-1">
        <h1 className="title">Choose Form</h1>
        <p className="description">Choose form to make your quotation</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 my-4 gap-2">
        <Link
          to="/dashboard/forms/curtains_form"
          className="md:col-span-2 xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Curtains Form</CardTitle>
              <CardDescription>
                Create your custom curtain quotation in just a few steps. Enter
                your details, calculate the cost, and download your personalized
                quote as a PDF instantly.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link
          to="/dashboard/forms/tile_form"
          className="md:col-span-2 xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Tile Form</CardTitle>
              <CardDescription>
                Quickly generate your custom tile quotation with our easy-to-use
                form. Get an accurate estimate and instantly download your
                detailed quote as a PDF for your records.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
