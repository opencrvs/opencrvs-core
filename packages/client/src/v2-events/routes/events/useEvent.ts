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

import { useParams } from 'react-router-dom'
import { tennisClubMembershipEvent } from './fixtures'
import { useIntl } from 'react-intl'
import { usePagination } from './usePagination'

export function useEvent() {
  const intl = useIntl()
  const { eventType } = useParams<{ eventType: string }>()

  const formConfig = tennisClubMembershipEvent.actions[0].forms[0]
  const pages = formConfig.form

  const { next, previous } = usePagination(pages.length)

  const exit = () => alert('exit')
  const saveAndExit = () => alert('save and exit')
  const finish = () => alert('finish')

  const title = intl.formatMessage(formConfig.version.label)

  return { eventType, title, exit, saveAndExit, previous, next, finish }
}
