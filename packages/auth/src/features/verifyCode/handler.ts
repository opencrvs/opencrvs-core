import * as Hapi from 'hapi'

interface IVerifyPayload {
  nonce: string
  code: string
}

export default function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IVerifyPayload
  // TODO OCRVS-327
  return payload.code // should return either a 200 (code valid) or 400 (code invalid)
}
