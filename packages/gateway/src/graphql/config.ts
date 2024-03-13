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
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'
import {
  Kind,
  GraphQLScalarType,
  defaultFieldResolver,
  GraphQLSchema
} from 'graphql'

import { resolvers as certificateResolvers } from '@gateway/features/certificate/root-resolvers'
import { resolvers as locationRootResolvers } from '@gateway/features/location/root-resolvers'
import { resolvers as metricsRootResolvers } from '@gateway/features/metrics/root-resolvers'
import { resolvers as integrationResolver } from '@gateway/features/systems/root-resolvers'
import { typeResolvers as metricsTypeResolvers } from '@gateway/features/metrics/type-resolvers'
import { resolvers as notificationRootResolvers } from '@gateway/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from '@gateway/features/registration/root-resolvers'
import { typeResolvers } from '@gateway/features/registration/type-resolvers'
import { resolvers as roleRootResolvers } from '@gateway/features/role/root-resolvers'
import { roleTypeResolvers } from '@gateway/features/role/type-resolvers'
import { resolvers as searchRootResolvers } from '@gateway/features/search/root-resolvers'
import { searchTypeResolvers } from '@gateway/features/search/type-resolvers'
import { resolvers as userRootResolvers } from '@gateway/features/user/root-resolvers'
import { resolvers as correctionRootResolvers } from '@gateway/features/correction/root-resolvers'
import { resolvers as applicationRootResolvers } from '@gateway/features/application/root-resolvers'
import { resolvers as bookmarkAdvancedSearchResolvers } from '@gateway/features/bookmarkAdvancedSearch/root-resolvers'
import { resolvers as informantSMSNotificationResolvers } from '@gateway/features/informantSMSNotifications/root-resolvers'
import { resolvers as OIDPUserInfoResolvers } from '@gateway/features/OIDPUserInfo/root-resolvers'
import {
  ISystemModelData,
  IUserModelData,
  userTypeResolvers
} from '@gateway/features/user/type-resolvers'
import { getUser, getSystem } from '@gateway/features/user/utils'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import {
  addResolversToSchema,
  makeExecutableSchema
} from '@graphql-tools/schema'
import { AuthenticationError, Config, gql } from 'apollo-server-hapi'
import { readFileSync } from 'fs'
import { IResolvers } from 'graphql-tools'
import { merge, isEqual } from 'lodash'
import { certificateTypeResolvers } from '@gateway/features/certificate/type-resolvers'
import { informantSMSNotiTypeResolvers } from '@gateway/features/informantSMSNotifications/type-resolvers'
import LocationsAPI from '@gateway/features/fhir/locationsAPI'
import DocumentsAPI from '@gateway/features/fhir/documentsAPI'
import PaymentsAPI from '@gateway/features/fhir/paymentsAPI'
import FHIRAPI from '@gateway/features/fhir/FHIRAPI'
import { Context } from '@gateway/graphql/context'
import PatientAPI from '@gateway/features/fhir/patientAPI'
import MinioAPI from '@gateway/features/fhir/minioAPI'
import { getAuthHeader } from '@opencrvs/commons/http'
import { UsersAPI } from '@gateway/features/user/usersAPI'
import MetricsAPI from '@gateway/features/fhir/metricsAPI'

const graphQLSchemaPath = `${__dirname}/schema.graphql`

interface IStringIndexSignatureInterface {
  [index: string]: any
}

type StringIndexed<T> = T & IStringIndexSignatureInterface

