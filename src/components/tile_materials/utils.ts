import type { MaterialsData, TypeMaterialsData } from './types'

export function parseMaterialData(data: MaterialsData): TypeMaterialsData {
	return {
		materials: data.materials.map(({ _creationTime, userId, ...item }) => item),
		sizes: data.sizes.map(({ _creationTime, userId, ...item }) => item),
		finish: data.finish.map(({ userId, _creationTime, ...item }) => item),
		styles: data.styles.map(({ _creationTime, userId, ...item }) => item),
	}
}

export function validateRelations(data: TypeMaterialsData): boolean {
	let isValid = true
	console.log(data)
	const stylesIds = data.materials.flatMap(mat => mat.styleIds)
	const sizesIds = data.materials.flatMap(mat => mat.sizeIds)
	const finishIds = data.materials.flatMap(mat => mat.finishIds)
	console.log('finishIds', finishIds)
	console.log('sizesIds', finishIds)
	console.log('stylesIds', stylesIds)
	for (const _id of stylesIds) {
		const id = data.styles.find(f => f._id == _id)
		if (!id) {
			console.log('id does not exits for ', _id)
			isValid = false
		}
	}
	for (const _id of sizesIds) {
		const id = data.sizes.find(s => s._id == _id)
		if (!id) {
			console.log('id does not exits for ', _id)
			isValid = false
		}
	}
	for (const _id of finishIds) {
		const id = data.finish.find(s => s._id == _id)
		if (!id) {
			console.log('id does not exits for ', _id)
			isValid = false
		}
	}
	return isValid
}
