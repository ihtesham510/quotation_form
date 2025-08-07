import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from './scroll-area'

export interface CommandSelectOption {
	value: string
	label: string
	description?: string
}

interface CommandSelectProps {
	options: CommandSelectOption[]
	value?: string
	onValueChange: (value: string) => void
	placeholder?: string
	searchPlaceholder?: string
	emptyMessage?: string
	className?: string
	disabled?: boolean
}

export function CommandSelect({
	options,
	value,
	onValueChange,
	placeholder = 'Select option...',
	searchPlaceholder = 'Search...',
	emptyMessage = 'No option found.',
	disabled = false,
}: CommandSelectProps) {
	const [open, setOpen] = React.useState(false)

	const selectedOption = options.find(option => option.value === value)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant='outline'
					aria-expanded={open}
					className='w-full justify-between p-4'
					disabled={disabled}
				>
					{selectedOption ? <span>{selectedOption.label}</span> : placeholder}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-full p-0' align='start'>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyMessage}</CommandEmpty>
						<CommandGroup>
							<ScrollArea className='h-[280px] w-sm pr-1.5'>
								{options.map(option => (
									<CommandItem
										key={option.value}
										value={option.value}
										keywords={[option.label]}
										onSelect={currentValue => {
											onValueChange(currentValue === value ? '' : currentValue)
											setOpen(false)
										}}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												value === option.value ? 'opacity-100' : 'opacity-0',
											)}
										/>
										<div className='flex flex-col'>
											<span>{option.label}</span>
											{option.description && (
												<span className='text-xs text-muted-foreground'>
													{option.description}
												</span>
											)}
										</div>
									</CommandItem>
								))}
							</ScrollArea>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
