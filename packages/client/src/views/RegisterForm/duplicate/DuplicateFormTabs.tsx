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
import { Event, HumanName, RegStatus, History } from '@client/utils/gateway'
import { MessageDescriptor, useIntl } from 'react-intl'
import { getLanguage } from '@client/i18n/selectors'
import { getRegisterForm } from '@client/forms/register/declaration-selectors'
import { FormTabs, IFormTabs } from '@opencrvs/components/lib/FormTabs'
import { IDeclaration } from '@client/declarations'
import { EMPTY_STRING } from '@client/utils/constants'
import { Icon } from '@opencrvs/components/lib/Icon/Icon'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getReviewForm } from '@client/forms/register/review-selectors'
import { ViewRecordQueries } from '@client/views/ViewRecord/query'
import {
  getErrorsOnFieldsBySection,
  IErrorsBySection,
  RequiredField
} from '@client/views/RegisterForm/review/ReviewSection'
import { getVisibleSectionGroupsBasedOnConditions } from '@client/forms/utils'
import {
  getOverriddenFieldsListForPreview,
  isViewOnly,
  isVisibleField,
  renderValue
} from '@client/views/CorrectionForm/utils'
import {
  FullBodyContent,
  Content,
  ContentSize
} from '@opencrvs/components/lib/Content'
import {
  recordAuditMessages,
  regStatusMessages
} from '@client/i18n/messages/views/recordAudit'
import styled from 'styled-components'
import { get } from 'lodash'
import { IValidationResult } from '@client/utils/validate'
import { IFieldErrors } from '@client/forms/validation'
import { ComparisonListView } from '@opencrvs/components/lib/ComparisonListView'
import { Text } from '@opencrvs/components/lib/Text'
import { duplicateMessages } from '@client/i18n/messages/views/duplicates'
import { getName, capitalize } from '@client/views/RecordAudit/utils'
import { Stack } from '@opencrvs/components/lib/Stack'
import { constantsMessages } from '@client/i18n/messages/constants'
import { SupportingDocumentsView } from '@client/views/RegisterForm/duplicate/SupportingDocumentsView'

