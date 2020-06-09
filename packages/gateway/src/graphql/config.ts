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

import { IResolvers } from 'graphql-tools'
import { resolvers as notificationRootResolvers } from '@gateway/features/notification/root-resolvers'
import { resolvers as registrationRootResolvers } from '@gateway/features/registration/root-resolvers'
import { resolvers as locationRootResolvers } from '@gateway/features/location/root-resolvers'
import { resolvers as userRootResolvers } from '@gateway/features/user/root-resolvers'
import { resolvers as metricsRootResolvers } from '@gateway/features/metrics/root-resolvers'
import { typeResolvers } from '@gateway/features/registration/type-resolvers'
import { resolvers as searchRootResolvers } from '@gateway/features/search/root-resolvers'
import { searchTypeResolvers } from '@gateway/features/search/type-resolvers'
import { userTypeResolvers } from '@gateway/features/user/type-resolvers'
import { resolvers as roleRootResolvers } from '@gateway/features/role/root-resolvers'
import { roleTypeResolvers } from '@gateway/features/role/type-resolvers'
import { Config, gql } from 'apollo-server-hapi'
import { GraphQLSchema } from 'graphql'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { addResolversToSchema } from '@graphql-tools/schema'
import { readFileSync } from 'fs'

const graphQLSchemaPath = `${__dirname}/index.graphql`

interface IStringIndexSignatureInterface {
  [index: string]: any
}

type StringIndexed<T> = T & IStringIndexSignatureInterface

export const getExecutableSchema = (): GraphQLSchema => {
  const schema = loadSchemaSync(graphQLSchemaPath, {
    loaders: [new GraphQLFileLoader()]
  })
  const resolvers: StringIndexed<IResolvers> = {
    // the types we generate out of our schema aren't
    // compatible with the types graphql-tools uses internally.
    ...(notificationRootResolvers as IResolvers),
    ...(registrationRootResolvers as IResolvers),
    ...(locationRootResolvers as IResolvers),
    ...(userRootResolvers as IResolvers),
    ...(userTypeResolvers as IResolvers),
    ...(metricsRootResolvers as IResolvers),
    ...(typeResolvers as IResolvers),
    ...(searchRootResolvers as IResolvers),
    ...(searchTypeResolvers as IResolvers),
    ...(roleRootResolvers as IResolvers),
    ...(roleTypeResolvers as IResolvers)
  }

  return addResolversToSchema({
    schema,
    resolvers
  })
}

export const getApolloConfig = (): Config => {
  const typeDefs = gql`
    ${readFileSync(graphQLSchemaPath, 'utf8')}
  `
  const resolvers: StringIndexed<IResolvers> = {
    // the types we generate out of our schema aren't
    // compatible with the types graphql-tools uses internally.
    ...(notificationRootResolvers as IResolvers),
    ...(registrationRootResolvers as IResolvers),
    ...(locationRootResolvers as IResolvers),
    ...(userRootResolvers as IResolvers),
    ...(userTypeResolvers as IResolvers),
    ...(metricsRootResolvers as IResolvers),
    ...(typeResolvers as IResolvers),
    ...(searchRootResolvers as IResolvers),
    ...(searchTypeResolvers as IResolvers),
    ...(roleRootResolvers as IResolvers),
    ...(roleTypeResolvers as IResolvers)
  }
  return {
    typeDefs,
    resolvers
  }
}
