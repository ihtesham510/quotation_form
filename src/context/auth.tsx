import { usePersistentState } from '@/hooks/usePersistantState'
import { api } from 'convex/_generated/api'
import type { DataModel, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useQuery } from 'convex-helpers/react/cache'
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from 'react'
import { toast } from 'sonner'

type SignInData = { email: string; password: string }
type SignUpData = {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface AuthContext {
  isLoading: boolean
  isAuthenticated: boolean
  user: DataModel['user']['document'] | null | undefined
  signIn: (data: SignInData) => void
  signUp: (data: SignUpData) => void
  signOut: () => Promise<void>
}

export const authContext = createContext<AuthContext | null>(null)

export function AuthContextProvdider({ children }: PropsWithChildren) {
  const [id, setId, resetId] = usePersistentState<Id<'user'> | null>(null, {
    key: 'token',
  })
  const user = useQuery(api.user.getUser, { userId: id ?? undefined })
  const signInMutation = useMutation(api.user.signIn)
  const signUpMutation = useMutation(api.user.signUp)

  const isLoading = user === undefined
  const isAuthenticated = !!user

  const signIn = useCallback(
    async (data: SignInData) => {
      try {
        const id = await signInMutation(data)
        if (id) {
          setId(id)
          toast.success('Signed In Successfully')
        }
      } catch (err) {
        toast.error('Error while signing in')
        console.log(err)
      }
    },
    [user],
  )

  const signUp = useCallback(
    async (data: SignUpData) => {
      try {
        const id = await signUpMutation(data)
        if (id) {
          setId(id)
          toast.success('Signed Up Successfully')
        }
      } catch (err) {
        console.log(err)
        toast.error('Error while signing up')
      }
    },
    [user],
  )

  const signOut = async () => await resetId()

  return (
    <authContext.Provider
      value={{ isLoading, isAuthenticated, user, signIn, signUp, signOut }}
    >
      {children}
    </authContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(authContext)
  if (!ctx)
    throw new Error('use Auth must be used inside auth context provider')
  return ctx
}
