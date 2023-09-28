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
import styled from 'styled-components'

import { IntlShape, useIntl } from 'react-intl'
import {
  Redirect,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch
} from 'react-router'
import { useRecord } from '@client/hooks/useRecord'
import { formatUrl } from '@client/navigation'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

import { RegisterForm } from '@client/views/RegisterForm/RegisterForm'
import { useSelector } from 'react-redux'
import { CorrectionInput, History } from '@client/utils/gateway'
import { getEventReviewForm } from '@client/forms/register/review-selectors'
import { IStoreState } from '@client/store'

import { merge } from 'lodash'
import { IDeclaration } from '@client/declarations'
import {
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSection,
  IFormSectionData,
  IFormSectionGroup,
  IPreviewGroup
} from '@client/forms'
import { Button } from '@opencrvs/components/src/Button'
import { ReviewSectionCorrection } from '@opencrvs/client/src/views/RegisterForm/review/ReviewSectionCorrection'
import { ReviewHeader } from '@opencrvs/client/src/views/RegisterForm/review/ReviewHeader'
import { Icon } from '@opencrvs/components/lib/Icon'
import { buttonMessages } from '@client/i18n/messages'
import { Table } from '@opencrvs/components/lib/Table'
import { Divider } from '@opencrvs/components/lib/Divider'
import { rejectCorrection } from '@client/review/reject-correction'
import { Summary } from '@opencrvs/components/lib/Summary'
import { CorrectorRelationship } from '@client/forms/correction/corrector'
import { messages } from '@client/i18n/messages/views/correction'
import { CorrectionReason } from '@client/forms/correction/reason'
import { Text } from '@opencrvs/components/lib/Text'
import { ColumnContentAlignment } from '@opencrvs/components/lib/common-types'
import {
  getRenderableField,
  getViewableSection,
  hasFieldChanged,
  isViewOnly,
  isVisibleField,
  renderValue
} from '@opencrvs/client/src/views/CorrectionForm/utils'
import { getOfflineData } from '@client/offline/selectors'
import { getLanguage } from '@client/i18n/selectors'
import { getName } from '@opencrvs/client/src/views/RecordAudit/utils'
import format from '@client/utils/date-formatting'
import { IOfflineData } from '@client/offline/reducer'

type URLParams = { declarationId: string }

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  background: ${({ theme }) => theme.colors.white};
  border-radius: 4px;
  margin-bottom: 40px;
  &:last-child {
    margin-bottom: 200px;
  }
`

const Row = styled.div<{
  position?: 'left' | 'center'
  background?: 'white' | 'background'
}>`
  display: flex;
  gap: 24px;
  width: 100%;
  justify-content: ${({ position }) => position || 'center'};
  background-color: ${({ theme, background }) =>
    !background || background === 'background'
      ? theme.colors.background
      : theme.colors.white};
  flex-direction: row;
  padding: 24px 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 24px 0;
  }
`
const ReviewContainter = styled.div<{ paddingT?: boolean }>`
  padding: ${({ paddingT }) => (paddingT ? '32px 32px 0 32px' : '0px 32px')};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px 24px;
  }
`

const SupportingDocument = styled.div`
  display: flex;
  margin: 8px 0;
