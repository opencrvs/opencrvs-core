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
  GQLAddress,
  GQLHumanName,
  GQLAttachment
} from '@opencrvs/gateway/src/graphql/schema'
import {
  BirthRegistration,
  DeathRegistration,
  MarriageRegistration,
  Address
} from '@client/utils/gateway'
import {
  IAttachment,
  IFormData,
  IFormField,
  IFormFieldQueryMapFunction,
  TransformedData,
  IFormSectionData,
  ISelectFormFieldWithOptions,
  AddressCases
} from '@client/forms'
import { EMPTY_STRING } from '@client/utils/constants'
import { camelCase, cloneDeep, get, isArray } from 'lodash'
import format from '@client/utils/date-formatting'
import {
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY,
  LocationType
} from '@client/offline/reducer'
import { mergeArraysRemovingEmptyStrings } from '@client/utils/data-formatting'
import { countries } from '@client/forms/countries'
import { MessageDescriptor } from 'react-intl'
import { getSelectedOption } from '@client/forms/utils'
import {
  countryAlpha3toAlpha2,
  getLocationNameMapOfFacility
} from '@client/utils/locationUtils'

interface IName {
  [key: string]: any
}

type QueryData = BirthRegistration | DeathRegistration | MarriageRegistration

export type SectionId = keyof (
  | BirthRegistration
  | DeathRegistration
  | MarriageRegistration
)

interface IIgnoreAddressFields {
  fieldsToIgnoreForLocalAddress: string[]
  fieldsToIgnoreForInternationalAddress: string[]
}

export const nameToFieldTransformer =
  (language: string, transformedFieldName?: string, fromSectionId?: string) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: SectionId,
    field: IFormField
  ) => {
    const selectSectionId = fromSectionId ? fromSectionId : sectionId

    const selectedName =
      queryData &&
      queryData[selectSectionId] &&
      queryData[selectSectionId].name &&
      (queryData[selectSectionId].name as GQLHumanName[]).find(
        (name) => name.use === language
      )

    const nameKey = transformedFieldName
      ? transformedFieldName
      : (field.name as keyof GQLHumanName)
    if (!selectedName || !selectedName[nameKey]) {
      return transformedData
    }
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    if (selectedName[nameKey])
      transformedData[sectionId][field.name] = selectedName[nameKey]
    return transformedData
  }

export const fieldValueTransformer =
  (transformedFieldName: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (queryData[sectionId] && queryData[sectionId][transformedFieldName]) {
      transformedData[sectionId][field.name] =
        queryData[sectionId][transformedFieldName]
    }
    return transformedData
  }

export const bundleFieldToSectionFieldTransformer =
  (transformedFieldName?: SectionId) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    const selectedFieldName = transformedFieldName
      ? transformedFieldName
      : (field.name as SectionId)
    if (
      queryData[selectedFieldName] !== null &&
      queryData[selectedFieldName] !== undefined &&
      queryData[selectedFieldName] !== ''
    ) {
      transformedData[sectionId][field.name] = queryData[selectedFieldName]
    }
    return transformedData
  }

export const fieldValueSectionExchangeTransformer =
  (
    fromSectionId: SectionId,
    fromSectionField: string,
    transformerMethod?: IFormFieldQueryMapFunction
  ) =>
  (
    transformedData: TransformedData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (transformerMethod) {
      transformerMethod(transformedData, queryData, sectionId, field)
    } else if (Boolean(queryData[fromSectionId])) {
      transformedData[sectionId][field.name] =
        queryData[fromSectionId][fromSectionField]
    }
    return transformedData
  }

export function arrayToFieldTransformer(
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField
) {
  if (
    queryData[sectionId] &&
    queryData[sectionId][field.name] &&
    queryData[sectionId][field.name][0]
  ) {
    transformedData[sectionId][field.name] = queryData[sectionId][field.name][0]
  }
  return transformedData
}

export const identifierToFieldTransformer =
  (identifierField: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (
      !queryData[sectionId] ||
      !queryData[sectionId].identifier ||
      !queryData[sectionId].identifier[0] ||
      !queryData[sectionId].identifier[0][identifierField]
    ) {
      return transformedData
    }
    transformedData[sectionId][field.name] =
      queryData[sectionId].identifier[0][identifierField]
    return transformedData
  }

