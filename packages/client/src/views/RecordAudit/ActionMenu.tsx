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
import { useDispatch, useSelector } from 'react-redux'
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
import { Event, SCOPES } from '@client/utils/gateway'
import { conflictsMessages } from '@client/i18n/messages/views/conflicts'
import {
  canBeCorrected,
  isArchivable,
  isArchived,
  isCertified,
  isPendingCorrection,
  isPrintable,
  isRecordOrDeclaration,
  isReviewableDeclaration,
  isUpdatableDeclaration
} from '@client/declarations/utils'
import ProtectedComponent from '@client/components/ProtectedComponent'
import { usePermissions } from '@client/hooks/useAuthorization'
import { getUserDetails } from '@client/profile/profileSelectors'

export const ActionMenu: React.FC<{
  declaration: IDeclarationData
  draft: IDeclaration | null
  duplicates?: string[]
  toggleDisplayDialog: () => void
}> = ({ declaration, draft, toggleDisplayDialog, duplicates }) => {
  const dispatch = useDispatch()
  const userDetails = useSelector(getUserDetails)
  const [modal, openModal] = useModal()

  const intl = useIntl()

  const { id, type, assignment, status } = declaration

  const assignedToSelf =
    assignment?.practitionerId === userDetails?.practitionerId
  const assignedToOther = !!(
    assignment && assignment?.practitionerId !== userDetails?.practitionerId
  )

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  const isActionable = isDownloaded && assignedToSelf

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
            name={firstName + ' ' + lastName}
            assignedSelf={assignedToSelf}
            officeName={officeName}
          />
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
          {assignment && assignedToOther && (
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
          <ProtectedComponent
            scopes={[
              SCOPES.RECORD_REGISTER,
              SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
              SCOPES.RECORD_SUBMIT_FOR_UPDATES
            ]}
          >
            <ReviewAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable}
              isDuplicate={isDuplicate}
            />
          </ProtectedComponent>
          <ProtectedComponent
            scopes={[
              SCOPES.RECORD_REGISTER,
              SCOPES.RECORD_SUBMIT_FOR_UPDATES,
              SCOPES.RECORD_SUBMIT_FOR_APPROVAL
            ]}
          >
            <UpdateAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={[SCOPES.RECORD_DECLARATION_ARCHIVE]}>
            <ArchiveAction
              toggleDisplayDialog={toggleDisplayDialog}
              isActionable={isActionable}
              declarationStatus={status}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={[SCOPES.RECORD_REGISTRATION_REINSTATE]}>
            <ReinstateAction
              toggleDisplayDialog={toggleDisplayDialog}
              isActionable={isActionable}
              declarationStatus={status}
            />
          </ProtectedComponent>
          <ProtectedComponent
            scopes={[
              SCOPES.RECORD_DECLARATION_PRINT,
              SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES,
              SCOPES.RECORD_BULK_PRINT_CERTIFIED_COPIES,
              SCOPES.RECORD_PRINT_CERTIFIED_COPIES
            ]}
          >
            <PrintAction
              declarationStatus={status}
              declarationId={id}
              type={type}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <ProtectedComponent
            scopes={[SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES]}
          >
            <IssueAction
              declarationStatus={status}
              declarationId={id}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <ProtectedComponent scopes={[SCOPES.RECORD_REGISTRATION_CORRECT]}>
            <CorrectRecordAction
              declarationId={id}
              declarationStatus={status}
              type={type}
              isActionable={isActionable}
            />
          </ProtectedComponent>
          <DeleteAction
            handleDelete={handleDelete}
            declarationStatus={status}
          />
          <UnassignAction
            handleUnassign={handleUnassign}
            assignedOther={assignedToOther}
            assignedSelf={assignedToSelf}
          />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modal}
    </>
  )
}

interface IActionItemCommonProps {
  isActionable: boolean
  declarationStatus?: SUBMISSION_STATUS
}

interface IDeclarationProps {
  declarationId: string
  type?: string
}

const ViewAction: React.FC<{
  declarationStatus?: SUBMISSION_STATUS
  declarationId: string
}> = ({ declarationStatus, declarationId }) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(goToViewRecordPage(declarationId))
      }}
    >
      <Icon name="Eye" color="currentColor" size="large" />
      {intl.formatMessage(messages.view, {
        recordOrDeclaration: isRecordOrDeclaration(declarationStatus)
      })}
    </DropdownMenu.Item>
  )
}

const CorrectRecordAction: React.FC<
  IActionItemCommonProps & IDeclarationProps
