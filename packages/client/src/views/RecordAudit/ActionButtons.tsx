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
  DOWNLOAD_STATUS,
  clearCorrectionAndPrintChanges
} from '@client/declarations'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { EVENT_STATUS } from '@client/workqueue'
import { DownloadButton } from '@client/components/interface/DownloadButton'
import {
  DRAFT_BIRTH_PARENT_FORM_PAGE,
  DRAFT_DEATH_FORM_PAGE,
  REVIEW_EVENT_PARENT_FORM_PAGE
} from '@client/navigation/routes'
import { DownloadAction } from '@client/forms'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { RoleType } from '@client/utils/gateway'
import { IDeclarationData } from './utils'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'
import { InternalRefetchQueriesInclude } from '@apollo/client'
import { FETCH_DECLARATION_SHORT_INFO } from '@client/views/RecordAudit/queries'
import { UserDetails } from '@client/utils/userUtils'

export type CMethodParams = {
  declaration: IDeclarationData
  intl: IntlShape
  userDetails: UserDetails | null
  draft: IDeclaration | null
  clearCorrectionAndPrintChanges?: typeof clearCorrectionAndPrintChanges
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
  userDetails: UserDetails | null
}) => {
  const { id, type } = declaration || {}

  if (declaration === null || id === null || type === null) return <></>

  const downloadStatus = draft?.downloadStatus || undefined
  let refetchQueries: InternalRefetchQueriesInclude = []
  if (
    userDetails?.systemRole === 'FIELD_AGENT' &&
    draft?.submissionStatus === SUBMISSION_STATUS.DECLARED
  )
    return <></>

  if (
    declaration.assignment &&
    (userDetails?.systemRole === RoleType.LocalRegistrar ||
      userDetails?.systemRole === RoleType.NationalRegistrar)
  ) {
    refetchQueries = [
      { query: FETCH_DECLARATION_SHORT_INFO, variables: { id: declaration.id } }
    ]
  }
  if (draft?.submissionStatus !== SUBMISSION_STATUS.DRAFT) {
    const downLoadConfig = {
      event: type as string,
      compositionId: id,
      action: DownloadAction.LOAD_REVIEW_DECLARATION,
      assignment: declaration?.assignment,
      declarationStatus: declaration.status,
      refetchQueries
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
  const systemRole = userDetails ? userDetails.systemRole : ''
  const showActionButton = systemRole
    ? FIELD_AGENT_ROLES.includes(systemRole)
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
    systemRole &&
    type &&
    updateButtonRoleStatusMap[systemRole].includes(
      declaration?.status as string
    )
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
  goToPrintCertificate,
  clearCorrectionAndPrintChanges
}: CMethodParams) => {
  const { id, type } = declaration || {}
  const systemRole = userDetails ? userDetails.systemRole : ''
  const showActionButton = systemRole
    ? FIELD_AGENT_ROLES.includes(systemRole)
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
    systemRole &&
    type &&
    systemRole in printButtonRoleStatusMap &&
    printButtonRoleStatusMap[systemRole].includes(
      declaration?.status as string
    ) &&
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
          clearCorrectionAndPrintChanges &&
            clearCorrectionAndPrintChanges(declaration.id)
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
  const systemRole = userDetails ? userDetails.systemRole : ''
  const showActionButton = systemRole
    ? FIELD_AGENT_ROLES.includes(systemRole)
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
    systemRole &&
    type &&
    systemRole in reviewButtonRoleStatusMap &&
    reviewButtonRoleStatusMap[systemRole].includes(
      declaration?.status as string
    ) &&
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
