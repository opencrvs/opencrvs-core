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
import React, { useState } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ITableRow, Table } from '@opencrvs/components/lib/Table'
import { Link, Pagination, Text } from '@opencrvs/components'
import { ROUTES } from '@client/v2-events/routes'
import { messages as eventOverviewMessages } from '@client/v2-events/layouts/EventOverview'
import { useEventOverviewInfo } from '../useEventOverviewInfo'

const PAGE_SIZE = 10

const TableDiv = styled.div`
  overflow: auto;
`

const NoDocumentsText = styled(Text)`
  padding: 24px;
`

const messages = defineMessages({
  documents: {
    id: 'events.documents.document',
    defaultMessage: 'Document'
  },
  recordAction: {
    id: 'events.documents.recordAction',
    defaultMessage: 'Record action'
  },
  addedOn: {
    id: 'events.documents.addedOn',
    defaultMessage: 'Added on'
  },
  addedBy: {
    id: 'events.documents.addedBy',
    defaultMessage: 'Added by'
  },
  noDocuments: {
    id: 'events.documents.noDocuments',
    defaultMessage: 'No documents found'
  }
})

export function Documents() {
  const intl = useIntl()
  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.DOCUMENTS)
  const { fullEvent } = useEventOverviewInfo(eventId)

  console.log(fullEvent?.actions)
  const columns = [
    {
      label: intl.formatMessage(messages.documents),
      width: 34,
      key: 'action'
    },
    {
      label: intl.formatMessage(messages.recordAction),
      width: 22,
      key: 'location'
    },
    {
      label: intl.formatMessage(messages.addedOn),
      width: 21,
      key: 'by'
    },
    {
      label: intl.formatMessage(messages.addedBy),
      width: 15,
      key: 'when'
    }
  ]

  const documents: ITableRow[] = []

  const displayedDocuments = documents.slice(
    (currentPageNumber - 1) * PAGE_SIZE,
    currentPageNumber * PAGE_SIZE
  )

  return (
    <Content
      noPadding
      size={ContentSize.LARGE}
      title={
        intl.formatMessage(eventOverviewMessages.documents) +
        ` (${documents.length})`
      }
    >
      <TableDiv>
        <Table
          highlightRowOnMouseOver
          columns={columns}
          content={displayedDocuments}
          id="task-history"
          noResultText=""
          pageSize={Math.max(documents.length, 1)}
        />
        {documents.length > PAGE_SIZE && (
          <Pagination
            currentPage={currentPageNumber}
            totalPages={Math.ceil(documents.length / PAGE_SIZE)}
            onPageChange={(page) => setCurrentPageNumber(page)}
          />
        )}
      </TableDiv>
      {documents.length === 0 && (
        <NoDocumentsText element="h3" variant="h3">
          {intl.formatMessage(messages.noDocuments)}
        </NoDocumentsText>
      )}
    </Content>
  )
}
