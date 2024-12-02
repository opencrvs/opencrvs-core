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
  FormWizard
} from '@opencrvs/components'
import React from 'react'
import { useEvent } from './useEvent'
import { useParams } from 'react-router-dom'
import { useEventForm } from './useEventForm'
import { EventConfig } from '@opencrvs/commons/client'
import {
  TextField,
  Paragraph,
  DateField,
  RadioGroup
} from './registered-fields'

export function EventFormWizardIndex() {
  const { eventType } = useParams<{ eventType: string }>()

  const { event, isLoading } = useEvent(eventType)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!event) {
    throw new Error('Event not found')
  }

  return <EventFormWizard event={event} />
}

export function EventFormWizard({ event }: { event: EventConfig }) {
  const { title, pages, exit, saveAndExit, previous, next, currentPageIndex } =
    useEventForm(event)

  return (
    <Frame
      skipToContentText="Skip to form"
      header={
        <AppBar
          mobileLeft={title}
          desktopLeft={title}
          desktopRight={
            <Stack direction="row">
              <Button type="primary" onClick={saveAndExit}>
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
          <Content title={title}>
            <FormWizard
              currentPage={currentPageIndex}
              pages={pages}
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
