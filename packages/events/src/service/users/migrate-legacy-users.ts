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

import mongoose from 'mongoose'
import { UUID } from '@opencrvs/commons'
import { env } from '@events/environment'
import { getClient } from '@events/storage/postgres/events'
import {
  createUserCredentialInTrx,
  createUserInTrx
} from '@events/storage/postgres/events/users'
import { NewUsers } from '@events/storage/postgres/events/schema/app/Users'

export type UserName = {
  use: string
  family: string
  given: string[]
}

export interface Signature {
  type: string
  data: string
}

export interface SecurityQuestionAnswer {
  questionKey: string
  answerHash: string
}

export interface Avatar {
  type: string
  data: string
}

type LegacyUser = {
  name: UserName[]
  username: string
  email: string
  mobile?: string
  fullHonorificName?: string
  emailForNotification?: string
  passwordHash: string
  oldPasswordHash?: string
  salt: string
  role: string
  practitionerId: string
  primaryOfficeId: string
  signature?: Signature
  status: string
  securityQuestionAnswers: SecurityQuestionAnswer[]
  avatar?: Avatar
}

type WithId<T> = T & { _id: mongoose.Types.ObjectId }

export type MigrationError =
  | { errorType: 'LEGACY_DATA_RETRIEVAL_FAILED'; meta: { reason: string } }
  | { errorType: 'INVALID_STATUS'; meta: { username: string; status: string } }
  | { errorType: 'NAME_NOT_FOUND'; meta: { username: string } }
  | {
      errorType: 'USER_CREATION_FAILED'
      meta: { username: string; reason: string }
    }

function isError(maybeError: unknown): maybeError is MigrationError {
  return (
    typeof maybeError === 'object' &&
    maybeError !== null &&
    'errorType' in maybeError
  )
}

function legacyUserToUser(
  legacyUser: WithId<LegacyUser>
): NewUsers | MigrationError {
  if (
    legacyUser.status !== 'active' &&
    legacyUser.status !== 'pending' &&
    legacyUser.status !== 'deactivated'
  ) {
    return {
      errorType: 'INVALID_STATUS',
      meta: { username: legacyUser.username, status: legacyUser.status }
    }
  }
  if (legacyUser.name.length === 0) {
    return {
      errorType: 'NAME_NOT_FOUND',
      meta: { username: legacyUser.username }
    }
  }
  return {
    legacyId: legacyUser._id.toString(),
    firstname: legacyUser.name[0].given.join(' '),
    surname: legacyUser.name[0].family,
    email: legacyUser.emailForNotification?.toLowerCase(),
    mobile: legacyUser.mobile,
    fullHonorificName: legacyUser.fullHonorificName,
    role: legacyUser.role,
    officeId: legacyUser.primaryOfficeId as UUID,
    status: legacyUser.status,
    profileImagePath: legacyUser.avatar?.data,
    signaturePath: legacyUser.signature?.data
  }
}

function legacyUserToUserCredential(userId: UUID, legacyUser: LegacyUser) {
  return {
    username: legacyUser.username,
    userId,
    passwordHash: legacyUser.passwordHash,
    salt: legacyUser.salt,
    securityQuestions: legacyUser.securityQuestionAnswers
  }
}

async function createNewUser(
  legacyUser: WithId<LegacyUser>
): Promise<{ userId: UUID; userCredentialId: UUID } | MigrationError> {
  const db = getClient()
  const userInputOrError = legacyUserToUser(legacyUser)

  if (isError(userInputOrError)) {
    return Promise.resolve(userInputOrError)
  }

  const userInput = userInputOrError

  const mapError = (error: unknown) => ({
    errorType: 'USER_CREATION_FAILED' as const,
    meta: {
      username: legacyUser.username,
      reason: error instanceof Error ? error.message : 'unknown error'
    }
  })

  return db.transaction().execute(async (tx) => {
    const userIdOrError = await createUserInTrx(userInput, tx).catch(mapError)
    if (isError(userIdOrError)) {
      return userIdOrError
    }
    const userId = userIdOrError
    const userCredentialIdOrError = await createUserCredentialInTrx(
      legacyUserToUserCredential(userId, legacyUser),
      tx
    ).catch(mapError)
    if (isError(userCredentialIdOrError)) {
      return userCredentialIdOrError
    }
    const userCredentialId = userCredentialIdOrError
    return { userId, userCredentialId }
  })
}

export async function migrateLegacyUsers(): Promise<MigrationError[]> {
  let legacyUsersStream
  try {
    legacyUsersStream = await mongoose
      .connect(env.USER_MGNT_MONGO_URL)
      .then((connectedMongoose) =>
        connectedMongoose.connection.db
          .collection<LegacyUser>('users')
          .find()
          .stream()
      )
  } catch (error) {
    return [
      {
        errorType: 'LEGACY_DATA_RETRIEVAL_FAILED',
        meta: {
          reason: error instanceof Error ? error.message : 'unknown error'
        }
      }
    ]
  }

  const errors: MigrationError[] = []

  for await (const legacyUser of legacyUsersStream) {
    const result = await createNewUser(legacyUser)
    if (isError(result)) {
      errors.push(result)
    }
  }
  return errors
}
