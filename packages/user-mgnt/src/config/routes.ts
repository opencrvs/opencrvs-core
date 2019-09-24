import * as Hapi from 'hapi'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from '@user-mgnt/features/verifyPassword/handler'
import getUserMobile, {
  requestSchema as userIdSchema,
  responseSchema as resMobileSchema
} from '@user-mgnt/features/getUserMobile/handler'
import searchUsers, {
  searchSchema
} from '@user-mgnt/features/searchUsers/handler'
import getUser, {
  getUserRequestSchema
} from '@user-mgnt/features/getUser/handler'
import createUser from '@user-mgnt/features/createUser/handler'
import getRoles, {
  searchRoleSchema
} from '@user-mgnt/features/getRoles/handler'
import activateUser, {
  requestSchema as activateUserRequestSchema
} from '@user-mgnt/features/activateUser/handler'
import verifyUserHandler, {
  requestSchema as reqVerifyUserSchema,
  responseSchema as resVerifyUserSchema
} from '@user-mgnt/features/verifyUser/handler'

const enum RouteScope {
  DECLARE = 'declare',
  REGISTER = 'register',
  CERTIFY = 'certify',
  PERFORMANCE = 'performance',
  SYSADMIN = 'sysadmin',
  VALIDATE = 'validate'
}

export const getRoutes = () => {
  const routes = [
    {
      method: 'POST',
      path: '/verifyPassword',
      handler: verifyPassHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Verify user password',
        notes: 'Verify account exist and password is correct',
        validate: {
          payload: reqAuthSchema
        },
        response: {
          schema: resAuthSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/check-token',
      handler: (request: Hapi.Request) => request.auth.credentials
    },
    {
      method: 'POST',
      path: '/getUserMobile',
      handler: getUserMobile,
      config: {
        tags: ['api'],
        description: 'Retrieves a user mobile number',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: userIdSchema
        },
        response: {
          schema: resMobileSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/searchUsers',
      handler: searchUsers,
      config: {
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: searchSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/getUser',
      handler: getUser,
      config: {
        tags: ['api'],
        description: 'Retrieves a user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: getUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/createUser',
      handler: createUser,
      config: {
        tags: ['api'],
        description: 'Creates a new user',
        auth: {
          scope: [RouteScope.SYSADMIN]
        }
      }
    },
    {
      method: 'POST',
      path: '/activateUser',
      handler: activateUser,
      config: {
        tags: ['api'],
        description: 'Activate an existing pending user',
        auth: {
          scope: [
            RouteScope.DECLARE,
            RouteScope.REGISTER,
            RouteScope.CERTIFY,
            RouteScope.PERFORMANCE,
            RouteScope.SYSADMIN,
            RouteScope.VALIDATE
          ]
        },
        validate: {
          payload: activateUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/getRoles',
      handler: getRoles,
      config: {
        auth: {
          scope: [RouteScope.SYSADMIN]
        },
        validate: {
          payload: searchRoleSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/verifyUser',
      handler: verifyUserHandler,
      config: {
        auth: false,
        tags: ['api'],
        description: 'Verify user',
        notes: 'Verify account exist',
        validate: {
          payload: reqVerifyUserSchema
        },
        response: {
          schema: resVerifyUserSchema
        }
      }
    }
  ]
  return routes
}
