import { CurtainsForm } from '@/components/curtains_form'
import { TileForm } from '@/components/tile_form'
import { useAuth } from '@/context/auth'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex-helpers/react/cache'

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
  return (
    <div className="p-8">
      {form && form?.type === 'tile' && (
        <TileForm title={form.title} description={form.description} />
      )}
      {form && form?.type === 'curtains' && (
        <CurtainsForm title={form.title} description={form.description} />
      )}
    </div>
  )
}
