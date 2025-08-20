import type React from 'react'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Download } from 'lucide-react'
import { toast } from 'sonner'
import { MaterialsDataSchema, type ImportExportControlsProps } from './types'
import { validateRelations } from './utils'

export function ImportExportControls({ data, onImport, onExport }: ImportExportControlsProps) {
	const fileInputRef = useRef<HTMLInputElement>(null)

	const handleExport = () => {
		try {
			const jsonString = JSON.stringify(data, null, 2)
			const blob = new Blob([jsonString], { type: 'application/json' })
			const url = URL.createObjectURL(blob)

			const a = document.createElement('a')
			a.href = url
			a.download = `materials-data-${new Date().toISOString().split('T')[0]}.json`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)

			onExport?.(data)
			toast.success('Export successful! File downloaded.')
		} catch (error) {
			console.error('Export failed:', error)
			toast.error('Export failed. Please try again.')
		}
	}

	const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return
		const reader = new FileReader()
		reader.onload = e => {
			try {
				const rawData = JSON.parse(e.target?.result as string)
				const parseResult = MaterialsDataSchema.safeParse(rawData)
				if (!parseResult.success) {
					const errorMessages = parseResult.error.errors.map(err => {
						const path = err.path.length > 0 ? `${err.path.join('.')}` : 'root'
						return `${path}: ${err.message}`
					})
					const detailedError = errorMessages.join('\n• ')
					toast.error(`Import failed - Data validation errors:\n• ${detailedError}`)
					return
				}
				const isValid = validateRelations(parseResult.data)
				if (!isValid) {
					toast.error('Validation Failed, Relations are not valid.')
					return
				}
				const validatedData = parseResult.data
				onImport?.(validatedData)
			} catch (error) {
				console.error('Import failed:', error)
				if (error instanceof SyntaxError) {
					toast.error(`Import failed - Invalid JSON format: ${error.message}`)
				} else {
					toast.error('Import failed - An unexpected error occurred. Please check the file format and try again.')
				}
			}
		}

		reader.onerror = () => {
			toast.error('Failed to read file. Please try again.')
		}

		reader.readAsText(file)

		// Reset the input
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	return (
		<Card>
			<CardContent className='pt-6'>
				<div className='flex gap-4 items-center'>
					<Button onClick={handleExport} variant='outline'>
						<Download className='w-4 h-4 mr-2' />
						Export to JSON
					</Button>
					<Button onClick={() => fileInputRef.current?.click()} variant='outline'>
						<Upload className='w-4 h-4 mr-2' />
						Import from JSON
					</Button>
					<input ref={fileInputRef} type='file' accept='.json' onChange={handleImport} className='hidden' />
					<p className='text-sm text-muted-foreground'>Import/Export all materials data in JSON format</p>
				</div>
			</CardContent>
		</Card>
	)
}