export const resolvers: StringIndexed<IResolvers> = merge(
  notificationRootResolvers as IResolvers,
  registrationRootResolvers as IResolvers,
  locationRootResolvers as IResolvers,
  userRootResolvers as IResolvers,
  userTypeResolvers as IResolvers,
  certificateTypeResolvers as IResolvers,
  metricsRootResolvers as IResolvers,
  integrationResolver as IResolvers,
  metricsTypeResolvers as IResolvers,
  typeResolvers as IResolvers,
  searchRootResolvers as IResolvers,
  searchTypeResolvers as IResolvers,
  roleRootResolvers as IResolvers,
  roleTypeResolvers as IResolvers,
  certificateResolvers as IResolvers,
  correctionRootResolvers as IResolvers,
  applicationRootResolvers as IResolvers,
  integrationResolver as IResolvers,
  bookmarkAdvancedSearchResolvers as IResolvers,
  informantSMSNotificationResolvers as IResolvers,
  informantSMSNotiTypeResolvers as IResolvers,
  OIDPUserInfoResolvers as IResolvers,
  {
    FieldValue: new GraphQLScalarType({
      name: 'FieldValue',
      description: 'String, Number or Boolean',
      serialize(value) {
        if (!['string', 'number', 'boolean'].includes(typeof value)) {
          throw new Error('Value must be either a String, Boolean or an number')
        }

        return value
      },
      parseValue(value) {
        if (!['string', 'number', 'boolean'].includes(typeof value)) {
          throw new Error('Value must be either a String, Boolean or an number')
        }

        return value
      },
      parseLiteral(ast) {
        switch (ast.kind) {
          case Kind.INT:
            return parseInt(ast.value, 10)
          case Kind.FLOAT:
            return parseFloat(ast.value)
          case Kind.BOOLEAN:
            return ast.value
          case Kind.STRING:
            return ast.value
          default:
            throw new Error(
              'Value must be either a String, Boolean or an number'
            )
        }
      }
    })
  }
)

export const schema = loadSchemaSync(graphQLSchemaPath, {
  loaders: [new GraphQLFileLoader()]
})

export const getExecutableSchema = (): GraphQLSchema => {
  return addResolversToSchema({
    schema,
    resolvers
  })
}

export function authSchemaTransformer(schema: GraphQLSchema) {
  const directiveName = 'auth'

  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, fieldType) => {
      if (!['Mutation', 'Query'].includes(fieldType)) {
        return undefined
      }

      const authDirective = getDirective(
        schema,
        fieldConfig,
        directiveName
      )?.[0]

      const { resolve = defaultFieldResolver } = fieldConfig
      fieldConfig.resolve = async function (source, args, context, info) {
        if (authDirective && authDirective.requires === 'ANONYMOUS') {
          return resolve(source, args, context, info)
        }

        if (!context.request.auth.isAuthenticated) {
          throw new AuthenticationError('Unauthorized')
        }

        const credentials = context.request.auth.credentials

        try {
          const userId = credentials.sub
          let user: IUserModelData | ISystemModelData
          const isSystemUser = credentials.scope.indexOf('recordsearch') > -1
          if (isSystemUser) {
            user = await getSystem(
              { systemId: userId },
              { Authorization: context.request.headers.authorization }
            )
          } else {
            user = await getUser(
              { userId },
              { Authorization: context.request.headers.authorization }
            )
          }

          if (!user || !['active', 'pending'].includes(user.status)) {
            throw new AuthenticationError('Authentication failed')
          }

          if (credentials && !isEqual(credentials.scope, user.scope)) {
            throw new AuthenticationError('Authentication failed')
          }
        } catch (err) {
          throw new AuthenticationError(err)
        }

        return resolve(source, args, context, info)
      }
      return fieldConfig
    }
  })
}

export function getDataSources(): Context['dataSources'] {
  return {
    documentsAPI: new DocumentsAPI(),
    paymentsAPI: new PaymentsAPI(),
    locationsAPI: new LocationsAPI(),
    usersAPI: new UsersAPI(),
    fhirAPI: new FHIRAPI(),
    patientAPI: new PatientAPI(),
    minioAPI: new MinioAPI(),
    metricsAPI: new MetricsAPI()
  }
}

export const getApolloConfig = (): Config<Context> => {
  const typeDefs = gql`
    ${readFileSync(graphQLSchemaPath, 'utf8')}
  `
  const schema = authSchemaTransformer(
    makeExecutableSchema({
      typeDefs,
      resolvers
    })
  )

  return {
    schema,
    introspection: true,
    dataSources: getDataSources,
    context: async ({ request }): Promise<Omit<Context, 'dataSources'>> => {
      return {
        request,
        presignDocumentUrls: true,
        headers: getAuthHeader(request)
      }
    }
  }
}
