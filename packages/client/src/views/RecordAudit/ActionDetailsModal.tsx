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

import React from 'react'
import { goToUserProfile, IDynamicValues } from '@client/navigation'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { IDeclaration } from '@client/declarations'
import { IOfflineData } from '@client/offline/reducer'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { IForm, IFormSection, IFormField } from '@client/forms'
import {
  constantsMessages,
  dynamicConstantsMessages,
  userMessages
} from '@client/i18n/messages'
import { getIndividualNameObj, UserDetails } from '@client/utils/userUtils'
import { History, RegAction, RegStatus } from '@client/utils/gateway'
import { messages } from '@client/i18n/messages/views/correction'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { isEmpty, find, flatten, values } from 'lodash'
import {
  getFieldValue,
  getStatusLabel,
  isSystemInitiated,
  isVerifiedAction
} from './utils'
import {
  CollectorRelationLabelArray,
  CorrectorRelationLabelArray,
  CorrectorRelationship
} from '@client/forms/correction/corrector'
import { getRejectionReasonDisplayValue } from '@client/views/SearchResult/SearchResult'
import { CorrectionReason } from '@client/forms/correction/reason'
import { Table } from '@client/../../components/lib'
import { Pill } from '@opencrvs/components/lib/Pill'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import { formatLongDate } from '@client/utils/date-formatting'
import { EMPTY_STRING } from '@client/utils/constants'

interface IActionDetailsModalListTable {
  actionDetailsData: History
  actionDetailsIndex: number
  registerForm: IForm
  intl: IntlShape
  offlineData: Partial<IOfflineData>
  draft: IDeclaration | null
}

function retrieveUniqueComments(
  histories: History[],
  actionDetailsData: History,
  previousHistoryItemIndex: number
) {
  if (!Array.isArray(actionDetailsData.comments)) {
    return []
  }

  if (previousHistoryItemIndex === -1) {
    return actionDetailsData.comments
      .map((comment) => comment?.comment)
      .map((comment) => ({ comment }))
  }

  const comments: IDynamicValues[] = []
  actionDetailsData.comments.forEach((item, index) => {
    if (
      (histories[previousHistoryItemIndex].comments || [])[index]?.comment !==
      item?.comment
    ) {
      comments.push({ comment: item?.comment })
    }
  })

  return comments
}

function getHistories(draft: IDeclaration | null) {
  const histories: History[] =
    draft?.data.history && Array.isArray(draft.data.history)
      ? draft.data.history.sort((prevItem, nextItem) => {
          return new Date(prevItem.date).getTime() >
            new Date(nextItem.date).getTime()
            ? 1
            : -1
        })
      : []

  return histories
}

/*
 *  This function prepares the comments to be displayed based on status of the declaration.
 */
function prepareComments(
  actionDetailsData: History,
  draft: IDeclaration | null
) {
  if (
    !draft ||
    (actionDetailsData.action &&
      actionDetailsData.action !== RegAction.RequestedCorrection)
  ) {
    return []
  }

  const histories = getHistories(draft)
  const currentHistoryItemIndex = histories.findIndex(
    (item) => item.date === actionDetailsData.date
  )
  const previousHistoryItemIndex =
    currentHistoryItemIndex < 0
      ? currentHistoryItemIndex
      : currentHistoryItemIndex - 1

  if (
    [RegStatus.Rejected, RegStatus.Archived].includes(
      actionDetailsData.regStatus as RegStatus
    )
  ) {
    return actionDetailsData.statusReason?.text
      ? [{ comment: actionDetailsData.statusReason.text }]
      : []
  }

  return retrieveUniqueComments(
    histories,
    actionDetailsData,
    previousHistoryItemIndex
  )
}

const requesterLabelMapper = (requester: string, intl: IntlShape) => {
  const requesterIndividual = CorrectorRelationLabelArray.find(
    (labelItem) => labelItem.value === requester
  )

  return requesterIndividual?.label
    ? intl.formatMessage(requesterIndividual.label)
    : ''
}

const getReasonForRequest = (
  reasonValue: string,
  otherReason: string,
  intl: IntlShape
) => {
  switch (reasonValue) {
    case CorrectionReason.CLERICAL_ERROR:
      return intl.formatMessage(messages.clericalError)

    case CorrectionReason.MATERIAL_ERROR:
      return intl.formatMessage(messages.materialError)

    case CorrectionReason.MATERIAL_OMISSION:
      return intl.formatMessage(messages.materialOmission)

    case CorrectionReason.JUDICIAL_ORDER:
      return intl.formatMessage(messages.judicialOrder)

    case CorrectionReason.OTHER:
      return otherReason
    default:
      return '-'
  }
}

