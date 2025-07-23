import { CurtainsForm } from '@/components/curtains_form'
import { TileForm } from '@/components/tile_form'
import { useAuth } from '@/context/auth'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex-helpers/react/cache'
import { useMutation } from 'convex/react'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/$form_id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { form_id } = Route.useParams()
  const { user } = useAuth()
  const form = useQuery(api.form.getForm, {
    formId: form_id as any,
    userId: user!._id,
  })
  const addTileQuotation = useMutation(api.quotation.addTileQuotation)
  const addCurtainQuotation = useMutation(api.quotation.addCurtainQuotation)
  return (
    <div className="p-8">
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
          title={form.title}
          description={form.description}
          onSave={async (data) => {
            await addCurtainQuotation({
              formId: form_id as Id<'forms'>,
              data: { ...data, type: 'curtains' },
            })
          }}
        />
      )}
    </div>
  )
}
