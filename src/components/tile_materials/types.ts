import type { Id } from 'convex/_generated/dataModel'
import type { Style, Material, Size, Finish } from '@/components/tile_form/types'
import { z } from 'zod'

export type NewTileMaterial = Omit<Material, '_id' | '_creationTime'>
export type NewTileStyle = Omit<Style, '_id' | '_creationTime'>
export type NewTileSize = Omit<Size, '_id' | '_creationTime'>
export type NewTileFinish = Omit<Finish, '_id' | '_creationTime'>

export type MaterialFormData = Omit<Material, '_creationTime' | '_id' | 'userId'>
export type TileAddMaterialFormData = Omit<Material, '_creationTime' | '_id'>
export type TileUpdateMaterialFormData = Omit<Material, '_creationTime'>

export type TileStyleFormData = Omit<Style, '_creationTime' | '_id' | 'userId'>
export type TileAddStyleFormData = Omit<Style, '_creationTime' | '_id'>
export type TileUpdateStyleFormData = Omit<Style, '_creationTime'>

export type TileSizeFormData = Omit<Size, '_creationTime' | '_id' | 'userId'>
export type TileAddSizeFormData = Omit<Size, '_creationTime' | '_id'>
export type TileUpdateSizeFormData = Omit<Size, '_creationTime'>

export type TileFinishFormData = Omit<Finish, '_creationTime' | '_id' | 'userId'>
export type TileAddFinishFormData = Omit<Finish, '_id' | '_creationTime'>
export type TileUpdateFinishFormData = Omit<Finish, '_creationTime'>

export interface MaterialFormProps {
	material?: Material
	styles: Style[]
	sizes: Size[]
	finishes: Finish[]
	onAdd?: (data: TileAddMaterialFormData) => void
	onUpdate?: (data: TileUpdateMaterialFormData) => void
	onCancel: () => void
	userId: Id<'user'>
	editing?: boolean
}

export interface StyleFormProps {
	userId: Id<'user'>
	style?: Style
	onAdd?: (data: TileAddStyleFormData) => void
	onUpdate?: (data: TileUpdateStyleFormData) => void
	onCancel: () => void
	editing?: boolean
}

export interface SizeFormProps {
	size?: Size
	userId: Id<'user'>
	onAdd?: (data: TileAddSizeFormData) => void
	onUpdate?: (data: TileUpdateSizeFormData) => void
	onCancel: () => void
	editing?: boolean
}

export interface FinishFormProps {
	finish?: Finish
	userId: Id<'user'>
	onAdd?: (data: TileAddFinishFormData) => void
	onUpdate?: (data: TileUpdateFinishFormData) => void
	onCancel: () => void
	editing?: boolean
}

export interface MaterialsData {
	materials: Material[]
	styles: Style[]
	sizes: Size[]
	finish: Finish[]
}

export type OnAddEvent =
	| {
			data: TileAddMaterialFormData
			type: 'material'
	  }
	| {
			data: TileAddStyleFormData
			type: 'style'
	  }
	| {
			data: TileAddFinishFormData
			type: 'finish'
	  }
	| {
			data: TileAddSizeFormData
			type: 'size'
	  }
export type OnUpdateEvent =
	| {
			data: TileUpdateMaterialFormData
			type: 'material'
	  }
	| {
			data: TileUpdateStyleFormData
			type: 'style'
	  }
	| {
			data: TileUpdateFinishFormData
			type: 'finish'
	  }
	| {
			data: TileUpdateSizeFormData
			type: 'size'
	  }

export interface MaterialsManagerProps {
	userId: Id<'user'>
	data: MaterialsData
	onAdd?: (obj: OnAddEvent) => void
	onUpdate?: (obj: OnUpdateEvent) => void
	onImport?: (data: TypeMaterialsData) => void
	onExport?: (data: TypeMaterialsData) => void
}
export * from '@/components/tile_form/types'

const MaterialSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		basePrice: z.number(),
		styleIds: z.array(z.string()),
		sizeIds: z.array(z.string()),
		finishIds: z.array(z.string()),
	})
	.passthrough()

const StyleSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		multiplier: z.number(),
	})
	.passthrough()

const SizeSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		size: z.union([
			z.object({
				type: z.literal('linear_meter'),
				pricing: z.number(),
			}),
			z.object({
				type: z.literal('height_width'),
				height: z.number(),
				width: z.number(),
				price_type: z.union([z.literal('fixed_price'), z.literal('multiplier')]),
				pricing: z.number(),
			}),
			z.object({
				type: z.literal('custom'),
				price_type: z.union([z.literal('fixed_price'), z.literal('multiplier')]),
				pricing: z.number(),
			}),
		]),
	})
	.passthrough()

const FinishSchema = z
	.object({
		_id: z.string(),
		name: z.string(),
		premium: z.number(),
	})
	.passthrough()

export const MaterialsDataSchema = z.object({
	materials: z.array(MaterialSchema),
	styles: z.array(StyleSchema),
	sizes: z.array(SizeSchema),
	finish: z.array(FinishSchema),
})

export type TypeMaterialsData = z.infer<typeof MaterialsDataSchema>

export interface ImportExportControlsProps {
	data: TypeMaterialsData
	onImport?: (data: TypeMaterialsData) => void
	onExport?: (data: TypeMaterialsData) => void
}
