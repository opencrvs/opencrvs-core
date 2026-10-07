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
  FileFieldValue,
  FileFieldValueWithOption,
  findAllFields,
  getAcceptedActions,
  isFileFieldType,
  isFileFieldWithOptionType,
  TranslationConfig
} from '@opencrvs/commons/client'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { ITableRow, Table } from '@opencrvs/components/lib/Table'
import { Link, Pagination, Text } from '@opencrvs/components'
import { ActionType } from '@opencrvs/commons/client'
import { messages as eventOverviewMessages } from '@client/v2-events/layouts/EventOverview'
import { ROUTES } from '@client/v2-events/routes'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { getRecordActionLabel } from '@client/v2-events/utils'
import { DocumentPreview } from '@client/v2-events/components/forms/inputs/FileInput/DocumentPreview'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { ActionByCell, WhenCell } from '../EventHistory'

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

/** Details of a single document which we want to format and display on the table. */
interface DocumentEntry {
  id: string
  file: FileFieldValue | FileFieldValueWithOption
  action: ActionDocument
  label: TranslationConfig
  /** For a FILE_WITH_OPTIONS document, we want to show both the field label and the option label */
  optionLabel?: TranslationConfig
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
            ...base,
            file: field.value
          }
        ]
      }

      // File with options: an array of files — one row per option file, named
      // after the field plus the option it was uploaded under.
      if (isFileFieldWithOptionType(field)) {
        return field.value.map((file, index) => ({
          id: `${action.id}:${fieldId}:${index}`,
          ...base,
          file,
          optionLabel: field.config.options.find((o) => o.value === file.option)
            ?.label
        }))
      }

      return []
    })
  )
}

/**
 * Collects every document uploaded to a record as a flat, chronological history of upload events.
 */
function collectDocuments(
  event: EventDocument,
  config: EventConfig
): DocumentEntry[] {
  // findAllFields covers both declaration and annotation field configs, so file uploads living in either resolve to a config here.
  const fieldById = new Map<string, FieldConfig>(
    findAllFields(config).map((field) => [field.id, field])
  )

  // We want to hide documents for reject correction and edit actions.
  // - Why hide reject correction? We dont want to display documents for a rejected correction, only a correction request or an accepted correction.
  // - Why hide edit? Edit also applies declare/register action, which displays the documents, so we dont want a duplicate row.
  return getAcceptedActions(event)
    .filter(
      ({ type }) =>
        type !== ActionType.REJECT_CORRECTION && type !== ActionType.EDIT
    )
    .flatMap((action) => getUploadedDocuments(action, fieldById))
}

/**
 * The document name rendered as a link that opens the file in a full-screen preview overlay.
 */
function DocumentNameCell({
  name,
  file
}: {
  name: string
  file: FileFieldValue | FileFieldValueWithOption
}) {
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <Link font="bold14" onClick={() => setPreviewOpen(true)}>
        {name}
      </Link>
      {previewOpen && (
        <DocumentPreview
          disableDelete
          goBack={() => setPreviewOpen(false)}
          previewImage={file}
          title={name}
          onDelete={() => setPreviewOpen(false)}
        />
      )}
    </>
  )
}

function DocumentsContent({ event }: { event: EventDocument }) {
  const intl = useIntl()
  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const { eventConfiguration } = useEventConfiguration(event.type)

  const entries = useMemo(
    () => collectDocuments(event, eventConfiguration),
    [event, eventConfiguration]
  )

  const columns = [
    // Padding column
    { label: '', width: 2, key: 'padding' },
    {
      label: intl.formatMessage(messages.document),
      width: 36,
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

  // Resolve each document's display name (field label, plus the option label for a FILE_WITH_OPTIONS document).
  const namedEntries = entries.map((entry) => {
    const fieldName = intl.formatMessage(entry.label)

    const documentName = entry.optionLabel
      ? `${fieldName} (${intl.formatMessage(entry.optionLabel)})`
      : fieldName

    return { entry, documentName }
  })

  namedEntries.sort((a, b) => {
    // Newest documents first.
    const byNewest = b.entry.action.createdAt.localeCompare(
      a.entry.action.createdAt
    )

    // Ties (same upload time) are ordered by name.
    return byNewest !== 0
      ? byNewest
      : a.documentName.localeCompare(b.documentName)
  })

  // Format the documents for the table.
  const documents: ITableRow[] = namedEntries.map(
    ({ entry, documentName }) => ({
      document: <DocumentNameCell file={entry.file} name={documentName} />,
      recordAction: getRecordActionLabel(
        entry.action,
        eventConfiguration,
        intl
      ),
      addedOn: <WhenCell isoDate={entry.action.createdAt} />,
      addedBy: <ActionByCell action={entry.action} />
    })
  )

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
  const events = useEvents()
  const event = events.getEvent.useGetOrDownloadEvent(eventId)

  return <DocumentsContent event={event} />
}
