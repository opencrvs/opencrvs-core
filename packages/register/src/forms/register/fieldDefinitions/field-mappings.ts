import { IFormField, IFormData, IFormFieldValue } from '../../../forms'

export const nameTransformer = (
  language: string,
  transformedFieldName?: string
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const sectionData = transformedData[sectionId]
  if (!sectionData.name) {
    sectionData.name = [
      {
        use: language
      }
    ]
  }
  const personName = (sectionData.name as [{ use: string }]).find(
    name => name.use === language
  )
  if (personName) {
    personName[!transformedFieldName ? field.name : transformedFieldName] =
      draftData[sectionId][field.name]
  }
  return transformedData
}

export function fieldToArrayTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[sectionId][field.name] = [draftData[sectionId][field.name]]
  return transformedData
}

export function identifierTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  const sectionData = transformedData[sectionId]
  if (!sectionData.identifier) {
    sectionData.identifier = [{}]
  }
  sectionData.identifier[0].id = draftData[sectionId][field.name]
  return transformedData
}

export function identifierTypeTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  const sectionData = transformedData[sectionId]
  if (!sectionData.identifier) {
    sectionData.identifier = [{}]
  }
  sectionData.identifier[0].type = draftData[sectionId][field.name]
  return transformedData
}

export const addressTransformer = (
  addressType: string,
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const sectionData = transformedData[sectionId]
  if (!sectionData.address) {
    sectionData.address = []
  }
  let address = (sectionData.address as [
    { type: string; line: IFormFieldValue[] }
  ]).find(addr => addr.type === addressType)
  if (!address) {
    address = {
      type: addressType,
      line: ['', '', '', '']
    }
    sectionData.address.push(address)
  }
  if (lineNumber > 0) {
    address.line[lineNumber - 1] = draftData[sectionId][field.name]
  } else {
    address[!transformedFieldName ? field.name : transformedFieldName] =
      draftData[sectionId][field.name]
  }
  return transformedData
}

export const fieldNameTransformer = (transformedFieldName: string) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  transformedData[sectionId][transformedFieldName] =
    draftData[sectionId][field.name]
  return transformedData
}

export function sectionFieldToBundleFieldTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[field.name] = draftData[sectionId][field.name]
  return transformedData
}

export const copyAddressTransformer = (
  fromAddressType: string,
  fromSection: string,
  toAddressType: string,
  toSection: string
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (draftData[sectionId][field.name] === false) {
    return transformedData
  }
  const fromSectionData = transformedData[fromSection]
  if (!fromSectionData.address) {
    throw new Error('Address data not found on section')
  }
  const address = (fromSectionData.address as [
    { type: string; line: IFormFieldValue[] }
  ]).find(addr => addr.type === fromAddressType)
  if (!address) {
    throw new Error(
      `Address not found for given type: ${fromAddressType} on section ${fromSection}`
    )
  }
  const toSectionData = transformedData[toSection]
  if (!toSectionData.address) {
    toSectionData.address = []
  }
  let toAddress = (toSectionData.address as [{ type: string }]).find(
    addr => addr.type === toAddressType
  )
  if (!toAddress) {
    toAddress = {
      type: toAddressType
    }
    toSectionData.address.push(toAddress)
  }
  toAddress = { ...address, type: toAddressType }
  return transformedData
}
