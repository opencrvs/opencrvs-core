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
import { set } from 'lodash'

interface IPersonName {
  [key: string]: string
}

export const fieldToNameTransformer =
  (language: string, transformedFieldName?: string, toSectionId?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (toSectionId && !transformedData[toSectionId]) {
      transformedData[toSectionId] = {}
    }
    const sectionData = transformedData[toSectionId ? toSectionId : sectionId]
    if (!sectionData.name) {
      sectionData.name = [
        {
          use: language
        }
      ]
    }
    let personName: IPersonName | undefined = (
      sectionData.name as [{ use: string }]
    ).find((name) => name.use === language)
    if (!personName) {
      personName = { use: language }
      sectionData.name.push(personName)
    }
    personName[!transformedFieldName ? field.name : transformedFieldName] =
      draftData[sectionId][field.name] as string

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

export const fieldToIdentifierTransformer =
  (identifierField: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]
    if (!sectionData.identifier) {
      sectionData.identifier = [{}]
    }
    sectionData.identifier[0][identifierField] =
      draftData[sectionId][field.name]
    return transformedData
  }

export const fieldToIdentityTransformer =
  (identifierField: string, identityType: string) =>
  (
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

export const nidVerificationFieldToIdentityTransformer = (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  fieldToIdentityTransformer('id', 'MOSIP_PSUT_TOKEN_ID')(
    transformedData,
    draftData,
    sectionId,
    field
  )
  const sectionData = transformedData[sectionId]
  const existingIdentity = sectionData.identifier.find(
    (identifier: fhir.Identifier) =>
      identifier.type && identifier.type === 'MOSIP_PSUT_TOKEN_ID'
  )
  if (existingIdentity) {
    const modifiedFields = draftData[sectionId][
      'fieldsModifiedByNidUserInfo'
    ] as string[] | undefined
    existingIdentity['fieldsModifiedByIdentity'] =
      modifiedFields?.join(',') ?? ''
  }
  return transformedData
}

interface IAddress {
  [key: string]: any
}

export const fieldToAddressLineTransformer =
  (addressType: string, lineNumber = 0) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]

    if (!sectionData.address) {
      sectionData.address = []
    }
    let address: IAddress | undefined = (
      sectionData.address as [{ type: string; line: IFormFieldValue[] }]
    ).find((addr) => addr.type === addressType)
    if (!address) {
      address = {
        type: addressType,
        line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] // lines must be available as empty strings for GraphQL to parse all options
      }
      sectionData.address.push(address)
    }

    address.line[lineNumber] = `${draftData[sectionId][field.name]}`

    return transformedData
  }

export const fieldToAddressFhirPropertyTransformer =
  (addressType: string, transformedFieldName: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]

    if (!sectionData.address) {
      sectionData.address = []
    }
    let address: IAddress | undefined = (
      sectionData.address as [{ type: string; line: IFormFieldValue[] }]
    ).find((addr) => addr.type === addressType)
    if (!address) {
      address = {
        type: addressType,
        line: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', ''] // lines must be available as empty strings for GraphQL to parse all options
      }
      sectionData.address.push(address)
    }

    address[!transformedFieldName ? field.name : transformedFieldName] = `${
      draftData[sectionId][field.name]
    }`

    return transformedData
  }

export const fieldNameTransformer =
  (transformedFieldName: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    transformedData[sectionId][transformedFieldName] =
      draftData[sectionId][field.name]
    return transformedData
  }

export const fieldValueSectionExchangeTransformer =
  (toSectionId: string, toSectionField?: string) =>
  (
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

export const sectionFieldToBundleFieldTransformer =
  (
    transformedFieldName?: string,
    transformerMethod?: IFormFieldMutationMapFunction
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const nestedFieldNames = transformedFieldName?.split('.') || []

    let currentData = transformedData
    for (let i = 0; i < nestedFieldNames.length - 1; i++) {
      const nestedFieldName = nestedFieldNames[i]
      if (!currentData[nestedFieldName]) {
        currentData[nestedFieldName] = {}
      }
      currentData = currentData[nestedFieldName]
    }

    const finalFieldName =
      nestedFieldNames?.[nestedFieldNames.length - 1] || field.name

    if (transformerMethod) {
      transformerMethod(transformedData, draftData, sectionId, field)
    } else {
      currentData[finalFieldName] = draftData[sectionId][field.name]
    }

    return transformedData
  }

export const nestedRadioFieldToBundleFieldTransformer =
  (transformedFieldName?: string) =>
  (
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
      transformedData[field.name] = (
        draftData[sectionId][field.name] as IFormSectionData
      ).value
    }
    return transformedData
  }

export const copyEventAddressTransformer =
  (fromSection: string) =>
  (
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
      (addr) => addr.type === draftData[sectionId][field.name]
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

export const copyAddressTransformer =
  (
    fromAddressType: string,
    fromSection: string,
    toAddressType: string,
    toSection: string,
    triggerValue = true,
    nodeName?: string
  ) =>
  (
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
      throw new Error(
        `Address data not found on section copying from ${fromSection}`
      )
    }

    const fromAddress = fromSectionData.address
    const address = (fromAddress as [{ type: string }]).find(
      (addr) => addr.type === fromAddressType
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
      (addr) => addr.type === toAddressType
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

export const sectionRemoveTransformer =
  (triggerValue = false) =>
  (
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
  alternateSectionId?: string
) {
  const attachments = (draftData[sectionId][field.name] as IAttachment[]).map(
    (attachment) => {
      return {
        ...(attachment.uri
          ? {
              uri: attachment.uri
            }
          : { data: attachment.data }),
        subject: attachment.optionValues[0],
        type: attachment.optionValues[1],
        contentType: attachment.type
      }
    }
  )
  if (attachments.length > 0) {
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

export const fieldToPhoneNumberTransformer =
  (transformedSectionId?: string) =>
  (
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

export const fieldToIdentifierWithTypeTransformer =
  (identifierType: string) =>
  (
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

export const nestedRadioFieldTransformer =
  (nestedTransformer: IFormFieldMutationMapFunction) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField,
    nestedField?: IFormField
  ) => {
    const fieldValueObj = draftData[sectionId][field.name] as IFormSectionData
    const partialDraftData: IFormData = {}

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
      partialDraftData[sectionId] =
        fieldValueObj.nestedFields as IFormSectionData
    }
    nestedTransformer(
      transformedData,
      partialDraftData,
      sectionId,
      nestedField || field
    )
  }

export const fieldToReasonsNotApplyingTransformer =
  (
    transformedArrayName: string,
    transformedFieldName?: string,
    extraField?: string,
    transformeValueArrayToBoolean?: boolean,
    isCaregiver?: boolean
  ) =>
  (
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

      let transformedField = transformedArray.find((transField) => {
        if (extraField) {
          return (
            transField[extraField] &&
            transField[extraField] === field.extraValue
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
  const date = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day)
  )

  if (date instanceof Date && !isNaN(date.getTime())) {
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
  } else return null
}

export const longDateTransformer =
  (transformedFieldName?: string) =>
  (
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
