import * as Hapi from '@hapi/hapi'
import { uniqueId } from 'lodash'

export interface IAuthHeader {
  Authorization: string
  'x-correlation-id'?: string
  'x-real-ip'?: string
  'x-real-user-agent'?: string
}

export function getAuthHeader(request: Hapi.Request) {
  return {
    Authorization: request.headers.authorization,
    'x-correlation-id': request.headers['x-correlation-id'] || uniqueId(),
    'x-real-ip': request.headers['x-real-ip'] || request.info?.remoteAddress,
    'x-real-user-agent': request.headers['user-agent']
  }
}
