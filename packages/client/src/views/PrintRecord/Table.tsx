import { IDeclaration } from '@client/declarations'
import {
  IFormSection,
  IFormField,
  FETCH_BUTTON,
  LIST,
  PARAGRAPH,
  SUBSECTION,
  WARNING,
  IFormFieldValue,
  IFormData,
  IDynamicOptions,
  SELECT_WITH_OPTIONS,
  SELECT_WITH_DYNAMIC_OPTIONS,
  DATE,
  FIELD_WITH_DYNAMIC_DEFINITIONS,
  RADIO_GROUP,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  IFormSectionData,
  CHECKBOX,
  CHECKBOX_GROUP,
  LOCATION_SEARCH_INPUT,
  REVIEW_OVERRIDE_POSITION,
  IFormSectionGroup,
  IPreviewGroup,
  ICheckboxFormField,
  ICheckboxGroupFormField,
  IRadioOption,
  ISelectOption
} from '@client/forms'
import {
  getConditionalActionsForField,
  getListOfLocations,
  getSectionFields,
  getVisibleSectionGroupsBasedOnConditions
} from '@client/forms/utils'
import {
  ILocation,
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@client/offline/reducer'
import { clone, get, flattenDeep } from 'lodash'
import React from 'react'
import { IntlShape, MessageDescriptor, useIntl } from 'react-intl'
import {
  IErrorsBySection,
  RequiredField
} from '@client/views/RegisterForm/review/ReviewSection'
import { formatLongDate } from '@client/utils/date-formatting'
import { generateLocations } from '@client/utils/locationUtils'
import { formatLocationName, formatMessage } from './utils'
import { IValidationResult } from '@client/utils/validate'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import styled from 'styled-components'
import { buttonMessages, formMessageDescriptors } from '@client/i18n/messages'
import {
  getValidationErrorsForForm,
  IFieldErrors
} from '@client/forms/validation'
import {
  getViewableSection,
  hasFieldChanged
} from '@client/views/CorrectionForm/utils'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'

interface PrintRecordTableProps {
  declaration: IDeclaration
  intls: IntlShape[]
}

const ErrorField = styled.p`
  margin-top: 0;
  margin-bottom: 0;
`

const StyledTable = styled.table`
  margin-top: 8px;
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  ${({ theme }) => theme.fonts.bold14}
`
const StyledTHead = styled.thead`
  background: ${({ theme }) => theme.colors.grey200};
`
const StyledTH = styled.th`
  text-transform: uppercase;
  text-align: left;
  padding: 4px 8px;
  border: 0.5px solid ${({ theme }) => theme.colors.grey500};
`

const StyledTD = styled.td`
  border: 0.5px solid ${({ theme }) => theme.colors.grey500};
  padding: 4px 8px;
`

export function renderSelectOrRadioLabel(
  value: IFormFieldValue,
  options: Array<ISelectOption | IRadioOption>,
  intls: IntlShape[]
) {
  const option = options.find((option) => option.value === value)
  return option?.label ? formatMessage(intls, option.label) : value
}

function renderSelectDynamicLabel(
  value: IFormFieldValue,
  options: IDynamicOptions,
  draftData: IFormSectionData,
  intls: IntlShape[],
  offlineCountryConfig: IOfflineData
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
    return selectedOption ? formatMessage(intls, selectedOption.label) : value
  } else {
    if (options.resource) {
      let selectedLocation: ILocation
      const locationId = value as string
      // HOTFIX for handling international address
      if (options.resource === 'locations') {
        selectedLocation = offlineCountryConfig[OFFLINE_LOCATIONS_KEY][
          locationId
        ] || { name: locationId, alias: locationId }
      } else {
        selectedLocation =
          offlineCountryConfig[OFFLINE_FACILITIES_KEY][locationId]
      }

      if (selectedLocation) {
        return formatLocationName(selectedLocation)
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
  intls: IntlShape[]
) => {
  const { checkedValue = true } = field
  return formatMessage(
    intls,
    value === String(checkedValue)
      ? formMessageDescriptors.confirm
      : formMessageDescriptors.deny
  )
}

const getCheckBoxGroupFieldValue = (
  field: ICheckboxGroupFormField,
  value: string[],
  intls: IntlShape[]
) => {
  const option = field.options.find((option) => {
    return value.length > 0 && option.value === value[0]
  })
  if (option) {
    return formatMessage(intls, option.label)
  }
  return ''
}
function getFormFieldValue(
  draftData: IFormData,
  sectionId: string,
  field: IFormField
): IFormFieldValue {
  const sectionDraftData = draftData[sectionId] || {}
  if (field.name in sectionDraftData) {
    return sectionDraftData[field.name]
  }

  let tempField: IFormField
  for (const key in sectionDraftData) {
    tempField = sectionDraftData[key] as IFormField
    if (tempField?.nestedFields?.[field.name]) {
      return tempField.nestedFields[field.name] as IFormFieldValue
    }
  }
  return ''
}

function renderValue(
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  intls: IntlShape[],
  offlineCountryConfiguration: IOfflineData,
  isOriginalData = false,
  intl: IntlShape
) {
  const value: IFormFieldValue = getFormFieldValue(draftData, sectionId, field)

  // Showing State & District Name instead of their ID
  if (
    [
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
    ].includes(field.name) &&
    isOriginalData
  ) {
    const sectionData = draftData[sectionId]

    if (sectionData.countryPrimary === window.config.COUNTRY) {
      const dynamicOption: IDynamicOptions = {
        resource: 'locations',
        initialValue: 'agentDefault'
      }
      dynamicOption.dependency = [
        'internationalStatePrimary',
        'statePrimary'
      ].includes(field.name)
        ? 'countryPrimary'
        : 'statePrimary'

      return renderSelectDynamicLabel(
        value,
        dynamicOption,
        sectionData,
        intls,
        offlineCountryConfiguration
      )
    }

    if (sectionData.countrySecondary === window.config.COUNTRY) {
      const dynamicOption: IDynamicOptions = {
        resource: 'locations',
        initialValue: 'agentDefault'
      }
      dynamicOption.dependency = [
        'internationalStateSecondary',
        'stateSecondary'
      ].includes(field.name)
        ? 'countrySecondary'
        : 'stateSecondary'

      return renderSelectDynamicLabel(
        value,
        dynamicOption,
        sectionData,
        intls,
        offlineCountryConfiguration
      )
    }

    return value
  }
  if (field.type === SELECT_WITH_OPTIONS && field.options) {
    return renderSelectOrRadioLabel(value, field.options, intls)
  }
  if (field.type === SELECT_WITH_DYNAMIC_OPTIONS && field.dynamicOptions) {
    const sectionData = draftData[sectionId]
    return renderSelectDynamicLabel(
      value,
      field.dynamicOptions,
      sectionData,
      intls,
      offlineCountryConfiguration
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
    return renderSelectOrRadioLabel(value, field.options, intls)
  }

  if (field.type === RADIO_GROUP_WITH_NESTED_FIELDS) {
    return renderSelectOrRadioLabel(
      (value && (value as IFormSectionData).value) || '',
      field.options,
      intls
    )
  }

  if (field.type === CHECKBOX) {
    return getCheckboxFieldValue(field, String(value), intls)
  }

  if (value && field.type === CHECKBOX_GROUP) {
    return getCheckBoxGroupFieldValue(field, value as string[], intls)
  }

  if (value && field.type === LOCATION_SEARCH_INPUT) {
    const searchableListOfLocations = generateLocations(
      field.searchableResource.reduce((locations, resource) => {
        return {
          ...locations,
          ...getListOfLocations(offlineCountryConfiguration, resource)
        }
      }, {}),
      intl
    )
    const selectedLocation = searchableListOfLocations.find(
      (location) => location.id === value
    )
    return (selectedLocation && selectedLocation.displayLabel) || ''
  }

  if (typeof value === 'boolean') {
    return value
      ? intl.formatMessage(buttonMessages.yes)
      : intl.formatMessage(buttonMessages.no)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return field.postfix
      ? String(value).concat(` ${field.postfix.toLowerCase()}`)
      : field.unit
      ? String(value).concat(intl.formatMessage(field.unit))
      : value
  }

  return value
}

export const getErrorsOnFieldsBySection = (
  formSections: IFormSection[],
  offlineCountryConfig: IOfflineData,
  draft: IDeclaration
): IErrorsBySection => {
  return formSections.reduce((sections, section: IFormSection) => {
    const fields: IFormField[] = getSectionFields(
      section,
      draft.data[section.id],
      draft.data
    )

    const errors = getValidationErrorsForForm(
      fields,
      draft.data[section.id] || {},
      offlineCountryConfig,
      draft.data
    )

    return {
      ...sections,
      [section.id]: fields.reduce((fields, field) => {
        // REFACTOR
        const validationErrors: IFieldErrors = errors[
          field.name as keyof typeof errors
        ] as IFieldErrors

        const value = draft.data[section.id]
          ? draft.data[section.id][field.name]
          : null

        const informationMissing =
          validationErrors.errors.length > 0 ||
          value === null ||
          Object.values(validationErrors.nestedFields).some(
            (nestedErrors) => nestedErrors.length > 0
          )
            ? validationErrors
            : { errors: [], nestedFields: {} }

        return { ...fields, [field.name]: informationMissing }
      }, {})
    }
  }, {})
}

export function PrintRecordTable(props: PrintRecordTableProps) {
  const offlineCountryConfiguration = useSelector(getOfflineData)
  const intl = useIntl()
  const registerForm = useSelector(getRegisterForm)
  function fieldHasErrors(
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) {
    if (
      (
        get(sectionErrors[section.id][field.name], 'errors') ||
        getErrorForNestedField(section, field, sectionErrors)
      ).length > 0
    ) {
      return true
    }
    return false
  }

  function getFieldValueWithErrorMessage(
    section: IFormSection,
    field: IFormField,
    errorsOnField: any
  ) {
    return (
      <RequiredField id={`required_label_${section.id}_${field.name}`}>
        {field.ignoreFieldLabelOnErrorMessage ||
          (field.previewGroup && formatMessage(props.intls, field.label) + ' ')}
        {formatMessage(props.intls, errorsOnField.message, errorsOnField.props)}
      </RequiredField>
    )
  }

  function getRenderableField(
    section: IFormSection,
    group: IFormSectionGroup,
    fieldLabel: MessageDescriptor,
    fieldName: string,
    value: IFormFieldValue | JSX.Element | undefined,
    ignoreAction = false
  ) {
    const { intls } = props

    return {
      label: formatMessage(intls, fieldLabel),
      value
    }
  }

  function getNestedFieldValueOrError(
    section: IFormSection,
    nestSectionData: IFormData,
    nestedField: IFormField,
    parentFieldErrors: IFieldErrors
  ) {
    const { intls } = props
    const errorsOnNestedField =
      parentFieldErrors.nestedFields[nestedField.name] || []

    return (
      <>
        {errorsOnNestedField.length > 0
          ? getFieldValueWithErrorMessage(
              section,
              nestedField,
              errorsOnNestedField[0]
            )
          : renderValue(
              nestSectionData,
              'nestedFields',
              nestedField,
              intls,
              offlineCountryConfiguration,
              undefined,
              intl
            )}
      </>
    )
  }

  function getPreviewGroupsField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    errorsOnFields: IErrorsBySection,
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) {
    const { declaration: draft } = props

    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (isVisibleField(field, section) && !isViewOnly(field)) {
          if (field.previewGroup === baseTag) {
            taggedFields.push(field)
          }
          for (const index in field.nestedFields) {
            field.nestedFields[index].forEach((tempField) => {
              if (
                isVisibleField(tempField, section) &&
                !isViewOnly(tempField) &&
                tempField.previewGroup === baseTag
              ) {
                taggedFields.push(tempField)
              }
            })
          }
        }
      })

      const tagDef =
        (group.previewGroups &&
          (group.previewGroups.filter(
            (previewGroup) => previewGroup.id === baseTag
          ) as IPreviewGroup[])) ||
        []
      const values = taggedFields
        .map((field) =>
          getValueOrError(section, draft.data, field, errorsOnFields)
        )
        .filter((value) => value)

      let completeValue = values[0]
      values.shift()
      values.forEach(
        (value) =>
          (completeValue = (
            <>
              {completeValue}
              {tagDef[0].delimiter ? (
                <span>{tagDef[0].delimiter}</span>
              ) : (
                <br />
              )}
              {value}
            </>
          ))
      )

      const hasErrors = taggedFields.reduce(
        (accum, field) =>
          accum || fieldHasErrors(section, field, errorsOnFields),
        false
      )

      const hasAnyFieldChanged = taggedFields.reduce(
        (accum, field) => accum || hasFieldChanged(field, data, originalData),
        false
      )
      const draftOriginalData = draft.originalData
      if (draftOriginalData && hasAnyFieldChanged && !hasErrors) {
        completeValue = <>{completeValue}</>
      }

      return getRenderableField(
        section,
        group,
        (tagDef[0] && tagDef[0].label) || field.label,
        (tagDef[0] && tagDef[0].fieldToRedirect) || field.name,
        completeValue,
        field.readonly
      )
    }
  }

  function getErrorForNestedField(
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ): IValidationResult[] {
    for (const key in sectionErrors[section.id]) {
      return sectionErrors[section.id][key].nestedFields[field.name] || []
    }
    return []
  }

  function getValueOrError(
    section: IFormSection,
    data: IFormData,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean,
    replaceEmpty?: boolean,
    isOriginalData?: boolean
  ) {
    let value = renderValue(
      data,
      section.id,
      field,
      props.intls,
      offlineCountryConfiguration,
      isOriginalData,
      intl
    )

    if (replaceEmpty && !value) {
      value = '-'
    }
    const errorsOnField =
      get(sectionErrors[section.id][field.name], 'errors') ||
      getErrorForNestedField(section, field, sectionErrors)

    return errorsOnField.length > 0 ? (
      <ErrorField>
        {getFieldValueWithErrorMessage(section, field, errorsOnField[0])}
      </ErrorField>
    ) : field.nestedFields && !Boolean(ignoreNestedFieldWrapping) ? (
      (
        (data[section.id] &&
          data[section.id][field.name] &&
          (data[section.id][field.name] as IFormSectionData).value &&
          field.nestedFields[
            (data[section.id][field.name] as IFormSectionData).value as string
          ]) ||
        []
      ).reduce((groupedValues, nestedField) => {
        const errorsOnNestedField =
          sectionErrors[section.id][field.name].nestedFields[
            nestedField.name
          ] || []
        // Value of the parentField resembles with IFormData as a nested form
        const nestedValue =
          (data[section.id] &&
            data[section.id][field.name] &&
            renderValue(
              data[section.id][field.name] as IFormData,
              'nestedFields',
              nestedField,
              props.intls,
              offlineCountryConfiguration,
              isOriginalData,
              intl
            )) ||
          ''
        return (
          <>
            {groupedValues}
            {(errorsOnNestedField.length > 0 || nestedValue) && <br />}
            {errorsOnNestedField.length > 0
              ? getFieldValueWithErrorMessage(
                  section,
                  field,
                  errorsOnNestedField[0]
                )
              : nestedValue}
          </>
        )
      }, <>{value}</>)
    ) : (
      <>{value}</>
    )
  }
  function getSinglePreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean
  ) {
    const {
      declaration: { data }
    } = props

    const value = getValueOrError(
      section,
      data,
      field,
      sectionErrors,
      ignoreNestedFieldWrapping
    )

    return getRenderableField(
      section,
      group,
      field.label,
      field.name,
      value,
      field.readonly
    )
  }

  function getNestedPreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) {
    const { declaration: draft } = props
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    nestedItems.push(
      getSinglePreviewField(section, group, field, sectionErrors, true)
    )
    ;(
      (field.nestedFields &&
        draft.data[section.id] &&
        draft.data[section.id][field.name] &&
        (draft.data[section.id][field.name] as IFormSectionData).value &&
        field.nestedFields[
          (draft.data[section.id][field.name] as IFormSectionData)
            .value as string
        ]) ||
      []
    ).forEach((nestedField) => {
      if (nestedField.previewGroup) {
        nestedItems.push(
          getPreviewGroupsField(
            section,
            group,
            nestedField,
            visitedTags,
            sectionErrors,
            (draft.data[section.id][field.name] as IFormData).nestedFields,
            (draft.originalData &&
              (draft.originalData[section.id][field.name] as IFormData)
                .nestedFields) ||
              undefined
          )
        )
      } else {
        nestedItems.push(
          getRenderableField(
            section,
            group,
            nestedField.label,
            nestedField.name,
            getNestedFieldValueOrError(
              section,
              draft.data[section.id][field.name] as IFormData,
              nestedField,
              sectionErrors[section.id][field.name]
            ),
            nestedField.readonly
          )
        )
      }
    })
    return nestedItems
  }
  function isViewOnly(field: IFormField) {
    return [LIST, PARAGRAPH, WARNING, SUBSECTION, FETCH_BUTTON].find(
      (type) => type === field.type
    )
  }
  function isVisibleField(field: IFormField, section: IFormSection) {
    const { declaration: draft } = props
    const conditionalActions = getConditionalActionsForField(
      field,
      draft.data[section.id] || {},
      offlineCountryConfiguration,
      draft.data
    )
    return (
      !conditionalActions.includes('hide') &&
      !conditionalActions.includes('hideInPreview')
    )
  }
  function getOverriddenFieldsListForPreview(
    formSections: IFormSection[]
  ): IFormField[] {
    const overriddenFields = formSections
      .map((section) => {
        return section.groups
          .map((group) => {
            return group.fields
              .map((field) => {
                const { declaration: draft } = props
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
                  offlineCountryConfiguration,
                  draft.data
                ).includes('hide')

                return isVisible ? field : ({} as IFormField)
              })
              .filter((field) => !Boolean(field.hideInPreview))
              .filter((field) => Boolean(field.reviewOverrides))
              .filter((field) => isVisibleField(field, section))
          })
          .filter((item) => item.length)
      })
      .filter((item) => item.length)
    return flattenDeep(overriddenFields)
  }

  function getOverRiddenPreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    overriddenField: IFormField,
    sectionErrors: IErrorsBySection,
    field: IFormField,
    items: any[],
    item: any
  ) {
    overriddenField.label =
      get(overriddenField, 'reviewOverrides.labelAs') || overriddenField.label
    const residingSectionId = get(
      overriddenField,
      'reviewOverrides.residingSection'
    )
    const residingSection = registerForm.death.sections.find(
      (section) => section.id === residingSectionId
    ) as IFormSection

    const result = getSinglePreviewField(
      residingSection,
      group,
      overriddenField,
      sectionErrors
    )

    const { sectionID, groupID, fieldName } =
      overriddenField!.reviewOverrides!.reference
    if (
      sectionID === section.id &&
      groupID === group.id &&
      fieldName === field.name
    ) {
      if (
        overriddenField!.reviewOverrides!.position ===
        REVIEW_OVERRIDE_POSITION.BEFORE
      ) {
        items = items.concat(result)
        items = items.concat(item)
      } else {
        items = items.concat(item)
        items = items.concat(result)
      }
      return items
    }

    items = items.concat(item)
    return items
  }

  const transformSectionData = (
    formSections: IFormSection[],
    errorsOnFields: IErrorsBySection,
    offlineCountryConfiguration: IOfflineData
  ) => {
    const { intls, declaration: draft } = props
    const overriddenFields = getOverriddenFieldsListForPreview(formSections)
    let tempItem: any
    return formSections.map((section) => {
      let items: any[] = []
      const visitedTags: string[] = []
      const visibleGroups = getVisibleSectionGroupsBasedOnConditions(
        section,
        draft.data[section.id] || {},
        draft.data
      )
      visibleGroups.forEach((group) => {
        group.fields
          .filter(
            (field) => isVisibleField(field, section) && !isViewOnly(field)
          )
          .filter((field) => !Boolean(field.hideInPreview))
          .filter((field) => !Boolean(field.reviewOverrides))
          .forEach((field) => {
            const fieldDisabled = getConditionalActionsForField(
              field,
              draft.data[section.id] || {},
              offlineCountryConfiguration,
              draft.data
            )

            tempItem = field.previewGroup
              ? getPreviewGroupsField(
                  section,
                  group,
                  field,
                  visitedTags,
                  errorsOnFields,
                  draft.data[section.id],
                  (draft.originalData && draft.originalData[section.id]) ||
                    undefined
                )
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? getNestedPreviewField(section, group, field, errorsOnFields)
              : getSinglePreviewField(section, group, field, errorsOnFields)
            if (fieldDisabled.includes('disable') && tempItem?.action) {
              tempItem.action.disabled = true
            }
            overriddenFields.forEach((overriddenField) => {
              items = getOverRiddenPreviewField(
                section,
                group,
                overriddenField as IFormField,
                errorsOnFields,
                field,
                items,
                tempItem
              )
            })

            if (!overriddenFields.length) {
              items = items.concat(tempItem)
            }
          })
      })
      return {
        id: section.id,
        title: formatMessage(intls, section.title),
        items: items.filter((item) => item)
      }
    })
  }

  const formSections = getViewableSection(
    registerForm[props.declaration.event],
    props.declaration
  )
  const errorsOnFields = getErrorsOnFieldsBySection(
    formSections,
    offlineCountryConfiguration,
    props.declaration
  )
  const transformedSectionData = transformSectionData(
    formSections,
    errorsOnFields,
    offlineCountryConfiguration
  )
  return (
    <>
      {transformedSectionData.map((section, idx) => (
        <StyledTable key={`${section.id}_${idx}`}>
          <StyledTHead>
            <tr>
              <StyledTH colSpan={2}> {section.title}</StyledTH>
            </tr>
          </StyledTHead>
          <tbody>
            {section.items.map((item, itemIdx) => (
              <tr key={`${item.label}_${itemIdx}`}>
                <StyledTD>{item.label}</StyledTD>
                <StyledTD>{item.value}</StyledTD>
              </tr>
            ))}
          </tbody>
        </StyledTable>
      ))}
    </>
  )
}
