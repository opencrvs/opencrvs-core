/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  IFormField,
  IFormData,
  IFormFieldValue,
  IAttachment,
  TransformedData,
  IFormSectionData,
  IFormFieldMutationMapFunction
} from '@client/forms'
import moment from 'moment'
import { set } from 'lodash'

interface IPersonName {
  [key: string]: string
}

export const fieldToNameTransformer = (
  language: string,
  transformedFieldName?: string
) => (
  transformedData: TransformedData,
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
  let personName: IPersonName | undefined = (sectionData.name as [
    { use: string }
  ]).find(name => name.use === language)
  if (!personName) {
    personName = { use: language }
    sectionData.name.push(personName)
  }
  personName[
    !transformedFieldName ? field.name : transformedFieldName
  ] = draftData[sectionId][field.name] as string

  return transformedData
}

export function ignoreFieldTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  /* do nothing */
  return transformedData
}

export function fieldToArrayTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[sectionId][field.name] = [draftData[sectionId][field.name]]
  return transformedData
}

export const fieldToIdentifierTransformer = (identifierField: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const sectionData = transformedData[sectionId]
  if (!sectionData.identifier) {
    sectionData.identifier = [{}]
  }
  sectionData.identifier[0][identifierField] = draftData[sectionId][field.name]
  return transformedData
}

export const fieldToIdentityTransformer = (
  identifierField: string,
  identityType: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const sectionData = transformedData[sectionId]
  if (!sectionData.identifier) {
    sectionData.identifier = []
  }

  const existingIdentity = sectionData.identifier.find(
    (identifier: fhir.Identifier) =>
      identifier.type && identifier.type === identityType
  )
  if (!existingIdentity) {
    sectionData.identifier.push({
      [identifierField]: draftData[sectionId][field.name],
      type: identityType
    })
  } else {
    existingIdentity[identifierField] = draftData[sectionId][field.name]
    existingIdentity.type = identityType
  }
  return transformedData
}

interface IAddress {
  [key: string]: any
}

export const fieldToAddressTransformer = (
  addressType: string,
  lineNumber: number = 0,
  transformedFieldName?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const sectionData = transformedData[sectionId]

  if (!sectionData.address) {
    sectionData.address = []
  }
  let address: IAddress | undefined = (sectionData.address as [
    { type: string; line: IFormFieldValue[] }
  ]).find(addr => addr.type === addressType)
  if (!address) {
    address = {
      type: addressType,
      line: ['', '', '', '', '', '']
    }
    sectionData.address.push(address)
  }
  if (lineNumber > 0) {
    address.line[lineNumber - 1] = `${draftData[sectionId][field.name]}`
  } else {
    address[!transformedFieldName ? field.name : transformedFieldName] = `${
      draftData[sectionId][field.name]
    }`
  }

  return transformedData
}

export const fieldNameTransformer = (transformedFieldName: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  transformedData[sectionId][transformedFieldName] =
    draftData[sectionId][field.name]
  return transformedData
}

export const fieldValueSectionExchangeTransformer = (
  toSectionId: string,
  toSectionField?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (!transformedData[toSectionId]) {
    transformedData[toSectionId] = {}
  }
  transformedData[toSectionId][toSectionField ? toSectionField : field.name] =
    draftData[sectionId][field.name]
  return transformedData
}

export const sectionFieldToBundleFieldTransformer = (
  transformedFieldName?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (transformedFieldName) {
    transformedData[transformedFieldName] = draftData[sectionId][field.name]
  } else {
    transformedData[field.name] = draftData[sectionId][field.name]
  }
  return transformedData
}

export const nestedRadioFieldToBundleFieldTransformer = (
  transformedFieldName?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (transformedFieldName) {
    set(
      transformedData,
      transformedFieldName,
      (draftData[sectionId][field.name] as IFormSectionData).value
    )
  } else {
    transformedData[field.name] = (draftData[sectionId][
      field.name
    ] as IFormSectionData).value
  }
  return transformedData
}

export const copyEventAddressTransformer = (fromSection: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (
    draftData[sectionId][field.name] === 'OTHER' ||
    draftData[sectionId][field.name] === 'PRIVATE_HOME' ||
    draftData[sectionId][field.name] === 'HEALTH_FACILITY'
  ) {
    transformedData.eventLocation = { type: draftData[sectionId][field.name] }
    return transformedData
  }
  const fromSectionData = transformedData[fromSection]
  if (!fromSectionData.address) {
    return transformedData
  }
  const address = (fromSectionData.address as [fhir.Address]).find(
    addr => addr.type === draftData[sectionId][field.name]
  )
  if (!address) {
    return transformedData
  }

  transformedData.eventLocation = {
    address: {
      ...address
    } as fhir.Address
  } as fhir.Location

  transformedData.eventLocation.type = draftData[sectionId][field.name]
  if (address && address.line && address.line[5]) {
    transformedData.eventLocation.partOf = `Location/${address.line[5]}`
  }

  return transformedData
}

