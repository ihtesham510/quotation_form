import * as React from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function PasswordInput({ className, ...props }: InputProps) {
	const [showPassword, setShowPassword] = React.useState(false)

	const isDisabled = props.value === '' || props.value === undefined || props.disabled

	return (
		<div className='relative'>
			<Input
				{...props}
				type={showPassword ? 'text' : 'password'}
				className={cn('hide-password-toggle pr-10', className)}
			/>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
				onClick={() => setShowPassword(prev => !prev)}
				disabled={isDisabled}
				tabIndex={-1}
			>
				{showPassword && !isDisabled ? (
					<EyeIcon className='h-4 w-4' aria-hidden='true' />
				) : (
					<EyeOffIcon className='h-4 w-4' aria-hidden='true' />
				)}
				<span className='sr-only'>{showPassword ? 'Hide password' : 'Show password'}</span>
			</Button>

			<style>{`
				.hide-password-toggle::-ms-reveal,
				.hide-password-toggle::-ms-clear {
					visibility: hidden;
					pointer-events: none;
					display: none;
				}
			`}</style>
		</div>
	)
}