const ActionDetailsModalListTable = ({
  actionDetailsData,
  actionDetailsIndex,
  registerForm,
  intl,
  offlineData,
  draft
}: IActionDetailsModalListTable) => {
  const [currentPage, setCurrentPage] = React.useState(1)

  if (registerForm === undefined) return <></>

  const sections = registerForm?.sections || []
  const requesterColumn = [
    {
      key: 'requester',
      label: intl.formatMessage(messages.correctionSummaryRequestedBy),
      width: 100
    }
  ]
  const commentsColumn = [
    {
      key: 'comment',
      label: intl.formatMessage(constantsMessages.comment),
      width: 100
    }
  ]
  const reasonColumn = [
    {
      key: 'text',
      label: intl.formatMessage(constantsMessages.reason),
      width: 100
    }
  ]
  const correctionReasonColumn = [
    {
      key: 'text',
      label: intl.formatMessage(constantsMessages.requestReason),
      width: 100
    }
  ]
  const declarationUpdatedColumns = [
    {
      key: 'item',
      label: intl.formatMessage(messages.correctionSummaryItem),
      width: 33.33
    },
    {
      key: 'original',
      label: intl.formatMessage(messages.correctionSummaryOriginal),
      width: 33.33
    },
    {
      key: 'edit',
      label: intl.formatMessage(messages.correctionSummaryCorrection),
      width: 33.33
    }
  ]
  const certificateCollectorVerified = [
    {
      key: 'hasShowedVerifiedDocument',
      label: intl.formatMessage(certificateMessages.collectorIDCheck),
      width: 100
    }
  ]
  const duplicateOfColumn = [
    {
      key: 'duplicateOf',
      label: intl.formatMessage(constantsMessages.duplicateOf),
      width: 100
    }
  ]

  const matchedToColumn = [
    {
      key: 'potentialDuplicates',
      label: intl.formatMessage(constantsMessages.matchedTo),
      width: 100
    }
  ]

  const potentialDuplicatesTransformer = (items: string[]) => {
    return (
      <>
        {items.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </>
    )
  }

  const getItemName = (
    sectionName: MessageDescriptor,
    fieldLabel: MessageDescriptor
  ) => {
    const label = intl.formatMessage(fieldLabel)
    const section = intl.formatMessage(sectionName)

    return (label && label.trim().length > 0 && `${label} (${section})`) || ''
  }

  const dataChange = (actionDetailsData: History): IDynamicValues[] => {
    const result: IDynamicValues[] = []

    if (actionDetailsData.action === RegAction.Downloaded) {
      return result
    }

    actionDetailsData?.input?.forEach((item) => {
      if (!item) return
      const editedValue = actionDetailsData?.output?.find(
        (oi) => oi?.valueId === item.valueId && oi?.valueCode === item.valueCode
      )
      if (!editedValue) return
      const section = find(
        sections,
        (section) => section.id === item?.valueCode
      ) as IFormSection

      if (section.id === 'documents') {
        item.valueString = EMPTY_STRING
        editedValue.valueString = intl.formatMessage(
          dynamicConstantsMessages.updated
        )
      }

      const indexes = item?.valueId?.split('.')
      if (!indexes) return

      if (indexes.length > 1) {
        const [parentField, , nestedField] = indexes

        const nestedFields = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField)

        const fieldObj = flatten(values(nestedFields?.nestedFields)).find(
          (field) => field.name === nestedField
        ) as IFormField

        result.push({
          item: getItemName(section.name, fieldObj.label),
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      } else {
        const [parentField] = indexes

        const fieldObj = flatten(
          section.groups.map((group) => {
            return group.fields
          })
        ).find((field) => field.name === parentField) as IFormField

        result.push({
          item: getItemName(section.name, fieldObj.label),
          original: getFieldValue(
            item.valueString,
            fieldObj,
            offlineData,
            intl
          ),
          edit: getFieldValue(
            editedValue.valueString,
            fieldObj,
            offlineData,
            intl
          )
        })
      }
    })

    return result
  }
  const certificateCollectorData = (
    actionDetailsData: History,
    index: number
  ): IDynamicValues => {
    if (!actionDetailsData.certificates) return {}

    const certificate = actionDetailsData.certificates.filter((item) => item)[
      index
    ]

    if (!certificate) {
      return {}
    }

    const name = certificate.collector?.name
      ? getIndividualNameObj(
          certificate.collector.name,
          window.config.LANGUAGES
        )
      : {}
    const collectorLabel = () => {
      const relation = CollectorRelationLabelArray.find(
        (labelItem) => labelItem.value === certificate.collector?.relationship
      )
      const collectorName = `${name?.firstNames || ''} ${
        name?.familyName || ''
      }`
      if (relation)
        return `${collectorName} (${intl.formatMessage(relation.label)})`
      if (certificate.collector?.relationship === 'PRINT_IN_ADVANCE') {
        return `${collectorName} (${certificate.collector?.otherRelationship})`
      }
      return collectorName
    }

    return {
      hasShowedVerifiedDocument: certificate.hasShowedVerifiedDocument
        ? intl.formatMessage(certificateMessages.idCheckVerify)
        : intl.formatMessage(certificateMessages.idCheckWithoutVerify),
      collector: collectorLabel(),
      otherRelationship: certificate.collector?.otherRelationship,
      relationship: certificate.collector?.relationship
    }
  }

  const declarationUpdates = dataChange(actionDetailsData)
  const collectorData = certificateCollectorData(
    actionDetailsData,
    actionDetailsIndex
  )
  const certificateCollector = [
    {
      key: 'collector',
      label:
        collectorData.relationship === 'PRINT_IN_ADVANCE'
          ? intl.formatMessage(certificateMessages.printedOnAdvance)
          : intl.formatMessage(certificateMessages.printedOnCollection),
      width: 100
    }
  ]
  const pageChangeHandler = (cp: number) => setCurrentPage(cp)
  const content = prepareComments(actionDetailsData, draft)
  const requesterLabel = requesterLabelMapper(
    actionDetailsData.requester as string,
    intl
  )
  return (
    <>
      {/* For Reject Reason */}
      {actionDetailsData.reason &&
        !actionDetailsData.action &&
        actionDetailsData.regStatus === RegStatus.Rejected && (
          <Table
            noResultText=" "
            columns={reasonColumn}
            content={[
              {
                text: intl.formatMessage(
                  getRejectionReasonDisplayValue(actionDetailsData.reason)
                )
              }
            ]}
          />
        )}

      {/* Correction Requester */}
      {actionDetailsData.requester &&
        actionDetailsData.action === RegAction.RequestedCorrection && (
          <Table
            noResultText=" "
            columns={requesterColumn}
            content={[{ requester: requesterLabel }]}
          />
        )}
      {/* Correction rejected */}
      {actionDetailsData.requester &&
        actionDetailsData.action === RegAction.RejectedCorrection && (
          <Table
            noResultText=" "
            columns={reasonColumn}
            content={[{ text: actionDetailsData.reason }]}
          />
        )}

      {/* Correction Requester Id Verified */}
      {actionDetailsData.action === RegAction.RequestedCorrection &&
        actionDetailsData.requester !== CorrectorRelationship.ANOTHER_AGENT &&
        actionDetailsData.requester !== CorrectorRelationship.REGISTRAR && (
          <Table
            noResultText=" "
            columns={certificateCollectorVerified}
            content={[
              {
                hasShowedVerifiedDocument:
                  actionDetailsData.hasShowedVerifiedDocument
                    ? intl.formatMessage(certificateMessages.idCheckVerify)
                    : intl.formatMessage(
                        certificateMessages.idCheckWithoutVerify
                      )
              }
            ]}
            pageSize={10}
            totalItems={1}
            currentPage={currentPage}
            onPageChange={pageChangeHandler}
          />
        )}

      {/* For Correction Reason */}
      {actionDetailsData.reason &&
        actionDetailsData.action === RegAction.RequestedCorrection && (
          <Table
            noResultText=" "
            columns={correctionReasonColumn}
            content={[
              {
                text: getReasonForRequest(
                  actionDetailsData.reason as string,
                  actionDetailsData.otherReason as string,
                  intl
                )
              }
            ]}
          />
        )}

      {/* Duplicate of */}
      {actionDetailsData.duplicateOf && (
        <Table
          noResultText=" "
          columns={duplicateOfColumn}
          content={[{ duplicateOf: actionDetailsData.duplicateOf }]}
        />
      )}

      {/* For Comments */}
      {content.length > 0 && (
        <Table noResultText=" " columns={commentsColumn} content={content} />
      )}

      {/* Show Duplicate pill for Archived declarations */}
      {actionDetailsData.reason === 'duplicate' &&
        !actionDetailsData.action &&
        actionDetailsData.regStatus === RegStatus.Archived && (
          <p>
            <Pill
              label={intl.formatMessage(recordAuditMessages.markAsDuplicate)}
              size="small"
              type="inactive"
            />
          </p>
        )}

      {/* For Data Updated */}
      {declarationUpdates.length > 0 &&
        (actionDetailsData.action === RegAction.RequestedCorrection ||
          actionDetailsData.regStatus === RegStatus.DeclarationUpdated) && (
          <Table
            noResultText=" "
            columns={declarationUpdatedColumns}
            content={declarationUpdates}
            pageSize={10}
            totalItems={declarationUpdates.length}
            currentPage={currentPage}
            onPageChange={pageChangeHandler}
          />
        )}

      {/* For Certificate */}
      {!isEmpty(collectorData) && (
        <Table
          noResultText=" "
          columns={certificateCollector}
          content={[collectorData]}
          pageSize={10}
          totalItems={1}
          currentPage={currentPage}
          onPageChange={pageChangeHandler}
        />
      )}
      {!isEmpty(collectorData) && (
        <Table
          noResultText=" "
          columns={certificateCollectorVerified}
          content={[collectorData]}
          pageSize={10}
          totalItems={1}
          currentPage={currentPage}
          onPageChange={pageChangeHandler}
        />
      )}

      {/* Matched to */}
      {actionDetailsData.potentialDuplicates &&
        actionDetailsData.action === RegAction.FlaggedAsPotentialDuplicate && (
          <Table
            noResultText=" "
            columns={matchedToColumn}
            content={[
              {
                potentialDuplicates: potentialDuplicatesTransformer(
                  actionDetailsData.potentialDuplicates
                )
              }
            ]}
          />
        )}
    </>
  )
}

export const ActionDetailsModal = ({
  show,
  actionDetailsData,
  actionDetailsIndex,
  toggleActionDetails,
  intl,
  userDetails,
  goToUser,
  registerForm,
  offlineData,
  draft
}: {
  show: boolean
  actionDetailsData: History
  actionDetailsIndex: number
  toggleActionDetails: (param: History | null) => void
  intl: IntlShape
  userDetails: UserDetails | null
  goToUser: typeof goToUserProfile
  registerForm: IForm
  offlineData: Partial<IOfflineData>
  draft: IDeclaration | null
}) => {
  if (isEmpty(actionDetailsData)) return <></>

  const title = getStatusLabel(
    actionDetailsData.action,
    actionDetailsData.regStatus,
    intl,
    actionDetailsData.user,
    userDetails
  )

  let userName = ''
  if (isVerifiedAction(actionDetailsData) && actionDetailsData.ipAddress) {
    userName = actionDetailsData.ipAddress
  } else if (!isSystemInitiated(actionDetailsData)) {
    const nameObj = actionDetailsData?.user?.name
      ? getIndividualNameObj(
          actionDetailsData.user.name,
          window.config.LANGUAGES
        )
      : null
    userName = nameObj
      ? `${String(nameObj.firstNames)} ${String(nameObj.familyName)}`
      : ''
  } else {
    userName =
      actionDetailsData.system?.name ??
      intl.formatMessage(userMessages.healthSystem)
  }

  return (
    <ResponsiveModal
      actions={[]}
      handleClose={() => toggleActionDetails(null)}
      show={show}
      responsive={true}
      title={title}
      width={1024}
      autoHeight={true}
    >
      <>
        <div>
          <>{userName}</>
          <span>
            {' '}
            —{' '}
            {formatLongDate(
              actionDetailsData.date.toLocaleString(),
              intl.locale,
              'MMMM dd, yyyy · hh.mm a'
            )}
          </span>
        </div>
        <ActionDetailsModalListTable
          actionDetailsData={actionDetailsData}
          actionDetailsIndex={actionDetailsIndex}
          registerForm={registerForm}
          intl={intl}
          offlineData={offlineData}
          draft={draft}
        />
      </>
    </ResponsiveModal>
  )
}
