import { IApplication } from '@register/applications'

export function getValueFromApplicationDataByKey(
  application: IApplication,
  valueKey: string
) {
  const keyTree: string[] = valueKey.split('.')
  // It's really hard to understand what can be the possible type here
  let valueObject: { [key: string]: any } | null = null
  try {
    keyTree.forEach(keyNode => {
      valueObject =
        valueObject === null ? application.data[keyNode] : valueObject[keyNode]
    })
  } catch (error) {
    console.error(`Given value key structure is not valid: ${valueKey}`)
    return null
  }
  return valueObject
}
