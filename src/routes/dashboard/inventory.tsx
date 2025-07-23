import { LoaderComponent } from '@/components/loader-component'
import { InteractiveCard } from '@/components/ui/interactive-card'
import { useAuth } from '@/context/auth'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex-helpers/react/cache'
import { ArrowRightIcon } from 'lucide-react'

export const Route = createFileRoute('/dashboard/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Your Forms</h1>
      {user && <FormList userId={user._id} />}
    </div>
  )
}

function FormList({ userId }: { userId: Id<'user'> }) {
  const forms = useQuery(api.form.getForms, { userId })
  const navigate = useNavigate()
  if (!forms) return <LoaderComponent />
  const isEmpty = forms && forms.length === 0
  return (
    <div className="grid grid-cols-3 gap-2">
      {isEmpty && (
        <div>
          {' '}
          You don't have any forms yet. <Link to="/dashboard/forms">
            add
          </Link>{' '}
          forms to continue
        </div>
      )}
      {!isEmpty &&
        forms?.map((form) => (
          <InteractiveCard
            key={form._id}
            title={form.title}
            description={form.description}
            button={{
              text: 'Check Out',
              icon: ArrowRightIcon,
              onClick: () =>
                navigate({
                  to: '/dashboard/$form_id',
                  params: { form_id: form._id },
                }),
            }}
            animationDuration="normal"
          ></InteractiveCard>
        ))}
    </div>
  )
}
