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

import { GQLRegStatus, GQLResolver } from '@gateway/graphql/schema'
import { resolvers as searchResolvers } from '@gateway/features/search/root-resolvers'

type WorkqueueConfiguration = {
  slug: string
  name: Array<{ language: string; text: string }>
  query: {
    registrationStatuses: Array<GQLRegStatus>
    compositionType?: Array<string> // @TODO: Strictly type this
  }
  tabs?: Array<Exclude<WorkqueueConfiguration, 'tabs'>>
}

const fetchWorkqueueConfiguration = async () => {
  // @TODO: Fetch these from country config, if the result is 404, return this default array. If it errors otherwise, throw an error.
  // @TODO: When the users have the "requiredScopes" scopes, already filter them here. Only return the workqueues the user actually has access to

  return [
    {
      // requiredScopes: ['view-in-progress-records'],
      slug: 'in-progress',
      name: [
        {
          language: 'en',
          text: 'In progress'
        },
        {
          language: 'fr',
          text: 'In prógress'
        }
      ],
      query: {
        registrationStatuses: [GQLRegStatus.IN_PROGRESS],
        compositionType: [
          'birth-declaration',
          'death-declaration',
          'marriage-declaration'
        ]
      },
      tabs: [
        {
          slug: 'field-agents',
          name: [
            {
              language: 'en',
              text: 'Field agents'
            },
            {
              language: 'fr',
              text: 'Fiéld agénts'
            }
          ],
          query: { registrationStatuses: [GQLRegStatus.IN_PROGRESS] }
        }
      ]
    },
    {
      slug: 'ready-for-review',
      name: [
        {
          language: 'en',
          text: 'Ready for review'
        },
        {
          language: 'fr',
          text: 'Réady for review'
        }
      ],
      query: { registrationStatuses: [GQLRegStatus.WAITING_VALIDATION] }
    },
    {
      slug: 'correction-requested',
      // requiredScopes: ['view-correction-requests'],
      name: [
        { language: 'en', text: 'Correction requested' },
        { language: 'fr', text: 'Corréction réquested' }
      ],
      query: { registrationStatuses: [GQLRegStatus.CORRECTION_REQUESTED] }
    },
    {
      slug: 'ready-to-print',
      name: [
        {
          language: 'en',
          text: 'Ready to print'
        },
        { language: 'fr', text: 'Réady to print' }
      ],
      query: { registrationStatuses: [GQLRegStatus.REGISTERED] }
    }
  ] satisfies WorkqueueConfiguration[]
}

export const resolvers: GQLResolver = {
  Query: {
    async getWorkqueues(_, __, context, info) {
      const workqueueConfiguration = await fetchWorkqueueConfiguration()
      return workqueueConfiguration
    },
    async getWorkqueue(_, { slug }, context, info) {
      const workqueueConfiguration = await fetchWorkqueueConfiguration()
      const requestedWorkqueue = workqueueConfiguration.find(
        (workqueue) => workqueue.slug === slug
      )

      if (!requestedWorkqueue) {
        throw new Error(
          "The workqueue doesn't exist or the requesting user doesn't have access to it."
        )
      }

      const result = await searchResolvers.Query?.searchEvents?.(
        null,
        { advancedSearchParameters: requestedWorkqueue.query },
        context,
        info
      )

      console.log(
        { advancedSearchParameters: requestedWorkqueue.query },
        result
      )

      return result
    }
  }
}
