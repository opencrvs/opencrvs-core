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

import { useIntl } from 'react-intl'
import { usePagination } from './usePagination'

import { EventConfig } from '@opencrvs/commons'

/**
 * Creates form methods (e.g. pagination) for the event
 */
export function useEventForm(event: EventConfig) {
  const intl = useIntl()

  const pages = event.actions[0].forms[0].pages

  const { next, previous, page } = usePagination(pages.length)

  const exit = () => alert('exit')
  const saveAndExit = () => alert('save and exit')
  const finish = () => alert('finish')

  return {
    title: intl.formatMessage(event.label),
    type: event.id,
    exit,
    saveAndExit,
    previous,
    next,
    finish,
    form: pages,
    fields: pages[page].fields,
    pages,
    page
  }
}
