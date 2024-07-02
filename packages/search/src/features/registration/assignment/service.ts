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
import { updateComposition } from '@search/elasticsearch/dbhelper'
import {
  getUser,
  IAssignment,
  ICompositionBody,
  IUserModelData,
  NAME_EN
} from '@search/elasticsearch/utils'
import { findName, findTaskExtension } from '@search/features/fhir/fhir-utils'
import * as Hapi from '@hapi/hapi'
import { getTokenPayload, ITokenPayload } from '@search/utils/authUtils'
import { client } from '@search/elasticsearch/client'
import { getTaskFromSavedBundle, SavedBundle } from '@opencrvs/commons/types'

export async function updateEventToAddAssignment(requestBundle: Hapi.Request) {
  const bundle = requestBundle.payload as SavedBundle
  const authHeader = requestBundle.headers.authorization

  const token: ITokenPayload = getTokenPayload(authHeader.split(' ')[1])
  const userId = token.sub

  const task = getTaskFromSavedBundle(bundle)

  const compositionId = task.focus.reference.split('/')[1]

  if (!compositionId) {
    throw new Error('No Composition ID found')
  }

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )
  const regLastOfficeIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastOffice'
  )

  const body: ICompositionBody = {}
  body.modifiedAt = Date.now().toString()
  body.assignment = {} as IAssignment
  body.assignment.officeName =
    (regLastOfficeIdentifier &&
      regLastOfficeIdentifier.valueString &&
      regLastOfficeIdentifier.valueString) ||
    ''
  body.assignment.userId = userId
  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]

  const user: IUserModelData = await getUser(body.updatedBy || '', authHeader)
  const userName = user && findName(NAME_EN, user.name)
  const userFirstNames = userName?.given?.join(' ') || ''
  const userFamilyName = userName?.family || ''

  body.assignment.firstName = userFirstNames
  body.assignment.lastName = userFamilyName

  await updateComposition(compositionId, body, client)
}

export async function updateEventToRemoveAssignment(
  requestBundle: Hapi.Request
) {
  const bundle = requestBundle.payload as SavedBundle

  const task = getTaskFromSavedBundle(bundle)

  const compositionId =
    task &&
    task.focus &&
    task.focus.reference &&
    task.focus.reference.split('/')[1]

  if (!compositionId) {
    throw new Error('No Composition ID found')
  }

  const regLastUserIdentifier = findTaskExtension(
    task,
    'http://opencrvs.org/specs/extension/regLastUser'
  )
  const body: ICompositionBody = {}
  body.modifiedAt = Date.now().toString()
  body.assignment = null
  body.updatedBy =
    regLastUserIdentifier &&
    regLastUserIdentifier.valueReference &&
    regLastUserIdentifier.valueReference.reference &&
    regLastUserIdentifier.valueReference.reference.split('/')[1]
  await updateComposition(compositionId, body, client)
}
