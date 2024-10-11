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
import {
  DangerButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'
import { useDispatch } from 'react-redux'
import { Icon, ResponsiveModal } from '@opencrvs/components'
import {
  goToCertificateCorrection,
  goToHome,
  goToIssueCertificate,
  goToPage,
  goToPrintCertificate,
  goToViewRecordPage
} from '@client/navigation'
import { useIntl } from 'react-intl'
import { Scope } from '@sentry/react'
import { IDeclarationData } from './utils'
import {
  clearCorrectionAndPrintChanges,
  deleteDeclaration,
  DOWNLOAD_STATUS,
  IDeclaration,
  SUBMISSION_STATUS,
  unassignDeclaration
} from '@client/declarations'
import { CorrectionSection } from '@client/forms'
import { buttonMessages } from '@client/i18n/messages'
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
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import { GQLAssignmentData } from '@client/utils/gateway-deprecated-do-not-use'

export const ActionMenu: React.FC<{
  declaration: IDeclarationData
  scope: Scope
  draft: IDeclaration | null
  duplicates?: string[]
  toggleDisplayDialog: () => void
}> = ({ declaration, scope, draft, toggleDisplayDialog, duplicates }) => {
  const dispatch = useDispatch()
  const [modal, openModal] = useModal()

  const intl = useIntl()

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
  const handleUnassign = async () => {
    const { firstName, lastName, officeName } = assignment || {}
    const unassignConfirm = await openModal<boolean | null>(
      (close) =>
        assignment && (
          <UnassignModal
            close={close}
            isDownloaded={isDownloaded}
            name={firstName + ' ' + lastName}
            officeName={officeName}
          ></UnassignModal>
        )
    )
    if (unassignConfirm) {
      dispatch(unassignDeclaration(id, client))
    }
    return
  }

  return (
    <>
      <DropdownMenu id="action">
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
          <ViewAction declarationId={id} declarationStatus={status} />
          <ReviewAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            scope={scope}
            isDuplicate={isDuplicate}
          />
          <UpdateAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            scope={scope}
          />
          <ArchiveAction
            toggleDisplayDialog={toggleDisplayDialog}
            isDownloaded={isDownloaded}
            scope={scope}
            declarationStatus={status}
          />
          <ReinstateAction
            toggleDisplayDialog={toggleDisplayDialog}
            isDownloaded={isDownloaded}
            scope={scope}
            declarationStatus={status}
          />
          <PrintAction
            declarationStatus={status}
            declarationId={id}
            type={type}
            isDownloaded={isDownloaded}
            scope={scope}
          />
          <IssueAction
            declarationStatus={status}
            declarationId={id}
            isDownloaded={isDownloaded}
            scope={scope}
          />
          <CorrectRecordAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            scope={scope}
          />
          <DeleteAction
            handleDelete={handleDelete}
            declarationStatus={status}
          />
          <UnassignAction
            handleUnassign={handleUnassign}
            isDownloaded={isDownloaded}
            scope={scope}
            assignment={assignment}
          />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modal}
    </>
  )
}

interface IActionItemCommonProps {
  isDownloaded: boolean
  scope: Scope
  declarationStatus?: string
}

interface IDeclarationProps {
  declarationId: string
  type?: string
}

const ViewAction: React.FC<{
  declarationStatus?: string
  declarationId: string
}> = ({ declarationStatus, declarationId }) => {
  const intl = useIntl()
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
        dispatch(goToViewRecordPage(declarationId))
      }}
    >
      <Icon name="Eye" color="currentColor" size="large" />
      {intl.formatMessage(messages.view, { recordOrDeclaration })}
    </DropdownMenu.Item>
  )
}

const CorrectRecordAction: React.FC<
  IActionItemCommonProps & IDeclarationProps
> = ({ declarationId, declarationStatus, type, isDownloaded, scope }) => {
  const dispatch = useDispatch()
  const intl = useIntl()

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
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate'))

  if (!isBirthOrDeathEvent || !canBeCorrected || !userHasRegisterScope) {
    return null
  }

  return (
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
}

const ArchiveAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isDownloaded, declarationStatus, scope }) => {
  const intl = useIntl()
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

  if (!isArchivable || !userHasArchiveScope) return null

  return (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
      <Icon name="Archive" color="currentColor" size="large" />
      {intl.formatMessage(messages.archiveRecord)}
    </DropdownMenu.Item>
  )
}

const ReinstateAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isDownloaded, declarationStatus, scope }) => {
  const intl = useIntl()
  const isArchived = declarationStatus === SUBMISSION_STATUS.ARCHIVED

  // @ToDo use: `record.registration-reinstate` after configurable role pr is merged
  // @Question: If user has reinstate scope but not register scope,
  // can he reinstate validated record?
  const userHasReinstateScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate'))

  if (!isArchived || !userHasReinstateScope) return null

  return (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
      <Icon name="FileArrowUp" color="currentColor" size="large" />
      {intl.formatMessage(messages.reinstateRecord)}
    </DropdownMenu.Item>
  )
}

const ReviewAction: React.FC<
  IActionItemCommonProps & IDeclarationProps & { isDuplicate: boolean }
