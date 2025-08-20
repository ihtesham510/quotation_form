import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

interface StepNavigationProps {
	currentStep: number
	totalSteps: number
	stepLabels: string[]
	onStepChange: (step: number) => void
	canNavigateToStep: (step: number) => boolean
}

export function StepNavigation({
	currentStep,
	totalSteps,
	stepLabels = [],
	onStepChange,
	canNavigateToStep,
}: StepNavigationProps) {
	if (!stepLabels || stepLabels.length === 0) {
		return null
	}

	const completionPercentage = Math.round((currentStep / totalSteps) * 100)

	return (
		<div className='w-full mb-8'>
			{/* Step Navigation Buttons */}
			<div className='flex flex-wrap gap-2 justify-between mb-6 w-full'>
				{stepLabels.map((label, index) => {
					const stepNumber = index + 1
					const isActive = stepNumber === currentStep
					const isCompleted = stepNumber < currentStep
					const canNavigate = canNavigateToStep(stepNumber) || stepNumber === currentStep

					return (
						<Button
							key={stepNumber}
							variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
							size='sm'
							onClick={() => onStepChange(stepNumber)}
							disabled={!canNavigate}
							className={cn(
								'flex items-center gap-2 min-w-[140px] justify-start',
								isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
								isCompleted && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
								!canNavigate && 'opacity-50 cursor-not-allowed',
							)}
						>
							<div
								className={cn(
									'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
									isActive && 'bg-primary-foreground text-primary',
									isCompleted && 'bg-primary text-primary-foreground',
									!isActive && !isCompleted && 'bg-muted text-muted-foreground',
								)}
							>
								{isCompleted ? '✓' : stepNumber}
							</div>
							<span className='text-sm font-medium'>{label}</span>
						</Button>
					)
				})}
			</div>

			{/* Progress Bar */}
			<div className='w-full'>
				<div className='flex justify-between items-center mb-2'>
					<span className='text-sm font-medium'>
						Step {currentStep} of {totalSteps}
					</span>
					<span className='text-sm font-medium'>{completionPercentage}% Complete</span>
				</div>
				<Progress value={completionPercentage} max={100} />
			</div>
		</div>
	)
}
