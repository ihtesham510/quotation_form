import { createFileRoute } from '@tanstack/react-router'
import { MultiStepForm } from '@/components/multistep-form'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="max-w-full max-h-full lg:max-w-[60%] lg:min-w-[50%]">
        <MultiStepForm />
      </div>
    </div>
  )
}
