/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { resolvers as certificateResolvers } from '@gateway/features/certificate/root-resolvers'
import { resolvers as locationRootResolvers } from '@gateway/features/location/root-resolvers'
import { resolvers as metricsRootResolvers } from '@gateway/features/metrics/root-resolvers'
import { resolvers as notificationRootResolvers } from '@gateway/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from '@gateway/features/registration/root-resolvers'
import { typeResolvers } from '@gateway/features/registration/type-resolvers'
import { resolvers as roleRootResolvers } from '@gateway/features/role/root-resolvers'
import { roleTypeResolvers } from '@gateway/features/role/type-resolvers'
import { resolvers as searchRootResolvers } from '@gateway/features/search/root-resolvers'
import { searchTypeResolvers } from '@gateway/features/search/type-resolvers'
import { resolvers as userRootResolvers } from '@gateway/features/user/root-resolvers'
import { resolvers as correctionRootResolvers } from '@gateway/features/correction/root-resolvers'
import { resolvers as questionResolvers } from '@gateway/features/questions/root-resolvers'
import {
  IUserModelData,
  userTypeResolvers
} from '@gateway/features/user/type-resolvers'
import {
  getUser,
  getUserId,
  getTokenPayload
} from '@gateway/features/user/utils'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchemaSync } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { AuthenticationError, Config, gql } from 'apollo-server-hapi'
import { readFileSync } from 'fs'
import { GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools'
import { merge, isEqual, uniqueId } from 'lodash'

const graphQLSchemaPath = `${__dirname}/schema.graphql`

interface IStringIndexSignatureInterface {
  [index: string]: any
}

type StringIndexed<T> = T & IStringIndexSignatureInterface

const resolvers: StringIndexed<IResolvers> = merge(
  notificationRootResolvers as IResolvers,
  registrationRootResolvers as IResolvers,
  locationRootResolvers as IResolvers,
  userRootResolvers as IResolvers,
  userTypeResolvers as IResolvers,
  metricsRootResolvers as IResolvers,
  typeResolvers as IResolvers,
  searchRootResolvers as IResolvers,
  searchTypeResolvers as IResolvers,
  roleRootResolvers as IResolvers,
  roleTypeResolvers as IResolvers,
  certificateResolvers as IResolvers,
  correctionRootResolvers as IResolvers,
  questionResolvers as IResolvers
)

export const getExecutableSchema = (): GraphQLSchema => {
  const schema = loadSchemaSync(graphQLSchemaPath, {
    loaders: [new GraphQLFileLoader()]
  })

  return addResolversToSchema({
    schema,
    resolvers
  })
}

export const getApolloConfig = (): Config => {
  const typeDefs = gql`
    ${readFileSync(graphQLSchemaPath, 'utf8')}
  `

  return {
    typeDefs,
    resolvers,
    context: async ({ request, h }) => {
      try {
        const userId = getUserId({
          Authorization: request.headers.authorization
        })
        const user: IUserModelData = await getUser(
          { userId },
          { Authorization: request.headers.authorization }
        )
        if (!user || !['active', 'pending'].includes(user.status)) {
          throw new AuthenticationError('Authentication failed')
        }
        const tokenPayload = getTokenPayload(
          request.headers.authorization.split(' ')[1]
        )
        if (tokenPayload && !isEqual(tokenPayload.scope, user.scope)) {
          throw new AuthenticationError('Authentication failed')
        }
      } catch (err) {
        throw new AuthenticationError(err)
      }

      return {
        Authorization: request.headers.authorization,
        'x-correlation-id': request.headers['x-correlation-id'] || uniqueId()
      }
    }
  }
}
