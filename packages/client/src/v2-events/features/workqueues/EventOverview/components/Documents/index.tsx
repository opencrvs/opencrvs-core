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
import React, { useMemo, useState } from 'react'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import {
  ActionDocument,
  EventConfig,
  EventDocument,
  FieldConfig,
  FieldUpdateValue,
  findAllFields,
  getAcceptedActions,
  isFileFieldType,
  isFileFieldWithOptionType,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ITableRow, Table } from '@opencrvs/components/lib/Table'
import { Pagination, Text } from '@opencrvs/components'
import { messages as eventOverviewMessages } from '@client/v2-events/layouts/EventOverview'
import { ROUTES } from '@client/v2-events/routes'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { ActionByCell, WhenCell } from '../EventHistory'
import { useEventOverviewInfo } from '../useEventOverviewInfo'

const PAGE_SIZE = 10

const TableDiv = styled.div`
  overflow: auto;
`

const NoDocumentsText = styled(Text)`
  padding: 24px;
`

const messages = defineMessages({
  document: {
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

/**
 * One uploaded file, tied to the action that added it. A single FILE field
 * yields one entry; a FILE_WITH_OPTIONS field yields one entry per option file.
 * The document is named after its field's config label, not the uploaded
 * file's name. The whole action is carried so the row can reuse the event
 * history's "by"/"when" cells for the uploader and timestamp.
 */
interface DocumentEntry {
  id: string
  label: TranslationConfig
  action: ActionDocument
}

/**
 * Maps a single accepted action to the documents it uploaded. Scans both the
 * declaration and annotation deltas: a FILE field yields one entry, a FILE_WITH_OPTIONS field one per option file.
 * `fieldById` is the typed lookup that identifies and labels file fields.
 */
function getUploadedDocuments(
  action: ActionDocument,
  fieldById: Map<string, FieldConfig>
): DocumentEntry[] {
  const sources: Array<Record<string, FieldUpdateValue> | null | undefined> = [
    action.declaration,
    action.annotation
  ]

  return sources.flatMap((source) =>
    Object.entries(source ?? {}).flatMap(([fieldId, value]) => {
      const fieldConfig = fieldById.get(fieldId)
      if (!fieldConfig) {
        return []
      }

      // Skip removals: a field cleared to null/undefined.
      if (value === null || value === undefined) {
        return []
      }

      const field = { config: fieldConfig, value }
      const base = {
        label: fieldConfig.label,
        action
      }

      // Single file: one row.
      if (isFileFieldType(field)) {
        return [
          {
            id: `${action.id}:${fieldId}`,
            ...base
          }
        ]
      }

      // File with options: an array of files — one row per option file.
      if (isFileFieldWithOptionType(field)) {
        return field.value.map((_file, index) => ({
          id: `${action.id}:${fieldId}:${index}`,
          ...base
        }))
      }

      return []
    })
  )
}

/**
 * Collects every document uploaded to a record as a flat, chronological
 * history of upload events.
 */
function collectDocuments(
  event: EventDocument,
  config: EventConfig
): DocumentEntry[] {
  // findAllFields covers both declaration and annotation field configs, so file uploads living in either resolve to a config here.
  const fieldById = new Map<string, FieldConfig>(
    findAllFields(config).map((field) => [field.id, field])
  )

  return getAcceptedActions(event).flatMap((action) =>
    getUploadedDocuments(action, fieldById)
  )
}

function DocumentsContent({ fullEvent }: { fullEvent: EventDocument }) {
  const intl = useIntl()
  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const { eventConfiguration } = useEventConfiguration(fullEvent.type)

  const entries = useMemo(
    () => collectDocuments(fullEvent, eventConfiguration),
    [fullEvent, eventConfiguration]
  )

  const columns = [
    {
      label: intl.formatMessage(messages.document),
      width: 38,
      key: 'document'
    },
    {
      label: intl.formatMessage(messages.recordAction),
      width: 22,
      key: 'recordAction'
    },
    {
      label: intl.formatMessage(messages.addedBy),
      width: 21,
      key: 'addedBy'
    },
    {
      label: intl.formatMessage(messages.addedOn),
      width: 19,
      key: 'addedOn'
    }
  ]

  const documents: ITableRow[] = entries.map((entry) => ({
    document: intl.formatMessage(entry.label),
    // TODO: localise the action type (deferred). Raw value for now.
    recordAction: entry.action.type,
    addedOn: <WhenCell isoDate={entry.action.createdAt} />,
    addedBy: <ActionByCell action={entry.action} />
  }))

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
          id="documents"
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

export function Documents() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.EVENT.DOCUMENTS)
  const { fullEvent, shouldShowFullOverview } = useEventOverviewInfo(eventId)

  if (!shouldShowFullOverview) {
    return null
  }

  return <DocumentsContent fullEvent={fullEvent} />
}
