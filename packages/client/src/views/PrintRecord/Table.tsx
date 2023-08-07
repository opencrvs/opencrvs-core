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
import { IDeclaration } from '@client/declarations'
import {
  IFormSection,
  IFormField,
  FETCH_BUTTON,
  PARAGRAPH,
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
  ISelectOption,
  DOCUMENT_UPLOADER_WITH_OPTION,
  IAttachment,
  IDocumentUploaderWithOptionsFormField,
  SUBSECTION_HEADER,
  BULLET_LIST
} from '@client/forms'
import {
  getConditionalActionsForField,
  getListOfLocations,
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
import { formatLongDate } from '@client/utils/date-formatting'
import { generateLocations } from '@client/utils/locationUtils'
import {
  formatLocationName,
  formatMessage,
  getLocationHierarchy
} from './utils'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import styled from 'styled-components'
import {
  buttonMessages,
  constantsMessages,
  formMessageDescriptors,
  userMessages
} from '@client/i18n/messages'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import { getViewableSection } from '@client/views/CorrectionForm/utils'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { messages as reviewMessages } from '@client/i18n/messages/views/review'
import { Checkbox, Stack } from '@opencrvs/components/lib'
import { printRecordMessages } from '@client/i18n/messages/views/printRecord'
import { Event, History } from '@client/utils/gateway'
import { DECLARED, VALIDATED } from '@client/utils/constants'
import { createNamesMap } from '@client/utils/data-formatting'

interface PrintRecordTableProps {
  declaration: IDeclaration
  intls: IntlShape[]
}

const StyledTable = styled.table`
  margin-top: 8px;
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
  border-radius: 4px;
  border: 0.5px solid ${({ theme }) => theme.colors.grey500};
  overflow: hidden;
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
  border-bottom: 0.5px solid ${({ theme }) => theme.colors.grey500};
`

const StyledTR = styled.tr`
  :not(:last-child) > td {
    border-bottom: 0.5px solid ${({ theme }) => theme.colors.grey500};
  }
`
const StyledTD = styled.td`
  padding: 4px 8px;
  vertical-align: top;
  :not(:last-child) {
    border-right: 0.5px solid ${({ theme }) => theme.colors.grey500};
  }
`

const DocumentsTD = styled.td`
  vertical-align: top;
  padding: 0 8px;
`
const DocumentTypeBox = styled.div`
  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.colors.grey500};
  padding: 2px 4px;
  margin-left: 39px;
  :not(:first-child) {
    margin-top: 8px;
  }
  ${({ theme }) => theme.fonts.reg14}
`
const SignatureBox = styled.div`
  margin-top: 8px;
  height: 66px;
  display: flex;
  width: 100%;
  border-radius: 4px;
  border-top: 1px solid ${({ theme }) => theme.colors.grey500};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey500};
  ${({ theme }) => theme.fonts.bold14}
  padding: 4px 8px;
`

const WarningText = styled.p`
  width: 100%;
  margin-top: 64px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.negative};
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.bold14}
  /* stylelint-disable-next-line opencrvs/no-font-styles */
  line-height: 0.1em;
  text-transform: uppercase;

  span {
    background: ${({ theme }) => theme.colors.white};
    padding: 0 16px;
  }
`
const StyledEM = styled.em`
  ${({ theme }) => theme.fonts.reg14}
`
const StyledStack = styled(Stack)`
  flex: 1;
`

function renderSelectOrRadioLabel(
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

export function PrintRecordTable(props: PrintRecordTableProps) {
  const offlineCountryConfiguration = useSelector(getOfflineData)
  const intl = useIntl()
  const registerForm = useSelector(getRegisterForm)
  function getLabelForDoc(
    docFieldsWithOptions: IDocumentUploaderWithOptionsFormField[],
    docForWhom: string,
    docType: string
  ) {
    const { intls } = props
    const matchedField = docFieldsWithOptions?.find(
      (field) => field.extraValue === docForWhom
    )
    const matchedOption = matchedField?.options.find(
      (option) => option.value === docType
    )
    return (
      matchedField && matchedOption && formatMessage(intls, matchedOption.label)
    )
  }

  function getRenderableField(
    _section: IFormSection,
    _group: IFormSectionGroup,
    fieldLabel: MessageDescriptor,
    _fieldName: string,
    value: IFormFieldValue | JSX.Element | undefined,
    _ignoreAction = false
  ) {
    const { intls } = props

    return {
      label: formatMessage(intls, fieldLabel),
      value
    }
  }

  function getNestedFieldValue(
    nestSectionData: IFormData,
    nestedField: IFormField
  ) {
    const { intls } = props

    return (
      <>
        {renderValue(
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
    visitedTags: string[]
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
        .map((field) => getValue(section, draft.data, field))
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

      completeValue = <>{completeValue}</>

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

  function getValue(
    section: IFormSection,
    data: IFormData,
    field: IFormField,
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

    return <>{value}</>
  }
  function getSinglePreviewField(
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField
  ) {
    const {
      declaration: { data }
    } = props

    const value = getValue(section, data, field)

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
    field: IFormField
  ) {
    const { declaration: draft } = props
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    nestedItems.push(getSinglePreviewField(section, group, field))
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
          getPreviewGroupsField(section, group, nestedField, visitedTags)
        )
      } else {
        nestedItems.push(
          getRenderableField(
            section,
            group,
            nestedField.label,
            nestedField.name,
            getNestedFieldValue(
              draft.data[section.id][field.name] as IFormData,
              nestedField
            ),
            nestedField.readonly
          )
        )
      }
    })
    return nestedItems
  }
  function isViewOnly(field: IFormField) {
    return [
      BULLET_LIST,
      PARAGRAPH,
      WARNING,
      SUBSECTION_HEADER,
      FETCH_BUTTON
    ].find((type) => type === field.type)
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
      overriddenField
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
              ? getPreviewGroupsField(section, group, field, visitedTags)
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? getNestedPreviewField(section, group, field)
              : getSinglePreviewField(section, group, field)
            if (fieldDisabled.includes('disable') && tempItem?.action) {
              tempItem.action.disabled = true
            }
            overriddenFields.forEach((overriddenField) => {
              items = getOverRiddenPreviewField(
                section,
                group,
                overriddenField as IFormField,
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
        title: section.title && formatMessage(intls, section.title),
        items: items.filter((item) => item)
      }
    })
  }

  const formSections = getViewableSection(
    registerForm[props.declaration.event],
    props.declaration
  )
  const transformedSectionData = transformSectionData(
    formSections,
    offlineCountryConfiguration
  )
  function renderSignatureBox() {
    if (props.declaration.event === Event.Marriage) {
      return (
        <StyledStack>
          <StyledStack direction="column">
            <SignatureBox>
              {formatMessage(props.intls, reviewMessages.groomSignature)}
            </SignatureBox>
            <SignatureBox>
              {formatMessage(props.intls, reviewMessages.witnessOneSignature)}
            </SignatureBox>
          </StyledStack>
          <StyledStack direction="column">
            <SignatureBox>
              {formatMessage(props.intls, reviewMessages.brideSignature)}
            </SignatureBox>
            <SignatureBox>
              {formatMessage(props.intls, reviewMessages.witnessTwoSignature)}
            </SignatureBox>
          </StyledStack>
        </StyledStack>
      )
    } else {
      return (
        <SignatureBox>
          {formatMessage(props.intls, reviewMessages.informantsSignature)}
        </SignatureBox>
      )
    }
  }
  function renderDocumentBox(field: IDocumentUploaderWithOptionsFormField) {
    const documents = props.declaration.data?.documents?.[
      field.name
    ] as IAttachment[]
    return (
      <div>
        <Checkbox
          name={field.name}
          value="true"
          selected={Boolean(documents.length)}
          disabled
          label={formatMessage(props.intls, field.label)}
        ></Checkbox>
        {documents.length > 0 &&
          documents.map((doc, i) => (
            <DocumentTypeBox key={`${doc.title}_${i}`}>
              {getLabelForDoc(
                documentSectionFields,
                doc.optionValues[0],
                doc.optionValues[1]
              )}
            </DocumentTypeBox>
          ))}
      </div>
    )
  }
  const documentSection = registerForm[props.declaration.event].sections.find(
    ({ id }) => id === 'documents'
  )
  const documentSectionFields = (documentSection?.groups[0].fields.filter(
    (field) => field.type === DOCUMENT_UPLOADER_WITH_OPTION
  ) || []) as IDocumentUploaderWithOptionsFormField[]
  const leftColumnSize = Math.ceil(documentSectionFields.length / 2)
  const declarationAciton = (
    props.declaration.data.history as unknown as History[]
  )
    ?.reverse()
    ?.find(
      (history) =>
        history.regStatus && [DECLARED, VALIDATED].includes(history.regStatus)
    )

  return (
    <div>
      {transformedSectionData
        .filter(({ id }) => id !== 'informant')
        .map((section, idx) => (
          <StyledTable key={`${section.id}_${idx}`}>
            <StyledTHead>
              <tr>
                <StyledTH colSpan={2}>{section.title}</StyledTH>
              </tr>
            </StyledTHead>
            <tbody>
              {section.items.map((item, itemIdx) => (
                <StyledTR key={`${item.label}_${itemIdx}`}>
                  <StyledTD>{item.label}</StyledTD>
                  <StyledTD>{item.value}</StyledTD>
                </StyledTR>
              ))}
            </tbody>
          </StyledTable>
        ))}
      {documentSection && (
        <StyledTable>
          <StyledTHead>
            <tr>
              <StyledTH colSpan={2}>
                {formatMessage(props.intls, reviewMessages.documentViewerTitle)}
              </StyledTH>
            </tr>
          </StyledTHead>
          <tbody>
            {documentSectionFields
              .slice(0, leftColumnSize)
              .map((leftColumnField, index) => {
                const rightColumnField =
                  documentSectionFields[index + leftColumnSize]
                return (
                  <tr key={leftColumnField.name}>
                    <DocumentsTD>
                      {renderDocumentBox(leftColumnField)}
                    </DocumentsTD>
                    <DocumentsTD>
                      {rightColumnField && renderDocumentBox(rightColumnField)}
                    </DocumentsTD>
                  </tr>
                )
              })}
          </tbody>
        </StyledTable>
      )}
      {transformedSectionData
        .filter(({ id }) => id === 'informant')
        .map((section, idx) => (
          <StyledTable key={`${section.id}_${idx}`}>
            <StyledTHead>
              <tr>
                <StyledTH colSpan={2}>{section.title}</StyledTH>
              </tr>
            </StyledTHead>
            <tbody>
              {props.declaration.event !== Event.Marriage && (
                <StyledTR>
                  <StyledTD colSpan={2}>
                    <StyledEM>
                      {formatMessage(
                        props.intls,
                        reviewMessages.signatureDescription
                      )}
                    </StyledEM>
                  </StyledTD>
                </StyledTR>
              )}
              {section.items.map((item, itemIdx) => (
                <StyledTR key={`${item.label}_${itemIdx}`}>
                  <StyledTD>{item.label}</StyledTD>
                  <StyledTD>{item.value}</StyledTD>
                </StyledTR>
              ))}
              {props.declaration.event === Event.Marriage && (
                <StyledTR>
                  <StyledTD colSpan={2}>
                    <StyledEM>
                      {formatMessage(
                        props.intls,
                        reviewMessages.signatureDescription
                      )}
                    </StyledEM>
                  </StyledTD>
                </StyledTR>
              )}
            </tbody>
          </StyledTable>
        ))}
      {renderSignatureBox()}
      <WarningText>
        <span>
          {formatMessage(
            props.intls,
            printRecordMessages.warningDeclarationDetails
          )}
        </span>
      </WarningText>
      <StyledTable>
        <StyledTHead>
          <tr>
            <StyledTH colSpan={2}>
              {formatMessage(props.intls, {
                id: 'form.field.label.informantTitle',
                defaultMessage: "Informant's details"
              })}
            </StyledTH>
          </tr>
        </StyledTHead>
        <tbody>
          <StyledTR>
            <StyledTD colSpan={2}>
              <StyledEM>
                {formatMessage(
                  props.intls,
                  printRecordMessages.informantAttestation,
                  { eventType: props.declaration.event }
                )}
              </StyledEM>
            </StyledTD>
          </StyledTR>
          <StyledTR>
            <StyledTD>
              {formatMessage(
                props.intls,
                printRecordMessages.placeOfDeclaration
              )}
            </StyledTD>
            <StyledTD>
              {declarationAciton?.location?.id &&
                getLocationHierarchy(
                  declarationAciton.location.id,
                  offlineCountryConfiguration
                ).map((loc) => (
                  <span key={loc.id}>
                    {formatLocationName(loc)}
                    <br></br>
                  </span>
                ))}
            </StyledTD>
          </StyledTR>
          <StyledTR>
            <StyledTD>
              {formatMessage(
                props.intls,
                printRecordMessages.civilRegistrationOffice
              )}
            </StyledTD>
            <StyledTD>
              {declarationAciton?.office &&
                formatLocationName(
                  declarationAciton?.office as unknown as ILocation
                )}
            </StyledTD>
          </StyledTR>
          <StyledTR>
            <StyledTD>
              {formatMessage(props.intls, constantsMessages.dateOfDeclaration)}
            </StyledTD>
            <StyledTD>
              {declarationAciton && formatLongDate(declarationAciton.date)}
            </StyledTD>
          </StyledTR>
          <StyledTR>
            <StyledTD>
              {formatMessage(
                [props.intls[0]],
                userMessages['REGISTRATION_AGENT']
              )}
            </StyledTD>
            <StyledTD>
              {declarationAciton?.user?.name &&
                createNamesMap(declarationAciton.user.name)[intl.locale]}
            </StyledTD>
          </StyledTR>
        </tbody>
      </StyledTable>
      <SignatureBox>
        {formatMessage(props.intls, userFormMessages.userAttachmentSection)}
      </SignatureBox>
    </div>
  )
}
