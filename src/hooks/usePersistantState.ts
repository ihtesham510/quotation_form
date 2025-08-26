import { useState, useEffect, useCallback } from 'react'
import { useEncryptedLocalStorage } from './useEncryptedLocalStorage'

interface PersistentStateOptions {
	key: string
	encryptionKey?: string
	syncAcrossTabs?: boolean
}

export function usePersistentState<T>(initialState: T, options: PersistentStateOptions) {
	const { key, encryptionKey = 'persistent-state-key', syncAcrossTabs = false } = options

	const [localState, setLocalState] = useState<T>(initialState)
	const [isReady, setIsReady] = useState<boolean>(false)

	const {
		value: storedValue,
		setValue: setStoredValue,
		removeValue: removeStoredValue,
		isLoading,
		error,
	} = useEncryptedLocalStorage<T>({
		key,
		encryptionKey,
		initialValue: initialState,
	})

	// Sync local state with stored value once loaded
	useEffect(() => {
		if (!isLoading && !error) {
			const valueToUse = storedValue !== null ? storedValue : initialState
			setLocalState(valueToUse)
			setIsReady(true)
		}
	}, [storedValue, isLoading, error, initialState])

	// Cross-tab synchronization
	useEffect(() => {
		if (!syncAcrossTabs || !isReady) return

		const handleStorageChange = async (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				// The storage event contains encrypted data, so we need to
				// trigger a re-read of the encrypted storage
				try {
					// Force re-evaluation by updating the stored value
					// This is a bit of a workaround since we can't directly decrypt here
					window.location.reload() // Simple approach - reload to sync
				} catch (err) {
					console.error('Failed to sync across tabs:', err)
				}
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [key, syncAcrossTabs, isReady])

	// Enhanced setState that supports both direct values and updater functions
	const setState = useCallback(
		async (value: T | ((prevState: T) => T)) => {
			try {
				const newValue = typeof value === 'function' ? (value as (prevState: T) => T)(localState) : value

				// Update local state immediately for better UX
				setLocalState(newValue)

				// Then persist to encrypted storage
				await setStoredValue(newValue)
			} catch (err) {
				// If storage fails, revert local state
				setLocalState(localState)
				throw err
			}
		},
		[localState, setStoredValue],
	)

	// Clear state entirely
	const clearState = useCallback(async () => {
		try {
			setLocalState(initialState)
			await removeStoredValue()
		} catch (err) {
			throw err
		}
	}, [initialState, removeStoredValue])

	return [localState, setState, clearState, isLoading, error, isReady] as const
}
