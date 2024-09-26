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
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { useDispatch } from 'react-redux'
import { Icon } from '@opencrvs/components'
import {
  goToCertificateCorrection,
  goToHome,
  goToIssueCertificate,
  goToPage,
  goToPrintCertificate,
  goToUserProfile,
  goToViewRecordPage
} from '@client/navigation'
import { IntlShape } from 'react-intl'
import { Scope } from '@sentry/react'
import { IDeclarationData } from './utils'
import {
  clearCorrectionAndPrintChanges,
  deleteDeclaration,
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { CorrectionSection } from '@client/forms'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { UserDetails } from '@client/utils/userUtils'
import { EVENT_STATUS } from '@client/workqueue'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  DRAFT_MARRIAGE_FORM_PAGE,
  REVIEW_CORRECTION,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { messages } from '@client/i18n/messages/views/action'
import { useModal } from '@client/hooks/useModal'
import { DeleteModal } from '@client/views/RegisterForm/RegisterForm'
import { client } from '@client/utils/apolloClient'
import { Event } from '@client/utils/gateway'

export const ActionMenu: React.FC<{
  declaration: IDeclarationData
  intl: IntlShape
  scope: Scope
  draft: IDeclaration | null
  userDetails: UserDetails | null
  duplicates?: string[]
  toggleDisplayDialog: () => void
  clearCorrectionAndPrintChanges: typeof clearCorrectionAndPrintChanges
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
  goToIssueCertificate: typeof goToIssueCertificate
  goToUserProfile: typeof goToUserProfile
}> = ({
  declaration,
  intl,
  scope,
  draft,
  userDetails,
  toggleDisplayDialog,
  goToPage,
  clearCorrectionAndPrintChanges,
  goToPrintCertificate,
  goToIssueCertificate,
  duplicates
}) => {
  const dispatch = useDispatch()
  const [modal, openModal] = useModal()

  const { id, type, assignment, status } = declaration

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  const isDuplicate = (duplicates ?? []).length > 0

  const handleDelete = async () => {
    const deleteConfirm = await openModal<boolean | null>((close) => (
      <DeleteModal intl={intl} close={close}></DeleteModal>
    ))
    if (deleteConfirm) {
      dispatch(deleteDeclaration(id, client))
      dispatch(goToHome())
    }
    return
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <PrimaryButton icon={() => <CaretDown />}>
            {intl.formatMessage(messages.action)}
          </PrimaryButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {!isDownloaded && assignment && (
            <>
              <DropdownMenu.Label>
                {intl.formatMessage(messages.assignedTo, {
                  name: assignment.firstName + ' ' + assignment.lastName,
                  officeName: assignment.officeName
                })}
              </DropdownMenu.Label>
              <DropdownMenu.Separator />
            </>
          )}
          <ViewAction
            declarationId={id}
            declarationStatus={status}
            intl={intl}
          />
          <CorrectRecordAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
          />
          <ArchiveAction
            toggleDisplayDialog={toggleDisplayDialog}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
            declarationStatus={status}
          />
          <ReinstateAction
            toggleDisplayDialog={toggleDisplayDialog}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
            declarationStatus={status}
          />
          <ReviewAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
            goToPage={goToPage}
            isDuplicate={isDuplicate}
          />
          <UpdateAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
            goToPage={goToPage}
          />
          <PrintAction
            declarationStatus={status}
            declarationId={id}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
            clearCorrectionAndPrintChanges={clearCorrectionAndPrintChanges}
            goToPrintCertificate={goToPrintCertificate}
          />
          <IssueAction
            declarationStatus={status}
            declarationId={id}
            isDownloaded={isDownloaded}
            intl={intl}
            scope={scope}
          />
          <DeleteAction handleDelete={handleDelete} intl={intl} scope={scope} />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modal}
    </>
  )
}

interface IActionItemCommonProps {
  isDownloaded: boolean
  intl: IntlShape
  scope: Scope
  declarationStatus?: string
}

interface IDeclarationProps {
  declarationId: string
  type?: string
}

