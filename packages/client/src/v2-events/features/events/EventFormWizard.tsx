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

import {
  Frame,
  AppBar,
  Stack,
  Button,
  Icon,
  Content,
  FormWizard,
  Spinner
} from '@opencrvs/components'
import React from 'react'
import { useEventConfiguration } from './useEventConfiguration'
import { EventConfig } from '@opencrvs/commons/client'
import {
  TextField,
  Paragraph,
  DateField,
  RadioGroup
} from './registered-fields'
import { usePagination } from '@client/v2-events/hooks/usePagination'
import { useEventFormNavigation } from './useEventFormNavigation'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

export function EventFormWizardIndex() {
  const { eventType } = useParams<{ eventType: string }>()
  const { event } = useEventConfiguration(eventType)

  if (!event) {
    throw new Error('Event not found')
  }

  return (
    <React.Suspense fallback={<Spinner id="event-form-spinner" />}>
      <EventFormWizard event={event} />
    </React.Suspense>
  )
}

export function EventFormWizard({ event }: { event: EventConfig }) {
  const intl = useIntl()
  const { page, next, previous } = usePagination(
    event.actions[0].forms[0].pages.length
  )
  const { modal, exit } = useEventFormNavigation()

  return (
    <Frame
      skipToContentText="Skip to form"
      header={
        <AppBar
          mobileLeft={intl.formatMessage(event.label)}
          desktopLeft={intl.formatMessage(event.label)}
          desktopRight={
            <Stack direction="row">
              <Button
                type="primary"
                onClick={() => alert('Whoops... Not implemented.')}
              >
                <Icon name="DownloadSimple" />
                Save and exit
              </Button>
              <Button type="secondary" onClick={exit}>
                <Icon name="X" />
                Exit
              </Button>
            </Stack>
          }
        />
      }
    >
      {modal}

      <Frame.LayoutForm>
        <Frame.SectionFormBackAction>
          {previous && (
            <Button type="tertiary" size="small" onClick={previous}>
              <Icon name="ArrowLeft" size="medium" />
              Back
            </Button>
          )}
        </Frame.SectionFormBackAction>

        <Frame.Section>
          <Content title={intl.formatMessage(event.label)}>
            <FormWizard
              currentPage={page}
              pages={event.actions[0].forms[0].pages}
              components={{
                TEXT: TextField,
                PARAGRAPH: Paragraph,
                DATE: DateField,
                RADIO_GROUP: RadioGroup
              }}
              onNextPage={next}
              onSubmit={() => {}}
            />
          </Content>
        </Frame.Section>
      </Frame.LayoutForm>
    </Frame>
  )
}
