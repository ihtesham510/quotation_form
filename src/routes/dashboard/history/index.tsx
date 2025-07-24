import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarDays, FileText, Search, Filter } from 'lucide-react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useAuth } from '@/context/auth'

export const Route = createFileRoute('/dashboard/history/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  return <div>{user && <History userId={user._id} />}</div>
}
function History({ userId }: { userId: Id<'user'> }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const quotations = useQuery(api.quotation.getQuotations, { userId })
  const filteredQuotations = quotations ?? []

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Quotation History</h1>
        <p className="text-muted-foreground">
          View and manage all your quotations
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="tile">Tile</SelectItem>
            <SelectItem value="curtains">Curtains</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuotations.map((quotation, index) => (
          <RenderQuotation key={index} data={quotation} />
        ))}
      </div>

      {filteredQuotations.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No quotations found</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterType !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : "You haven't created any quotations yet"}
          </p>
        </div>
      )}
    </div>
  )
}

function RenderQuotation({
  data: quotation,
}: {
  data: DataModel['quotation']['document'] & {
    title?: string
    description?: string
  }
}) {
  const navigate = useNavigate()
  return (
    <Card key={quotation._id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{quotation?.title}</CardTitle>
            <CardDescription className="text-sm">
              {quotation?.description}
            </CardDescription>
          </div>
          <Badge
            variant={quotation.quote.type === 'tile' ? 'default' : 'secondary'}
          >
            {quotation.quote.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-2" />
            {formatDate(quotation._creationTime)}
          </div>

          <div className="flex items-center text-sm">
            <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium">
              {getQuoteValue(quotation.quote)}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <span className="text-muted-foreground mr-2">Delivery:</span>
            <span className="font-medium">
              {quotation.quote.deliveryOption}
            </span>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() =>
              navigate({
                to: '/dashboard/history/$quotationId',
                params: { quotationId: quotation._id },
              })
            }
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getQuoteValue = (quote: any) => {
  if (quote.type === 'tile') {
    return `${quote.squareFootage} sq ft`
  } else {
    return `${quote.rooms?.length || 0} rooms`
  }
}