const TopBar = styled.div`
  padding: 0 ${({ theme }) => theme.grid.margin}px;
  height: 56px;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  top: 0;
  width: 100%;
  position: sticky;
  z-index: 1;
`
const SupportingDocumentWrapper = styled(Stack)`
  position: sticky;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

interface IProps {
  declaration: IDeclaration
  selectedDuplicateComId: string
  onTabClick: (id: string) => void
}

interface IComparisonDeclaration {
  title: React.ReactNode | string
  data: {
    label: React.ReactNode
    heading: {
      right: string
      left: string
    }
    rightValue: React.ReactNode
    leftValue: React.ReactNode
  }[]
}

export const getVisibleSections = (
  formSections: IFormSection[],
  declaration: IDeclaration
) => {
  const draft = declaration
  return formSections.filter(
    (section) =>
      getVisibleSectionGroupsBasedOnConditions(
        section,
        draft.data[section.id] || {},
        draft.data
      ).length > 0
  )
}

const getViewableSection = (
  registerForm: IForm,
  declaration: IDeclaration
): IFormSection[] => {
  const sections = registerForm.sections.filter(
    ({ id, viewType }) =>
      id !== 'documents' && (viewType === 'form' || viewType === 'hidden')
  )

  return getVisibleSections(sections, declaration)
}

export const DuplicateFormTabs = (props: IProps) => {
  const { selectedDuplicateComId, onTabClick } = props
  const [comparisonDelcarationData, setComparisonDelcarationData] =
    React.useState<IComparisonDeclaration[] | undefined>(undefined)

  const [duplicateDeclarationData, setDuplicateDeclarationData] =
    React.useState<IDeclaration | undefined>(undefined)
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
    declaration: IDeclaration,
    section: IFormSection,
    field: IFormField,
    sectionErrors: IErrorsBySection,
    ignoreNestedFieldWrapping?: boolean
  ) => {
    const { data } = declaration

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
    errorsOnFields: IErrorsBySection,
    declaration: IDeclaration
  ) => {
    const draft = declaration

    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (
          isVisibleField(field, section, declaration, offlineData) &&
          !isViewOnly(field)
        ) {
          if (field.previewGroup === baseTag) {
            taggedFields.push(field)
          }
          for (const index in field.nestedFields) {
            field.nestedFields[index].forEach((tempField) => {
              if (
                isVisibleField(tempField, section, declaration, offlineData) &&
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
    sectionErrors: IErrorsBySection,
    declaration: IDeclaration
  ) => {
    const draft = declaration
    const visitedTags: string[] = []
    const nestedItems: any[] = []
    // parent field
    nestedItems.push(
      getSinglePreviewField(declaration, section, field, sectionErrors, true)
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
            declaration
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
    declaration: IDeclaration,
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
      declaration,
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
    errorsOnFields: IErrorsBySection,
    declaration: IDeclaration
  ) => {
    const draft = declaration
    const overriddenFields = getOverriddenFieldsListForPreview(
      formSections,
      declaration,
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
              isVisibleField(field, section, declaration, offlineData) &&
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
                  errorsOnFields,
                  declaration
                )
              : field.nestedFields && field.ignoreNestedFieldWrappingInPreview
              ? getNestedPreviewField(
                  section,
                  group,
                  field,
                  errorsOnFields,
                  declaration
                )
              : getSinglePreviewField(draft, section, field, errorsOnFields)

            overriddenFields.forEach((overriddenField) => {
              items = getOverRiddenPreviewField(
                draft,
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
        title: section.title ? intl.formatMessage(section.title) : '',
        items: items.filter((item) => item)
      }
    })
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
    icon: <Icon name="WarningCircle" color="red" size="medium" />,
    color: 'red'
  })

  const actualTrackingId = tabs[0].title
  const duplicateTrackingId = tabs.find(
    (tab) => tab.id === selectedDuplicateComId
  )?.title as string

  const duplicateTabHandler = async (duplicateCompositionId: string) => {
    if (String(props.declaration.id) !== duplicateCompositionId) {
      const duplicateDeclarationGQLData = await fetchDuplicateDeclaration(
        duplicateCompositionId
      )
      const eventData =
        duplicateDeclarationGQLData?.data?.fetchRegistrationForViewing
      const eventType =
        duplicateDeclarationGQLData?.data?.fetchRegistrationForViewing?.registration.type.toLowerCase() as Event
      const duplicateDeclarationData = gqlToDraftTransformer(
        form[eventType],
        eventData,
        offlineData,
        userDetails!
      )
      setDuplicateDeclarationData({
        data: duplicateDeclarationData
      } as IDeclaration)

      const actualDeclarationFormSections = getViewableSection(
        registerForm[eventType],
        props.declaration
      )
      const actualDeclarationerrorsOnFields = getErrorsOnFieldsBySection(
        actualDeclarationFormSections,
        offlineData,
        props.declaration
      )
      const actualDeclarationTransformData = transformSectionData(
        actualDeclarationFormSections,
        actualDeclarationerrorsOnFields,
        props.declaration
      )

      const duplicateDeclarationFormSections = getViewableSection(
        registerForm[eventType],
        { data: duplicateDeclarationData } as IDeclaration
      )
      const duplicateDeclarationerrorsOnFields = getErrorsOnFieldsBySection(
        duplicateDeclarationFormSections,
        offlineData,
        { data: duplicateDeclarationData } as IDeclaration
      )
      const duplicateDeclarationTransformData = transformSectionData(
        duplicateDeclarationFormSections,
        duplicateDeclarationerrorsOnFields,
        { data: duplicateDeclarationData } as IDeclaration
      )

      const duplicateRegData = {
        status: eventData.history.find((data: History) => data.action === null)
          .regStatus as RegStatus,
        type: capitalize(eventData.registration.type),
        trackingId: eventData.registration.trackingId,
        registrationNumber: eventData.registration?.registrationNumber,
        registeredAt: (eventData.history as History[]).find(
          (data) =>
            data.action === null && data.regStatus === RegStatus.Registered
        )?.office?.name,
        registeredBy: getName(
          (eventData.history as History[]).find(
            (data) =>
              data.action === null && data.regStatus === RegStatus.Registered
          )?.user?.name as HumanName[],
          language
        )
      }

      const actualRegData = {
        status: (props.declaration.data.history as unknown as History[]).find(
          (data) => data.action === null
        )?.regStatus,
        type: capitalize(String(props.declaration.data.registration.type)),
        trackingId: props.declaration.data.registration.trackingId,
        registrationNumber:
          props.declaration.data.registration?.registrationNumber,
        registeredAt: (
          props.declaration.data.history as unknown as History[]
        ).find((data) => data.action === null)?.office?.name,
        registeredBy: getName(
          (props.declaration.data.history as unknown as History[]).find(
            (data) => data.action === null
          )?.user?.name as HumanName[],
          language
        )
      }

      const registrationComparisonData = [
        {
          label: (
            <Text variant="bold16" element="span" color="grey600">
              {intl.formatMessage(constantsMessages.status)}
            </Text>
          ),
          heading: {
            right: String(duplicateRegData.trackingId),
            left: String(actualRegData.trackingId)
          },
          leftValue: (
            <Text variant="reg16" element="span" color="grey600">
              {actualRegData.status
                ? intl.formatMessage(regStatusMessages[actualRegData.status])
                : EMPTY_STRING}
            </Text>
          ),
          rightValue: (
            <Text variant="reg16" element="span" color="grey600">
              {duplicateRegData.status
                ? intl.formatMessage(regStatusMessages[duplicateRegData.status])
                : EMPTY_STRING}
            </Text>
          )
        },
        {
          label: (
            <Text variant="bold16" element="span" color="grey600">
              {intl.formatMessage(constantsMessages.eventType)}
            </Text>
          ),
          heading: {
            right: String(duplicateRegData.trackingId),
            left: String(actualRegData.trackingId)
          },
          leftValue: (
            <Text variant="reg16" element="span" color="grey600">
              {actualRegData.type}
            </Text>
          ),
          rightValue: (
            <Text variant="reg16" element="span" color="grey600">
              {duplicateRegData.type}
            </Text>
          )
        },
        {
          label: (
            <Text variant="bold16" element="span" color="grey600">
              {intl.formatMessage(constantsMessages.trackingId)}
            </Text>
          ),
          heading: {
            right: String(duplicateRegData.trackingId),
            left: String(actualRegData.trackingId)
          },
          leftValue: (
            <Text variant="reg16" element="span" color="grey600">
              {actualRegData.trackingId as string}
            </Text>
          ),
          rightValue: (
            <Text variant="reg16" element="span" color="grey600">
              {duplicateRegData.trackingId}
            </Text>
          )
        },
        {
          label: (
            <Text variant="bold16" element="span" color="grey600">
              {intl.formatMessage(
                duplicateRegData.type.toLowerCase() === Event.Birth
                  ? recordAuditMessages.brn
                  : recordAuditMessages.drn
              )}
            </Text>
          ),
          heading: {
            right: String(duplicateRegData.trackingId),
            left: String(actualRegData.trackingId)
          },
          leftValue: (
            <Text variant="reg16" element="span" color="grey600">
              {actualRegData.registrationNumber as string}
            </Text>
          ),
          rightValue: (
            <Text variant="reg16" element="span" color="grey600">
              {duplicateRegData.registrationNumber}
            </Text>
          )
        },
        {
          label: (
            <Text variant="bold16" element="span" color="grey600">
              {intl.formatMessage(constantsMessages.registeredAt)}
            </Text>
          ),
          heading: {
            right: String(duplicateRegData.trackingId),
            left: String(actualRegData.trackingId)
          },
          leftValue: (
            <Text variant="reg16" element="span" color="grey600">
              {actualRegData.registeredAt}
            </Text>
          ),
          rightValue: (
            <Text variant="reg16" element="span" color="grey600">
              {duplicateRegData.registeredAt}
            </Text>
          )
        },
        {
          label: (
            <Text variant="bold16" element="span" color="grey600">
              {intl.formatMessage(constantsMessages.registeredBy)}
            </Text>
          ),
          heading: {
            right: String(duplicateRegData.trackingId),
            left: String(actualRegData.trackingId)
          },
          leftValue: (
            <Text variant="reg16" element="span" color="grey600">
              {actualRegData.registeredBy}
            </Text>
          ),
          rightValue: (
            <Text variant="reg16" element="span" color="grey600">
              {duplicateRegData.registeredBy}
            </Text>
          )
        }
      ]
      const formatterComparisonData = actualDeclarationTransformData.map(
        (data1) => {
          const data2 = duplicateDeclarationTransformData.find(
            (d) => d.id === data1.id
          )
          return {
            title: data1.title,
            data: data1.items.map((item1) => {
              const item2 = data2?.items.find((i) => i.label === item1.label)
              return {
                label: (
                  <Text variant="bold16" element="span" color="grey600">
                    {item1.label}
                  </Text>
                ),
                heading: {
                  right: String(duplicateRegData.trackingId),
                  left: String(actualRegData.trackingId)
                },
                leftValue: (
                  <Text variant="reg16" element="span" color="grey600">
                    {item1.value}
                  </Text>
                ),
                rightValue: (
                  <Text variant="reg16" element="span" color="grey600">
                    {item2?.value}
                  </Text>
                )
              }
            })
          }
        }
      )
      formatterComparisonData[0].data.push(...registrationComparisonData)
      setComparisonDelcarationData(formatterComparisonData)
    } else {
      setComparisonDelcarationData(undefined)
    }
    onTabClick(duplicateCompositionId)
  }

  return (
    <>
      <TopBar>
        <FormTabs
          sections={tabs}
          activeTabId={selectedDuplicateComId || EMPTY_STRING}
          onTabClick={async (id: string) => await duplicateTabHandler(id)}
        />
      </TopBar>

      {comparisonDelcarationData && (
        <FullBodyContent>
          <Content
            title={intl.formatMessage(
              duplicateMessages.duplicateComparePageTitle,
              {
                actualTrackingId: (
                  <Text variant="bold18" element="span" color="negative">
                    {actualTrackingId}
                  </Text>
                ),
                duplicateTrackingId
              }
            )}
            size={ContentSize.LARGE}
            showTitleOnMobile
          >
            <Stack direction="column" gap={20} alignItems={'stretch'}>
              {comparisonDelcarationData.map((sections, index) => {
                return (
                  <div key={`comparison-div-${index}`}>
                    <Text variant="bold18" element="span" color="grey600">
                      {sections.title}
                    </Text>
                    <ComparisonListView
                      headings={[actualTrackingId, duplicateTrackingId]}
                      key={`comparison-${index}`}
                    >
                      {sections.data.map((item, index) => (
                        <ComparisonListView.Row
                          label={item.label}
                          heading={{
                            right: item.heading.right,
                            left: item.heading.left
                          }}
                          leftValue={item.leftValue}
                          rightValue={item.rightValue}
                          key={`row-${index}`}
                        />
                      ))}
                    </ComparisonListView>
                  </div>
                )
              })}
            </Stack>
          </Content>

          <Content
            title={intl.formatMessage(
              duplicateMessages.duplicateComparePageSupportingDocuments
            )}
            size={ContentSize.LARGE}
            showTitleOnMobile
          >
            <SupportingDocumentWrapper
              justifyContent={'space-between'}
              gap={25}
            >
              <div style={{ flex: 1 }}>
                <Text variant="bold14" element="p" color="redDark">
                  {actualTrackingId}
                </Text>
                <SupportingDocumentsView declaration={props.declaration} />
              </div>
              <div style={{ flex: 1 }}>
                <Text variant="bold14" element="p" color="grey400">
                  {duplicateTrackingId}
                </Text>
                <SupportingDocumentsView
                  declaration={duplicateDeclarationData as IDeclaration}
                />
              </div>
            </SupportingDocumentWrapper>
          </Content>
        </FullBodyContent>
      )}
    </>
  )
}
