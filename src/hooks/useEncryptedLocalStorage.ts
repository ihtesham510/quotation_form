import { useState, useEffect, useCallback } from 'react'

interface EncryptedStorageOptions {
	key: string
	encryptionKey?: string
	initialValue?: any
}

interface UseEncryptedLocalStorageReturn<T> {
	value: T | null
	setValue: (value: T) => Promise<void>
	removeValue: () => Promise<void>
	isLoading: boolean
	error: string | null
}

const generateKey = async (password: string): Promise<CryptoKey> => {
	const encoder = new TextEncoder()
	const keyMaterial = await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
		'deriveBits',
		'deriveKey',
	])

	return window.crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: encoder.encode('useEncryptedLocalStorage'),
			iterations: 100000,
			hash: 'SHA-256',
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt'],
	)
}

const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
	const encoder = new TextEncoder()
	const iv = window.crypto.getRandomValues(new Uint8Array(12))

	const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data))

	const combined = new Uint8Array(iv.length + encrypted.byteLength)
	combined.set(iv)
	combined.set(new Uint8Array(encrypted), iv.length)

	return btoa(String.fromCharCode(...combined))
}

const decryptData = async (encryptedData: string, key: CryptoKey): Promise<string> => {
	try {
		const combined = new Uint8Array(
			atob(encryptedData)
				.split('')
				.map(char => char.charCodeAt(0)),
		)

		const iv = combined.slice(0, 12)
		const data = combined.slice(12)

		const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)

		return new TextDecoder().decode(decrypted)
	} catch (error) {
		throw new Error('Failed to decrypt data')
	}
}

export function useEncryptedLocalStorage<T = any>({
	key,
	encryptionKey = 'default-encryption-key',
	initialValue = null,
}: EncryptedStorageOptions): UseEncryptedLocalStorageReturn<T> {
	const [value, setValue] = useState<T | null>(initialValue)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [error, setError] = useState<string | null>(null)
	const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null)

	useEffect(() => {
		const initKey = async () => {
			try {
				const key = await generateKey(encryptionKey)
				setCryptoKey(key)
			} catch (err) {
				setError('Failed to initialize encryption key')
				setIsLoading(false)
			}
		}

		initKey()
	}, [encryptionKey])

	useEffect(() => {
		const loadStoredValue = async () => {
			if (!cryptoKey) return

			try {
				setIsLoading(true)
				setError(null)

				const storedValue = localStorage.getItem(key)
				if (storedValue) {
					const decryptedValue = await decryptData(storedValue, cryptoKey)
					const parsedValue = JSON.parse(decryptedValue)
					setValue(parsedValue)
				} else {
					setValue(initialValue)
				}
			} catch (err) {
				setError('Failed to load stored value')
				setValue(initialValue)
			} finally {
				setIsLoading(false)
			}
		}

		loadStoredValue()
	}, [cryptoKey, key, initialValue])

	const setStoredValue = useCallback(
		async (newValue: T) => {
			if (!cryptoKey) {
				setError('Encryption key not initialized')
				return
			}

			try {
				setError(null)
				const serializedValue = JSON.stringify(newValue)
				const encryptedValue = await encryptData(serializedValue, cryptoKey)

				localStorage.setItem(key, encryptedValue)
				setValue(newValue)
			} catch (err) {
				setError('Failed to store value')
				throw err
			}
		},
		[cryptoKey, key],
	)

	const removeStoredValue = useCallback(async () => {
		try {
			setError(null)
			localStorage.removeItem(key)
			setValue(null)
		} catch (err) {
			setError('Failed to remove value')
			throw err
		}
	}, [key])

	return {
		value,
		setValue: setStoredValue,
		removeValue: removeStoredValue,
		isLoading,
		error,
	}
}
