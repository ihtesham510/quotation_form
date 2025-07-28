import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, ChevronsUpDownIcon } from 'lucide-react'
import { Button } from './ui/button'

interface CommandSelectProps extends PropsWithChildren {
  open?: boolean
  onOpenChange?: (e: boolean) => void
  asChild?: boolean
  list: { value: string; label: string }[]
  onSelect: (e: string) => void
  value?: string
}

const commandSelectContext = createContext<CommandSelectProps | null>(null)

function useCommandSelect() {
  const ctx = useContext(commandSelectContext)
  if (!ctx)
    throw new Error(
      'useCommandSelect must be used inside commandSelectContext provider',
    )
  return ctx
}

export function CommandSelect({
  children,
  asChild,
  list,
  onSelect,
  open,
  onOpenChange,
  value,
}: CommandSelectProps) {
  const [isOpen, setIsOpen] = useState(open ?? false)

  useEffect(() => {
    if (open) {
      setIsOpen(open)
    }
  }, [open])

  return (
    <commandSelectContext.Provider
      value={{
        children,
        asChild,
        list,
        onSelect,
        open,
        onOpenChange,
        value,
      }}
    >
      <Popover
        open={isOpen}
        onOpenChange={(e) => {
          setIsOpen(e)
          onOpenChange?.(e)
        }}
      >
        <PopoverTrigger asChild={asChild}>{children}</PopoverTrigger>
        <PopoverContent className="p-0 max-w-2xl min-w-md">
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No voices found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[280px] pr-1.5">
                  {list.map((item, index) => (
                    <CommandItem
                      key={index}
                      value={item.value}
                      keywords={[item.label, item.value]}
                      onSelect={(value) => {
                        onSelect(value)
                      }}
                      className="flex gap-2"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === item.value ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <p>{item.label}</p>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </commandSelectContext.Provider>
  )
}

export function CommandSelectTrigger() {
  const { list, value } = useCommandSelect()
  return (
    <Button
      className="w-full md:min-w-[150px] md:max-w-[200px]"
      variant="secondary"
    >
      {list.find((item) => item.value === value)?.label ?? 'Select Value'}
      <ChevronsUpDownIcon className="size-4" />
    </Button>
  )
}
