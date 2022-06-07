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

import React from 'react'
import {
  goToPage,
  goToPrintCertificate,
  goToUserProfile,
  goToTeamUserList
} from '@client/navigation'
import { IntlShape } from 'react-intl'
import {
  IDeclaration,
  SUBMISSION_STATUS,
  DOWNLOAD_STATUS
} from '@client/declarations'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { EVENT_STATUS } from '@client/views/OfficeHome/OfficeHome'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { Action } from '@client/forms'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { IUserDetails } from '@client/utils/userUtils'
import { IDeclarationData } from './utils'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'

export type CMethodParams = {
  declaration: IDeclarationData
  intl: IntlShape
  userDetails: IUserDetails | null
  draft: IDeclaration | null
  goToPage?: typeof goToPage
  goToPrintCertificate?: typeof goToPrintCertificate
  goToUserProfile?: typeof goToUserProfile
  goToTeamUserList?: typeof goToTeamUserList
}

export const ShowDownloadButton = ({
  declaration,
  draft,
  userDetails
}: {
  declaration: IDeclarationData
  draft: IDeclaration | null
  userDetails: IUserDetails | null
}) => {
  const { id, type } = declaration || {}

  if (declaration === null || id === null || type === null) return <></>

  const downloadStatus = draft?.downloadStatus || undefined

  if (
    userDetails?.role === 'FIELD_AGENT' &&
    draft?.submissionStatus === SUBMISSION_STATUS.DECLARED
  )
    return <></>
  if (
    draft?.submissionStatus !== SUBMISSION_STATUS.DRAFT &&
    downloadStatus !== DOWNLOAD_STATUS.DOWNLOADED
  ) {
    const downLoadConfig = {
      event: type as string,
      compositionId: id,
      action: Action.LOAD_REVIEW_DECLARATION
    }
    return (
      <DownloadButton
        key={id}
        downloadConfigs={downLoadConfig}
        status={downloadStatus as DOWNLOAD_STATUS}
      />
    )
  }

  return <></>
}

export const ShowUpdateButton = ({
  declaration,
  intl,
  userDetails,
  draft,
  goToPage
}: CMethodParams) => {
  const { id, type } = declaration || {}

  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT
  const role = userDetails ? userDetails.role : ''
  const showActionButton = role
    ? FIELD_AGENT_ROLES.includes(role)
      ? false
      : true
    : false

  if (!showActionButton && !isDownloaded) {
    return <></>
  }

  const updateButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [SUBMISSION_STATUS.DRAFT],
    REGISTRATION_AGENT: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ],
    DISTRICT_REGISTRAR: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ],
    LOCAL_REGISTRAR: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ],
    NATIONAL_REGISTRAR: [
      SUBMISSION_STATUS.DRAFT,
      EVENT_STATUS.IN_PROGRESS,
      EVENT_STATUS.REJECTED
    ]
  }

  if (
    role &&
    type &&
    updateButtonRoleStatusMap[role].includes(declaration?.status as string)
  ) {
    let PAGE_ROUTE: string, PAGE_ID: string

    if (declaration?.status === SUBMISSION_STATUS.DRAFT) {
      PAGE_ID = 'preview'
      if (type.toString() === 'birth') {
        PAGE_ROUTE = DRAFT_BIRTH_PARENT_FORM_PAGE
      } else if (type.toString() === 'death') {
        PAGE_ROUTE = DRAFT_DEATH_FORM_PAGE
      }
    } else {
      PAGE_ROUTE = REVIEW_EVENT_PARENT_FORM_PAGE
      PAGE_ID = 'review'
    }
    if (!isDownloaded) {
      return (
        <PrimaryButton
          key={id}
          id={`update-application-${id}`}
          size={'medium'}
          disabled={true}
        >
          {intl.formatMessage(buttonMessages.update)}
        </PrimaryButton>
      )
    }
    return (
      <PrimaryButton
        key={id}
        id={`update-application-${id}`}
        size={'medium'}
        onClick={() => {
          goToPage && goToPage(PAGE_ROUTE, id, PAGE_ID, type)
        }}
      >
        {intl.formatMessage(buttonMessages.update)}
      </PrimaryButton>
    )
  }

  return <></>
}

export const ShowPrintButton = ({
  declaration,
  intl,
  userDetails,
  draft,
  goToPrintCertificate
}: CMethodParams) => {
  const { id, type } = declaration || {}
  const role = userDetails ? userDetails.role : ''
  const showActionButton = role
    ? FIELD_AGENT_ROLES.includes(role)
      ? false
      : true
    : false
  const isDownloaded =
    draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED ||
    draft?.submissionStatus === SUBMISSION_STATUS.DRAFT

  const printButtonRoleStatusMap: { [key: string]: string[] } = {
    REGISTRATION_AGENT: [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED
    ],
    DISTRICT_REGISTRAR: [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED
    ],
    LOCAL_REGISTRAR: [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED
    ],
    NATIONAL_REGISTRAR: [
      SUBMISSION_STATUS.REGISTERED,
      SUBMISSION_STATUS.CERTIFIED
    ]
  }

  if (
    role &&
    type &&
    role in printButtonRoleStatusMap &&
    printButtonRoleStatusMap[role].includes(declaration?.status as string) &&
    showActionButton
  ) {
    if (!isDownloaded) {
      return (
        <PrimaryButton
          key={id}
          size={'medium'}
          id={`print-${id}`}
          disabled={true}
        >
          {intl.formatMessage(buttonMessages.print)}
        </PrimaryButton>
      )
    }
    return (
      <PrimaryButton
        key={id}
        size={'medium'}
        id={`print-${id}`}
        onClick={() => {
          goToPrintCertificate &&
            goToPrintCertificate(id, type.toLocaleLowerCase())
        }}
      >
        {intl.formatMessage(buttonMessages.print)}
      </PrimaryButton>
    )
  }
  return <></>
}

export const ShowReviewButton = ({
  declaration,
  intl,
  userDetails,
  draft,
  goToPage
}: CMethodParams) => {
  const { id, type } = declaration || {}

  const isDownloaded = draft?.downloadStatus === DOWNLOAD_STATUS.DOWNLOADED
  const role = userDetails ? userDetails.role : ''
  const showActionButton = role
    ? FIELD_AGENT_ROLES.includes(role)
      ? false
      : true
    : false

  const reviewButtonRoleStatusMap: { [key: string]: string[] } = {
    FIELD_AGENT: [],
    REGISTRATION_AGENT: [EVENT_STATUS.DECLARED],
    DISTRICT_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED],
    LOCAL_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED],
    NATIONAL_REGISTRAR: [EVENT_STATUS.VALIDATED, EVENT_STATUS.DECLARED]
  }

  if (
    role &&
    type &&
    role in reviewButtonRoleStatusMap &&
    reviewButtonRoleStatusMap[role].includes(declaration?.status as string) &&
    showActionButton
  ) {
    if (!isDownloaded) {
      return (
        <PrimaryButton
          key={id}
          size={'medium'}
          id={`review-btn-${id}`}
          disabled={true}
        >
          {intl.formatMessage(constantsMessages.review)}
        </PrimaryButton>
      )
    }
    return (
      <PrimaryButton
        key={id}
        size={'medium'}
        id={`review-btn-${id}`}
        onClick={() => {
          goToPage &&
            goToPage(REVIEW_EVENT_PARENT_FORM_PAGE, id, 'review', type)
        }}
      >
        {intl.formatMessage(constantsMessages.review)}
      </PrimaryButton>
    )
  }
  return <></>
}