export const identifierWithTypeToFieldTransformer =
  (identifierType: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    let identifier
    if (
      (identifier = queryData[sectionId] && queryData[sectionId].identifier) &&
      identifier.system === identifierType
    ) {
      transformedData[sectionId][field.name] = identifier.value
    }
    return transformedData
  }

export const identityToFieldTransformer =
  (identifierField: string, identityType: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (queryData[sectionId] && queryData[sectionId].identifier) {
      const existingIdentity = queryData[sectionId].identifier.find(
        (identity: fhir.Identifier) => identity.type === identityType
      )
      if (!transformedData[sectionId]) {
        transformedData[sectionId] = {}
      }
      transformedData[sectionId][field.name] =
        existingIdentity && identifierField in existingIdentity
          ? existingIdentity[identifierField]
          : EMPTY_STRING
    }

    return transformedData
  }

export const identityToNidVerificationFieldTransformer = (
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField
) => {
  identityToFieldTransformer('id', 'MOSIP_PSUT_TOKEN_ID')(
    transformedData,
    queryData,
    sectionId,
    field
  )
  const existingIdentity = queryData[sectionId]?.identifier?.find(
    (identity: fhir.Identifier) =>
      (identity.type as string) === 'MOSIP_PSUT_TOKEN_ID'
  )
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }

  if (existingIdentity) {
    const modifiedFields = existingIdentity[
      'fieldsModifiedByIdentity'
    ] as string[]
    transformedData[sectionId].fieldsModifiedByNidUserInfo = modifiedFields
  }

  return transformedData
}

export const addressLineToFieldTransformer =
  (addressType: string, lineNumber = 0) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    const address =
      queryData[sectionId] &&
      queryData[sectionId].address &&
      queryData[sectionId].address.find(
        (addr: Address) => addr.type === addressType
      )

    if (!address) {
      return transformedData
    }

    transformedData[sectionId][field.name] =
      (address.line && address.line[lineNumber]) || ''
    return transformedData
  }

interface IAddress {
  [key: string]: any
}

export const addressFhirPropertyToFieldTransformer =
  (addressType: string, transformedFieldName: string) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    field: IFormField
  ) => {
    const address =
      queryData[sectionId] &&
      queryData[sectionId].address &&
      (queryData[sectionId].address as GQLAddress[]).find(
        (addr) => addr.type === addressType
      )

    if (!address) {
      return transformedData
    }

    transformedData[sectionId][field.name] =
      address[transformedFieldName ? transformedFieldName : field.name]

    return transformedData
  }

export const sameAddressFieldTransformer =
  (
    fromAddressType: string,
    fromSection: SectionId,
    toAddressType: string,
    toSection: SectionId
  ) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: string,
    field: IFormField
  ) => {
    const fromAddress =
      queryData[fromSection] &&
      queryData[fromSection].address &&
      queryData[fromSection].address.find(
        (addr: Address) => addr.type === fromAddressType
      )

    const toAddress =
      queryData[toSection] &&
      queryData[toSection].address &&
      (queryData[toSection].address as [GQLAddress]).find(
        (addr) => addr.type === toAddressType
      )

    if (!fromAddress || !toAddress) {
      transformedData[sectionId][field.name] = false
      return transformedData
    }

    transformedData[sectionId][field.name] =
      fromAddress.country === toAddress.country &&
      fromAddress.state === toAddress.state &&
      fromAddress.district === toAddress.district &&
      fromAddress.postalCode === toAddress.postalCode &&
      (fromAddress.line && fromAddress.line[0]) ===
        (toAddress.line && toAddress.line[0]) &&
      (fromAddress.line && fromAddress.line[1]) ===
        (toAddress.line && toAddress.line[1]) &&
      (fromAddress.line && fromAddress.line[2]) ===
        (toAddress.line && toAddress.line[2]) &&
      (fromAddress.line && fromAddress.line[3]) ===
        (toAddress.line && toAddress.line[3]) &&
      (fromAddress.line && fromAddress.line[4]) ===
        (toAddress.line && toAddress.line[4]) &&
      (fromAddress.line && fromAddress.line[5]) ===
        (toAddress.line && toAddress.line[5])

    return transformedData
  }

export const sectionFieldExchangeTransformer =
  (fromSectionId: SectionId, fromSectionField?: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (
      !queryData[fromSectionId] ||
      !queryData[fromSectionId][
        fromSectionField ? fromSectionField : field.name
      ]
    ) {
      return transformedData
    }
    transformedData[sectionId][field.name] =
      queryData[fromSectionId][fromSectionField ? fromSectionField : field.name]
    return transformedData
  }

