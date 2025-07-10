import { createFileRoute } from '@tanstack/react-router'
import { MultiStepForm } from '@/components/multistep-form'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="max-h-[75vh] min-h-[45vh] max-w-[60%] min-w-[50%]">
        <MultiStepForm />
      </div>
    </div>
  )
}
