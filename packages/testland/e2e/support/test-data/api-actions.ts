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
import { v4 as uuidv4 } from 'uuid'
import { expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { createClient } from '@opencrvs/toolkit/api'
import {
  ActionDocument,
  ActionStatus,
  ActionType
} from '@opencrvs/toolkit/events'
import {
  AUTH_URL,
  GATEWAY_HOST,
  TEST_USER_PASSWORD
} from '@e2e/support/constants'
import { formatName, NEW_USER_PASSWORD } from '@e2e/support/helpers'
import {
  getDeclaration,
  getNotificationDeclaration,
  NOTIFY_ANNOTATION
} from './birth-declaration'
import { getSignatureFile, uploadFile } from './utils'

/*
 * API shortcuts for putting an event or user into the state a test starts
 * from, when the UI flow to get there is not what the test is about.
 */

function getClient(token: string) {
  return createClient(GATEWAY_HOST + '/events', `Bearer ${token}`)
}

function getUserId(token: string): string {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).sub
}

async function assignToSelf(token: string, eventId: string) {
  await getClient(token).event.actions.assignment.assign.mutate({
    eventId,
    type: ActionType.ASSIGN,
    assignedTo: getUserId(token),
    transactionId: uuidv4(),
    declaration: {},
    annotation: {},
    keepAssignment: true
  })
}

/**
 * Creates a birth event and notifies it with only the child details
 * (name, gender, dob, health facility) of `generateBirthInputs()` output,
 * plus informant comment & signature — the same data the "Notify by HO"
 * UI steps in the workqueue flows used to fill in.
 */
export async function notifyChildDetailsViaApi(
  token: string,
  inputs: {
    child: {
      name: { firstNames: string; familyName: string }
      gender: string
      birthDate: { dd: string; mm: string; yyyy: string }
    }
    birthLocation: { facility: string }
  }
) {
  const client = getClient(token)

  const { id: eventId } = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4()
  })

  const { dd, mm, yyyy } = inputs.child.birthDate
  const declaration = await getNotificationDeclaration({
    token,
    facility: inputs.birthLocation.facility,
    partialDeclaration: {
      'child.name': {
        firstname: inputs.child.name.firstNames,
        surname: inputs.child.name.familyName
      },
      'child.gender': inputs.child.gender.toLowerCase(),
      'child.dob': `${yyyy}-${mm}-${dd}`
    }
  })

  await client.event.actions.notify.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation: NOTIFY_ANNOTATION
  })

  return { eventId: eventId as string }
}

/** Assigns the event to the token's user and rejects it ("Send For Update"). */
export async function rejectViaApi(
  token: string,
  eventId: string,
  reason: string = faker.lorem.sentence()
) {
  await assignToSelf(token, eventId)
  await getClient(token).event.actions.reject.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {},
    content: { reason }
  })
}

/** Assigns the event to the token's user and archives it. */
export async function archiveViaApi(token: string, eventId: string) {
  await assignToSelf(token, eventId)
  await getClient(token).event.actions.archive.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration: {},
    annotation: {}
  })
}

/**
 * Assigns the event to the token's user and runs a configured custom action
 * (e.g. 'ATTEST', 'ESCALATE', 'VALIDATE_DECLARATION'). `annotation` carries
 * the custom action's form values, keyed by field id.
 */
export async function customActionViaApi({
  token,
  eventId,
  customActionType,
  annotation = {}
}: {
  token: string
  eventId: string
  customActionType: string
  annotation?: Record<string, unknown>
}) {
  await assignToSelf(token, eventId)
  return getClient(token).event.actions.custom.request.mutate({
    eventId,
    transactionId: uuidv4(),
    customActionType,
    declaration: {},
    annotation
  })
}

/** Assigns the event to the token's user and validates it. */
export async function validateViaApi(token: string, eventId: string) {
  return customActionViaApi({
    token,
    eventId,
    customActionType: 'VALIDATE_DECLARATION'
  })
}

/**
 * Requests a correction on a registered event via API, as the user owning
 * `token`. The event is left unassigned so another user can pick it up.
 *
 * `annotation` holds the correction form answers, e.g.
 * { 'requester.type': 'LEGAL_GUARDIAN', 'reason.option': 'MATERIAL_ERROR',
 *   'requester.identity.verify': true, 'fees.amount': 100 }
 */