> = ({
  declarationId,
  declarationStatus,
  type,
  scope,
  isDownloaded,
  isDuplicate
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

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

  if (!userHasReviewScope) return null

  return isPendingCorrection ? (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(
          goToPage(
            REVIEW_CORRECTION,
            declarationId as string,
            'review',
            type as string
          )
        )
      }}
      disabled={!isDownloaded}
    >
      <Icon name="PencilLine" color="currentColor" size="large" />
      {intl.formatMessage(messages.reviewCorrection)}
    </DropdownMenu.Item>
  ) : (
    isReviewableDeclaration && (
      <DropdownMenu.Item
        onClick={() => {
          dispatch(
            goToPage(
              REVIEW_EVENT_PARENT_FORM_PAGE,
              declarationId as string,
              'review',
              type as string
            )
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

const UpdateAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  declarationStatus,
  type,
  scope,
  isDownloaded
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

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

  if (!isUpdatableDeclaration || !userHasUpdateScope) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(
          goToPage(PAGE_ROUTE, declarationId as string, PAGE_ID, type as string)
        )
      }}
      disabled={!isDownloaded}
    >
      <Icon name="PencilCircle" color="currentColor" size="large" />
      {intl.formatMessage(messages.updateDeclaration)}
    </DropdownMenu.Item>
  )
}

const PrintAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  declarationStatus,
  scope,
  type,
  isDownloaded
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  const isPrintable =
    declarationStatus &&
    [SUBMISSION_STATUS.REGISTERED, SUBMISSION_STATUS.ISSUED].includes(
      declarationStatus as SUBMISSION_STATUS
    )

  // @ToDo use: `record.print-records` or other appropriate scope after configurable role pr is merged
  const userHasPrintScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate'))

  if (!isPrintable || !userHasPrintScope) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))
        dispatch(
          goToPrintCertificate(
            declarationId as string,
            (type as string).toLocaleLowerCase()
          )
        )
      }}
      disabled={!isDownloaded}
    >
      <Icon name="Printer" color="currentColor" size="large" />
      {intl.formatMessage(messages.printDeclaration)}
    </DropdownMenu.Item>
  )
}

const IssueAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  isDownloaded,
  declarationStatus,
  scope
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  const isCertified = declarationStatus === SUBMISSION_STATUS.CERTIFIED

  // @ToDo use: `record.print-issue-certified-copies` or other appropriate scope after configurable role pr is merged
  const userHasIssueScope =
    scope &&
    ((scope as any as string[]).includes('register') ||
      (scope as any as string[]).includes('validate'))

  if (!isCertified || !userHasIssueScope) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))
        dispatch(goToIssueCertificate(declarationId as string))
      }}
      disabled={!isDownloaded}
    >
      <Icon name="Handshake" color="currentColor" size="large" />
      {intl.formatMessage(messages.issueCertificate)}
    </DropdownMenu.Item>
  )
}

const DeleteAction: React.FC<{
  handleDelete: () => void
  declarationStatus?: string
}> = ({ handleDelete, declarationStatus }) => {
  const intl = useIntl()
  return (
    declarationStatus === SUBMISSION_STATUS.DRAFT && (
      <DropdownMenu.Item onClick={handleDelete}>
        <Icon name="Trash" color="currentColor" size="large" />
        {intl.formatMessage(buttonMessages.deleteDeclaration)}
      </DropdownMenu.Item>
    )
  )
}
const UnassignAction: React.FC<{
  handleUnassign: () => void
  isDownloaded: boolean
  assignment?: GQLAssignmentData
  scope: Scope
}> = ({ handleUnassign, isDownloaded, assignment, scope }) => {
  const intl = useIntl()
  const isAssignedToSomeoneElse = !isDownloaded && assignment

  // @ToDo use: appropriate scope after configurable role pr is merged
  const userHasUnassignScope =
    scope && (scope as any as string[]).includes('register')

  if (!isDownloaded && (!isAssignedToSomeoneElse || !userHasUnassignScope))
    return null

  return (
    <DropdownMenu.Item onClick={handleUnassign}>
      <Icon name="ArrowCircleDown" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.unassign)}
    </DropdownMenu.Item>
  )
}

const UnassignModal: React.FC<{
  close: (result: boolean | null) => void
  isDownloaded: boolean
  name: string
  officeName?: string
}> = ({ close, isDownloaded, name, officeName }) => {
  const intl = useIntl()
  return (
    <ResponsiveModal
      autoHeight
      responsive={false}
      title={intl.formatMessage(conflictsMessages.unassignTitle)}
      actions={[
        <TertiaryButton
          id="cancel_unassign"
          key="cancel_unassign"
          onClick={() => {
            close(null)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <DangerButton
          key="confirm_unassign"
          id="confirm_unassign"
          onClick={() => {
            close(true)
          }}
        >
          {intl.formatMessage(buttonMessages.unassign)}
        </DangerButton>
      ]}
      show={true}
      handleClose={() => close(null)}
    >
      {isDownloaded
        ? intl.formatMessage(conflictsMessages.selfUnassignDesc)
        : intl.formatMessage(conflictsMessages.regUnassignDesc, {
            name,
            officeName
          })}
    </ResponsiveModal>
  )
}
