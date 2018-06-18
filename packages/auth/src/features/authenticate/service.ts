import fetch from 'node-fetch'
import { USER_MANAGEMENT_URL } from 'src/config'
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
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ mobile, password })
  })

  const body = await res.json()

  if (!body.valid) {
    throw new UnauthorizedError('Unauthorized')
  }

  return { nonce: body.nonce, mobile }
}
