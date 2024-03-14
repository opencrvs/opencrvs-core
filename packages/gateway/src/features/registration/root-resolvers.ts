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
import { AUTH_URL, COUNTRY_CONFIG_URL, SEARCH_URL } from '@gateway/constants'
import { fetchFHIR, getIDFromResponse } from '@gateway/features/fhir/service'
import { hasScope, inScope } from '@gateway/features/user/utils'
import fetch from '@gateway/fetch'
import { IAuthHeader } from '@opencrvs/commons'
import {
  Bundle,
  Composition,
  EVENT_TYPE,
  Patient,
  Saved,
  Task,
  buildFHIRBundle,
  getComposition
} from '@opencrvs/commons/types'
import {
  GQLBirthRegistrationInput,
  GQLDeathRegistrationInput,
  GQLMarriageRegistrationInput,
  GQLResolver,
  GQLStatusWiseRegistrationCount
} from '@gateway/graphql/schema'
import { UnassignError } from '@gateway/utils/unassignError'
import {
  validateBirthDeclarationAttachments,
  validateDeathDeclarationAttachments,
  validateMarriageDeclarationAttachments
} from '@gateway/utils/validators'
import { checkUserAssignment } from '@gateway/authorisation'
import { UserInputError } from 'apollo-server-hapi'
import { setCollectorForPrintInAdvance } from '@gateway/features/registration/utils'
import {
  archiveRegistration,
  certifyRegistration,
  createRegistration,
  issueRegistration,
  registerDeclaration,
  unassignRegistration,
  rejectDeclaration,
  updateRegistration,
  validateRegistration,
  fetchRegistrationForDownloading,
  reinstateRegistration,
  duplicateRegistration,
  viewDeclaration,
  verifyRegistration,
  markNotADuplicate
} from '@gateway/workflow/index'
import { getRecordById } from '@gateway/records'

async function getAnonymousToken() {
  const res = await fetch(new URL('/anonymous-token', AUTH_URL).toString())
  const { token } = await res.json()
  return token
}

