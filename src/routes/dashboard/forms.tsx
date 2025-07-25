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
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useIsMobile } from '@/hooks/use-mobile'

export const Route = createFileRoute('/dashboard/forms')({
  component: RouteComponent,
})

type FormType = null | 'tile' | 'curtains'

function RouteComponent() {
  const [open, setIsOpen] = useState(false)
  const [form, setForm] = useState<FormType>(null)
  const isMobile = useIsMobile()
  return (
    <div className="p-8 mb-8">
      <AddFormDialog
        open={open}
        onOpenChange={(e) => {
          setIsOpen(e)
          if (e) setForm(null)
        }}
        type={form}
      />
      <h1 className="text-3xl font-bold my-4">Templates</h1>
      <div className="space-y-4 gap-2">
        <Card
          onClick={() => {
            setForm('tile')
            setIsOpen(true)
          }}
        >
          <CardHeader>
            <CardTitle>Tile Form</CardTitle>
            <CardDescription>
              Quickly generate your custom tile quotation with our easy-to-use
              form. Get an accurate estimate and instantly download your
              detailed quote as a PDF for your records.
            </CardDescription>
            {!isMobile && (
              <div
                className={`absolute opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 z-30`}
              >
                {/* Blur backdrop behind button */}
                <div className="absolute inset-0 -m-2 rounded-lg backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-border/20" />
                <Button
                  size="sm"
                  className="relative z-10 shadow-lg hover:shadow-xl transition-shadow duration-100"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardFooter className="flex md:justify-end">
            <Button>
              <p>Add</p> <PlusIcon className="size-4" />
            </Button>
          </CardFooter>
        </Card>
        <Card
          onClick={() => {
            setForm('curtains')
            setIsOpen(true)
          }}
        >
          <CardHeader>
            <CardTitle>Curtain Form</CardTitle>
            <CardDescription>
              Create your custom curtain quotation in just a few steps. Enter
              your details, calculate the cost, and download your personalized
              quote as a PDF instantly.
            </CardDescription>
            {!isMobile && (
              <div
                className={`absolute opacity-0 transition-all group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 z-30`}
              >
                {/* Blur backdrop behind button */}
                <div className="absolute inset-0 -m-2 rounded-lg backdrop-blur-sm bg-background/20 dark:bg-background/10 border border-border/20" />
                <Button
                  size="sm"
                  className="relative z-10 shadow-lg hover:shadow-xl transition-shadow duration-100"
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardFooter className="flex md:justify-end">
            <Button>
              <p>Add</p> <PlusIcon className="size-4" />
            </Button>
          </CardFooter>
        </Card>
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
