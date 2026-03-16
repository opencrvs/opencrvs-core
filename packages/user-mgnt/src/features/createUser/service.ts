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
import {
  triggerUserEventNotification,
  logger,
  personNameFromV1ToV2,
  IUserName
} from '@opencrvs/commons'
import { COUNTRY_CONFIG_URL, DOCUMENTS_URL } from '@user-mgnt/constants'
import User, { ISignature } from '@user-mgnt/model/user'
import fetch from 'node-fetch'

export const uploadSignatureToMinio = async (
  token: string,
  signature: ISignature
) => {
  const result = await fetch(`${DOCUMENTS_URL}/upload`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fileData: signature.data })
  })
  const res = await result.json()
  return res.refUrl
}

export async function generateUsername(
  names: IUserName[],
  existingUserName?: string
) {
  const { given = [], family = '' } =
    names.find((name) => name.use === 'en') || {}
  const initials = given.reduce(
    (accumulated, current) => accumulated + current.trim().charAt(0),
    ''
  )

  let proposedUsername = `${initials}${initials === '' ? '' : '.'}${family
    .trim()
    .replace(/ /g, '-')}`.toLowerCase()

  if (proposedUsername.length < 3) {
    proposedUsername =
      proposedUsername + '0'.repeat(3 - proposedUsername.length)
  }

  if (existingUserName && existingUserName === proposedUsername) {
    return proposedUsername
  }

  try {
    let usernameTaken = await checkUsername(proposedUsername)
    let i = 1
    const copyProposedName = proposedUsername
    while (usernameTaken) {
      if (existingUserName && existingUserName === proposedUsername) {
        return proposedUsername
      }
      proposedUsername = copyProposedName + i
      i += 1
      usernameTaken = await checkUsername(proposedUsername)
    }
  } catch (err) {
    logger.error(`Failed username generation: ${err}`)
    throw new Error('Failed username generation')
  }

  return proposedUsername
}

async function checkUsername(username: string) {
  const user = await User.findOne({ username })
  return !!user
}

export async function sendCredentialsNotification(
  userFullName: IUserName[],
  username: string,
  password: string,
  authHeader: { Authorization: string },
  msisdn?: string,
  email?: string
) {
  try {
    await triggerUserEventNotification({
      event: 'user-created',
      payload: {
        recipient: {
          name: personNameFromV1ToV2(userFullName),
          email,
          mobile: msisdn
        },
        username,
        temporaryPassword: password
      },
      countryConfigUrl: COUNTRY_CONFIG_URL,
      authHeader
    })
  } catch (err) {
    logger.error(`Unable to send notification for error : ${err}`)
  }
}
