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
import styled from 'styled-components'
import { defineMessages, useIntl } from 'react-intl'
import { EventIndex } from '@opencrvs/commons/client'
import { Icon } from '@opencrvs/components'
import { useVersionedEventConfigurations } from '@client/v2-events/features/events/useEventConfiguration'

const messages = defineMessages({
  title: {
    id: 'search.result.unknownConfigVersion.title',
    defaultMessage: '{trackingId} cannot be shown',
    description:
      'Shown in place of a workqueue or search row when the record was created under a configuration version that is not available'
  },
  description: {
    id: 'search.result.unknownConfigVersion.description',
    defaultMessage: 'Unknown configuration version',
    description:
      'Second line of a workqueue or search row whose record was created under a configuration version that is not available'
  },
  details: {
    id: 'search.result.unknownConfigVersion.details',
    defaultMessage:
      'Record {trackingId} was created under version: "{version}" of the {event} configuration, which is not available. Please contact your system administrator.',
    description:
      'Shown on hover over a workqueue or search row whose record was created under a configuration version that is not available'
  }
})

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const IconWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
`

// A row is 72px high and its cells keep to one line, so each line cuts off at the cell's edge
const Lines = styled.div`
  min-width: 0;
  & > div {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.negative};
`

const Description = styled.div`
  ${({ theme }) => theme.fonts.reg12};
  color: ${({ theme }) => theme.colors.grey500};
`

/**
 * The title cell of a row whose record was created under a configuration version that
 * is not available. The record cannot be shown with that version, so the row shows this
 * message instead of the record's details.
 */
export function UnknownConfigVersionTitle({ event }: { event: EventIndex }) {
  const intl = useIntl()
  const versionedConfig = useVersionedEventConfigurations().find(
    ({ id }) => id === event.type
  )

  return (
    <Wrapper
      data-testid={`unknown-config-version-${event.id}`}
      title={intl.formatMessage(messages.details, {
        trackingId: event.trackingId,
        version: event.configVersionId,
        event: versionedConfig
          ? intl.formatMessage(versionedConfig.label)
          : event.type
      })}
    >
      <IconWrapper>
        <Icon color="red" name="WarningCircle" size="medium" />
      </IconWrapper>
      <Lines>
        <Title>
          {intl.formatMessage(messages.title, {
            trackingId: event.trackingId
          })}
        </Title>
        <Description>{intl.formatMessage(messages.description)}</Description>
      </Lines>
    </Wrapper>
  )
}
