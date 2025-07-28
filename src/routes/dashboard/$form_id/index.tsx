import { CurtainsForm } from '@/components/curtains_form'
import { TileForm } from '@/components/tile_form'
import { useAuth } from '@/context/auth'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import type { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'
import { PackageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/dashboard/$form_id/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { form_id } = Route.useParams()
  const navigate = Route.useNavigate()
  const { user } = useAuth()
  const form = useQuery(api.form.getForm, {
    formId: form_id as any,
    userId: user!._id,
  })
  const addTileQuotation = useMutation(api.quotation.addTileQuotation)
  const addCurtainQuotation = useMutation(api.quotation.addCurtainQuotation)
  return (
    <div className="grid">
      <div className="grid space-y-2 p-8 pb-0">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{form?.title}</h1>
          {form && form.type === 'curtains' && (
            <Button
              variant="outline"
              className="flex gap-2"
              onClick={() =>
                navigate({
                  to: '/dashboard/$form_id/manage_products',
                })
              }
            >
              <PackageIcon className="size-4" />
              <p className="hidden md:inline-flex">Products</p>
            </Button>
          )}
        </div>
        <p className="text-muted-foreground font-medium">{form?.description}</p>
      </div>
      <div>
        {form && form?.type === 'tile' && (
          <TileForm
            title={form.title}
            description={form.description}
            onSave={async (data) => {
              await addTileQuotation({
                data: { ...data, type: 'tile' },
                formId: form_id as Id<'forms'>,
              })
            }}
          />
        )}
        {form && form?.type === 'curtains' && (
          <CurtainsForm
            onSave={async (data) => {
              await addCurtainQuotation({
                formId: form_id as Id<'forms'>,
                data: { ...data, type: 'curtains' },
              })
              toast.success('Quote Saved Successfully')
            }}
          />
        )}
      </div>
    </div>
  )
}