export async function requestCorrectionViaApi({
  token,
  eventId,
  declaration,
  annotation
}: {
  token: string
  eventId: string
  declaration: Record<string, unknown>
  annotation: Record<string, unknown>
}) {
  await assignToSelf(token, eventId)

  const res = await getClient(
    token
  ).event.actions.correction.request.request.mutate({
    eventId,
    transactionId: uuidv4(),
    declaration,
    annotation
  })

  const requestAction = res.actions.find(
    (action: ActionDocument) => action.type === ActionType.REQUEST_CORRECTION
  )
  if (!requestAction) {
    throw new Error(`Correction request was not recorded for event ${eventId}`)
  }

  return res
}

/** Mirrors the username normalisation in events/src/service/users/utils.ts */
function normalizeUsername(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-]/g, '')
    .replace(/^[.\-]+|[.\-]+$/g, '')
    .toLowerCase()
}

/**
 * The username the server generates for a user created with `name` (see
 * `generateUsername` in events/src/service/users/utils.ts): initials and
 * surname without diacritics or special characters, padded to 5 and cut to
 * 30 characters. Assumes no other user already has that username.
 */
export function getExpectedUsername(name: {
  firstname: string
  surname: string
}) {
  const initials = normalizeUsername(
    name.firstname
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
  )
  const surname = normalizeUsername(name.surname)
  const raw = `${initials}${initials ? '.' : ''}${surname}`
  return raw
    .padEnd(5, '0')
    .slice(0, 30)
    .replace(/[.\-]+$/, '')
}

/**
 * API equivalent of `loginWithNewUser`: completes the first-login account
 * setup (password + security questions) of a freshly created user, so tests
 * whose subject is not the setup ceremony itself don't click through it.
 * Afterwards the user logs in with NEW_USER_PASSWORD, as with the UI flow.
 */
export async function activateUserViaApi(username: string) {
  // A pending user gets its token straight from /authenticate - no 2FA step.
  // Creating the user returns before its credentials are usable, so retry.
  let token = ''
  await expect(async () => {
    const authResponse = await fetch(`${AUTH_URL}/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: TEST_USER_PASSWORD })
    })
    const body = await authResponse.json()

    expect(body.status, `Expected ${username} to be a pending user`).toBe(
      'pending'
    )
    token = body.token
  }).toPass({
    timeout: 60_000,
    intervals: [...Array(5).fill(1_000), ...Array(5).fill(2_000), 5_000]
  })

  await getClient(token).user.activate.mutate({
    userId: getUserId(token),
    password: NEW_USER_PASSWORD,
    securityQNAs: [
      { questionKey: 'BIRTH_TOWN', answer: 'Chittagong' },
      { questionKey: 'FAVORITE_MOVIE', answer: 'Into the wild' },
      { questionKey: 'FAVORITE_FOOD', answer: 'Burger' }
    ]
  })
}

/**
 * Creates a birth event with an in-progress declare draft holding only the
 * child's name - what "Save & Exit" leaves behind after filling the child's
 * name in the form. Returns the child's formatted name as shown in Drafts.
 */
export async function createBirthDraftViaApi(token: string) {
  const client = getClient(token)

  const event = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4()
  })

  const firstname = faker.person.firstName('female')
  const surname = faker.person.lastName('female')

  await client.event.draft.create.mutate({
    eventId: event.id,
    transactionId: uuidv4(),
    type: ActionType.DECLARE,
    status: ActionStatus.Requested,
    declaration: { 'child.name': { firstname, surname } },
    annotation: {}
  })

  return formatName({ firstNames: firstname, familyName: surname })
}

export async function createCompleteBirthDraftViaApi(token: string) {
  const client = getClient(token)

  const event = await client.event.create.mutate({
    type: 'birth',
    transactionId: uuidv4()
  })

  const firstname = faker.person.firstName('female')
  const surname = faker.person.lastName('female')

  const declaration = await getDeclaration({
    token,
    partialDeclaration: { 'child.name': { firstname, surname } }
  })
  const signature = await uploadFile(getSignatureFile(), token)

  await client.event.draft.create.mutate({
    eventId: event.id,
    transactionId: uuidv4(),
    type: ActionType.DECLARE,
    status: ActionStatus.Requested,
    declaration,
    annotation: {
      'review.comment': 'My comment',
      'review.signature': signature
    }
  })

  return formatName({ firstNames: firstname, familyName: surname })
}
