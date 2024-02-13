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
import { getDataSources, resolvers, schema } from '@gateway/graphql/config'
import { Context } from '@gateway/graphql/context'
import { generateQueryForType } from '@gateway/graphql/query-generator'
import {
  GQLBirthRegistration,
  GQLDeathRegistration,
  GQLMarriageRegistration
} from '@gateway/graphql/schema'
import { addResolversToSchema } from '@graphql-tools/schema'
import { Bundle, Saved, getEventLabelFromBundle } from '@opencrvs/commons/types'
import { ApolloServer } from 'apollo-server-hapi'

type Registration =
  | GQLBirthRegistration
  | GQLDeathRegistration
  | GQLMarriageRegistration

function fakeResolver(record: Saved<Bundle>) {
  return (_: any, __: any, context: Context) => {
    context.record = record
    return record
  }
}

export async function fhirBundleToOpenCRVSRecord(
  bundle: Saved<Bundle>,
  authorizationToken: string
): Promise<Registration> {
  const eventLabel = getEventLabelFromBundle(bundle)
  const myResolvers = {
    ...resolvers,
    Query: {
      ...resolvers.Query,
      fetchDeathRegistration: fakeResolver(bundle),
      fetchMarriageRegistration: fakeResolver(bundle),
      fetchBirthRegistration: fakeResolver(bundle)
    }
  }
  const schemaWithMockResolvers = addResolversToSchema({
    schema,
    resolvers: myResolvers
  })

  const query = `query {
      fetch${eventLabel}(id: "") {
        ${generateQueryForType(schemaWithMockResolvers, eventLabel)}
      }
    }
    `

  const apolloServer = new ApolloServer({
    schema: schemaWithMockResolvers,
    dataSources: getDataSources,
    context: async ({ request }): Promise<Omit<Context, 'dataSources'>> => {
      return {
        request,
        presignDocumentUrls: false,
        headers: {
          Authorization: authorizationToken
        }
      }
    }
  })

  const result = await apolloServer.executeOperation({ query })

  if (!result.data || result.errors) {
    throw new Error('Failed to converting FHIR to OpenCRVS model')
  }
  return Object.values(result.data)[0]
}
