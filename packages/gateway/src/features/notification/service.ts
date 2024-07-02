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
import { IAuthHeader } from '@opencrvs/commons'
import { USER_MANAGEMENT_URL, NOTIFICATION_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { IUserModelData } from '@gateway/features/user/type-resolvers'
import { internal } from '@hapi/boom'
import { v4 as uuid } from 'uuid'

const DEFAULT_PAGE_SIZE = 500

async function fetchAllUsers(authHeader: IAuthHeader) {
  const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
    method: 'POST',
    body: JSON.stringify({
      count: 0,
      skip: 0,
      sortOrder: 'desc'
    }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })

  if (res.status === 200) {
    return (await res.json()) as Promise<{
      total: number
      results: IUserModelData[]
    }>
  } else {
    const errorResponse = await res.json()
    throw internal('Error fetching user-mgnt: ' + errorResponse.message)
  }
}

async function requestNotificationServiceToSendEmails(
  subject: string,
  body: string,
  bcc: string[],
  locale: string,
  requestId: string,
  authHeader: IAuthHeader
) {
  const res = await fetch(`${NOTIFICATION_URL}allUsersEmail`, {
    method: 'POST',
    body: JSON.stringify({
      subject,
      body,
      locale,
      requestId,
      bcc
    }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
  if (res.status !== 200) {
    const errorResponse = await res.json()
    throw internal('Error fetching notification: ' + errorResponse.message)
  }
}

export async function sendEmailToAllUsers(
  subject: string,
  body: string,
  locale: string,
  authHeader: IAuthHeader
) {
  const users = await fetchAllUsers(authHeader)
  const requestId = uuid()
  let i = 0
  do {
    const emails = users.results
      .slice(i, i + DEFAULT_PAGE_SIZE)
      .map((user) => user.emailForNotification)
      .filter((email): email is string => email != undefined)
    await requestNotificationServiceToSendEmails(
      subject,
      body,
      emails,
      locale,
      requestId,
      authHeader
    )
    i += DEFAULT_PAGE_SIZE
  } while (users.total && i < users.total)

  return {
    success: true
  }
}