> = ({ declarationId, declarationStatus, type, isActionable }) => {
  const dispatch = useDispatch()
  const intl = useIntl()

  const isBirthOrDeathEvent =
    type && [Event.Birth, Event.Death].includes(type as Event)

  if (!isBirthOrDeathEvent || !canBeCorrected(declarationStatus)) {
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
      disabled={!isActionable}
    >
      <Icon name="NotePencil" color="currentColor" size="large" />
      {intl.formatMessage(messages.correctRecord)}
    </DropdownMenu.Item>
  )
}

const ArchiveAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isActionable, declarationStatus }) => {
  const intl = useIntl()
  if (!isArchivable(declarationStatus)) return null

  return (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isActionable}>
      <Icon name="Archive" color="currentColor" size="large" />
      {intl.formatMessage(messages.archiveRecord)}
    </DropdownMenu.Item>
  )
}

const ReinstateAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isActionable, declarationStatus }) => {
  const intl = useIntl()
  if (!isArchived(declarationStatus)) return null

  return (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isActionable}>
      <Icon name="FileArrowUp" color="currentColor" size="large" />
      {intl.formatMessage(messages.reinstateRecord)}
    </DropdownMenu.Item>
  )
}

const ReviewAction: React.FC<
  IActionItemCommonProps & IDeclarationProps & { isDuplicate: boolean }
> = ({ declarationId, declarationStatus, type, isActionable, isDuplicate }) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  return isPendingCorrection(declarationStatus) ? (
    <DropdownMenu.Item
      onClick={() => {
        type &&
          dispatch(goToPage(REVIEW_CORRECTION, declarationId, 'review', type))
      }}
      disabled={!isActionable}
    >
      <Icon name="PencilLine" color="currentColor" size="large" />
      {intl.formatMessage(messages.reviewCorrection)}
    </DropdownMenu.Item>
  ) : isReviewableDeclaration(declarationStatus) ? (
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
      disabled={!isActionable}
    >
      <Icon name="PencilLine" color="currentColor" size="large" />
      {intl.formatMessage(messages.reviewDeclaration, { isDuplicate })}
    </DropdownMenu.Item>
  ) : null
}

const UpdateAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  declarationStatus,
  type,
  isActionable
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

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

  if (!isUpdatableDeclaration(declarationStatus)) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(
          goToPage(PAGE_ROUTE, declarationId as string, PAGE_ID, type as string)
        )
      }}
      disabled={!isActionable}
    >
      <Icon name="PencilCircle" color="currentColor" size="large" />
      {intl.formatMessage(messages.updateDeclaration)}
    </DropdownMenu.Item>
  )
}

const PrintAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  declarationStatus,
  type,
  isActionable
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  if (!isPrintable(declarationStatus)) return null

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
      disabled={!isActionable}
    >
      <Icon name="Printer" color="currentColor" size="large" />
      {intl.formatMessage(messages.printDeclaration)}
    </DropdownMenu.Item>
  )
}

const IssueAction: React.FC<IActionItemCommonProps & IDeclarationProps> = ({
  declarationId,
  isActionable,
  declarationStatus
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()

  if (!isCertified(declarationStatus)) return null

  return (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(declarationId as string))
        dispatch(goToIssueCertificate(declarationId as string))
      }}
      disabled={!isActionable}
    >
      <Icon name="Handshake" color="currentColor" size="large" />
      {intl.formatMessage(messages.issueCertificate)}
    </DropdownMenu.Item>
  )
}

const DeleteAction: React.FC<{
  handleDelete: () => void
  declarationStatus?: SUBMISSION_STATUS
}> = ({ handleDelete, declarationStatus }) => {
  const intl = useIntl()
  if (declarationStatus !== SUBMISSION_STATUS.DRAFT) return null
  return (
    <DropdownMenu.Item onClick={handleDelete}>
      <Icon name="Trash" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.deleteDeclaration)}
    </DropdownMenu.Item>
  )
}
const UnassignAction: React.FC<{
  handleUnassign: () => void
  assignedOther: boolean
  assignedSelf: boolean
}> = ({ handleUnassign, assignedOther, assignedSelf }) => {
  const { hasScope } = usePermissions()
  const intl = useIntl()

  if (
    !assignedSelf &&
    (!assignedOther || !hasScope(SCOPES.RECORD_UNASSIGN_OTHERS))
  )
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
  assignedSelf: boolean
  name: string
  officeName?: string | null
}> = ({ close, assignedSelf, name, officeName }) => {
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
      {assignedSelf
        ? intl.formatMessage(conflictsMessages.selfUnassignDesc)
        : intl.formatMessage(conflictsMessages.regUnassignDesc, {
            name,
            officeName
          })}
    </ResponsiveModal>
  )
}
