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
import { Icon, NavigationGroup, NavigationItem } from '@opencrvs/components'
import { DeclarationIconSmall } from '@opencrvs/components/lib/icons/DeclarationIconSmall'
import React from 'react'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { usePermissions } from '@client/hooks/useAuthorization'
import {
  filterProcessingDeclarationsFromQuery,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { IWorkqueue } from '@client/workqueue'
import {
  ALLOWED_STATUS_FOR_RETRY,
  INPROGRESS_STATUS
} from '@client/SubmissionController'
import { getOfflineData } from '@client/offline/selectors'
import { useDispatch, useSelector } from 'react-redux'
import { Event } from '@client/utils/gateway'
import { useIntl } from 'react-intl'
import { goToHomeTab } from '@client/navigation'

interface IWorkqueueProps {
  workqueue: IWorkqueue
  storedDeclarations: IDeclaration[]
  draftDeclarations: IDeclaration[]
  tabId: string
  menuCollapse?: () => void
}

const Workqueue = ({
  workqueue,
  storedDeclarations,
  draftDeclarations,
  tabId,
  menuCollapse
}: IWorkqueueProps) => {
  const { hasScope, hasAnyScope } = usePermissions()
  const intl = useIntl()
  const dispatch = useDispatch()

  const { data, initialSyncDone } = workqueue
  const filteredData = filterProcessingDeclarationsFromQuery(
    data,
    storedDeclarations
  )

  const offlineCountryConfiguration = useSelector(getOfflineData)

  const isOnePrintInAdvanceOn = Object.values(Event).some((event: Event) => {
    const upperCaseEvent = event.toUpperCase() as Uppercase<Event>
    return offlineCountryConfiguration.config[upperCaseEvent].PRINT_IN_ADVANCE
  })

  const declarationCount = {
    inProgress: !initialSyncDone
      ? 0
      : draftDeclarations.filter(
          (draft) =>
            draft.submissionStatus ===
            SUBMISSION_STATUS[SUBMISSION_STATUS.DRAFT]
        ).length +
        (filteredData.inProgressTab?.totalItems || 0) +
        (filteredData.notificationTab?.totalItems || 0),
    readyForReview: !initialSyncDone
      ? 0
      : filteredData.reviewTab?.totalItems || 0,
    requiresUpdate: !initialSyncDone
      ? 0
      : filteredData.rejectTab?.totalItems || 0,
    sentForApproval: !initialSyncDone
      ? 0
      : filteredData.approvalTab?.totalItems || 0,
    externalValidation:
      window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE && !initialSyncDone
        ? 0
        : filteredData.externalValidationTab?.totalItems || 0,
    readyToPrint: !initialSyncDone ? 0 : filteredData.printTab?.totalItems || 0,
    readyToIssue: !initialSyncDone ? 0 : filteredData.issueTab?.totalItems || 0,
    outbox: storedDeclarations.filter((draft) =>
      (
        [
          ...ALLOWED_STATUS_FOR_RETRY,
          ...INPROGRESS_STATUS,
          SUBMISSION_STATUS.FAILED
        ] as SUBMISSION_STATUS[]
      ).includes(draft.submissionStatus as SUBMISSION_STATUS)
    ).length
  }

  const hasInProgress = hasAnyScope([
    'record.declare-birth',
    'record.declare-birth:my-jurisdiction',
    'record.declare-death',
    'record.declare-death:my-jurisdiction',
    'record.declare-marriage',
    'record.declare-marriage:my-jurisdiction'
  ])

  const canRegister = hasScope('record.register')
  const hasSentForReview = hasAnyScope(['record.submit-for-review'])
  const hasSentForApproval = hasScope('record.submit-for-approval')
  const hasReadyForReview = hasScope('record.declaration-review')
  const hasReadyToPrint = hasScope('record.print-issue-certified-copies')
  const hasReadyToIssue = hasScope('record.print-issue-certified-copies')
  const hasRequiresUpdates = hasScope('record.declaration-review')

  const hasOutbox = !hasAnyScope(['sysadmin', 'natlsysadmin'])

  return (
    <NavigationGroup>
      {hasInProgress && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'purple'} />}
          id={`navigation_${WORKQUEUE_TABS.inProgress}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.inProgress]
          )}
          count={draftDeclarations.length}
          isSelected={tabId === WORKQUEUE_TABS.inProgress}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.inProgress))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {hasSentForReview && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'orange'} />}
          id={`navigation_${WORKQUEUE_TABS.sentForReview}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.sentForReview]
          )}
          count={declarationCount.readyForReview}
          isSelected={tabId === WORKQUEUE_TABS.sentForReview}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.sentForReview))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {hasSentForApproval && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'grey'} />}
          id={`navigation_${WORKQUEUE_TABS.sentForApproval}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.sentForApproval]
          )}
          count={declarationCount.sentForApproval}
          isSelected={tabId === WORKQUEUE_TABS.sentForApproval}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.sentForApproval))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {hasRequiresUpdates && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'red'} />}
          id={`navigation_${WORKQUEUE_TABS.requiresUpdate}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.requiresUpdate]
          )}
          count={declarationCount.requiresUpdate}
          isSelected={tabId === WORKQUEUE_TABS.requiresUpdate}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.requiresUpdate))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {hasReadyForReview && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'orange'} />}
          id={`navigation_${WORKQUEUE_TABS.readyForReview}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.readyForReview]
          )}
          count={declarationCount.readyForReview}
          isSelected={tabId === WORKQUEUE_TABS.readyForReview}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.readyForReview))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {hasReadyToPrint && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'green'} />}
          id={`navigation_${WORKQUEUE_TABS.readyToPrint}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.readyToPrint]
          )}
          count={declarationCount.readyToPrint}
          isSelected={tabId === WORKQUEUE_TABS.readyToPrint}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.readyToPrint))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {canRegister && window.config.FEATURES.EXTERNAL_VALIDATION_WORKQUEUE && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'teal'} />}
          id={`navigation_${WORKQUEUE_TABS.externalValidation}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.externalValidation]
          )}
          count={declarationCount.externalValidation}
          isSelected={tabId === WORKQUEUE_TABS.externalValidation}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.externalValidation))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {isOnePrintInAdvanceOn && hasReadyToIssue && (
        <NavigationItem
          icon={() => <DeclarationIconSmall color={'teal'} />}
          id={`navigation_${WORKQUEUE_TABS.readyToIssue}`}
          label={intl.formatMessage(
            navigationMessages[WORKQUEUE_TABS.readyToIssue]
          )}
          count={declarationCount.readyToIssue}
          isSelected={tabId === WORKQUEUE_TABS.readyToIssue}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.readyToIssue))
            menuCollapse && menuCollapse()
          }}
        />
      )}
      {hasOutbox && (
        <NavigationItem
          icon={() => <Icon name="PaperPlaneTilt" size="medium" />}
          id={`navigation_${WORKQUEUE_TABS.outbox}`}
          label={intl.formatMessage(navigationMessages[WORKQUEUE_TABS.outbox])}
          count={declarationCount.outbox}
          isSelected={tabId === WORKQUEUE_TABS.outbox}
          onClick={() => {
            dispatch(goToHomeTab(WORKQUEUE_TABS.outbox))
            menuCollapse && menuCollapse()
          }}
        />
      )}
    </NavigationGroup>
  )
}

export default Workqueue