export function commentToFieldTransformer(
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField
) {
  // Check this one
  const comment =
    queryData[sectionId].status &&
    queryData[sectionId].status[0].comments &&
    queryData[sectionId].status[0].comments[0].comment
  if (comment) {
    transformedData[sectionId][field.name] = comment
  }
  return transformedData
}

export function attachmentToFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField,
  alternateSectionId: string
) {
  const selectedSectionId = alternateSectionId ? alternateSectionId : sectionId
  const attachments: IAttachment[] = []

  if (queryData[selectedSectionId].attachments) {
    ;(queryData[selectedSectionId].attachments as GQLAttachment[])
      .filter((attachment) => attachment.subject === field.extraValue)
      .forEach((attachment) => {
        attachments.push({
          data: attachment.data,
          uri: attachment.uri,
          type: attachment.contentType,
          optionValues: [attachment.subject, attachment.type],
          title: attachment.subject,
          description: attachment.type
        } as IAttachment)
      })
  }
  if (attachments) {
    transformedData[sectionId][field.name] = attachments
  }
  return transformedData
}

export const eventLocationQueryTransformer =
  (
    transformationParams: {
      lineNumber?: number
      transformedFieldName?: string
    },
    ignoreAddressFields?: IIgnoreAddressFields
  ) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: string,
    field: IFormField
  ) => {
    if (!queryData.eventLocation || !queryData.eventLocation.address) {
      return transformedData
    }
    const eventLocation = queryData.eventLocation as fhir.Location
    const address = eventLocation.address as IAddress
    const line = address.line as string[]
    const country = address.country
    const fieldValue =
      address[
        transformationParams.transformedFieldName
          ? transformationParams.transformedFieldName
          : field.name
      ]
    if (
      transformationParams.lineNumber ||
      transformationParams.lineNumber === 0
    ) {
      transformedData[sectionId][field.name] =
        line[transformationParams.lineNumber]
    } else if (fieldValue && ignoreAddressFields) {
      if (
        (country &&
          country.toUpperCase() === window.config.COUNTRY.toUpperCase() &&
          !ignoreAddressFields.fieldsToIgnoreForLocalAddress.includes(
            field.name
          )) ||
        (country &&
          country.toUpperCase() !== window.config.COUNTRY.toUpperCase() &&
          !ignoreAddressFields.fieldsToIgnoreForInternationalAddress.includes(
            field.name
          ))
      ) {
        transformedData[sectionId][field.name] = fieldValue
      }
    } else if (fieldValue) {
      transformedData[sectionId][field.name] = fieldValue
    }

    return transformedData
  }

export const eventLocationTypeQueryTransformer =
  () =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: string,
    field: IFormField
  ) => {
    if (!queryData.eventLocation) {
      return transformedData
    }
    if (!queryData.eventLocation.type) {
      transformedData[sectionId][field.name] = 'HOSPITAL'
    } else {
      transformedData[sectionId][field.name] = queryData.eventLocation
        .type as string
    }
    return transformedData
  }

export const eventLocationIDQueryTransformer =
  () =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: string,
    field: IFormField
  ) => {
    if (
      !queryData.eventLocation ||
      !queryData._fhirIDMap ||
      !queryData._fhirIDMap.eventLocation
    ) {
      return transformedData
    } else {
      transformedData[sectionId][field.name] = queryData._fhirIDMap
        .eventLocation as string
    }
    return transformedData
  }

export const locationIDToFieldTransformer =
  (transformedName?: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    const fieldName = transformedName || field.name
    if (queryData[sectionId] && queryData[sectionId][fieldName]) {
      transformedData[sectionId][field.name] =
        queryData[sectionId][fieldName].id
    }

    return transformedData
  }

