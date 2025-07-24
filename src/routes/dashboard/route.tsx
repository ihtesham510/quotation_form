import { AppSidebar } from '@/components/sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth'
import { ProtectedRoute } from '@/hoc/protected-routes'
import { ChatBot } from '@/components/chat-bot'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedRoute>
      <ChatBot />
      <RouteComponent />
    </ProtectedRoute>
  ),
})

function RouteComponent() {
  const { signOut } = useAuth()
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <div className="flex flex-col w-full">
        <header className="px-4 md:px-8 flex justify-between items-center mt-2 py-2 w-full">
          <SidebarTrigger />
          <Button variant="secondary" onClick={async () => await signOut()}>
            Log Out
          </Button>
        </header>
        <Outlet />
      </div>
    </SidebarProvider>
  )
}
