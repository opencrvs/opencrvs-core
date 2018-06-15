import * as Hapi from 'hapi'

interface IAuthPayload {
  mobile: string
  password: string
}

interface IAuthResponse {
  nonce: string
  mobile: string
}

export default function authenticateHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as IAuthPayload
  // TODO OCRVS-326
  const response: IAuthResponse = { nonce: 'test1234', mobile: payload.mobile }
  return response
}