const ViewAction: React.FC<{
  intl: IntlShape
  declarationStatus?: string
  declarationId: string
}> = ({ declarationStatus, declarationId, intl }) => {
  const dispatch = useDispatch()

  const recordOrDeclaration = [
    SUBMISSION_STATUS.REGISTERED,
    SUBMISSION_STATUS.CORRECTION_REQUESTED,
    SUBMISSION_STATUS.CERTIFIED
  ].includes(declarationStatus as any as SUBMISSION_STATUS)
    ? 'record'
    : 'declaration'

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(goToViewRecordPage(declarationId as string))
      }}
    >
      <Icon name="Eye" color="currentColor" size="large" />
      {intl.formatMessage(messages.view, { recordOrDeclaration })}
    </DropdownMenu.Item>
  )
}

const CorrectRecordAction: React.FC<
  IActionItemCommonProps & IDeclarationProps
> = ({ declarationId, declarationStatus, type, isDownloaded, intl, scope }) => {
  const dispatch = useDispatch()

  const isBirthOrDeathEvent =
    type && [Event.Birth, Event.Death].includes(type.toLowerCase() as Event)

  const canBeCorrected =
    declarationStatus &&
    [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED,
      SUBMISSION_STATUS.ISSUED
    ].includes(declarationStatus as SUBMISSION_STATUS)

  // @ToDo use: `record.registration-correct` after configurable role pr is merged
  const userHasRegisterScope =
    scope && (scope as any as string[]).includes('register')

  return (
    isBirthOrDeathEvent &&
    canBeCorrected &&
    userHasRegisterScope && (
      <DropdownMenu.Item
        onClick={() => {
          dispatch(clearCorrectionAndPrintChanges(declarationId as string))
          dispatch(
            goToCertificateCorrection(
              declarationId as string,
              CorrectionSection.Corrector
            )
          )
        }}
        disabled={!isDownloaded}
      >
        <Icon name="NotePencil" color="currentColor" size="large" />
        {intl.formatMessage(messages.correctRecord)}
      </DropdownMenu.Item>
    )
  )
}

const ArchiveAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, intl, isDownloaded, declarationStatus, scope }) => {
  const isArchivable =
    declarationStatus &&
    [
      SUBMISSION_STATUS.IN_PROGRESS,
      SUBMISSION_STATUS.DECLARED,
      SUBMISSION_STATUS.VALIDATED,
      SUBMISSION_STATUS.REJECTED
    ].includes(declarationStatus as SUBMISSION_STATUS)

  // @ToDo use: `record.registration-archive` after configurable role pr is merged
  // @Question: If user has archive scope but not register scope,
  // can he archive validated record?
  const userHasArchiveScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      ((scope as any as string[]).includes('validate') &&
        declarationStatus !== SUBMISSION_STATUS.VALIDATED))

  return (
    isArchivable &&
    userHasArchiveScope && (
      <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
        <Icon name="Archive" color="currentColor" size="large" />
        {intl.formatMessage(messages.archiveRecord)}
      </DropdownMenu.Item>
    )
  )
}

const ReinstateAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isDownloaded, intl, declarationStatus, scope }) => {
  const isArchived = declarationStatus === SUBMISSION_STATUS.ARCHIVED

  // @ToDo use: `record.registration-reinstate` after configurable role pr is merged
  // @Question: If user has reinstate scope but not register scope,
  // can he reinstate validated record?
  const userHasReinstateScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate'))
  return (
    isArchived &&
    userHasReinstateScope && (
      <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
        <Icon name="FileArrowUp" color="currentColor" size="large" />
        {intl.formatMessage(messages.reinstateRecord)}
      </DropdownMenu.Item>
    )
  )
}

const ReviewAction: React.FC<
  IActionItemCommonProps &
    IDeclarationProps & { isDuplicate: boolean; goToPage: typeof goToPage }
