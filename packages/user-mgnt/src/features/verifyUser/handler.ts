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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { unauthorized, conflict, badRequest } from '@hapi/boom'
import User, {
  IUserModel,
  ISecurityQuestionAnswer
} from '@user-mgnt/model/user'
import {
  isNonEmptyArray,
  NonEmptyArray
} from '@user-mgnt/utils/non-empty-array'

interface IVerifyPayload {
  mobile?: string
  email?: string
}

interface IVerifyResponse {
  mobile?: string
  scope: string[]
  status: string
  securityQuestionKey: string
  id: string
  username: string
  practitionerId: string
  email?: string
}

export default async function verifyUserHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { mobile, email } = request.payload as IVerifyPayload

  let user: IUserModel | null

  if (!email && !mobile) {
    return badRequest()
  }

  if (mobile) {
    user = await User.findOne({ mobile })
  } else {
    user = await User.findOne({ emailForNotification: email })
  }

  if (!user) {
    // Don't return a 404 as this gives away that this user account exists
    throw unauthorized()
  }

  if (
    !user.securityQuestionAnswers ||
    !isNonEmptyArray(user.securityQuestionAnswers)
  ) {
    throw conflict("User doesn't have security questions")
  }

  const response: IVerifyResponse = {
    mobile: user.mobile,
    scope: user.scope,
    status: user.status,
    securityQuestionKey: getRandomQuestionKey(user.securityQuestionAnswers),
    id: user.id,
    username: user.username,
    email: user.emailForNotification,
    practitionerId: user.practitionerId
  }

  return response
}

export function getRandomQuestionKey(
  securityQuestionAnswers: NonEmptyArray<ISecurityQuestionAnswer>,
  questionKeyToSkip?: string
): string {
  const filteredQuestions = questionKeyToSkip
    ? securityQuestionAnswers.filter(
        (securityQnA) => securityQnA.questionKey !== questionKeyToSkip
      )
    : securityQuestionAnswers
  return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)]
    .questionKey
}

export const requestSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email()
})

export const responseSchema = Joi.object({
  mobile: Joi.string(),
  email: Joi.string().email(),
  scope: Joi.array().items(Joi.string()),
  status: Joi.string(),
  securityQuestionKey: Joi.string(),
  id: Joi.string(),
  username: Joi.string(),
  practitionerId: Joi.string()
})
