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

import { useSelector } from 'react-redux'
import { getScope, getUserDetails } from '@client/profile/profileSelectors'
import { Scope, User, Location, SCOPES } from '@client/utils/gateway'
import { SUBMISSION_STATUS } from '@client/declarations'
import {
  canBeCorrected,
  canBeReinstated,
  isArchivable,
  isIssuable,
  isPrintable,
  isReviewableDeclaration,
  isUpdatableDeclaration
} from '@client/declarations/utils'

export function usePermissions() {
  const userScopes = useSelector(getScope)
  const userPrimaryOffice = useSelector(getUserDetails)?.primaryOffice

  const hasScopes = (neededScopes: Scope[]) =>
    neededScopes.every((scope) => userScopes?.includes(scope))

  const hasAnyScope = (neededScopes: Scope[]) =>
    neededScopes.length === 0 ||
    neededScopes.some((scope) => userScopes?.includes(scope))

  const hasScope = (neededScope: Scope) => hasAnyScope([neededScope])

  const canReadUser = (user: Pick<User, 'primaryOffice'>) => {
    if (hasScope(SCOPES.USER_READ)) return true
    if (hasScope(SCOPES.USER_READ_MY_OFFICE))
      return user.primaryOffice.id === userPrimaryOffice?.id

    return false
  }

  const canEditUser = (user: Pick<User, 'primaryOffice'>) => {
    if (hasScope(SCOPES.USER_UPDATE)) return true
    if (hasScope(SCOPES.USER_UPDATE_MY_JURISDICTION))
      return user.primaryOffice.id === userPrimaryOffice?.id

    return false
  }

  const canReadOfficeUsers = (office: Pick<Location, 'id'>) => {
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS)) return true
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE))
      return office.id === userPrimaryOffice?.id

    return false
  }

  const canAddOfficeUsers = (office: Pick<Location, 'id'>) => {
    if (hasScope(SCOPES.USER_CREATE)) return true
    if (hasScope(SCOPES.USER_CREATE_MY_JURISDICTION))
      return office.id === userPrimaryOffice?.id

    return false
  }

  const canUpdateRecord = () =>
    hasAnyScope([
      SCOPES.RECORD_REGISTER,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL
    ])

  const canReviewRecord = () =>
    hasAnyScope([
      SCOPES.REGISTER,
      SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
      SCOPES.RECORD_SUBMIT_FOR_UPDATES
    ])

  const canPrintRecord = () =>
    hasScope(SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES)

  const canIssueRecord = () =>
    hasScope(SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES)

  const canCorrectRecord = () =>
    hasAnyScope([
      SCOPES.RECORD_REGISTRATION_CORRECT,
      SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
    ])

  const canArchiveRecord = () => hasScope(SCOPES.RECORD_DECLARATION_ARCHIVE)

  const canReinstateRecord = () => hasScope(SCOPES.RECORD_DECLARATION_REINSTATE)

  const isRecordActionable = (status: SUBMISSION_STATUS) =>
    [
      canUpdateRecord() && isUpdatableDeclaration(status),
      canReviewRecord() && isReviewableDeclaration(status),
      canPrintRecord() && isPrintable(status),
      canIssueRecord() && isIssuable(status),
      canCorrectRecord() && canBeCorrected(status),
      canArchiveRecord() && isArchivable(status),
      canReinstateRecord() && canBeReinstated(status)
    ]
      .map((p) => Boolean(p))
      .some((p) => p)

  return {
    hasScopes,
    hasScope,
    hasAnyScope,
    isRecordActionable,
    canPrintRecord,
    canIssueRecord,
    canReadUser,
    canEditUser,
    canReadOfficeUsers,
    canAddOfficeUsers
  }
}