> = ({
  declarationId,
  declarationStatus,
  type,
  scope,
  isDownloaded,
  isDuplicate,
  intl,
  goToPage
}) => {
  const isPendingCorrection =
    declarationStatus === EVENT_STATUS.CORRECTION_REQUESTED

  const isReviewableDeclaration =
    declarationStatus &&
    [EVENT_STATUS.DECLARED, EVENT_STATUS.VALIDATED].includes(declarationStatus)

  // @ToDo use: `record.declaration-review` or other appropriate scope after configurable role pr is merged
  const userHasReviewScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate'))

  return isPendingCorrection && userHasReviewScope ? (
    <DropdownMenu.Item
      onClick={() => {
        goToPage(
          REVIEW_CORRECTION,
          declarationId as string,
          'review',
          type as string
        )
      }}
      disabled={!isDownloaded}
    >
      <Icon name="PencilLine" color="currentColor" size="large" />
      {intl.formatMessage(messages.reviewCorrection)}
    </DropdownMenu.Item>
  ) : (
    isReviewableDeclaration && userHasReviewScope && (
      <DropdownMenu.Item
        onClick={() => {
          goToPage(
            REVIEW_EVENT_PARENT_FORM_PAGE,
            declarationId as string,
            'review',
            type as string
          )
        }}
        disabled={!isDownloaded}
      >
        <Icon name="PencilLine" color="currentColor" size="large" />
        {intl.formatMessage(messages.reviewDeclaration, { isDuplicate })}
      </DropdownMenu.Item>
    )
  )
}

const UpdateAction: React.FC<
  IActionItemCommonProps & IDeclarationProps & { goToPage: typeof goToPage }
> = ({
  declarationId,
  declarationStatus,
  type,
  scope,
  isDownloaded,
  intl,
  goToPage
}) => {
  const isUpdatableDeclaration =
    declarationStatus &&
    [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ].includes(declarationStatus)

  // @ToDo use: appropriate scope after configurable role pr is merged
  const userHasUpdateScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate') ||
      ((scope as any as string[]).includes('validate') &&
        declarationStatus === SUBMISSION_STATUS.DRAFT))

  let PAGE_ROUTE: string, PAGE_ID: string

  if (declarationStatus === SUBMISSION_STATUS.DRAFT) {
    PAGE_ID = 'preview'
    if (type === 'birth') {
      PAGE_ROUTE = DRAFT_BIRTH_PARENT_FORM_PAGE
    } else if (type === 'death') {
      PAGE_ROUTE = DRAFT_DEATH_FORM_PAGE
    } else if (type === 'marriage') {
      PAGE_ROUTE = DRAFT_MARRIAGE_FORM_PAGE
    }
  } else {
    PAGE_ROUTE = REVIEW_EVENT_PARENT_FORM_PAGE
    PAGE_ID = 'review'
  }
  return (
    isUpdatableDeclaration &&
    userHasUpdateScope && (
      <DropdownMenu.Item
        onClick={() => {
          goToPage &&
            goToPage(
              PAGE_ROUTE,
              declarationId as string,
              PAGE_ID,
              type as string
            )
        }}
        disabled={!isDownloaded}
      >
        <Icon name="PencilCircle" color="currentColor" size="large" />
        {intl.formatMessage(messages.updateDeclaration)}
      </DropdownMenu.Item>
    )
  )
}

const PrintAction: React.FC<
  IActionItemCommonProps &
    IDeclarationProps & {
      clearCorrectionAndPrintChanges: typeof clearCorrectionAndPrintChanges
      goToPrintCertificate: typeof goToPrintCertificate
    }
> = ({
  declarationId,
  type,
  isDownloaded,
  intl,
  clearCorrectionAndPrintChanges,
  goToPrintCertificate
}) => (
  <DropdownMenu.Item
    onClick={() => {
      clearCorrectionAndPrintChanges(declarationId as string)
      goToPrintCertificate(
        declarationId as string,
        (type as string).toLocaleLowerCase()
      )
    }}
    disabled={!isDownloaded}
  >
    <Icon name="Printer" color="currentColor" size="large" />
    {intl.formatMessage(buttonMessages.print)}
  </DropdownMenu.Item>
)

const IssueAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  isDownloaded,
  intl
}) => {
  const dispatch = useDispatch()
  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))
        dispatch(goToIssueCertificate(declarationId as string))
      }}
      disabled={!isDownloaded}
    >
      <Icon name="Handshake" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.issue)}
    </DropdownMenu.Item>
  )
}

const DeleteAction: React.FC<{
  intl: IntlShape
  handleDelete: () => void
  scope: Scope
}> = ({ intl, handleDelete, scope }) => {
  return (
    <DropdownMenu.Item onClick={handleDelete}>
      <Icon name="Trash" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.deleteDeclaration)}
    </DropdownMenu.Item>
  )
}