export const eventLocationNameQueryOfflineTransformer =
  (resourceKey: string, transformedFieldName?: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: string,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ) => {
    if (
      queryData.eventLocation?.type &&
      queryData.eventLocation?.type !== 'HEALTH_FACILITY'
    ) {
      return
    }
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    eventLocationIDQueryTransformer()(
      transformedData,
      queryData,
      sectionId,
      field
    )

    const locationId = transformedData[sectionId][field.name] as string
    if (!locationId || !offlineData) {
      return
    }
    let selectedLocation
    if (resourceKey === OFFLINE_FACILITIES_KEY) {
      selectedLocation = offlineData[resourceKey][locationId]

      if (selectedLocation) {
        const locationNameMap = getLocationNameMapOfFacility(
          selectedLocation,
          offlineData.locations
        )

        transformedData[sectionId][transformedFieldName || field.name] =
          Object.values(locationNameMap) as Record<
            string,
            string | MessageDescriptor
          >[]

        Object.keys(locationNameMap).forEach((type) => {
          transformedData[sectionId][
            camelCase(`${transformedFieldName || field.name}_${type}`)
          ] = locationNameMap[type] as string | Record<string, string>
        })
      }
    }
    return transformedData
  }

export const nestedValueToFieldTransformer =
  (nestedFieldName: string, transformMethod?: IFormFieldQueryMapFunction) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (!queryData[sectionId] || !queryData[sectionId][nestedFieldName]) {
      return transformedData
    } else if (transformMethod) {
      const clonedData = cloneDeep(transformedData)
      if (!clonedData[nestedFieldName]) {
        clonedData[nestedFieldName] = {}
      }

      transformMethod(clonedData, queryData[sectionId], nestedFieldName, field)

      if (clonedData[nestedFieldName][field.name] === undefined) {
        return transformedData
      }
      transformedData[sectionId][field.name] =
        clonedData[nestedFieldName][field.name]
    } else {
      transformedData[sectionId][field.name] =
        queryData[sectionId][nestedFieldName][field.name]
    }
    return transformedData
  }

export const nestedIdentityValueToFieldTransformer =
  (nestedField: SectionId) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField
  ) => {
    if (!queryData[sectionId] || !queryData[sectionId][nestedField]) {
      return transformedData
    }
    const clonedData = cloneDeep(transformedData)
    if (!clonedData[nestedField]) {
      clonedData[nestedField] = {}
    }

    identityToFieldTransformer('id', 'MOSIP_PSUT_TOKEN_ID')(
      clonedData,
      queryData[sectionId],
      nestedField,
      field
    )

    if (clonedData[nestedField][field.name] === undefined) {
      return transformedData
    }
    transformedData[sectionId][field.name] = clonedData[nestedField][field.name]

    const existingIdentity = queryData[sectionId][nestedField].identifier?.find(
      (identity: fhir.Identifier) =>
        (identity.type as string) === 'MOSIP_PSUT_TOKEN_ID'
    )
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }

    if (existingIdentity) {
      const modifiedFields = existingIdentity[
        'fieldsModifiedByIdentity'
      ] as string[]
      transformedData[sectionId].fieldsModifiedByNidUserInfo = modifiedFields
    }

    return transformedData
  }

export const booleanTransformer = (
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField
) => {
  // graphql boolean ignored unless forced like this
  if (queryData && queryData[sectionId] && field && field.name) {
    transformedData[sectionId][field.name] = queryData[sectionId][field.name]
  }
}

export const valueToNestedRadioFieldTransformer =
  (transformMethod: IFormFieldQueryMapFunction) =>
  (
    transformedData: IFormData,
    queryData: TransformedData,
    sectionId: string,
    field: IFormField,
    nestedField?: IFormField
  ) => {
    const tempDraftData = {
      [sectionId]: {}
    } as IFormData
    transformMethod(tempDraftData, queryData, sectionId, nestedField || field)
    const fieldValue =
      tempDraftData[sectionId][nestedField ? nestedField.name : field.name]

    if (!fieldValue) {
      return
    }
    const transformedFieldData = transformedData[sectionId][
      field.name
    ] as IFormData
    if (!transformedFieldData) {
      transformedData[sectionId][field.name] = {
        value: fieldValue,
        nestedFields: {}
      }
    } else if (nestedField) {
      transformedFieldData.nestedFields[nestedField.name] = fieldValue
    }
  }

export const bundleFieldToNestedRadioFieldTransformer =
  (transformedFieldName: string) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    transformedData[sectionId][field.name] = transformedData[sectionId][
      field.name
    ] || {
      value: get(queryData, transformedFieldName),
      nestedFields: {}
    }
  }

