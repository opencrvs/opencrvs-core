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
import { defineMessages, useIntl } from 'react-intl'
import { DuplicateDetectedAction } from '@opencrvs/commons/client'
import { Table } from '@opencrvs/components'

const messages = defineMessages({
  matchedTo: {
    defaultMessage: 'Matched to',
    description: 'table header for `Matched to` in record audit',
    id: 'constants.matchedTo'
  }
})

export function DetectedDuplicate({
  action
}: {
  action: DuplicateDetectedAction
}) {
  const intl = useIntl()

  const duplicates = action.content.duplicates.map(({ trackingId }) => ({
    matchedTo: trackingId
  }))

  return (
    <Table
      columns={[
        {
          width: 100,
          key: 'matchedTo',
          label: intl.formatMessage(messages.matchedTo)
        }
      ]}
      content={duplicates}
    ></Table>
  )
}
