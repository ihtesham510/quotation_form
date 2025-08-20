import type { QuotationData } from './types'

export function filterQuotationData(data: QuotationData): QuotationData {
	const filteredMaterialItems = data.selections.materialItems.map(({ size, style, finish, material, ...item }) => ({
		...item,
		size: size ? (({ _id, _creationTime, ...rest }) => rest)(size) : undefined,
		style: style ? (({ _id, _creationTime, ...rest }) => rest)(style) : undefined,
		finish: finish ? (({ _id, _creationTime, ...rest }) => rest)(finish) : undefined,
		material: material ? (({ _id, _creationTime, ...rest }) => rest)(material) : undefined,
	}))

	return {
		...data,
		selections: {
			materialItems: filteredMaterialItems,
		},
	} as QuotationData
}
