import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { ConvexProvider, ConvexReactClient, useConvex } from 'convex/react'
import { ConvexQueryCacheProvider } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'

import { routeTree } from './routeTree.gen'

document.documentElement.classList.add('dark')

import './index.css'
import reportWebVitals from './reportWebVitals.ts'
import { Toaster } from './components/ui/sonner.tsx'
import { AuthContextProvdider, useAuth } from './context/auth.tsx'

const router = createRouter({
  routeTree,
  context: undefined!,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

function App() {
  const auth = useAuth()
  const convex = useConvex()
  return <RouterProvider router={router} context={{ auth, convex, api }} />
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Toaster />
      <ConvexProvider client={convex}>
        <ConvexQueryCacheProvider>
          <AuthContextProvdider>
            <App />
          </AuthContextProvdider>
        </ConvexQueryCacheProvider>
      </ConvexProvider>
    </StrictMode>,
  )
}

reportWebVitals()
