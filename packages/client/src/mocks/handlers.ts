import { rest, graphql } from 'msw'
import {
  FetchUserQuery,
  FetchUserQueryVariables,
  GetSystemRolesQuery,
  GetSystemRolesQueryVariables
} from '@client/utils/gateway'
import healthFacilities from './sources/healthFacilities'
import adminStructures from './sources/adminStructures'
import offices from './sources/offices'
import config from './sources/config'
import forms from './sources/forms'
import content from './sources/content'
import { registrar } from './sources/userResponses'
import systemRoles from './sources/systemRoles'

const userHandler = graphql.query<FetchUserQuery, FetchUserQueryVariables>(
  'fetchUser',
  (_, res, ctx) => {
    return res(ctx.data(registrar))
  }
)

const systemRolesHandler = graphql.query<
  GetSystemRolesQuery,
  GetSystemRolesQueryVariables
>('getSystemRoles', (_, res, ctx) => {
  return res(ctx.data(systemRoles))
})

const locationHandler = rest.get(
  'http://localhost:7070/location',
  (req, res, ctx) => {
    const type = req.url.searchParams.get('type')
    if (type === 'CRVS_OFFICE') {
      return res(ctx.json(offices))
    } else if (type === 'ADMIN_STRUCTURE') {
      return res(ctx.json(adminStructures))
    } else if (type === 'HEALTH_FACILITY') {
      return res(ctx.json(healthFacilities))
    }
    throw new Error('Unimplemented')
  }
)

const configHandler = rest.get(
  'http://localhost:2021/config',
  (_, res, ctx) => {
    return res(ctx.json(config))
  }
)

const formsHandler = rest.get('http://localhost:2021/forms', (_, res, ctx) => {
  return res(ctx.status(201), ctx.json(forms))
})

const contentHandler = rest.get(
  'http://localhost:3040/content/client',
  (_, res, ctx) => {
    return res(ctx.json(content))
  }
)

const certificatesHandler = rest.get(
  'http://localhost:3535/certificates/:event',
  (req, res, ctx) => {
    const { event } = req.params
    if (event === 'birth') {
      return res(ctx.text('dummy'))
    } else if (event === 'death') {
      return res(ctx.text('dummy'))
    } else if (event === 'marriage') {
      return res(ctx.text('dummy'))
    }
    throw new Error('Unimplemented')
  }
)

const handlers = [
  locationHandler,
  userHandler,
  configHandler,
  formsHandler,
  contentHandler,
  certificatesHandler,
  systemRolesHandler
]

export default handlers
