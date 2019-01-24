import {
  IFormField,
  IFormData,
  IFormFieldValue,
  IAttachment
} from '../../../forms'

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
  let personName = (sectionData.name as [{ use: string }]).find(
    name => name.use === language
  )
  if (!personName) {
    personName = { use: language }
    sectionData.name.push(personName)
  }
  personName[!transformedFieldName ? field.name : transformedFieldName] =
    draftData[sectionId][field.name]

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
  toSection: string,
  triggerValue: boolean = true
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (draftData[sectionId][field.name] !== triggerValue) {
    return transformedData
  }

  const fromSectionData = transformedData[fromSection]
  if (!fromSectionData.address) {
    throw new Error(`Address data not found on section ${sectionId}`)
  }
  const address = (fromSectionData.address as [{ type: string }]).find(
    addr => addr.type === fromAddressType
  )
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
  if (toAddress) {
    toAddress = { ...address, type: toAddressType }
  } else {
    toAddress = {
      ...address,
      type: toAddressType
    }
    toSectionData.address.push(toAddress)
  }
  return transformedData
}

export const sectionRemoveTransformer = (triggerValue: boolean = false) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (draftData[sectionId][field.name] !== triggerValue) {
    return transformedData
  }
  delete transformedData[sectionId]
  return transformedData
}

export function commentTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[sectionId].status = [
    {
      comments: [
        {
          comment: draftData[sectionId][field.name],
          createdAt: new Date()
        }
      ],
      timestamp: new Date()
    }
  ]
  return transformedData
}

export function ignoreValueTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  /* don't include the value on transformed data */
  return transformedData
}

export const attachmentTransformer = (
  alternateSectionId?: string,
  subjectMapper?: any,
  typeMapper?: any
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const attachments = (draftData[sectionId][field.name] as IAttachment[]).map(
    attachment => {
      return {
        data: attachment.data,
        subject: subjectMapper
          ? subjectMapper[attachment.optionValues[0]]
          : attachment.optionValues[0],
        type: typeMapper
          ? typeMapper[attachment.optionValues[1]]
          : attachment.optionValues[1],
        contentType: attachment.type
      }
    }
  )
  if (attachments) {
    transformedData[
      alternateSectionId ? alternateSectionId : sectionId
    ].attachments = attachments
  }
  return transformedData
}
