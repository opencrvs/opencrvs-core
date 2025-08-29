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

import React from 'react'

import {
  useTypedParams,
  useTypedSearchParams
} from 'react-router-typesafe-routes/dom'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { FloatingActionButton } from '@opencrvs/components/lib/buttons'
import { PlusTransparentWhite } from '@opencrvs/components/lib/icons'
import { useEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'

import { ROUTES } from '@client/v2-events/routes'
import { useWorkqueue } from '@client/v2-events/hooks/useWorkqueue'
import { CoreWorkqueues } from '@client/v2-events/utils'
import { SearchResultComponent } from '../events/Search/SearchResult'
import { useCountryConfigWorkqueueConfigurations } from '../events/useCountryConfigWorkqueueConfigurations'
import { useOutbox } from '../events/useEvents/outbox'
import { Outbox } from './Outbox'
import { Draft } from './Draft'

const FabContainer = styled.div`
  position: fixed;
  right: 40px;
  bottom: 55px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

function ConfigurableWorkqueue({ workqueueSlug }: { workqueueSlug: string }) {
  const [searchParams] = useTypedSearchParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  const eventConfigs = useEventConfigurations()
  const workqueues = useCountryConfigWorkqueueConfigurations()

  const { getResult } = useWorkqueue(workqueueSlug)
  const outbox = useOutbox()

  const data = getResult({
    offset: searchParams.offset || 0,
    limit: 10
  }).useSuspenseQuery()

  const { total, results } = data
  const events = results.filter(
    (event) => !outbox.find(({ id }) => id === event.id)
  )

  const intl = useIntl()
  const workqueueConfig = workqueues.find(({ slug }) => slug === workqueueSlug)

  if (!workqueueConfig) {
    throw new Error('Workqueue configuration not found for' + workqueueSlug)
  }

  const actions = workqueueConfig.actions.map(({ type }) => type)

  return (
    <SearchResultComponent
      key={`${workqueueSlug}-${outbox.length}`}
      actions={actions}
      columns={workqueueConfig.columns}
      emptyMessage={workqueueConfig.emptyMessage}
      eventConfigs={eventConfigs}
      queryData={events}
      title={intl.formatMessage(workqueueConfig.name)}
      totalResults={total}
      {...searchParams}
    />
  )
}

function WorkqueueContent() {
  const { slug: workqueueSlug } = useTypedParams(ROUTES.V2.WORKQUEUES.WORKQUEUE)
  if (!workqueueSlug) {
    throw new Error('Workqueue slug is required')
  }
  if (workqueueSlug === CoreWorkqueues.OUTBOX) {
    return <Outbox />
  }
  if (workqueueSlug === CoreWorkqueues.DRAFT) {
    return <Draft />
  }
  return <ConfigurableWorkqueue workqueueSlug={workqueueSlug} />
}

export function WorkqueueContainer() {
  return (
    <>
      <WorkqueueContent />
      <FabContainer>
        <Link to={ROUTES.V2.EVENTS.CREATE.path}>
          <FloatingActionButton
            icon={() => <PlusTransparentWhite />}
            id="new_event_declaration"
          />
        </Link>
      </FabContainer>
    </>
  )
}
