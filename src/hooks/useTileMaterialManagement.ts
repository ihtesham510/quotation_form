import type { OnAddEvent, OnUpdateEvent, TypeMaterialsData } from '@/components/tile_materials/types'
import { useAuth } from '@/context/auth'
import { useQuery } from 'convex-helpers/react/cache'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'

export function useTileMaterialManagement() {
	const { user } = useAuth()
	const data = useQuery(api.tile_materials.getAlldata, { userId: user!._id })
	// add mutations
	const addMaterial = useMutation(api.tile_materials.addMaterial)
	const addSize = useMutation(api.tile_materials.addSize)
	const addStyle = useMutation(api.tile_materials.addStyle)
	const addFinish = useMutation(api.tile_materials.addFinish)
	// update mutations
	const updateMaterial = useMutation(api.tile_materials.updateMaterial)
	const updateSize = useMutation(api.tile_materials.updateSize)
	const updateStyle = useMutation(api.tile_materials.updateStyle)
	const updateFinish = useMutation(api.tile_materials.updateFinish)

	// import handler
	function handleImport(data: TypeMaterialsData) {
		const userId = user!._id
		const styleMap = new Map<string, Id<'tile_styles'>>()
		const sizesMap = new Map<string, Id<'tile_sizes'>>()
		const finishesMap = new Map<string, Id<'tile_finishes'>>()
		toast.promise(
			async () => {
				await Promise.all(
					data.styles.map(async style => {
						const id = await addStyle({
							userId,
							name: style.name,
							multiplier: style.multiplier,
						})
						styleMap.set(style._id, id)
					}),
				)
				await Promise.all(
					data.sizes.map(async size => {
						const id = await addSize({
							userId,
							name: size.name,
							size: size.size,
						})
						sizesMap.set(size._id, id)
					}),
				)
				await Promise.all(
					data.sizes.map(async size => {
						const id = await addSize({
							userId,
							name: size.name,
							size: size.size,
						})
						sizesMap.set(size._id, id)
					}),
				)
				await Promise.all(
					data.finish.map(async finish => {
						const id = await addFinish({
							userId,
							name: finish.name,
							premium: finish.premium,
						})
						finishesMap.set(finish._id, id)
					}),
				)
				await Promise.all(
					data.materials.map(async material => {
						const sizeIds = material.sizeIds.reduce<Id<'tile_sizes'>[]>((acc, id) => {
							const val = sizesMap.get(id)
							if (val) acc.push(val)
							return acc
						}, [])
						const styleIds = material.styleIds.reduce<Id<'tile_styles'>[]>((acc, id) => {
							const val = styleMap.get(id)
							if (val) acc.push(val)
							return acc
						}, [])
						const finishIds = material.finishIds.reduce<Id<'tile_finishes'>[]>((acc, id) => {
							const val = finishesMap.get(id)
							if (val) acc.push(val)
							return acc
						}, [])
						await addMaterial({
							name: material.name,
							basePrice: material.basePrice,
							sizeIds,
							finishIds,
							styleIds,
							userId,
						})
					}),
				)
			},
			{
				loading: 'Importing Data',
				error: 'Error while importing data',
				success: 'Imported data successfully.',
			},
		)
	}

	const handleSave = async (args: OnAddEvent) => {
		switch (args.type) {
			case 'size':
				await addSize(args.data)
				return
			case 'finish':
				await addFinish(args.data)
				return
			case 'material':
				await addMaterial(args.data)
				return
			case 'style':
				await addStyle(args.data)
				return
		}
	}
	const handleUpdate = async (args: OnUpdateEvent) => {
		switch (args.type) {
			case 'size': {
				const { _id, ...data } = args.data
				await updateSize({ id: _id, ...data })
				return
			}

			case 'finish': {
				const { _id, ...data } = args.data
				await updateFinish({ id: _id, ...data })
				return
			}
			case 'material': {
				const { _id, ...data } = args.data
				await updateMaterial({ id: _id, ...data })
				return
			}
			case 'style': {
				const { _id, ...data } = args.data
				await updateStyle({ id: _id, ...data })
				return
			}
		}
	}

	return { data, handleSave, handleUpdate, handleImport }
}
