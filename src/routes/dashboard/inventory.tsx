import { LoaderComponent } from '@/components/loader-component'
import { useAuth } from '@/context/auth'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex-helpers/react/cache'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
    <div>
      {isEmpty && (
        <div>
          {' '}
          You don't have any forms yet. <Link to="/dashboard/forms">
            add
          </Link>{' '}
          forms to continue
        </div>
      )}
      {!isEmpty && (
        <Table>
          <TableCaption>A list of Your Forms.</TableCaption>
          <TableHeader>
            <TableRow className="font-bold">
              <TableHead className="font-bold">Title</TableHead>
              <TableHead className="font-bold">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms?.map((form, index) => (
              <TableRow
                key={index}
                onClick={() =>
                  navigate({
                    to: '/dashboard/$form_id',
                    params: { form_id: form._id },
                  })
                }
                className="cursor-pointer"
              >
                <TableCell>{form.title}</TableCell>
                <TableCell>{form.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
