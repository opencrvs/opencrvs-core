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

import { FieldConfig } from '@opencrvs/commons/client'
import { useIntl } from 'react-intl'
import { usePagination } from './usePagination'

import { trpc } from '@client/v2-events/trcp'
import { FormPage } from '@opencrvs/commons'
import { useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { V2_EVENT_ROUTE } from '@client/v2-events/routes/routes'

export function useEvent(anyEventType: string) {
  const intl = useIntl()

  const hook = trpc.config.get.useQuery()
  const { isLoading, error, data } = hook

  const [pages, setPages] = useState<FormPage[]>([])
  const [title, setTitle] = useState<string>()
  const [fields, setFields] = useState<FieldConfig[]>([])

  const match = useRouteMatch<{ eventType: string }>(V2_EVENT_ROUTE)

  const { next, previous, page } = usePagination(pages.length)

  const exit = () => alert('exit')
  const saveAndExit = () => alert('save and exit')
  const finish = () => alert('finish')

  useEffect(() => {
    if (!data) {
      return
    }
    if (error) {
      return
    }
    const event = data.find((event) => event.id === match?.params.eventType)

    if (!event) {
      return
    }

    setTitle(intl.formatMessage(event.label))
    const pages = event.actions[0].forms[0].pages
    setPages(pages)
    setFields(pages[page].fields)
  }, [data, error, intl, match?.params.eventType, page])

  return {
    loading: isLoading,
    type: match?.params.eventType,
    title,
    exit,
    saveAndExit,
    previous,
    next,
    finish,
    form: pages,
    fields
  }
}
