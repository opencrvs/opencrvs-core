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
  goToPage: typeof goToPage
  goToPrintCertificate: typeof goToPrintCertificate
}> = ({
  declaration,
  intl,
  scope,
  draft,
  userDetails,
  toggleDisplayDialog,
  goToPage,
  goToPrintCertificate
}) => {
  const dispatch = useDispatch()
  const [modal, openModal] = useModal()

  const { id, type, assignment } = declaration

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  const recordOrDeclaration = [
    SUBMISSION_STATUS.REGISTERED,
    SUBMISSION_STATUS.CORRECTION_REQUESTED,
    SUBMISSION_STATUS.CERTIFIED
  ].includes(declaration.status as any as SUBMISSION_STATUS)
    ? 'record'
    : 'declaration'

  const ViewAction = () => (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(goToViewRecordPage(id as string))
      }}
    >
      <Icon name="Eye" color="currentColor" size="large" />
      {intl.formatMessage(messages.view, { recordOrDeclaration })}
    </DropdownMenu.Item>
  )

  const CorrectRecordAction = () => (
    <DropdownMenu.Item
      onClick={() => {
        clearCorrectionAndPrintChanges(id)
        goToCertificateCorrection(id, CorrectionSection.Corrector)
      }}
      disabled={!isDownloaded}
    >
      <Icon name="NotePencil" color="currentColor" size="large" />
      {intl.formatMessage(messages.correctRecord)}
    </DropdownMenu.Item>
  )

  const ArchiveAction = () => (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
      <Icon name="Archive" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.archive)}
    </DropdownMenu.Item>
  )

  const ReinstateAction = () => (
    <DropdownMenu.Item onClick={toggleDisplayDialog} disabled={!isDownloaded}>
      <Icon name="FileArrowUp" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.reinstate)}
    </DropdownMenu.Item>
  )

  const ReviewAction = () => {
    return (
      <DropdownMenu.Item
        onClick={() => {
          if (declaration.status === EVENT_STATUS.CORRECTION_REQUESTED) {
            goToPage(REVIEW_CORRECTION, id, 'review', type!)
          } else {
            goToPage(REVIEW_EVENT_PARENT_FORM_PAGE, id, 'review', type!)
          }
        }}
        disabled={!isDownloaded}
      >
        <Icon name="PencilLine" color="currentColor" size="large" />
        {intl.formatMessage(constantsMessages.review)}
      </DropdownMenu.Item>
    )
  }

  const DeleteAction = () => {
    return (
      <DropdownMenu.Item
        onClick={async () => {
          const deleteConfirm = await openModal<boolean | null>((close) => (
            <DeleteModal intl={intl} close={close}></DeleteModal>
          ))
          if (deleteConfirm) {
            dispatch(deleteDeclaration(declaration.id, client))
            dispatch(goToHome())
          }
          return
        }}
      >
        <Icon name="Trash" color="currentColor" size="large" />
        {intl.formatMessage(buttonMessages.deleteDeclaration)}
      </DropdownMenu.Item>
    )
  }

  const UpdateAction = () => {
    let PAGE_ROUTE: string, PAGE_ID: string

    if (declaration?.status === SUBMISSION_STATUS.DRAFT) {
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
          goToPage && goToPage(PAGE_ROUTE, id, PAGE_ID, type as string)
        }}
        disabled={!isDownloaded}
      >
        <Icon name="PencilCircle" color="currentColor" size="large" />
        {intl.formatMessage(buttonMessages.update)}
      </DropdownMenu.Item>
    )
  }

  const PrintAction = () => (
    <DropdownMenu.Item
      onClick={() => {
        clearCorrectionAndPrintChanges &&
          clearCorrectionAndPrintChanges(declaration.id)
        goToPrintCertificate &&
          goToPrintCertificate(id, (type as string).toLocaleLowerCase())
      }}
      disabled={!isDownloaded}
    >
      <Icon name="Printer" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.print)}
    </DropdownMenu.Item>
  )

  const IssueAction = () => (
    <DropdownMenu.Item
      onClick={() => {
        dispatch(clearCorrectionAndPrintChanges(id))
        dispatch(goToIssueCertificate(id))
      }}
      disabled={!isDownloaded}
    >
      <Icon name="Handshake" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.issue)}
    </DropdownMenu.Item>
  )

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
          <ViewAction />
          <CorrectRecordAction />
          <ArchiveAction />
          <ReinstateAction />
          <ReviewAction />
          <UpdateAction />
          <PrintAction />
          <IssueAction />
          <DeleteAction />
        </DropdownMenu.Content>
      </DropdownMenu>
      {modal}
    </>
  )
}
