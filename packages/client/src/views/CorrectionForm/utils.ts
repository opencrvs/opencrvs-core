/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import { IDeclaration } from '@client/declarations'
import {
  BULLET_LIST,
  CHECKBOX,
  CHECKBOX_GROUP,
  DATE,
  DIVIDER,
  FETCH_BUTTON,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  HIDDEN,
  IAttachmentValue,
  ICheckboxFormField,
  ICheckboxGroupFormField,
  IDynamicOptions,
  IFileValue,
  IForm,
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IRadioOption,
  ISelectOption,
  LOCATION_SEARCH_INPUT,
  PARAGRAPH,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SUBSECTION_HEADER,
  TEXTAREA,
  WARNING
} from '@client/forms'
import {
  getConditionalActionsForField,
  getVisibleSectionGroupsBasedOnConditions
} from '@client/forms/utils'
import { getValidationErrorsForForm } from '@client/forms/validation'
import { buttonMessages, formMessageDescriptors } from '@client/i18n/messages'
import { getDefaultLanguage } from '@client/i18n/utils'
import {
  ILocation,
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@client/offline/reducer'
import { ACCUMULATED_FILE_SIZE } from '@client/utils/constants'
import {
  formatPlainDate,
  isValidPlainDate
} from '@client/utils/date-formatting'
import {
  CorrectionInput,
  PaymentOutcomeType,
  PaymentType,
  RegStatus
} from '@client/utils/gateway'
import { generateLocations } from '@client/utils/locationUtils'
import { UserDetails } from '@client/utils/userUtils'
import { getListOfLocations } from '@client/utils/validate'
import { camelCase, clone, flattenDeep, get, isArray, isEqual } from 'lodash'
import { IntlShape, MessageDescriptor } from 'react-intl'

export function groupHasError(
  group: IFormSectionGroup,
  sectionData: IFormSectionData,
  config: IOfflineData,
  draft: IFormData,
  user: UserDetails | null
) {
  const errors = getValidationErrorsForForm(
    group.fields,
    sectionData || {},
    config,
    draft,
    user
  )

  for (const field of group.fields) {
    const fieldErrors = errors[field.name].errors
    const nestedFieldErrors = errors[field.name].nestedFields

    if (fieldErrors.length > 0) {
      return true
    }

    if (field.nestedFields) {
      for (const nestedFields of Object.values(field.nestedFields)) {
        for (const nestedField of nestedFields) {
          if (
            nestedFieldErrors[nestedField.name] &&
            nestedFieldErrors[nestedField.name].length > 0
          ) {
            return true
          }
        }
      }
    }
  }

  return false
}

export function isCorrection(declaration: IDeclaration) {
  const { registrationStatus } = declaration
  return (
    registrationStatus === RegStatus.Registered ||
    registrationStatus === RegStatus.Certified ||
    registrationStatus === RegStatus.Issued ||
    registrationStatus === RegStatus.CorrectionRequested
  )
}

export function bytesToSize(bytes: number) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Byte'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}

export function isFileSizeExceeded(declaration: IDeclaration) {
  const {
    data: { documents }
  } = declaration
  let totalFileSize = 0
  for (const index in documents) {
    if (!isArray(documents[index])) {
      continue
    }
    totalFileSize = (documents[index] as IFileValue[]).reduce(
      (total, fieldValue) => (total += fieldValue.fileSize || 0),
      totalFileSize
    )
  }
  return totalFileSize > ACCUMULATED_FILE_SIZE
}

export function updateDeclarationRegistrationWithCorrection(
  correctionData: {
    corrector?: {
      relationship:
        | string
        | { value: string; nestedFields: { otherRelationship: string } }
      hasShowedVerifiedDocument?: boolean
    }
    reason?: {
      type: string | { value: string }
      additionalComment?: string
      nestedFields?: IFormSectionData
    }
    supportingDocuments?: {
      supportDocumentRequiredForCorrection?: boolean
      uploadDocForLegalProof?: IAttachmentValue
    }
    currectionFeesPayment?: {
      correctionFees?: IFormSectionData
    }
  },
  meta?: { userPrimaryOffice?: UserDetails['primaryOffice'] }
) {
  let correctionValues: CorrectionInput = {
    requester: '',
    requesterOther: '',
    hasShowedVerifiedDocument: false,
    noSupportingDocumentationRequired: false,
    reason: '',
    otherReason: '',
    location: {},
    note: '',
    attachments: [],
    values: []
  }

  const data = correctionData

  if (data.corrector && data.corrector.relationship) {
    if (typeof data.corrector.relationship === 'string') {
      correctionValues.requester = data.corrector.relationship
    } else {
      correctionValues.requester = data.corrector.relationship.value
      correctionValues.requesterOther =
        data.corrector.relationship.nestedFields.otherRelationship
    }
  }

  correctionValues.hasShowedVerifiedDocument = Boolean(
    data.corrector?.hasShowedVerifiedDocument
  )

  if (data.reason) {
    if (data.reason.type) {
      correctionValues.reason = ((data.reason.type as IFormSectionData).value ||
        data.reason.type) as string
    }

    if (data.reason.additionalComment) {
      correctionValues.note = data.reason.additionalComment
    }

    if ((data.reason.type as IFormSectionData).nestedFields) {
      const nestedFields = (data.reason.type as IFormSectionData)
        .nestedFields as IFormSectionData
      correctionValues = { ...correctionValues, ...nestedFields }
    }
  }

  if (data.supportingDocuments) {
    if (
      typeof data.supportingDocuments.supportDocumentRequiredForCorrection ===
      'boolean'
    ) {
      if (data.supportingDocuments.supportDocumentRequiredForCorrection) {
        correctionValues.hasShowedVerifiedDocument = Boolean(
          data.corrector?.hasShowedVerifiedDocument
        )
      } else {
        correctionValues.noSupportingDocumentationRequired = true
      }
    }

    if (Array.isArray(data.supportingDocuments.uploadDocForLegalProof)) {
      data.supportingDocuments.uploadDocForLegalProof.forEach((file) => {
        correctionValues.attachments.push({
          data: file.data,
          type: file.optionValues[1]
        })
      })
    }
  }

  if (data.currectionFeesPayment) {
    const correctionFees = (
      data.currectionFeesPayment.correctionFees as IFormSectionData
    )?.value

    if (correctionFees === 'REQUIRED') {
      const { nestedFields }: { nestedFields?: IFormSectionData } = data
        .currectionFeesPayment.correctionFees as IFormSectionData

      correctionValues.payment = {
        type: PaymentType.Manual,
        amount: Number(nestedFields?.totalFees),
        outcome: PaymentOutcomeType.Completed,
        date: new Date().toISOString()
      }

      if (nestedFields?.proofOfPayment) {
        correctionValues.payment.attachmentData = (
          nestedFields?.proofOfPayment as IFileValue
        ).data
      }
    }
  }

  if (meta) {
    if (meta.userPrimaryOffice) {
      correctionValues.location = {
        _fhirID: meta.userPrimaryOffice.id
      }
    }
  }

  return correctionValues
}

export function sectionHasError(
  group: IFormSectionGroup,
  section: IFormSection,
  declaration: IDeclaration,
  config: IOfflineData,
  draft: IFormData,
  user: UserDetails | null
) {
  const errors = getValidationErrorsForForm(
    group.fields,
    declaration.data[section.id] || {},
    config,
    draft,
    user
  )

  for (const field of group.fields) {
    const fieldErrors = errors[field.name].errors
    const nestedFieldErrors = errors[field.name].nestedFields

    if (fieldErrors.length > 0) {
      return true
    }

    if (field.nestedFields) {
      for (const nestedFields of Object.values(field.nestedFields)) {
        for (const nestedField of nestedFields) {
          if (
            nestedFieldErrors[nestedField.name] &&
            nestedFieldErrors[nestedField.name].length > 0
          ) {
            return true
          }
        }
      }
    }
  }

  return false
}

function renderSelectOrRadioLabel(
  value: IFormFieldValue,
  options: Array<ISelectOption | IRadioOption>,
  intl: IntlShape
) {
  const option = options.find((option) => option.value === value)
  return option?.label ? intl.formatMessage(option.label) : value
}

function renderSelectDynamicLabel(
  value: IFormFieldValue,
  options: IDynamicOptions,
  draftData: IFormSectionData,
  intl: IntlShape,
  resources: IOfflineData,
  language: string
) {
  if (!options.resource) {
    const dependency = options.dependency
      ? draftData[options.dependency]
      : false
    const selectedOption = dependency
      ? options.options &&
        options.options[dependency.toString()].find(
          (option) => option.value === value
        )
      : false
    return selectedOption ? intl.formatMessage(selectedOption.label) : value
  } else {
    if (options.resource) {
      let selectedLocation: ILocation
      const locationId = value as string
      // HOTFIX for handling international address
      if (options.resource === 'locations') {
        selectedLocation = resources[OFFLINE_LOCATIONS_KEY][locationId] || {
          name: locationId,
          alias: locationId
        }
      } else {
        selectedLocation = resources[OFFLINE_FACILITIES_KEY][locationId]
      }

      if (selectedLocation) {
        if (language !== getDefaultLanguage()) {
          return selectedLocation.alias
        } else {
          return selectedLocation.name
        }
      } else {
        return false
      }
    } else {
      return false
    }
  }
}

const getCheckboxFieldValue = (
  field: ICheckboxFormField,
  value: string,
  intl: IntlShape
) => {
  const { checkedValue = true } = field
  return intl.formatMessage(
    value === String(checkedValue)
      ? formMessageDescriptors.confirm
      : formMessageDescriptors.deny
  )
}

const getCheckBoxGroupFieldValue = (
  field: ICheckboxGroupFormField,
  value: string[],
  intl: IntlShape
) => {
  const option = field.options.find((option) => {
    return value.length > 0 && option.value === value[0]
  })
  if (option) {
    return intl.formatMessage(option.label)
  }
  return ''
}

const getFormFieldValue = (
  draftData: IFormData,
  sectionId: string,
  field: IFormField
): IFormFieldValue => {
  const sectionDraftData = draftData[sectionId] || {}
  if (field.name in sectionDraftData) {
    return sectionDraftData[field.name]
  }

  let tempField: IFormField
  for (const key in sectionDraftData) {
    tempField = sectionDraftData[key] as IFormField
    if (
      tempField &&
      tempField.nestedFields &&
      field.name in tempField.nestedFields
    ) {
      return tempField.nestedFields[field.name] as IFormFieldValue
    }
  }
  return ''
}

export const addressFieldNames = [
  'statePrimary',
  'districtPrimary',
  'cityUrbanOptionPrimary',
  'internationalStatePrimary',
  'internationalDistrictPrimary',
  'internationalCityPrimary',
  'stateSecondary',
  'districtSecondary',
  'cityUrbanOptionSecondary',
  'internationalStateSecondary',
  'internationalCitySecondary',
  'internationalDistrictSecondary'
]

export const renderValue = (
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  intl: IntlShape,
  offlineResources: IOfflineData,
  language: string
) => {
  const value: IFormFieldValue = getFormFieldValue(draftData, sectionId, field)
  const hasAddressField = addressFieldNames.some((fieldName) =>
    field.name.includes(fieldName)
  )

  if (hasAddressField) {
    const sectionData = draftData[sectionId]

    if (
      sectionData[camelCase(`countryPrimary ${sectionId}`)] ===
      window.config.COUNTRY
    ) {
      const dynamicOption: IDynamicOptions = {
        resource: 'locations'
      }
      dynamicOption.dependency = [
        'internationalStatePrimary',
        'statePrimary'
      ].some((f) => field.name.includes(f))
        ? camelCase(`countryPrimary ${sectionId}`)
        : camelCase(`statePrimary ${sectionId}`)

      return renderSelectDynamicLabel(
        value,
        dynamicOption,
        sectionData,
        intl,
        offlineResources,
        language
      )
    }

    if (
      sectionData[camelCase(`countrySecondary ${sectionId}`)] ===
      window.config.COUNTRY
    ) {
      const dynamicOption: IDynamicOptions = {
        resource: 'locations'
      }
      dynamicOption.dependency = [
        'internationalStateSecondary',
        'stateSecondary'
      ].some((f) => field.name.includes(f))
        ? camelCase(`countrySecondary ${sectionId}`)
        : camelCase(`stateSecondary ${sectionId}`)

      return renderSelectDynamicLabel(
        value,
        dynamicOption,
        sectionData,
        intl,
        offlineResources,
        language
      )
    }
    return value
  }

  if (field.type === SELECT_WITH_OPTIONS && field.options) {
    return renderSelectOrRadioLabel(value, field.options, intl)
  }
  if (field.type === SELECT_WITH_DYNAMIC_OPTIONS && field.dynamicOptions) {
    const sectionData = draftData[sectionId]
    return renderSelectDynamicLabel(
      value,
      field.dynamicOptions,
      sectionData,
      intl,
      offlineResources,
      language
    )
  }

  if (
    (field.type === DATE ||
      (field.type === FIELD_WITH_DYNAMIC_DEFINITIONS &&
        field.dynamicDefinitions.type &&
        field.dynamicDefinitions.type.kind === 'static' &&
        field.dynamicDefinitions.type.staticType === DATE)) &&
    value &&
    typeof value === 'string'
  ) {
    return isValidPlainDate(value) ? formatPlainDate(value) : ''
  }

  if (field.hideValueInPreview) {
    return ''
  }

  if (field.type === RADIO_GROUP) {
    return renderSelectOrRadioLabel(value, field.options, intl)
  }

  if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
    return renderSelectOrRadioLabel(
      (value && (value as IFormSectionData).value) || '',
      field.options,
      intl
    )
  }

  if (field.type === CHECKBOX) {
    return getCheckboxFieldValue(field, String(value), intl)
  }

  if (value && field.type === CHECKBOX_GROUP) {
    return getCheckBoxGroupFieldValue(field, value as string[], intl)
  }

  if (value && field.type === LOCATION_SEARCH_INPUT) {
    const searchableListOfLocations = generateLocations(
      field.searchableResource.reduce((locations, resource) => {
        return {
          ...locations,
          ...getListOfLocations(offlineResources, resource)
        }
      }, {}),
      intl
    )
    const selectedLocation = searchableListOfLocations.find(
      (location) => location.id === value
    )
    return (selectedLocation && selectedLocation.displayLabel) || ''
  }

  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'boolean') {
    return value
      ? intl.formatMessage(buttonMessages.yes)
      : intl.formatMessage(buttonMessages.no)
  }
  return value
}

