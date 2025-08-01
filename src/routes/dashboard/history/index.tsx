import { createFileRoute, Link } from '@tanstack/react-router'
import { calculateTotal } from '@/components/curtains_form/calculations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useAuth } from '@/context/auth'
import { Quote, Search } from 'lucide-react'
import { format } from 'date-fns'
import React from 'react'

export const Route = createFileRoute('/dashboard/history/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  return <div>{user && <History userId={user._id} />}</div>
}

function History({ userId }: { userId: Id<'user'> }) {
  const quotations = useQuery(api.quotation.getQuotations, { userId })

  const isEmpty = quotations && quotations.length === 0
  if (!quotations) return null
  return (
    <React.Fragment>
      {quotations && isEmpty ? (
        <div className="min-h-[70vh] w-full flex flex-col justify-center items-center text-center space-y-6">
          <span className="border border-border rounded-full">
            <Quote className="size-18 m-6" />
          </span>
          <h1>No Saved Quotes</h1>
        </div>
      ) : (
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-2">
            <div className="mx-auto">
              <h1 className="text-3xl font-bold mb-6">Quote History</h1>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search quotations..."
                  onClick={() => {}}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {quotations.map((quote) => (
                  <Link
                    key={quote._id}
                    to="/dashboard/history/$quotationId"
                    params={{ quotationId: quote._id }}
                    className="block"
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {quote.quoteData.customer.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {quote.quoteData.quoteDate
                            ? format(new Date(quote.quoteData.quoteDate), 'PPP')
                            : 'N/A'}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Email:</span>{' '}
                          {quote.quoteData.customer.email}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Phone:</span>{' '}
                          {quote.quoteData.customer.phone}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Rooms:</span>{' '}
                          {quote.quoteData.rooms.length}
                        </p>
                        <div className="pt-2 border-t mt-2">
                          <p className="text-lg font-bold text-right">
                            Total: ${calculateTotal(quote.quoteData).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  )
}
