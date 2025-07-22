import { InteractiveCard } from '@/components/ui/interactive-card'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle, PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useAuth } from '@/context/auth'

export const Route = createFileRoute('/dashboard/forms')({
  component: RouteComponent,
})

type FormType = null | 'tile' | 'curtains'

function RouteComponent() {
  const [open, setIsOpen] = useState(false)
  const [form, setForm] = useState<FormType>(null)
  return (
    <div className="p-8">
      <AddFormDialog
        open={open}
        onOpenChange={(e) => {
          setIsOpen(e)
          if (e) setForm(null)
        }}
        type={form}
      />
      <h1 className="text-3xl font-bold my-4">Templates</h1>
      <div className="grid grid-cols-3 gap-2">
        <InteractiveCard
          title="Tile Form"
          description="Quickly generate your custom tile quotation with our easy-to-use form. Get an accurate estimate and instantly download your detailed quote as a PDF for your records."
          button={{
            text: 'Add',
            icon: PlusIcon,
            onClick: () => {
              setIsOpen(true)
              setForm('tile')
            },
          }}
          animationDuration="normal"
        ></InteractiveCard>
        <InteractiveCard
          title="Curtain Form"
          description="Create your custom curtain quotation in just a few steps. Enter your details, calculate the cost, and download your personalized quote as a PDF instantly."
          button={{
            text: 'Add',
            icon: PlusIcon,
            onClick: () => {
              setIsOpen(true)
              setForm('curtains')
            },
          }}
          animationDuration="normal"
        ></InteractiveCard>
      </div>
    </div>
  )
}

const formSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
})

function AddFormDialog({
  open,
  onOpenChange,
  type,
}: {
  open?: boolean
  onOpenChange?: (e: boolean) => void
  type: FormType
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })
  const addForm = useMutation(api.form.addFormForUser)
  const { user } = useAuth()

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (type && user) {
      await addForm({
        type,
        title: values.title,
        description: values.description,
        userId: user._id,
      })
    }
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Form</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your form title"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Form Description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <LoaderCircle className="size-4" />
                ) : (
                  'Submit'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
