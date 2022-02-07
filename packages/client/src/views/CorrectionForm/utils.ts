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
  CHECKBOX_GROUP,
  DATE,
  FETCH_BUTTON,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
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
  LIST,
  PARAGRAPH,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SUBSECTION,
  TEXTAREA,
  WARNING,
  LOCATION_SEARCH_INPUT
} from '@client/forms'
import { IApplication } from '@client/applications'
import { Errors, getValidationErrorsForForm } from '@client/forms/validation'
import { IntlShape, MessageDescriptor } from 'react-intl'
import {
  ILocation,
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@client/offline/reducer'
import { getDefaultLanguage } from '@client/i18n/utils'
import { formatLongDate } from '@client/utils/date-formatting'
import { generateLocations } from '@client/utils/locationUtils'
import {
  getConditionalActionsForField,
  getListOfLocations,
  getVisibleSectionGroupsBasedOnConditions
} from '@client/forms/utils'
import { buttonMessages } from '@client/i18n/messages'
import { flattenDeep, get, clone } from 'lodash'

interface IErrorsBySection {
  [sectionId: string]: Errors
}

export function sectionHasError(
  group: IFormSectionGroup,
  section: IFormSection,
  application: IApplication
) {
  const errors = getValidationErrorsForForm(
    group.fields,
    application.data[section.id] || {}
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

export function renderSelectOrRadioLabel(
  value: IFormFieldValue,
  options: Array<ISelectOption | IRadioOption>,
  intl: IntlShape
) {
  const option = options.find((option) => option.value === value)
  return option ? intl.formatMessage(option.label) : value
}

export function renderSelectDynamicLabel(
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
      if (options.resource === 'locations') {
        selectedLocation = resources[OFFLINE_LOCATIONS_KEY][locationId]
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

export const getCheckBoxGroupFieldValue = (
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

export const getFormFieldValue = (
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
    return (tempField &&
      tempField.nestedFields &&
      tempField.nestedFields[field.name]) as IFormFieldValue
  }
  return ''
}

export const renderValue = (
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  intl: IntlShape,
  offlineResources: IOfflineData,
  language: string
) => {
  const value: IFormFieldValue = getFormFieldValue(draftData, sectionId, field)
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
    return formatLongDate(value)
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

  if (value && field.type === CHECKBOX_GROUP) {
    return getCheckBoxGroupFieldValue(field, value as string[], intl)
  }

  if (value && field.type === LOCATION_SEARCH_INPUT) {
    const searchableListOfLocations = generateLocations(
      getListOfLocations(offlineResources, field.searchableResource),
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
  section: IFormSection,
  field: IFormField,
  draft: IApplication
) {
  if (!draft.originalData) return false
  if (
    draft.data[section.id][field.name] &&
    (draft.data[section.id][field.name] as IFormData).value
  ) {
    return hasNestedDataChanged(section, field, draft)
  }
  /*
   * data section might have some values as empty string
   * whereas original data section have them as undefined
   */
  if (
    !draft.originalData[section.id][field.name] &&
    draft.data[section.id][field.name] === ''
  ) {
    return false
  }
  return (
    draft.data[section.id][field.name] !==
    draft.originalData[section.id][field.name]
  )
}

export function hasNestedDataChanged(
  section: IFormSection,
  field: IFormField,
  draft: IApplication
) {
  const nestedFieldData = draft.data[section.id][field.name] as IFormData

  const previousNestedFieldData = (draft.originalData as IFormData)[section.id][
    field.name
  ] as IFormData
  if (nestedFieldData.value === previousNestedFieldData.value) {
    Object.keys(nestedFieldData.nestedFields).forEach((key) => {
      if (
        nestedFieldData.nestedFields[key] !==
        previousNestedFieldData.nestedFields[key]
      )
        return true
    })
    return false
  }
  return true
}

export function getRenderableField(
  section: IFormSection,
  field: IFormField,
  original: IFormFieldValue | JSX.Element | undefined,
  changed: IFormFieldValue | JSX.Element | undefined,
  intl: IntlShape
) {
  let item = intl.formatMessage(field.label)
  if (section && section.name) {
    item = `${item} (${intl.formatMessage(section.name)})`
  }
  return {
    item: item,
    original,
    changed
  }
}

export function isVisibleField(
  field: IFormField,
  section: IFormSection,
  draft: IApplication,
  offlineResources: IOfflineData
) {
  const conditionalActions = getConditionalActionsForField(
    field,
    draft.data[section.id] || {},
    offlineResources,
    draft.data
  )
  return (
    !conditionalActions.includes('hide') &&
    !conditionalActions.includes('disable')
  )
}

export function getOverriddenFieldsListForPreview(
  formSections: IFormSection[],
  draft: IApplication,
  offlineResources: IOfflineData
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
                draft.data
              ).includes('hide')
              return isVisible ? field : ({} as IFormField)
            })
            .filter((field) => !Boolean(field.hideInPreview))
            .filter((field) => Boolean(field.reviewOverrides))
            .filter((field) =>
              isVisibleField(field, section, draft, offlineResources)
            )
        })
        .filter((item) => item.length)
    })
    .filter((item) => item.length)
  return flattenDeep(overriddenFields)
}

export function isViewOnly(field: IFormField) {
  return [LIST, PARAGRAPH, WARNING, TEXTAREA, SUBSECTION, FETCH_BUTTON].find(
    (type) => type === field.type
  )
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
  draft: IApplication
): IFormSection[] => {
  const sections = registerForm.sections.filter(
    ({ id, viewType }) =>
      id !== 'documents' && (viewType === 'form' || viewType === 'hidden')
  )

  return getVisibleSections(sections, draft)
}

const getVisibleSections = (
  formSections: IFormSection[],
  draft: IApplication
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
