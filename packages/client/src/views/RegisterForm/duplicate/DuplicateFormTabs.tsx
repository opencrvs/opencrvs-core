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
import * as React from 'react'
import styled from '@client/styledComponents'
import { FormTabs, IFormTabs } from '@opencrvs/components/lib/FormTabs'
import { IDeclaration } from '@client/declarations'
import { EMPTY_STRING } from '@client/utils/constants'
import { Icon } from '@opencrvs/components/lib/Icon/Icon'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { ViewRecordQueries } from '@client/views/ViewRecord/query'
import {
  IForm,
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IPreviewGroup,
  REVIEW_OVERRIDE_POSITION
} from '@client/forms'
import { useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { gqlToDraftTransformer } from '@client/transformer'
import { Event } from '@client/utils/gateway'
import { MessageDescriptor, useIntl } from 'react-intl'
import { getLanguage } from '@client/i18n/selectors'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import {
  getErrorsOnFieldsBySection,
  IErrorsBySection,
  RequiredField
} from '@client/views/RegisterForm/review/ReviewSection'
import { get } from 'lodash'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import {
  getOverriddenFieldsListForPreview,
  isViewOnly,
  isVisibleField,
  renderValue
} from '@client/views/CorrectionForm/utils'
import { IValidationResult } from '@client/utils/validate'
import { IFieldErrors } from '@client/forms/validation'

const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 56px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  top: 56px;
  width: 100%;
  position: sticky;
  z-index: 1;
`

interface IProps {
  declaration: IDeclaration
}

export const DuplicateFormTabs = (props: IProps) => {
  const [selectedDuplicateComId, setSelectedDuplicateComId] = React.useState(
    props.declaration.id
  )
  const form = useSelector(getReviewForm)
  const userDetails = useSelector(getUserDetails)
  const language = useSelector(getLanguage)
  const offlineData = useSelector(getOfflineData)
  const registerForm = useSelector(getRegisterForm)
  const intl = useIntl()

  const getFieldValueWithErrorMessage = (
    section: IFormSection,
    field: IFormField,
    errorsOnField: any
  ) => {
    return (
      <RequiredField id={`required_label_${section.id}_${field.name}`}>
        {field.ignoreFieldLabelOnErrorMessage ||
          (field.previewGroup && intl.formatMessage(field.label) + ' ')}
        {intl.formatMessage(errorsOnField.message, errorsOnField.props)}
      </RequiredField>
    )
  }

  const getErrorForNestedField = (
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ): IValidationResult[] => {
    for (const key in sectionErrors[section.id]) {
      return sectionErrors[section.id][key].nestedFields[field.name] || []
    }
    return []
  }

  const getValueOrError = (
    section: IFormSection,
    data: IFormData,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean,
    replaceEmpty?: boolean
  ) => {
    let value = renderValue(
      data,
      section.id,
      field,
      intl,
      offlineData,
      language
    )

    if (replaceEmpty && !value) {
      value = '-'
    }
    const errorsOnField =
      get(sectionErrors[section.id][field.name], 'errors') ||
      getErrorForNestedField(section, field, sectionErrors)

    return errorsOnField.length > 0
      ? getFieldValueWithErrorMessage(section, field, errorsOnField[0])
      : field.nestedFields && !Boolean(ignoreNestedFieldWrapping)
      ? (
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
                intl,
                offlineData,
                language
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
      : value
  }

  const fieldHasErrors = (
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) => {
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

  const getRenderableField = (
    fieldLabel: MessageDescriptor,
    value: IFormFieldValue | JSX.Element | undefined
  ) => {
    return {
      label: intl.formatMessage(fieldLabel),
      value
    }
  }

  const getSinglePreviewField = (
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean
  ) => {
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

    return getRenderableField(field.label, value)
  }

  const getPreviewGroupsField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    errorsOnFields: IErrorsBySection
  ) => {
    const draft = props.declaration

    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (
          isVisibleField(field, section, props.declaration, offlineData) &&
          !isViewOnly(field)
        ) {
          if (field.previewGroup === baseTag) {
            taggedFields.push(field)
          }
          for (const index in field.nestedFields) {
            field.nestedFields[index].forEach((tempField) => {
              if (
                isVisibleField(
                  tempField,
                  section,
                  props.declaration,
                  offlineData
                ) &&
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

      const draftOriginalData = draft.originalData
      if (draftOriginalData && !hasErrors) {
        const previousValues = taggedFields
          .map((field, index) =>
            getValueOrError(
              section,
              draftOriginalData,
              field,
              errorsOnFields,
              undefined,
              !index
            )
          )
          .filter((value) => value)
      }

      return getRenderableField(
        (tagDef[0] && tagDef[0].label) || field.label,
        completeValue
      )
    }
  }

  const getNestedFieldValueOrError = (
    section: IFormSection,
    nestSectionData: IFormData,
    nestedField: IFormField,
    parentFieldErrors: IFieldErrors
  ) => {
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
              intl,
              offlineData,
              language
            )}
      </>
    )
  }

  const getNestedPreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    sectionErrors: IErrorsBySection
  ) => {
    const draft = props.declaration
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    nestedItems.push(getSinglePreviewField(section, field, sectionErrors, true))
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
            sectionErrors
          )
        )
      } else {
        nestedItems.push(
          getRenderableField(
            nestedField.label,
            getNestedFieldValueOrError(
              section,
              draft.data[section.id][field.name] as IFormData,
              nestedField,
              sectionErrors[section.id][field.name]
            )
          )
        )
      }
    })
    return nestedItems
  }

  const getOverRiddenPreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    overriddenField: IFormField,
    sectionErrors: IErrorsBySection,
    field: IFormField,
    items: any[],
    item: any
  ) => {
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
    errorsOnFields: IErrorsBySection
  ) => {
    const draft = props.declaration
    const overriddenFields = getOverriddenFieldsListForPreview(
      formSections,
      props.declaration,
      offlineData
    )
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
            (field) =>
              isVisibleField(field, section, props.declaration, offlineData) &&
              !isViewOnly(field)
          )
          .filter((field) => !Boolean(field.hideInPreview))
          .filter((field) => !Boolean(field.reviewOverrides))
          .forEach((field) => {
            tempItem = field.previewGroup
              ? getPreviewGroupsField(
                  section,
                  group,
                  field,
                  visitedTags,
                  errorsOnFields
                )
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? getNestedPreviewField(section, group, field, errorsOnFields)
              : getSinglePreviewField(section, field, errorsOnFields)

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
        title: intl.formatMessage(section.title),
        items: items.filter((item) => item)
      }
    })
  }

  const getVisibleSections = (formSections: IFormSection[]) => {
    const draft = props.declaration
    return formSections.filter(
      (section) =>
        getVisibleSectionGroupsBasedOnConditions(
          section,
          draft.data[section.id] || {},
          draft.data
        ).length > 0
    )
  }

  const getViewableSection = (registerForm: IForm): IFormSection[] => {
    const sections = registerForm.sections.filter(
      ({ id, viewType }) =>
        id !== 'documents' && (viewType === 'form' || viewType === 'hidden')
    )

    return getVisibleSections(sections)
  }

  const fetchDuplicateDeclaration = async (duplicateCompositionId: string) => {
    return await ViewRecordQueries.fetchDeclarationForViewing(
      duplicateCompositionId
    )
  }

  const tabs: IFormTabs[] =
    props.declaration.duplicates?.map((duplicateId) => {
      return {
        id: duplicateId.compositionId,
        title: duplicateId.trackingId,
        disabled: false
      }
    }) ?? []

  tabs.unshift({
    id: props.declaration.id,
    title: (props.declaration.data.registration.trackingId as string) || '',
    disabled: false,
    icon: <Icon name={'AlertCircle'} color={'red'} size={'medium'} />,
    color: 'red'
  })

  const duplicateTabHandler = async (duplicateCompositionId: string) => {
    setSelectedDuplicateComId(duplicateCompositionId)
    const duplicateDeclarationData = await fetchDuplicateDeclaration(
      duplicateCompositionId
    )
    const eventData =
      duplicateDeclarationData?.data?.fetchRegistrationForViewing
    const eventType =
      duplicateDeclarationData?.data?.fetchRegistrationForViewing?.registration.type.toLowerCase() as Event

    const transDuplicateDeclarationData: IFormData = gqlToDraftTransformer(
      form[eventType],
      eventData,
      offlineData,
      userDetails!
    )

    const formSections = getViewableSection(registerForm[eventType])

    const errorsOnFields = getErrorsOnFieldsBySection(
      formSections,
      offlineData,
      duplicateDeclarationData
    )

    console.log('originalDeclarationData', props.declaration)
    console.log('transData', transDuplicateDeclarationData)
    console.log(transformSectionData(formSections, errorsOnFields))
  }

  return (
    <TopBar>
      <FormTabs
        sections={tabs}
        activeTabId={selectedDuplicateComId || EMPTY_STRING}
        onTabClick={async (id: string) => await duplicateTabHandler(id)}
      />
    </TopBar>
  )
}
