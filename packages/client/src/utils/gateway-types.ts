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

/*
 * Hand-written replacements for the handful of types that used to be
 * generated from the gateway GraphQL schema (src/utils/gateway.ts).
 */

export type Maybe<T> = T | null

export type Avatar = {
  __typename?: 'Avatar'
  data: string
  type: string
}

export enum EventType {
  Birth = 'birth',
  Death = 'death',
  Marriage = 'marriage'
}

export enum RegAction {
  ApprovedCorrection = 'APPROVED_CORRECTION',
  Assigned = 'ASSIGNED',
  Corrected = 'CORRECTED',
  Downloaded = 'DOWNLOADED',
  FlaggedAsPotentialDuplicate = 'FLAGGED_AS_POTENTIAL_DUPLICATE',
  MarkedAsDuplicate = 'MARKED_AS_DUPLICATE',
  MarkedAsNotDuplicate = 'MARKED_AS_NOT_DUPLICATE',
  Reinstated = 'REINSTATED',
  RejectedCorrection = 'REJECTED_CORRECTION',
  RequestedCorrection = 'REQUESTED_CORRECTION',
  Unassigned = 'UNASSIGNED',
  Verified = 'VERIFIED',
  Viewed = 'VIEWED'
}

export enum RegStatus {
  Archived = 'ARCHIVED',
  Certified = 'CERTIFIED',
  CorrectionRequested = 'CORRECTION_REQUESTED',
  DeclarationUpdated = 'DECLARATION_UPDATED',
  Declared = 'DECLARED',
  InProgress = 'IN_PROGRESS',
  Issued = 'ISSUED',
  Registered = 'REGISTERED',
  Rejected = 'REJECTED',
  Validated = 'VALIDATED',
  WaitingValidation = 'WAITING_VALIDATION'
}

export enum Status {
  Active = 'active',
  Deactivated = 'deactivated',
  Disabled = 'disabled',
  Pending = 'pending'
}

export type FetchUserQuery = {
  __typename?: 'Query'
  getUser?: {
    __typename?: 'User'
    id: string
    userMgntUserID: string
    creationDate: string
    username?: string | null
    practitionerId: string
    mobile?: string | null
    email?: string | null
    fullHonorificName?: string | null
    status: Status
    role: {
      __typename?: 'UserRole'
      id: string
      label: {
        __typename?: 'I18nMessage'
        id: string
        defaultMessage: string
        description: string
      }
    }
    name: Array<{
      __typename?: 'HumanName'
      use?: string | null
      firstNames?: string | null
      familyName?: string | null
    }>
    primaryOffice: {
      __typename?: 'Location'
      id: string
      name?: string | null
      alias?: Array<string> | null
      status?: string | null
    }
    localRegistrar?: {
      __typename?: 'LocalRegistrar'
      role?: string | null
      name: Array<{
        __typename?: 'HumanName'
        use?: string | null
        firstNames?: string | null
        familyName?: string | null
      } | null>
      signature?: {
        __typename?: 'Signature'
        data?: string | null
        type?: string | null
      } | null
    } | null
    avatar?: { __typename?: 'Avatar'; type: string; data: string } | null
    searches?: Array<{
      __typename?: 'BookmarkedSeachItem'
      searchId: string
      name: string
      parameters: {
        __typename?: 'AdvancedSeachParameters'
        event?: EventType | null
        name?: string | null
        registrationStatuses?: Array<string | null> | null
        dateOfEvent?: string | null
        dateOfEventStart?: string | null
        dateOfEventEnd?: string | null
        timePeriodFrom?: string | null
        contactNumber?: string | null
        nationalId?: string | null
        registrationNumber?: string | null
        trackingId?: string | null
        dateOfRegistration?: string | null
        dateOfRegistrationStart?: string | null
        dateOfRegistrationEnd?: string | null
        declarationLocationId?: string | null
        declarationJurisdictionId?: string | null
        eventLocationId?: string | null
        eventCountry?: string | null
        eventLocationLevel1?: string | null
        eventLocationLevel2?: string | null
        eventLocationLevel3?: string | null
        eventLocationLevel4?: string | null
        eventLocationLevel5?: string | null
        eventLocationLevel6?: string | null
        childFirstNames?: string | null
        childLastName?: string | null
        childDoB?: string | null
        childDoBStart?: string | null
        childDoBEnd?: string | null
        childGender?: string | null
        deceasedFirstNames?: string | null
        deceasedFamilyName?: string | null
        deceasedGender?: string | null
        deceasedDoB?: string | null
        deceasedDoBStart?: string | null
        deceasedDoBEnd?: string | null
        deceasedIdentifier?: string | null
        motherFirstNames?: string | null
        motherFamilyName?: string | null
        motherDoB?: string | null
        motherDoBStart?: string | null
        motherDoBEnd?: string | null
        motherIdentifier?: string | null
        fatherFirstNames?: string | null
        fatherFamilyName?: string | null
        fatherDoB?: string | null
        fatherDoBStart?: string | null
        fatherDoBEnd?: string | null
        fatherIdentifier?: string | null
        informantFirstNames?: string | null
        informantFamilyName?: string | null
        informantDoB?: string | null
        informantDoBStart?: string | null
        informantDoBEnd?: string | null
        informantIdentifier?: string | null
        compositionType?: Array<string | null> | null
      }
    }> | null
  } | null
}
