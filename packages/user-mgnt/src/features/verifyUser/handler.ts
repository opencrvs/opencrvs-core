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
import { fetchJSON, joinUrl, Roles } from '@opencrvs/commons'
import { env } from '@user-mgnt/environment'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { unauthorized, conflict, badRequest } from '@hapi/boom'
import User, {
  IUserModel,
  ISecurityQuestionAnswer,
  IUserName
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
  name: IUserName[]
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

  const roles = await fetchJSON<Roles>(
    joinUrl(env.COUNTRY_CONFIG_URL, '/roles')
  )

  const response: IVerifyResponse = {
    name: user.name,
    mobile: user.mobile,
    status: user.status,
    securityQuestionKey: getRandomQuestionKey(user.securityQuestionAnswers),
    id: user.id,
    scope: roles.find((role) => role.id === user.role)?.scopes || [],
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
  name: Joi.array().items(
    Joi.object({
      given: Joi.array().items(Joi.string()).required(),
      use: Joi.string().required(),
      family: Joi.string().required()
    }).unknown(true)
  ),
  mobile: Joi.string(),
  email: Joi.string(),
  scope: Joi.array().items(Joi.string()),
  status: Joi.string(),
  securityQuestionKey: Joi.string(),
  id: Joi.string(),
  username: Joi.string(),
  practitionerId: Joi.string()
})