export const copyAddressTransformer = (
  fromAddressType: string,
  fromSection: string,
  toAddressType: string,
  toSection: string,
  triggerValue: boolean = true,
  nodeName?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (draftData[sectionId][field.name] !== triggerValue) {
    return transformedData
  }

  let fromSectionData = transformedData[fromSection]
  if (nodeName) {
    fromSectionData = transformedData[fromSection][nodeName]
  }

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
  transformedData: TransformedData,
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

export function fieldToCommentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[sectionId].status = [
    {
      comments: [
        {
          comment: draftData[sectionId][field.name] || '',
          createdAt: new Date()
        }
      ],
      timestamp: new Date()
    }
  ]
  return transformedData
}

export function fieldToAttachmentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  alternateSectionId?: string,
  subjectMapper?: any,
  typeMapper?: any
) {
  if (draftData[sectionId][field.name] === []) {
    return transformedData
  }
  const attachments = (draftData[sectionId][field.name] as IAttachment[]).map(
    attachment => {
      return {
        data: attachment.data,
        subject: attachment.optionValues[0],
        type: typeMapper
          ? typeMapper[attachment.optionValues[1]]
          : attachment.optionValues[1],
        contentType: attachment.type
      }
    }
  )
  if (attachments) {
    const selectedSectionId = alternateSectionId
      ? alternateSectionId
      : sectionId
    if (!transformedData[selectedSectionId]) {
      transformedData[selectedSectionId] = {}
    }
    transformedData[selectedSectionId].attachments = transformedData[
      selectedSectionId
    ].attachments
      ? transformedData[selectedSectionId].attachments.concat(attachments)
      : attachments
  }
  return transformedData
}

export const fieldToPhoneNumberTransformer = (
  transformedSectionId?: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  transformedData[
    transformedSectionId ? transformedSectionId : sectionId
  ].telecom = [{ system: 'phone', value: draftData[sectionId][field.name] }]
  return transformedData
}

export const fieldToIdentifierWithTypeTransformer = (
  identifierType: string
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const sectionData = transformedData[sectionId]
  if (!sectionData.identifier) {
    sectionData.identifier = [{}]
  }
  sectionData.identifier[0].system = identifierType
  sectionData.identifier[0].value = draftData[sectionId][field.name]
  return transformedData
}

export const nestedRadioFieldTransformer = (
  nestedTransformer: IFormFieldMutationMapFunction
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  nestedField?: IFormField
) => {
  const fieldValueObj = draftData[sectionId][field.name] as IFormSectionData
  let partialDraftData: IFormData = {}

  if (!nestedField) {
    const parentData: IFormSectionData = {}
    parentData[field.name] = fieldValueObj.value as IFormSectionData
    partialDraftData[sectionId] = parentData
  } else {
    if (
      nestedField.extraValue &&
      nestedField.extraValue !== fieldValueObj.value
    ) {
      return
    }
    partialDraftData[sectionId] = fieldValueObj.nestedFields as IFormSectionData
  }
  nestedTransformer(
    transformedData,
    partialDraftData,
    sectionId,
    nestedField || field
  )
}

export const fieldToReasonsNotApplyingTransformer = (
  transformedArrayName: string,
  transformedFieldName?: string,
  extraField?: string,
  transformeValueArrayToBoolean?: boolean,
  isCaregiver?: boolean
) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  let fieldValue = draftData[sectionId][field.name]
  const transFieldName = transformedFieldName
    ? transformedFieldName
    : field.name

  if (!fieldValue) {
    return
  } else {
    if (transformeValueArrayToBoolean) {
      const valueArray = fieldValue as IFormFieldValue[]
      fieldValue = valueArray.length > 0
    }

    if (!transformedData[sectionId][transformedArrayName]) {
      transformedData[sectionId][transformedArrayName] = []
    }

    const transformedArray: TransformedData[] =
      transformedData[sectionId][transformedArrayName]

    let transformedField = transformedArray.find(transField => {
      if (extraField) {
        return (
          transField[extraField] && transField[extraField] === field.extraValue
        )
      }
      return (
        !isCaregiver &&
        transField[transFieldName] &&
        transField[transFieldName] === fieldValue
      )
    })

    if (!transformedField) {
      transformedField = {}
      transformedField[transFieldName] = fieldValue

      if (extraField) {
        transformedField[extraField] = field.extraValue
      }

      transformedArray.push(transformedField)
    } else {
      transformedField[transFieldName] = fieldValue
    }
  }
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-')
  const date = moment(dateString, 'YYYY-M-D')

  if (date.isValid() && year && month && day) {
    return date.format('YYYY-MM-DD')
  } else return null
}

export const longDateTransformer = (transformedFieldName?: string) => (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const fieldName = transformedFieldName || field.name
  const sectionData = draftData[sectionId][field.name] as string

  if (sectionData) {
    transformedData[sectionId][fieldName] = formatDate(sectionData)
  }

  return transformedData
}
