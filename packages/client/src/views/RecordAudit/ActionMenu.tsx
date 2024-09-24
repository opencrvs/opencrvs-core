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
  goToPage,
  goToViewRecordPage
} from '@client/navigation'
import { IntlShape } from 'react-intl'
import { Scope } from '@sentry/react'
import { IDeclarationData } from './utils'
import {
  clearCorrectionAndPrintChanges,
  IDeclaration,
  SUBMISSION_STATUS
} from '@client/declarations'
import { CorrectionSection } from '@client/forms'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { UserDetails } from '@client/utils/userUtils'
import { EVENT_STATUS } from '@client/workqueue'
import {
  REVIEW_CORRECTION,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { messages } from '@client/i18n/messages/views/action'

export const ActionMenu: React.FC<{
  declaration: IDeclarationData
  intl: IntlShape
  scope: Scope | null
  draft: IDeclaration | null
  userDetails: UserDetails | null
  toggleDisplayDialog: () => void
  goToPage: typeof goToPage
}> = ({
  declaration,
  intl,
  scope,
  draft,
  userDetails,
  toggleDisplayDialog,
  goToPage
}) => {
  const dispatch = useDispatch()

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
        dispatch(goToViewRecordPage(declaration.id as string))
      }}
    >
      <Icon name="Eye" color="currentColor" size="large" />
      {intl.formatMessage(messages.view, { recordOrDeclaration })}
    </DropdownMenu.Item>
  )

  const CorrectRecordAction = () => (
    <DropdownMenu.Item
      onClick={() => {
        clearCorrectionAndPrintChanges(declaration.id)
        goToCertificateCorrection(declaration.id, CorrectionSection.Corrector)
      }}
    >
      <Icon name="NotePencil" color="currentColor" size="large" />
      {intl.formatMessage(messages.correctRecord)}
    </DropdownMenu.Item>
  )

  const ArchiveAction = () => (
    <DropdownMenu.Item onClick={toggleDisplayDialog}>
      <Icon name="Archive" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.archive)}
    </DropdownMenu.Item>
  )

  const ReinstateAction = () => (
    <DropdownMenu.Item onClick={toggleDisplayDialog}>
      <Icon name="FileArrowUp" color="currentColor" size="large" />
      {intl.formatMessage(buttonMessages.reinstate)}
    </DropdownMenu.Item>
  )

  const ReviewAction = () => {
    const { id, type } = declaration
    return (
      <DropdownMenu.Item
        onClick={() => {
          if (declaration.status === EVENT_STATUS.CORRECTION_REQUESTED) {
            goToPage(REVIEW_CORRECTION, id, 'review', type!)
          } else {
            goToPage(REVIEW_EVENT_PARENT_FORM_PAGE, id, 'review', type!)
          }
        }}
      >
        <Icon name="PencilLine" color="currentColor" size="large" />
        {intl.formatMessage(constantsMessages.review)}
      </DropdownMenu.Item>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <PrimaryButton icon={() => <CaretDown />}> Action</PrimaryButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <ViewAction />
        <CorrectRecordAction />
        <ArchiveAction />
        <ReinstateAction />
        <ReviewAction />
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
