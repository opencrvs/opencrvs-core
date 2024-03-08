import { IAuthHeader } from '@opencrvs/commons'
import { USER_MANAGEMENT_URL, NOTIFICATION_URL } from '@gateway/constants'
import fetch from '@gateway/fetch'
import { IUserModelData } from '@gateway/features/user/type-resolvers'
import { internal } from '@hapi/boom'

const DEFAULT_PAGE_SIZE = 500

async function fetchAllUsersInPage(
  pageSize: number,
  pageNumber: number,
  authHeader: IAuthHeader
) {
  const res = await fetch(`${USER_MANAGEMENT_URL}searchUsers`, {
    method: 'POST',
    body: JSON.stringify({
      count: pageSize,
      skip: pageNumber * pageSize,
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
    throw internal('Something went wrong in user-mgnt server')
  }
}

async function requestNotificationServiceToSendEmails(
  subject: string,
  body: string,
  bcc: string[],
  authHeader: IAuthHeader
) {
  const res = await fetch(`${NOTIFICATION_URL}allUserEmail`, {
    method: 'POST',
    body: JSON.stringify({
      subject,
      body,
      bcc
    }),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    }
  })
  if (res.status !== 200) {
    throw internal(
      'Something went wrong in notification service while forwarding email request'
    )
  }
}

export async function sendEmailToAllUsers(
  subject: string,
  body: string,
  authHeader: IAuthHeader
) {
  let total: number | undefined
  let res
  let currentPage = 0

  do {
    res = await fetchAllUsersInPage(DEFAULT_PAGE_SIZE, currentPage, authHeader)
    if (res.results?.length > 0) {
      if (!total) {
        total = res.total
      }
      const emails = res.results
        .filter((user) => user.systemRole !== 'NATIONAL_SYSTEM_ADMIN')
        .map((user) => user.emailForNotification)
        .filter((email): email is string => email != undefined)
      await requestNotificationServiceToSendEmails(
        subject,
        body,
        emails,
        authHeader
      )
    }
    currentPage += 1
  } while (total && currentPage < Math.ceil(total / DEFAULT_PAGE_SIZE))

  return {
    success: true
  }
}
