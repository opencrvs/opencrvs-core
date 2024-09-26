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

export const ActionMenu: React.FC<{
  declaration: IDeclarationData
  intl: IntlShape
  scope: Scope | null
  draft: IDeclaration | null
  userDetails: UserDetails | null
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
  goToIssueCertificate
}) => {
  const dispatch = useDispatch()
  const [modal, openModal] = useModal()

  const { id, type, assignment, status } = declaration

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

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
            isDownloaded={isDownloaded}
            intl={intl}
          />
          <ArchiveAction
            toggleDisplayDialog={toggleDisplayDialog}
            isDownloaded={isDownloaded}
            intl={intl}
          />
          <ReinstateAction
            toggleDisplayDialog={toggleDisplayDialog}
            isDownloaded={isDownloaded}
            intl={intl}
          />
          <ReviewAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            goToPage={goToPage}
          />
          <UpdateAction
            declarationId={id}
            declarationStatus={status}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            goToPage={goToPage}
          />
          <PrintAction
            declarationId={id}
            type={type}
            isDownloaded={isDownloaded}
            intl={intl}
            clearCorrectionAndPrintChanges={clearCorrectionAndPrintChanges}
            goToPrintCertificate={goToPrintCertificate}
          />
          <IssueAction
            declarationId={id}
            isDownloaded={isDownloaded}
            intl={intl}
          />
          <DeleteAction handleDelete={handleDelete} intl={intl} />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modal}
    </>
  )
}

interface IActionItemCommonProps {
  isDownloaded: boolean
  intl: IntlShape
}

interface IDeclarationProps {
  declarationId: string
  type?: string
  declarationStatus?: string
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
> = ({ declarationId, isDownloaded, intl }) => {
  const dispatch = useDispatch()
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
> = ({ toggleDisplayDialog, intl, isDownloaded }) => (
  <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
    <Icon name="Archive" color="currentColor" size="large" />
    {intl.formatMessage(buttonMessages.archive)}
  </DropdownMenu.Item>
)

const ReinstateAction: React.FC<
  IActionItemCommonProps & { toggleDisplayDialog?: () => void }
> = ({ toggleDisplayDialog, isDownloaded, intl }) => (
  <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
    <Icon name="FileArrowUp" color="currentColor" size="large" />
    {intl.formatMessage(buttonMessages.reinstate)}
  </DropdownMenu.Item>
)

const ReviewAction: React.FC<
  IActionItemCommonProps & IDeclarationProps & { goToPage: typeof goToPage }
> = ({
  declarationId,
  declarationStatus,
  type,
  isDownloaded,
  intl,
  goToPage
}) => {
  return (
    <DropdownMenu.Item
      onClick={() => {
        if (declarationStatus === EVENT_STATUS.CORRECTION_REQUESTED) {
          goToPage(
            REVIEW_CORRECTION,
            declarationId as string,
            'review',
            type as string
          )
        } else {
          goToPage(
            REVIEW_EVENT_PARENT_FORM_PAGE,
            declarationId as string,
            'review',
            type as string
          )
        }
      }}
      disabled={!isDownloaded}
    >
      <Icon name="PencilLine" color="currentColor" size="large" />
      {intl.formatMessage(constantsMessages.review)}
    </DropdownMenu.Item>
  )
}

const UpdateAction: React.FC<
  IActionItemCommonProps & IDeclarationProps & { goToPage: typeof goToPage }
> = ({
  declarationId,
  declarationStatus,
  type,
  isDownloaded,
  intl,
  goToPage
}) => {
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
    <DropdownMenu.Item
      onClick={() => {
        goToPage &&
          goToPage(PAGE_ROUTE, declarationId as string, PAGE_ID, type as string)
      }}
      disabled={!isDownloaded}
    >
      <Icon name="PencilCircle" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.update)}
    </DropdownMenu.Item>
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
}> = ({ intl, handleDelete }) => {
  return (
    <DropdownMenu.Item onClick={handleDelete}>
      <Icon name="Trash" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.deleteDeclaration)}
    </DropdownMenu.Item>
  )
}
