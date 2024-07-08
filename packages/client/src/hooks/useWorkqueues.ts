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

import { gql, useQuery } from '@apollo/client'
import { Query, Translation } from '@client/utils/gateway'
import { generatePath, useParams } from 'react-router'
import * as routes from '@client/navigation/routes'

const FETCH_WORKQUEUE = gql`
  query getWorkqueue($slug: String!) {
    getWorkqueue(slug: $slug) {
      results {
        id
      }
    }
  }
`

const FETCH_WORKQUEUES = gql`
  query getWorkqueues {
    getWorkqueues {
      slug
      name {
        language
        text
      }
    }
  }
`

const translateWorkqueueTitle = (translations: Translation[]) => {
  return translations[0].text // @TODO: Handle translations: getDefaultLanguage
}

export const useWorkqueue = () => {
  const { slug } = useParams<{ slug: string }>()
  const workqueueConfiguration = useWorkqueueConfiguration(slug)
  const { data, loading, error } = useQuery<Pick<Query, 'getWorkqueue'>>(
    FETCH_WORKQUEUE,
    {
      variables: { slug }
    }
  )

  return {
    title:
      workqueueConfiguration &&
      translateWorkqueueTitle(workqueueConfiguration.name),
    records: data?.getWorkqueue.results,
    totalItems: data?.getWorkqueue.totalItems,
    loading,
    error
  }
}

export const useWorkqueues = () => {
  const { data, loading, error } =
    useQuery<Pick<Query, 'getWorkqueues'>>(FETCH_WORKQUEUES)

  const links = data?.getWorkqueues.map(({ slug, name }) => ({
    path: generatePath(routes.WORKQUEUE, { slug }),
    label: translateWorkqueueTitle(name)
  }))

  return { links, loading, error }
}

export const useWorkqueueConfiguration = (slug: string) => {
  const { data } = useQuery<Pick<Query, 'getWorkqueues'>>(FETCH_WORKQUEUES)
  return data?.getWorkqueues.find((workqueue) => workqueue.slug === slug)
}