export function hasFieldChanged(
  field: IFormField,
  sectionData: IFormSectionData,
  originalSectionData?: IFormSectionData
) {
  if (!originalSectionData) {
    const isCustomSection = sectionData && sectionData[field.name]
    if (isCustomSection) return true
    return false
  }
  if (sectionData[field.name] && (sectionData[field.name] as IFormData).value) {
    return hasNestedDataChanged(
      sectionData[field.name] as IFormData,
      originalSectionData[field.name] as IFormData
    )
  }
  /*
   * data section might have some values as empty string
   * whereas original data section have them as undefined
   */
  if (!originalSectionData[field.name] && sectionData[field.name] === '') {
    return false
  }

  if (Array.isArray(sectionData[field.name])) {
    return !isEqual(sectionData[field.name], originalSectionData[field.name])
  }
  return sectionData[field.name] !== originalSectionData[field.name]
}

function hasNestedDataChanged(
  nestedFieldData: IFormData,
  previousNestedFieldData: IFormData
) {
  if (nestedFieldData.value === previousNestedFieldData.value) {
    for (const key of Object.keys(nestedFieldData.nestedFields)) {
      if (
        !previousNestedFieldData.nestedFields[key] &&
        nestedFieldData.nestedFields[key] === ''
      ) {
        continue
      }
      if (
        nestedFieldData.nestedFields[key] !==
        previousNestedFieldData.nestedFields[key]
      ) {
        return true
      }
    }
    return false
  }
  return true
}

