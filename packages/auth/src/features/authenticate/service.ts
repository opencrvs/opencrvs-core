import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from 'src/constants'
import { resolve } from 'url'

interface IAuthentication {
  nonce: string
  mobile: string
}

export class UnauthorizedError extends Error {}

export function isUnauthorizedError(err: Error) {
  return err instanceof UnauthorizedError
}

export async function authenticate(
  mobile: string,
  password: string
): Promise<IAuthentication> {
  const url = resolve(USER_MANAGEMENT_URL, '/authenticate')

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ mobile, password })
    })
  } catch (err) {
    throw new UnauthorizedError('Unauthorized')
  }
  const body = await res.json()

  return { nonce: body.nonce, mobile }
}
