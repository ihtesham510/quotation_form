import { useCallback, useEffect, useState } from 'react'

const encrypt = (text: string, key: string): string => {
	try {
		const encrypted = text
			.split('')
			.map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length)))
			.join('')
		return btoa(encrypted)
	} catch (error) {
		console.error('Encryption failed:', error)
		return text
	}
}

const decrypt = (encryptedText: string, key: string): string => {
	try {
		const decoded = atob(encryptedText)
		const decrypted = decoded
			.split('')
			.map((char, index) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(index % key.length)))
			.join('')
		return decrypted
	} catch (error) {
		console.error('Decryption failed:', error)
		return encryptedText
	}
}

// Default serialization functions similar to Mantine's approach
const defaultSerialize = <T>(value: T): string => JSON.stringify(value)
const defaultDeserialize = <T>(value: string): T => JSON.parse(value)

interface UseEncryptedLocalStorageOptions<T> {
	serialize?: (value: T) => string
	deserialize?: (value: string) => T
	encryptionKey?: string
	getInitialValueInEffect?: boolean
}

export function useEncryptedLocalStorage<T = string>(
	key: string,
	defaultValue: T,
	options: UseEncryptedLocalStorageOptions<T> = {},
): [T, (value: T | ((prevValue: T) => T)) => void, () => void] {
	const {
		serialize = defaultSerialize,
		deserialize = defaultDeserialize,
		encryptionKey = 'default-encryption-key',
		getInitialValueInEffect = true,
	} = options

	const [storedValue, setStoredValue] = useState<T>(() => {
		if (getInitialValueInEffect) {
			return defaultValue
		}

		try {
			const item = window.localStorage.getItem(key)
			if (item === null) {
				return defaultValue
			}

			const decryptedItem = decrypt(item, encryptionKey)
			return deserialize(decryptedItem)
		} catch (error) {
			console.error(`Error reading localStorage key "${key}":`, error)
			return defaultValue
		}
	})

	// Read initial value from localStorage in effect (similar to Mantine's approach)
	useEffect(() => {
		if (getInitialValueInEffect) {
			try {
				const item = window.localStorage.getItem(key)
				if (item !== null) {
					const decryptedItem = decrypt(item, encryptionKey)
					setStoredValue(deserialize(decryptedItem))
				}
			} catch (error) {
				console.error(`Error reading localStorage key "${key}" in effect:`, error)
			}
		}
	}, [key, deserialize, encryptionKey, getInitialValueInEffect])

	// Listen for storage changes across tabs
	useEffect(() => {
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === key && e.newValue !== null) {
				try {
					const decryptedValue = decrypt(e.newValue, encryptionKey)
					setStoredValue(deserialize(decryptedValue))
				} catch (error) {
					console.error(`Error processing storage change for key "${key}":`, error)
				}
			}
		}

		window.addEventListener('storage', handleStorageChange)
		return () => window.removeEventListener('storage', handleStorageChange)
	}, [key, deserialize, encryptionKey])

	const setValue = useCallback(
		(value: T | ((prevValue: T) => T)) => {
			try {
				const valueToStore = value instanceof Function ? value(storedValue) : value
				setStoredValue(valueToStore)

				const serializedValue = serialize(valueToStore)
				const encryptedValue = encrypt(serializedValue, encryptionKey)
				window.localStorage.setItem(key, encryptedValue)
			} catch (error) {
				console.error(`Error setting localStorage key "${key}":`, error)
			}
		},
		[key, serialize, encryptionKey, storedValue],
	)

	const removeValue = useCallback(() => {
		try {
			window.localStorage.removeItem(key)
			setStoredValue(defaultValue)
		} catch (error) {
			console.error(`Error removing localStorage key "${key}":`, error)
		}
	}, [key, defaultValue])

	return [storedValue, setValue, removeValue]
}

// Utility function to read encrypted localStorage value without hook
export function readEncryptedLocalStorageValue<T>(
	key: string,
	defaultValue: T,
	options: Pick<UseEncryptedLocalStorageOptions<T>, 'deserialize' | 'encryptionKey'> = {},
): T {
	const { deserialize = defaultDeserialize, encryptionKey = 'default-encryption-key' } = options

	try {
		const item = window.localStorage.getItem(key)
		if (item === null) {
			return defaultValue
		}

		const decryptedItem = decrypt(item, encryptionKey)
		return deserialize(decryptedItem)
	} catch (error) {
		console.error(`Error reading localStorage key "${key}":`, error)
		return defaultValue
	}
}
