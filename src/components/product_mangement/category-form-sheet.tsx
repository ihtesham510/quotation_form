import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import { categorySchema, type CategoryFormValues } from './schemas'
import type { Category } from './types'

interface CategoryFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CategoryFormValues) => void
  defaultValues?: Category
}

export function CategoryFormSheet({
  open,
  onOpenChange,
  onSave,
  defaultValues,
}: CategoryFormSheetProps) {
  const isEditing = !!defaultValues

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      title: defaultValues?.name || '',
      description: defaultValues?.description || '',
    },
  })

  const handleSave = (data: CategoryFormValues) => {
    onSave(data)
    form.reset()
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader className="flex-shrink-0 px-6 pt-6">
          <SheetTitle>
            {isEditing ? 'Edit Category' : 'Add Category'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update the category details below.'
              : 'Create a new category for your products.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="flex flex-col h-full"
            >
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter category title"
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
                            placeholder="Enter category description"
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <SheetFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-background">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {isEditing ? 'Update Category' : 'Create Category'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