export const sectionTransformer =
  (
    transformedSectionId: string,
    queryTransformer?: IFormFieldQueryMapFunction,
    targetFieldName?: string
  ) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ): void => {
    const targetNameKey = targetFieldName || field.name

    if (!transformedData[transformedSectionId]) {
      transformedData[transformedSectionId] = {}
    }

    if (queryTransformer) {
      const localTransformedData: IFormData = {}
      queryTransformer(
        localTransformedData,
        queryData,
        sectionId,
        field,
        _,
        offlineData
      )
      if (!localTransformedData[sectionId]) {
        return
      }
      Object.keys(localTransformedData[sectionId]).forEach((key) => {
        const targetKey = key === field.name ? targetNameKey : key
        if (
          Array.isArray(transformedData[transformedSectionId][targetKey]) &&
          Array.isArray(localTransformedData[sectionId][key])
        ) {
          transformedData[transformedSectionId][targetKey] =
            mergeArraysRemovingEmptyStrings(
              transformedData[transformedSectionId][targetKey],
              localTransformedData[sectionId][key] as string[]
            )
        } else {
          const transformedValue = localTransformedData[sectionId][key]
          if (isArray(transformedValue)) {
            transformedData[transformedSectionId][targetKey] = transformedValue
          } else {
            transformedData[transformedSectionId][targetKey] =
              transformedData.template[key] || transformedValue
          }
        }
      })
    } else {
      transformedData[transformedSectionId][targetNameKey] =
        queryData[sectionId]?.[field.name] || ''
    }
  }

export const dateFormatTransformer =
  (transformedFieldName: string, locale: string, dateFormat = 'dd MMMM yyyy') =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField
  ): void => {
    const queryValue =
      (queryData[sectionId]?.[transformedFieldName] as string) || ''

    const date = new Date(queryValue)
    if (!Number.isNaN(date.getTime())) {
      const prevLocale = window.__localeId__
      window.__localeId__ = locale

      if (!transformedData[sectionId]) {
        transformedData[sectionId] = {}
      }
      transformedData[sectionId][field.name] = format(date, dateFormat)
      window.__localeId__ = prevLocale
    }
  }

enum LocationLevel {
  district,
  state,
  country
}

const isLocationFacilityOrCRVSOffice = (
  type: string
): type is Exclude<
  LocationType,
  LocationType.HEALTH_FACILITY | LocationType.CRVS_OFFICE
> => {
  return Boolean(
    type &&
      [LocationType.HEALTH_FACILITY, LocationType.CRVS_OFFICE].includes(
        type as LocationType
      )
  )
}

const transformAddressTemplateArray = (
  transformedData: IFormData,
  addressFromQuery: Address,
  addressLocationLevel: keyof typeof LocationLevel,
  sectionId: string,
  nameKey: string,
  offlineData?: IOfflineData,
  addressCases?: AddressCases
) => {
  if (!transformedData[sectionId]) {
    transformedData[sectionId] = {}
  }
  if (!transformedData[sectionId][nameKey]) {
    transformedData[sectionId][nameKey] = Array(3).fill('')
  }
  const addressName =
    addressLocationLevel === 'country'
      ? countries.find(
          ({ value }) => value === addressFromQuery?.[addressLocationLevel]
        )?.label || ''
      : offlineData?.[OFFLINE_LOCATIONS_KEY]?.[
          addressFromQuery[addressLocationLevel] as string
        ]?.name ||
        addressFromQuery[addressLocationLevel] ||
        ''
  ;(transformedData[sectionId][nameKey] as Array<string | MessageDescriptor>)[
    LocationLevel[addressLocationLevel]
  ] = addressName

  const addressCase =
    addressCases === AddressCases.SECONDARY_ADDRESS ? 'secondary' : 'primary'
  transformedData[sectionId][
    camelCase(`${nameKey}_${addressCase}_${addressLocationLevel}`)
  ] = addressName as string | Record<string, string>
}

export const addressOfflineTransformer =
  (
    transformedFieldName: SectionId,
    addressType: GQLAddress,
    addressLocationLevel: keyof typeof LocationLevel,
    targetFieldName?: string
  ) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ) => {
    if (
      queryData[transformedFieldName]?.type &&
      isLocationFacilityOrCRVSOffice(queryData[transformedFieldName]?.type)
    ) {
      return
    }
    const addressFromQuery = queryData[transformedFieldName]?.address?.find(
      (address: GQLAddress) => address.type === addressType
    )
    const nameKey = targetFieldName || field.name
    if (addressFromQuery) {
      transformAddressTemplateArray(
        transformedData,
        addressFromQuery,
        addressLocationLevel,
        sectionId,
        nameKey,
        offlineData
      )
    }
  }

