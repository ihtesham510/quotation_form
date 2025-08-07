import { LoaderCircle } from 'lucide-react'

export function LoaderComponent() {
	return (
		<div className='h-screen w-full flex justify-center items-center'>
			<LoaderCircle className='size-8 animate-spin' />
		</div>
	)
}
