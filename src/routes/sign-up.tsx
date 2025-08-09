import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useConvex } from 'convex/react'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { api } from 'convex/_generated/api'
import { useAuth } from '@/context/auth'
import { PasswordInput } from '@/components/ui/password-input'
import { UnProtectedRoute } from '@/hoc/unprotected-routes'

export const Route = createFileRoute('/sign-up')({
	component: () => (
		<UnProtectedRoute>
			<RouteComponent />
		</UnProtectedRoute>
	),
})

function RouteComponent() {
	return (
		<section className='flex min-h-screen px-4 py-16 md:py-32'>
			<SignUpForm />
		</section>
	)
}

function SignUpForm() {
	const convex = useConvex()
	const { signUp } = useAuth()
	const formSchema = z
		.object({
			email: z.string().email(),
			first_name: z.string(),
			last_name: z.string(),
			password: z.string().min(8),
		})
		.superRefine(async ({ email, password }, ctx) => {
			const userExits = await convex.query(api.user.userExists, { email })
			const auth = await convex.query(api.user.auth, { email, password })
			if (userExits) {
				ctx.addIssue({
					code: 'custom',
					message: 'Email already exits',
					path: ['email'],
				})
			}
		})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

	const onSubmit = (values: z.infer<typeof formSchema>) => signUp(values)

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='max-w-92 m-auto h-fit w-full'
			>
				<div className='p-6'>
					<div>
						<h1 className='mt-6 text-balance text-xl font-semibold'>
							<span className='text-muted-foreground'>
								Welcome back <br className='opacity-0' />
							</span>{' '}
							Sign Up to continue
						</h1>
					</div>

					<hr className='mb-5 mt-6' />

					<div className='space-y-6'>
						<div className='space-y-2'>
							<FormField
								control={form.control}
								name='first_name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<Input
												required
												id='first_name'
												{...field}
												className='ring-foreground/15 border-transparent ring-1'
											/>
										</FormControl>
										<FormDescription />
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='last_name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<Input
												required
												id='last_name'
												{...field}
												className='ring-foreground/15 border-transparent ring-1'
											/>
										</FormControl>
										<FormDescription />
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type='email'
												required
												id='email'
												{...field}
												placeholder='Your email'
												className='ring-foreground/15 border-transparent ring-1'
											/>
										</FormControl>
										<FormDescription />
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<PasswordInput
												required
												{...field}
												className='ring-foreground/15 border-transparent ring-1'
											/>
										</FormControl>
										<FormDescription />
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button className='w-full' size='default'>
							Continue
						</Button>
					</div>
				</div>

				<div className='px-6'>
					<p className='text-muted-foreground text-sm'>
						Already have an account ?
						<Button asChild variant='link' className='px-2'>
							<Link to='/sign-in'>Sign in</Link>
						</Button>
					</p>
				</div>
			</form>
		</Form>
	)
}