export const individualAddressTransformer =
  (
    addressCase: AddressCases,
    addressLocationLevel: keyof typeof LocationLevel
  ) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ) => {
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }

    const address = queryData[sectionId]?.address
    const addressFromQuery = (address || []).find(
      (addr: { type: AddressCases }) => addr.type === addressCase
    )

    if (addressFromQuery) {
      transformAddressTemplateArray(
        transformedData,
        addressFromQuery,
        addressLocationLevel,
        sectionId,
        sectionId,
        offlineData,
        addressCase
      )
    }
  }

export const addressLineTemplateTransformer =
  (
    addressCase: AddressCases,
    lineNumber: number,
    transformedFieldName: string
  ) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ) => {
    const address = (
      queryData[sectionId]?.individual?.address ||
      queryData[sectionId]?.address ||
      []
    ).find((add: { type: AddressCases }) => add.type === addressCase)

    if (!address) {
      return
    }

    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    const index = lineNumber
    const addCase =
      addressCase === AddressCases.SECONDARY_ADDRESS ? 'secondary' : 'primary'
    const newTransformedName = camelCase(
      `${sectionId}_${addCase}_${transformedFieldName}`
    )
    transformedData[sectionId][newTransformedName] = address.line[index] || ''
  }

export const eventLocationAddressLineTemplateTransformer =
  (lineNumber: number, transformedFieldName: string) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ) => {
    if (
      queryData.eventLocation?.type &&
      queryData.eventLocation?.type === 'HEALTH_FACILITY'
    ) {
      return
    }
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    const index = lineNumber
    transformedData[sectionId][transformedFieldName] =
      (queryData.eventLocation?.address &&
        queryData.eventLocation.address.line &&
        queryData.eventLocation.address.line[index]) ||
      ''
  }

export const eventLocationAddressOfflineTransformer =
  (
    addressLocationLevel: keyof typeof LocationLevel,
    transformedFieldName?: string
  ) =>
  (
    transformedData: IFormData,
    queryData: QueryData,
    sectionId: SectionId,
    field: IFormField,
    _?: IFormField,
    offlineData?: IOfflineData
  ) => {
    if (
      queryData.eventLocation?.type &&
      queryData.eventLocation.type !== 'PRIVATE_HOME' &&
      queryData.eventLocation.type !== 'PRIMARY_ADDRESS' &&
      queryData.eventLocation.type !== 'DECEASED_USUAL_RESIDENCE' &&
      queryData.eventLocation.type !== 'OTHER'
    ) {
      return
    }

    const addressFromQuery = queryData.eventLocation?.address
    const nameKey = transformedFieldName || field.name

    if (addressFromQuery) {
      transformAddressTemplateArray(
        transformedData,
        addressFromQuery,
        addressLocationLevel,
        sectionId,
        nameKey,
        offlineData
      )
    }
  }

export const selectTransformer = (
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField
) => {
  const fieldName = field.name as SectionId
  if (queryData[sectionId]?.[field.name]) {
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    transformedData[sectionId][field.name] =
      (getSelectedOption(
        queryData[sectionId][field.name],
        (field as ISelectFormFieldWithOptions).options
      )?.label as IFormSectionData) || ''
  } else if (queryData[fieldName]) {
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    transformedData[sectionId][field.name] =
      (getSelectedOption(
        queryData[fieldName],
        (field as ISelectFormFieldWithOptions).options
      )?.label as IFormSectionData) || ''
  }
}

export const nationalityTransformer = (
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField,
  _?: IFormField,
  __?: IOfflineData
) => {
  if (queryData[sectionId]?.[field.name]) {
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    const nationalityName = countryAlpha3toAlpha2(
      queryData[sectionId][field.name] && queryData[sectionId][field.name][0]
    )
    transformedData[sectionId][field.name] = nationalityName || 'UNKNOWN'
  }
}

export const plainInputTransformer = (
  transformedData: IFormData,
  queryData: QueryData,
  sectionId: SectionId,
  field: IFormField
) => {
  const fieldName = field.name as SectionId
  if (queryData[sectionId]?.[fieldName]) {
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    transformedData[sectionId][fieldName] =
      queryData[sectionId][field.name] || ''
  } else if (queryData[fieldName]) {
    if (!transformedData[sectionId]) {
      transformedData[sectionId] = {}
    }
    transformedData[sectionId][field.name] = queryData[fieldName] || ''
  }
}