export type RenderableFieldType = {
  item: string
  original: IFormFieldValue | JSX.Element | undefined
  changed: IFormFieldValue | JSX.Element | undefined
}

export function getRenderableField(
  section: IFormSection,
  {
    fieldLabel,
    fieldLabelParams
  }: {
    fieldLabel: MessageDescriptor
    fieldLabelParams?: Record<string, string>
  },
  original: IFormFieldValue | JSX.Element | undefined,
  changed: IFormFieldValue | JSX.Element | undefined,
  intl: IntlShape
): RenderableFieldType {
  let item = intl.formatMessage(fieldLabel, fieldLabelParams)
  if (section && section.name) {
    item = `${item} (${intl.formatMessage(section.name)})`
  }
  return {
    item,
    original,
    changed
  }
}

export function isVisibleField(
  field: IFormField,
  section: IFormSection,
  draft: IDeclaration,
  config: IOfflineData,
  user: UserDetails | null
) {
  if (field.type === HIDDEN) {
    return false
  }
  const conditionalActions = getConditionalActionsForField(
    field,
    draft.data[section.id] || {},
    config,
    draft.data,
    user
  )
  return (
    !conditionalActions.includes('hide') &&
    !conditionalActions.includes('disable')
  )
}

export function getOverriddenFieldsListForPreview(
  formSections: IFormSection[],
  draft: IDeclaration,
  offlineResources: IOfflineData,
  userDetails: UserDetails | null
): IFormField[] {
  const overriddenFields = formSections
    .map((section) => {
      return section.groups
        .map((group) => {
          return group.fields
            .map((field) => {
              const tempField = clone(field)
              const residingSection =
                get(field.reviewOverrides, 'residingSection') || ''
              tempField.conditionals =
                get(field.reviewOverrides, 'conditionals') ||
                field.conditionals ||
                []

              const isVisible = !getConditionalActionsForField(
                tempField,
                draft.data[residingSection] || {},
                offlineResources,
                draft.data,
                userDetails
              ).includes('hide')
              return isVisible ? field : ({} as IFormField)
            })
            .filter((field) => !Boolean(field.hideInPreview))
            .filter((field) => Boolean(field.reviewOverrides))
            .filter((field) =>
              isVisibleField(
                field,
                section,
                draft,
                offlineResources,
                userDetails
              )
            )
        })
        .filter((item) => item.length)
    })
    .filter((item) => item.length)
  return flattenDeep(overriddenFields)
}

export function isViewOnly(field: IFormField) {
  return [
    BULLET_LIST,
    PARAGRAPH,
    WARNING,
    TEXTAREA,
    SUBSECTION_HEADER,
    FETCH_BUTTON,
    DIVIDER
  ].find((type) => type === field.type)
}

export const getNestedFieldValue = (
  section: IFormSection,
  nestSectionData: IFormData,
  nestedField: IFormField,
  intl: IntlShape,
  offlineResources: IOfflineData,
  language: string
) => {
  return renderValue(
    nestSectionData,
    'nestedFields',
    nestedField,
    intl,
    offlineResources,
    language
  )
}

export const getViewableSection = (
  registerForm: IForm,
  draft: IDeclaration
): IFormSection[] => {
  const sections = registerForm.sections.filter(
    ({ id, viewType }) =>
      id !== 'documents' && (viewType === 'form' || viewType === 'hidden')
  )

  return getVisibleSections(sections, draft)
}

const getVisibleSections = (
  formSections: IFormSection[],
  draft: IDeclaration
) => {
  return formSections.filter(
    (section) =>
      getVisibleSectionGroupsBasedOnConditions(
        section,
        draft.data[section.id] || {},
        draft.data
      ).length > 0
  )
}