export const resolvers: GQLResolver = {
  RecordDetails: {
    __resolveType(obj): any {
      if (!obj?.type?.text) return 'BirthRegistration'
      if (obj.type.text == 'Birth Declaration') return 'BirthRegistration'
      if (obj.type.text == 'Death Declaration') return 'DeathRegistration'
    }
  },
  Query: {
    async searchBirthRegistrations(
      _,
      { fromDate, toDate },
      { headers: authHeader }
    ): Promise<Saved<Bundle>[]> {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR<Saved<Bundle<Saved<Composition>>>>(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions = res.entry.map(({ resource }) => resource)

      return Promise.all(
        compositions
          .filter(({ type }) =>
            type.coding?.some(({ code }) => code === 'birth-declaration')
          )
          .map((composition) =>
            getRecordById(composition.id, authHeader.Authorization)
          )
      )
    },
    async searchDeathRegistrations(
      _,
      { fromDate, toDate },
      { headers: authHeader }
    ): Promise<Saved<Bundle>[]> {
      if (!hasScope(authHeader, 'sysadmin')) {
        return await Promise.reject(
          new Error('User does not have a sysadmin scope')
        )
      }
      const res = await fetchFHIR<Saved<Bundle<Saved<Composition>>>>(
        `/Composition?date=gt${fromDate.toISOString()}&date=lte${toDate.toISOString()}&_count=0`,
        authHeader
      )

      const compositions = res.entry.map(({ resource }) => resource)

      return Promise.all(
        compositions
          .filter(({ type }) =>
            type.coding?.some(({ code }) => code === 'death-declaration')
          )
          .map((composition) =>
            getRecordById(composition.id, authHeader.Authorization)
          )
      )
    },
    async fetchBirthRegistration(_, { id }, context): Promise<Saved<Bundle>> {
      if (
        hasScope(context.headers, 'register') ||
        hasScope(context.headers, 'validate') ||
        hasScope(context.headers, 'declare')
      ) {
        context.record = await fetchRegistrationForDownloading(
          id,
          context.headers
        )
        return context.record
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchDeathRegistration(_, { id }, context): Promise<Saved<Bundle>> {
      if (
        hasScope(context.headers, 'register') ||
        hasScope(context.headers, 'validate') ||
        hasScope(context.headers, 'declare')
      ) {
        context.record = await fetchRegistrationForDownloading(
          id,
          context.headers
        )
        return context.record
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchMarriageRegistration(
      _,
      { id },
      context
    ): Promise<Saved<Bundle>> {
      if (
        hasScope(context.headers, 'register') ||
        hasScope(context.headers, 'validate') ||
        hasScope(context.headers, 'declare')
      ) {
        context.record = await fetchRegistrationForDownloading(
          id,
          context.headers
        )
        return context.record
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async queryRegistrationByIdentifier(
      _,
      { identifier },
      { headers: authHeader }
    ): Promise<Saved<Bundle>> {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const taskBundle = await fetchFHIR<Bundle<Task>>(
          `/Task?identifier=${identifier}`,
          authHeader
        )

        if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
          throw new Error(`Task does not exist for identifer ${identifier}`)
        }
        const task = taskBundle.entry[0].resource

        if (!task.focus || !task.focus.reference) {
          throw new Error(`Composition reference not found`)
        }

        return await fetchFHIR(`/${task.focus.reference}`, authHeader)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async fetchRegistration(_, { id }, context): Promise<Saved<Bundle>> {
      context.record = await getRecordById(id, context.headers.Authorization)
      return context.record
    },
    async fetchRegistrationForViewing(
      _,
      { id },
      context
    ): Promise<Saved<Bundle>> {
      context.record = await viewDeclaration(id, context.headers)

      return context.record
    },
    async queryPersonByIdentifier(_, { identifier }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const personBundle = await fetchFHIR<Bundle<Patient>>(
          `/Patient?identifier=${identifier}`,
          authHeader
        )
        if (!personBundle || !personBundle.entry || !personBundle.entry[0]) {
          throw new Error(`Person does not exist for identifer ${identifier}`)
        }
        const person = personBundle.entry[0].resource

        return person
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async queryPersonByNidIdentifier(
      _,
      { dob, nid, country },
      { headers: authHeader }
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare')
      ) {
        const response = await fetch(
          `${COUNTRY_CONFIG_URL}/verify/nid/${country}`,
          {
            method: 'POST',
            body: JSON.stringify({ dob, nid }),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        if (!response.operationResult.success) {
          throw new Error(response.operationResult.error.errorMessage)
        } else {
          return response.data
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async fetchRegistrationCountByStatus(
      _,
      { locationId, status, event },
      { headers: authHeader }
    ) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate') ||
        hasScope(authHeader, 'declare') ||
        hasScope(authHeader, 'sysadmin') ||
        hasScope(authHeader, 'performance')
      ) {
        const payload: {
          declarationJurisdictionId?: string
          status: string[]
          event?: string
        } = {
          declarationJurisdictionId: locationId,
          status: status as string[],
          event
        }

        const results: GQLStatusWiseRegistrationCount[] = await fetch(
          `${SEARCH_URL}statusWiseRegistrationCount`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json',
              ...authHeader
            }
          }
        ).then((data) => data.json())

        let total = 0
        if (results && results.length > 0) {
          total = results.reduce(
            (totalCount, statusCount) => ({
              count: totalCount.count + statusCount.count
            }),
            {
              count: total
            }
          ).count
        }
        return {
          results,
          total
        }
      } else {
        return await Promise.reject(
          new Error('User does not have enough scope')
        )
      }
    },
    async fetchRecordDetailsForVerification(_, { id }, context) {
      const token = await getAnonymousToken()
      context.headers.Authorization = `Bearer ${token}`
      context.record = await verifyRegistration(id, context.headers)

      return context.record
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, { headers: authHeader }) {
      try {
        await validateBirthDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return await createRegistration(details, EVENT_TYPE.BIRTH, authHeader)
    },
    async createDeathRegistration(_, { details }, { headers: authHeader }) {
      try {
        await validateDeathDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createRegistration(details, EVENT_TYPE.DEATH, authHeader)
    },
    async createMarriageRegistration(_, { details }, { headers: authHeader }) {
      try {
        await validateMarriageDeclarationAttachments(details)
      } catch (error) {
        throw new UserInputError(error.message)
      }

      return createRegistration(details, EVENT_TYPE.MARRIAGE, authHeader)
    },
    async updateBirthRegistration(_, { details }, { headers: authHeader }) {
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const doc = buildFHIRBundle(details, EVENT_TYPE.BIRTH)

        const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
        // return composition-id
        return getIDFromResponse(res)
      } else {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
    },
    async markBirthAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      } else {
        return await markEventAsValidated(
          id,
          authHeader,
          EVENT_TYPE.BIRTH,
          details
        )
      }
    },
    async markDeathAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      }
      return await markEventAsValidated(
        id,
        authHeader,
        EVENT_TYPE.DEATH,
        details
      )
    },
    async markMarriageAsValidated(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!hasScope(authHeader, 'validate')) {
        return await Promise.reject(
          new Error('User does not have a validate scope')
        )
      } else {
        return await markEventAsValidated(
          id,
          authHeader,
          EVENT_TYPE.MARRIAGE,
          details
        )
      }
    },
    async markBirthAsRegistered(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(id, authHeader, EVENT_TYPE.BIRTH, details)
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markDeathAsRegistered(_, { id, details }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(id, authHeader, EVENT_TYPE.DEATH, details)
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markMarriageAsRegistered(
      _,
      { id, details },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (hasScope(authHeader, 'register')) {
        return markEventAsRegistered(
          id,
          authHeader,
          EVENT_TYPE.MARRIAGE,
          details
        )
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsVoided(
      _,
      { id, reason, comment },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await rejectDeclaration(id, authHeader, reason, comment)
      if (!taskEntry) {
        return await Promise.reject(new Error('Task not found'))
      }

      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsArchived(
      _,
      { id, reason, comment, duplicateTrackingId },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const taskEntry = await archiveRegistration(
        id,
        authHeader,
        reason,
        comment,
        duplicateTrackingId
      )
      // return the taskId
      return taskEntry.resource.id
    },
    async markEventAsReinstated(_, { id }, { headers: authHeader }) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }

      const { taskId, prevRegStatus } = await reinstateRegistration(
        id,
        authHeader
      )

      return {
        taskEntryResourceID: taskId,
        registrationStatus: prevRegStatus
      }
    },
    async markBirthAsCertified(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      return markEventAsCertified(id, details, authHeader, EVENT_TYPE.BIRTH)
    },
    async markBirthAsIssued(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      return markEventAsIssued(id, details, authHeader, EVENT_TYPE.BIRTH)
    },
    async markDeathAsCertified(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      return markEventAsCertified(id, details, authHeader, EVENT_TYPE.DEATH)
    },
    async markDeathAsIssued(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      return markEventAsIssued(id, details, authHeader, EVENT_TYPE.DEATH)
    },
    async markMarriageAsCertified(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      return markEventAsCertified(id, details, authHeader, EVENT_TYPE.MARRIAGE)
    },
    async markMarriageAsIssued(_, { id, details }, { headers: authHeader }) {
      if (!hasScope(authHeader, 'certify')) {
        return Promise.reject(new Error('User does not have a certify scope'))
      }
      return markEventAsIssued(id, details, authHeader, EVENT_TYPE.MARRIAGE)
    },
    async markEventAsNotDuplicate(_, { id }, { headers: authHeader }) {
      const isAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!isAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (
        hasScope(authHeader, 'register') ||
        hasScope(authHeader, 'validate')
      ) {
        const composition = await markNotADuplicate(id, authHeader)

        return composition.id
      } else {
        return await Promise.reject(
          new Error('User does not have a register scope')
        )
      }
    },
    async markEventAsUnassigned(_, { id }, { headers: authHeader }) {
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }
      const task = (await unassignRegistration(id, authHeader)).entry[0]

      // return the taskId
      return task.resource.id
    },
    async markEventAsDuplicate(
      _,
      { id, reason, comment, duplicateTrackingId },
      { headers: authHeader }
    ) {
      const hasAssignedToThisUser = await checkUserAssignment(id, authHeader)
      if (!hasAssignedToThisUser) {
        throw new UnassignError('User has been unassigned')
      }
      if (!inScope(authHeader, ['register', 'validate'])) {
        return await Promise.reject(
          new Error('User does not have a register or validate scope')
        )
      }

      const taskEntry = await duplicateRegistration(
        id,
        authHeader,
        reason,
        comment,
        duplicateTrackingId
      )

      return taskEntry.resource.id
    }
  }
}

async function markEventAsValidated(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details?:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput
) {
  if (
    details?.registration?.changedValues &&
    details.registration.changedValues.length > 0
  ) {
    await updateRegistration(id, authHeader, details, event)
  }

  const comment =
    details?.registration?.status?.[0]?.comments?.[0]?.comment ?? undefined
  const timeLoggedMS =
    details?.registration?.status?.[0]?.timeLoggedMS ?? undefined

  await validateRegistration(id, authHeader, comment, timeLoggedMS)
  return id
}

async function markEventAsRegistered(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput
) {
  if (
    details?.registration?.changedValues &&
    details.registration.changedValues.length > 0
  ) {
    await updateRegistration(id, authHeader, details, event)
  }

  const comments =
    details?.registration?.status?.[0]?.comments?.[0]?.comment ?? undefined
  const timeLoggedMS =
    details?.registration?.status?.[0]?.timeLoggedMS ?? undefined

  await registerDeclaration(id, authHeader, comments, timeLoggedMS)
  return id
}

async function markEventAsCertified(
  id: string,
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  await setCollectorForPrintInAdvance(details, authHeader)
  const certificateDetails = details.registration?.certificates?.[0]
  if (!certificateDetails) {
    return Promise.reject(new Error('Certificate details required'))
  }
  const certifiedRecord = await certifyRegistration(
    id,
    certificateDetails,
    event,
    authHeader
  )
  return getComposition(certifiedRecord).id
}

async function markEventAsIssued(
  id: string,
  details:
    | GQLBirthRegistrationInput
    | GQLDeathRegistrationInput
    | GQLMarriageRegistrationInput,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const certificateDetails = details.registration?.certificates?.[0]
  if (!certificateDetails) {
    return Promise.reject(new Error('Certificate details required'))
  }
  const { payments, ...withoutPayments } = certificateDetails
  if (!payments?.[0]) {
    return Promise.reject(new Error('Payment details required'))
  }
  const issuedRecord = await issueRegistration(
    id,
    { ...withoutPayments, payment: payments[0] },
    event,
    authHeader
  )
  return getComposition(issuedRecord).id
}
