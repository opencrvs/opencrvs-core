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
import { useIntl } from 'react-intl'
import { Loader as LoaderUI } from '@opencrvs/components'
import { LoaderField } from '@opencrvs/commons/client'

function LoaderInput({
  id,
  configuration
}: {
  id: string
  configuration: LoaderField['configuration']
}) {
  const intl = useIntl()
  return (
    <LoaderUI
      flexDirection="column-reverse"
      id={id}
      loadingText={intl.formatMessage(configuration.text)}
    />
  )
}

export const Loader = {
  Input: LoaderInput,
  Output: null
}
