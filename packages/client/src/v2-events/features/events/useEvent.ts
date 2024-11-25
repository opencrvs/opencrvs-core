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

import { tennisClubMembershipEvent } from './fixtures'
import { useIntl } from 'react-intl'
import { usePagination } from './usePagination'
import { Field } from '@opencrvs/commons'

const eventTypes = { 'tennis-club-membership': tennisClubMembershipEvent }

export function useEvent(anyEventType: string) {
  const intl = useIntl()

  if (!eventTypes[anyEventType as keyof typeof eventTypes]) {
    throw new Error(`Event type ${anyEventType} not found`)
  }

  const type = anyEventType as keyof typeof eventTypes
  const { pages, label } = eventTypes[type].actions[0].forms[0]

  const { next, previous, page } = usePagination(pages.length)

  const exit = () => alert('exit')
  const saveAndExit = () => alert('save and exit')
  const finish = () => alert('finish')

  const title = intl.formatMessage(label)

  return {
    type,
    title,
    exit,
    saveAndExit,
    previous,
    next,
    finish,
    form: pages,
    fields: pages[page].fields as Field[]
  }
}