`

interface IPropsReviewSummarySection {
  declaration: IDeclaration
}

const ReviewSummarySection = ({ declaration }: IPropsReviewSummarySection) => {
  const intl = useIntl()

  const registerForm = useSelector((state: IStoreState) =>
    getEventReviewForm(state, declaration.event)
  )

  const offlineResources = useSelector((state: IStoreState) =>
    getOfflineData(state)
  )

  const language = useSelector((state: IStoreState) => getLanguage(state))

  const formSections = getViewableSection(registerForm, declaration)

  const history = declaration.data.history as unknown as History[]
  if (!history) {
    throw new Error('No history found from record. Should never happen')
  }

  const correctionRequestTask = history.find(
    (task: History) => task.action === 'REQUESTED_CORRECTION'
  )

  if (!correctionRequestTask) {
    throw new Error(
      'No correction request found from record history. Should never happen'
    )
  }

  const getNameRequester = (person: IFormSectionData) => {
    return [
      person.firstNamesEng as string,
      person.familyNameEng as string
    ].join(' ')
  }

  const getRequestedBy = () => {
    const relationship = correctionRequestTask?.requester
    switch (relationship) {
      case CorrectorRelationship.INFORMANT:
        return getNameRequester(declaration.data.informant)
      case CorrectorRelationship.MOTHER:
        return getNameRequester(declaration.data.mother)
      case CorrectorRelationship.FATHER:
        return getNameRequester(declaration.data.father)
      case CorrectorRelationship.CHILD:
        return getNameRequester(declaration.data.child)
      case CorrectorRelationship.LEGAL_GUARDIAN:
        return intl.formatMessage(messages.legalGuardian)
      case CorrectorRelationship.ANOTHER_AGENT:
        return intl.formatMessage(messages.anotherRegOrFieldAgent)
      case CorrectorRelationship.REGISTRAR:
        return intl.formatMessage(messages.me)
      case CorrectorRelationship.COURT:
        return intl.formatMessage(messages.court)
      case CorrectorRelationship.OTHER:
        return (
          intl.formatMessage(messages.others) +
          ' - ' +
          correctionRequestTask.requesterOther
        )

      default:
        return '-'
    }
  }

  const getReasonForRequest = () => {
    switch (correctionRequestTask.reason) {
      case CorrectionReason.CLERICAL_ERROR:
        return intl.formatMessage(messages.clericalError)
      case CorrectionReason.MATERIAL_ERROR:
        return intl.formatMessage(messages.materialError)
      case CorrectionReason.MATERIAL_OMISSION:
        return intl.formatMessage(messages.materialOmission)
      case CorrectionReason.JUDICIAL_ORDER:
        return intl.formatMessage(messages.judicialOrder)
      case CorrectionReason.OTHER:
        return (
          intl.formatMessage(messages.otherReason) +
          ' - ' +
          correctionRequestTask.otherReason
        )
      default:
        return '-'
    }
  }

  const getSupportingDocuments = () => {
    const correction = correctionRequestTask
    const proofOfDoc = correction?.documents

    return (
      <>
        {proofOfDoc &&
          proofOfDoc.map((proof, i) => {
            const doc = proof.type
            return (
              <SupportingDocument key={`proof-${i}`}>
                <Text element="span" variant="reg16">
                  {doc}
                </Text>
              </SupportingDocument>
            )
          })}
      </>
    )
  }

  const getComments = () => {
    const reason = correctionRequestTask
    return reason?.comments && (reason.comments[0]?.comment as string)
  }

  const getFieldValue = (
    section: IFormSection,
    data: IFormData,
    field: IFormField,
    intl: IntlShape,
    offlineResources: IOfflineData,
    language: string,
    ignoreNestedFieldWrapping?: boolean,
    replaceEmpty?: boolean
  ) => {
    let value = renderValue(
      data,
      section.id,
      field,
      intl,
      offlineResources,
      language
    )

    if (replaceEmpty && !value) {
      value = '-'
    }

    return field.nestedFields && !Boolean(ignoreNestedFieldWrapping)
      ? (
          (data[section.id] &&
            data[section.id][field.name] &&
            (data[section.id][field.name] as IFormSectionData).value &&
            field.nestedFields[
              (data[section.id][field.name] as IFormSectionData).value as string
            ]) ||
          []
        ).reduce((groupedValues, nestedField) => {
          // Value of the parentField resembles with IFormData as a nested form
          const nestedValue =
            (data[section.id] &&
              data[section.id][field.name] &&
              renderValue(
                data[section.id][field.name] as IFormData,
                'nestedFields',
                nestedField,
                intl,
                offlineResources,
                language
              )) ||
            ''
          return (
            <>
              {groupedValues}
              {nestedValue && <div></div>}
              {nestedValue}
            </>
          )
        }, <>{value}</>)
      : value
  }

  const getPreviewGroupsField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    visitedTags: string[],
    data: IFormSectionData,
    originalData?: IFormSectionData
  ) => {
    if (field.previewGroup && !visitedTags.includes(field.previewGroup)) {
      visitedTags.push(field.previewGroup)

      const baseTag = field.previewGroup
      const taggedFields: IFormField[] = []
      group.fields.forEach((field) => {
        if (
          isVisibleField(field, section, declaration, offlineResources) &&
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
                  declaration,
                  offlineResources
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
          getFieldValue(
            section,
            declaration.data,
            field,
            intl,
            offlineResources,
            language
          )
        )
        .filter((value) => value)

      let completeValue = values[0]
      values.shift()
      values.forEach(
        (value) =>
          (completeValue = (
            <>
              {completeValue}
              {tagDef[0].delimiter ? tagDef[0].delimiter : <div></div>}
              {value}
            </>
          ))
      )

      const hasAnyFieldChanged = taggedFields.reduce(
        (accum, field) => accum || hasFieldChanged(field, data, originalData),
        false
      )

      const declarationOriginalData = declaration.originalData
      if (declarationOriginalData && hasAnyFieldChanged) {
        const previousValues = taggedFields
          .map((field, index) =>
            getFieldValue(
              section,
              declarationOriginalData,
              field,
              intl,
              offlineResources,
              language,
              undefined,
              !!index
            )
          )
          .filter((value) => value)
        let previousCompleteValue = previousValues[0]
        previousValues.shift()
        previousValues.forEach(
          (previousValue) =>
            (previousCompleteValue = (
              <>
                {previousCompleteValue}
                {tagDef[0].delimiter ? tagDef[0].delimiter : <div></div>}
                {previousValue}
              </>
            ))
        )

        return getRenderableField(
          section,
          (tagDef[0] && tagDef[0].label) || field.label,
          previousCompleteValue,
          completeValue,
          intl
        )
      }
    }
  }

  const getSinglePreviewField = (
    section: IFormSection,
    group: IFormSectionGroup,
    field: IFormField,
    ignoreNestedFieldWrapping?: boolean
  ) => {
    if (
      declaration.originalData &&
      hasFieldChanged(
        field,
        declaration.data[section.id],
        declaration.originalData[section.id]
      )
    ) {
      const changed = getFieldValue(
        section,
        declaration.data,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping
      )
      const original = getFieldValue(
        section,
        declaration.originalData,
        field,
        intl,
        offlineResources,
        language,
        ignoreNestedFieldWrapping,
        true
      )

      return getRenderableField(section, field.label, original, changed, intl)
    }
  }

  const getChanges = (formSections: IFormSection[]) => {
    const changesValue = declaration.data?.registration
      ?.correction as IFormSectionData
    const Values = changesValue && (changesValue.values as any[])
    let items: any[] = []

    let tempItem: any

    const visitedTags: string[] = []

    Values?.forEach((value: any) => {
      const section = formSections.find((r) => r.id === value.section)
      if (section) {
        section.groups.forEach((group) => {
          const field = group.fields.find((r) => r.name === value.fieldName)
          if (field) {
            tempItem = field.previewGroup
              ? getPreviewGroupsField(
                  section,
                  group,
                  field,
                  visitedTags,
                  declaration.data[section.id],
                  declaration.originalData &&
                    declaration.originalData[section.id]
                )
              : getSinglePreviewField(section, group, field)

            items = items.concat(tempItem)
          }
        })
      }
    })

    return items.filter((item) => item)
  }

  const getSubmitter = () => {
    const correction = correctionRequestTask
    return correction?.user && getName(correction.user.name, 'en')
  }

  const getOffice = () => {
    const correction = correctionRequestTask
    return correction?.office && (correction.office?.name as string)
  }

  const getDate = () => {
    const correction = correctionRequestTask
    return correction?.date && (correction.date as Date)
  }

  return (
    <ReviewSectionCorrection declaration={declaration} form={rejectCorrection}>
      {({ toggleRejectModal, toggleApproveModal }) => (
        <Card>
          <ReviewHeader id="correction_header" subject={'Correction request'} />

          <ReviewContainter paddingT={true}>
            <Summary>
              <Summary.Row
                label={intl.formatMessage(messages.correctionSummarySubmitter)}
                value={getSubmitter()}
              />
              <Summary.Row
                label={intl.formatMessage(messages.correctionSummaryOffice)}
                value={getOffice()}
              />
              <Summary.Row
                label={intl.formatMessage(
                  messages.correctionSummaryRequestedOn
                )}
                value={format(new Date(getDate()), 'MMMM dd, yyyy')}
              />
              <Summary.Row
                label={intl.formatMessage(
                  messages.correctionSummaryRequestedBy
                )}
                value={getRequestedBy()}
              />
              <Summary.Row
                label={intl.formatMessage(
                  messages.correctionSummaryReasonForRequest
                )}
                value={getReasonForRequest()}
              />
              <Summary.Row
                label={intl.formatMessage(
                  messages.correctionSummarySupportingDocuments
                )}
                value={getSupportingDocuments()}
              />
              <Summary.Row
                label={intl.formatMessage(messages.correctionSummaryComments)}
                value={getComments()}
              />
            </Summary>
            <Divider />
            <Table
              isLoading={false}
              noPagination
              hideTableBottomBorder={false}
              columns={[
                {
                  label: intl.formatMessage(messages.correctionSummaryItem),
                  alignment: ColumnContentAlignment.LEFT,
                  width: 34,
                  key: 'item'
                },
                {
                  label: intl.formatMessage(messages.correctionSummaryOriginal),
                  width: 33,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'original'
                },
                {
                  label: intl.formatMessage(
                    messages.correctionSummaryCorrection
                  ),
                  width: 33,
                  alignment: ColumnContentAlignment.LEFT,
                  key: 'changed'
                }
              ]}
              content={getChanges(formSections)}
            />
            <Row position="left" background="white">
              <Button
                type="positive"
                size="large"
                id="ApproveCorrectionBtn"
                onClick={toggleApproveModal}
              >
                <Icon name="Check" />
                {intl.formatMessage(buttonMessages.approve)}
              </Button>
              <Button
                type="negative"
                size="large"
                id="rejectCorrectionBtn"
                onClick={toggleRejectModal}
              >
                <Icon name="X" />
                {intl.formatMessage(buttonMessages.reject)}
              </Button>
            </Row>
          </ReviewContainter>
        </Card>
      )}
    </ReviewSectionCorrection>
  )
}

function applyCorrectionToData(record: IDeclaration) {
  const history = record.data.history as unknown as History[]
  if (!history) {
    throw new Error('No history found from declaration. Should never happen')
  }

  const correctionRequestTask = history.find(
    (task: History) => task.action === 'REQUESTED_CORRECTION'
  )

  if (!correctionRequestTask) {
    throw new Error('No correction request task found. Should never happen')
  }

  if (!correctionRequestTask.input) {
    throw new Error(
      'Correction request task did not have an input field. Should never happen'
    )
  }

  const proposedChangesPatch = correctionRequestTask.input.reduce(
    (acc: Record<string, Record<string, IFormFieldValue>>, curr: any) => {
      acc[curr.valueCode] = acc[curr.valueCode] || {}

      switch (typeof record.data[curr.valueCode]?.[curr.valueId]) {
        case 'number':
          acc[curr.valueCode][curr.valueId] = Number(curr.valueString)
          break

        default:
          acc[curr.valueCode][curr.valueId] = curr.valueString
          break
      }

      return acc
    },
    {}
  )

  const correction: CorrectionInput = {
    attachments: correctionRequestTask.documents.map((document) => ({
      _fhirID: document.id
    })),
    hasShowedVerifiedDocument: correctionRequestTask.hasShowedVerifiedDocument!,
    noSupportingDocumentationRequired:
      correctionRequestTask.noSupportingDocumentationRequired!,
    location: {
      _fhirID: correctionRequestTask.location!.id
    },
    note: '', //correctionRequestTask.note!,
    otherReason: correctionRequestTask.otherReason!,
    payment: correctionRequestTask.payment && {
      _fhirID: correctionRequestTask.payment.id,
      type: correctionRequestTask.payment.type,
      amount: correctionRequestTask.payment.amount,
      outcome: correctionRequestTask.payment.outcome,
      date: correctionRequestTask.payment.date
    },
    reason: correctionRequestTask.reason!,
    requester: correctionRequestTask.requester!,
    values: correctionRequestTask.input.map((input) => ({
      fieldName: input!.valueId,
      newValue: input!.valueString,
      section: input!.valueCode,
      oldValue: (record.data[input!.valueCode][input!.valueId] || '').toString()
    }))
  }

  const declarationData = merge({}, record.data, proposedChangesPatch)

  return {
    ...record,
    data: {
      ...declarationData,
      registration: {
        ...declarationData.registration,
        correction: correction
      }
    }
  }
}

export function ReviewCorrection() {
  const { declarationId } = useParams<URLParams>()
  const match = useRouteMatch()

  const location = useLocation()
  const history = useHistory()

  const records = useRecord()
  const record = records.findById(declarationId)

  const registerForm = useSelector(
    (state: IStoreState) => record && getEventReviewForm(state, record.event)
  )

  if (!record) {
    return (
      <Redirect
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyForReview,
          selectorId: ''
        })}
      />
    )
  }

  const recordWithProposedChanges = applyCorrectionToData(record)

  return (
    <>
      <RegisterForm
        match={{
          ...match,
          params: {
            declarationId: record.id,
            pageId: 'review',
            groupId: 'review-view-group'
          }
        }}
        reviewSummaryHeader={
          <ReviewSummarySection declaration={recordWithProposedChanges} />
        }
        pageRoute={''}
        location={location}
        history={history}
        registerForm={registerForm}
        declaration={recordWithProposedChanges}
      />
    </>
  )
}
