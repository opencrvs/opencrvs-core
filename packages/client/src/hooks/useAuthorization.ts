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
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { User, Location } from '@client/utils/gateway'
import { SUBMISSION_STATUS } from '@client/declarations'
import {
  canBeCorrected,
  canBeReinstated,
  isArchivable,
  isIssuable,
  isPendingCorrection,
  isPrintable,
  isReviewableDeclaration,
  isUpdatableDeclaration
} from '@client/declarations/utils'
import { isUnderJurisdiction } from '@client/utils/locationUtils'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'

export const RECORD_ALLOWED_SCOPES = {
  UPDATE: [
    SCOPES.RECORD_REGISTER,
    SCOPES.RECORD_SUBMIT_FOR_UPDATES,
    SCOPES.RECORD_SUBMIT_FOR_APPROVAL
  ],
  REVIEW: [
    SCOPES.RECORD_REGISTER,
    SCOPES.RECORD_SUBMIT_FOR_APPROVAL,
    SCOPES.RECORD_SUBMIT_FOR_UPDATES,
    SCOPES.RECORD_REVIEW_DUPLICATES
  ],
  PRINT: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES],
  ISSUE: [SCOPES.RECORD_PRINT_ISSUE_CERTIFIED_COPIES],
  CORRECT: [
    SCOPES.RECORD_REGISTRATION_CORRECT,
    SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
  ],
  ARCHIVE: [SCOPES.RECORD_DECLARATION_ARCHIVE],
  REINSTATE: [SCOPES.RECORD_DECLARATION_REINSTATE],
  REVIEW_CORRECTION: [SCOPES.RECORD_REGISTRATION_CORRECT]
}

export function usePermissions() {
  const userScopes = useSelector(getScope)
  const userPrimaryOffice = useSelector(getUserDetails)?.primaryOffice
  const locations = useSelector(getOfflineData).locations
  const offices = useSelector(getOfflineData).offices
  const roles = useSelector((store: IStoreState) => store.userForm.userRoles)

  const roleScopes = (role: string) =>
    roles.find(({ id }) => id === role)?.scopes ?? []

  const hasScopes = (neededScopes: Scope[]) =>
    neededScopes.every((scope) => userScopes?.includes(scope))

  const hasAnyScope = (neededScopes: Scope[]) =>
    neededScopes.length === 0 ||
    neededScopes.some((scope) => userScopes?.includes(scope))

  const hasScope = (neededScope: Scope) => hasAnyScope([neededScope])

  const canReadUser = (user: Pick<User, 'primaryOffice'>) => {
    if (!userPrimaryOffice?.id) {
      return false
    }
    if (hasScope(SCOPES.USER_READ)) {
      return true
    }
    if (hasScope(SCOPES.USER_READ_MY_OFFICE)) {
      return user.primaryOffice.id === userPrimaryOffice?.id
    }
    if (hasScope(SCOPES.USER_READ_MY_JURISDICTION)) {
      return isUnderJurisdiction(
        userPrimaryOffice.id,
        user.primaryOffice.id,
        locations,
        offices
      )
    }

    return false
  }

  const canEditUser = (
    user: Pick<User, 'primaryOffice'> & { role: { id: string } }
  ) => {
    if (!userPrimaryOffice?.id) {
      return false
    }
    if (hasScope(SCOPES.USER_UPDATE)) {
      return true
    }
    if (hasScope(SCOPES.USER_UPDATE_MY_JURISDICTION)) {
      if (roleScopes(user.role.id).includes(SCOPES.USER_UPDATE)) {
        return false
      }
      return isUnderJurisdiction(
        userPrimaryOffice.id,
        user.primaryOffice.id,
        locations,
        offices
      )
    }

    return false
  }

  const canAccessOffice = (office: Pick<Location, 'id'>) => {
    if (!userPrimaryOffice?.id) {
      return false
    }
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS)) {
      return true
    }
    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE)) {
      return office.id === userPrimaryOffice.id
    }

    if (hasScope(SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION)) {
      return isUnderJurisdiction(
        userPrimaryOffice.id,
        office.id,
        locations,
        offices
      )
    }
    return false
  }

  const canAddOfficeUsers = (office: Pick<Location, 'id'>) => {
    if (!userPrimaryOffice?.id) {
      return false
    }
    if (hasScope(SCOPES.USER_CREATE)) {
      return true
    }
    if (hasScope(SCOPES.USER_CREATE_MY_JURISDICTION)) {
      return isUnderJurisdiction(
        userPrimaryOffice.id,
        office.id,
        locations,
        offices
      )
    }
    return false
  }

  const canUpdateRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.UPDATE)

  const canReviewRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.REVIEW)

  const canPrintRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.PRINT)

  const canIssueRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.ISSUE)

  const canCorrectRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.CORRECT)

  const canArchiveRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.ARCHIVE)

  const canReinstateRecord = () => hasAnyScope(RECORD_ALLOWED_SCOPES.REINSTATE)

  const canReviewCorrection = () =>
    hasAnyScope(RECORD_ALLOWED_SCOPES.REVIEW_CORRECTION)

  const isRecordActionable = (status: SUBMISSION_STATUS) =>
    [
      canUpdateRecord() && isUpdatableDeclaration(status),
      canReviewRecord() && isReviewableDeclaration(status),
      canPrintRecord() && isPrintable(status),
      canIssueRecord() && isIssuable(status),
      canCorrectRecord() && canBeCorrected(status),
      canReviewCorrection() && isPendingCorrection(status),
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
    canAccessOffice,
    canAddOfficeUsers,
    canUpdateRecord,
    canReviewRecord,
    canCorrectRecord,
    canArchiveRecord,
    canReinstateRecord
  }
}
