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

import { IFormField } from '@client/forms'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { usePagination } from '@client/v2-events/hooks/usePagination'

import {
  AppBar,
  Button,
  FormWizard,
  Frame,
  Icon,
  Spinner
} from '@opencrvs/components'
import { DeclarationIcon } from '@opencrvs/components/lib/icons'
import React, { useEffect } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEventConfiguration } from '@client/v2-events//features/events/useEventConfiguration'
import { useEventFormNavigation } from '@client/v2-events//features/events/useEventFormNavigation'
import { useEvents } from '@client/v2-events//features/events/useEvents/useEvents'
import type { TranslationConfig } from '@opencrvs/commons/events'
import { useEventFormData } from '@client/v2-events//features/events/useEventFormData'
import { ROUTES } from '@client/v2-events/routes'

function getDeclarationIconColor(): string {
  return 'purple'
}

const messages = defineMessages({
  saveExitButton: {
    id: 'buttons.saveExit',
    defaultMessage: 'Save & Exit',
    description: 'The label for the save and exit button'
  },
  exitButton: {
    id: 'buttons.exit',
    defaultMessage: 'Exit',
    description: 'The label for the exit button'
  },
  newVitalEventRegistration: {
    id: 'event.newVitalEventRegistration',
    defaultMessage: 'New "{event}" registration',
    description: 'The title for the new vital event registration page'
  }
})

export const FormHeader = ({ label }: { label: TranslationConfig }) => {
  const intl = useIntl()
  const { exit } = useEventFormNavigation()

  const TODO = () => {}
  const IS_TODO = true
  return (
    <AppBar
      desktopLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
      desktopTitle={intl.formatMessage(messages.newVitalEventRegistration, {
        event: intl.formatMessage(label)
      })}
      desktopRight={
        <>
          {
            <Button
              id="save-exit-btn"
              type="primary"
              size="small"
              disabled={!IS_TODO}
              onClick={TODO}
            >
              <Icon name="DownloadSimple" />
              {intl.formatMessage(messages.saveExitButton)}
            </Button>
          }

          <Button type="secondary" size="small" onClick={exit}>
            <Icon name="X" />
            {intl.formatMessage(messages.exitButton)}
          </Button>
        </>
      }
      mobileLeft={<DeclarationIcon color={getDeclarationIconColor()} />}
      mobileTitle={intl.formatMessage(messages.newVitalEventRegistration, {
        event: intl.formatMessage(label)
      })}
      mobileRight={
        <>
          {
            <Button type="icon" size="small" disabled={!IS_TODO} onClick={TODO}>
              <Icon name="DownloadSimple" />
            </Button>
          }
          <Button type="icon" size="small" onClick={exit}>
            <Icon name="X" />
          </Button>
        </>
      }
    />
  )
}
