import fetch from 'node-fetch'
import { UserRole } from 'src/authentication'

interface IUserName {
  use: string
  family: string
  given: string[]
}

type ObjectId = string

/*
 * Let's add more fields as they are needed
 */
type User = {
  name: IUserName[]
  username: string
  email: string
  systemRole: UserRole
  role: ObjectId
  practitionerId: string
  primaryOfficeId: string
  scope: string[]
  status: string
  creationDate: number
}

export async function getUser(
  userManagementHost: string,
  userId: string,
  token: string
) {
  const res = await fetch(new URL(`getUser`, userManagementHost).href, {
    method: 'POST',
    body: JSON.stringify({ userId }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token
    }
  })

  if (!res.ok) {
    throw new Error(
      `Unable to retrieve user details. Error: ${res.status} status received`
    )
  }

  return res.json() as Promise<User>
}
