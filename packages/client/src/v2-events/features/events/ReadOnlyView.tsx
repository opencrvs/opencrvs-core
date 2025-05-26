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

import React, { useMemo } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { noop } from 'lodash'
import { getCurrentEventStateWithDrafts } from '@opencrvs/commons/client'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ROUTES } from '@client/v2-events/routes'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { FormLayout } from '@client/v2-events/layouts'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'

function ReadonlyView() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.DECLARE.REVIEW)
  const events = useEvents()
  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { getRemoteDrafts } = useDrafts()
  const drafts = getRemoteDrafts()
  const eventStateWithDrafts = useMemo(
    () => getCurrentEventStateWithDrafts(event, drafts),
    [drafts, event]
  )
  const { eventConfiguration: configuration } = useEventConfiguration(
    event.type
  )
  const { formatMessage } = useIntlFormatMessageWithFlattenedParams()
  return (
    <FormLayout route={ROUTES.V2.EVENTS.DECLARE}>
      <ReviewComponent.Body
        readonlyMode
        form={eventStateWithDrafts.declaration}
        formConfig={configuration.declaration}
        title={formatMessage(
          configuration.title,
          eventStateWithDrafts.declaration
        )}
        onEdit={noop}
      >
        <></>
      </ReviewComponent.Body>
    </FormLayout>
  )
}

export const ReadonlyViewIndex = withSuspense(ReadonlyView)
