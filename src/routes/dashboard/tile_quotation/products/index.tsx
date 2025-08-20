import { LoaderComponent } from '@/components/loader-component'
import { TileMaterialManager } from '@/components/tile_materials'
import { useAuth } from '@/context/auth'
import { useTileMaterialManagement } from '@/hooks/useTileMaterialManagement'
import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/tile_quotation/products/')({
	component: () => {
		const { user } = useAuth()
		if (!user) return null
		return <RouteComponent userId={user._id} />
	},
})

function RouteComponent({ userId }: { userId: Id<'user'> }) {
	const { data, handleSave, handleUpdate, handleImport } = useTileMaterialManagement()
	if (!data) return <LoaderComponent />
	return (
		<div>
			<TileMaterialManager
				data={data}
				userId={userId}
				onAdd={handleSave}
				onImport={handleImport}
				onUpdate={handleUpdate}
			/>
		</div>
	)
}
