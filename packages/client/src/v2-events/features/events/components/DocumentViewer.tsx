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
import { defineMessages, useIntl, IntlShape } from 'react-intl'
import styled from 'styled-components'
import {
  DocumentViewer as DocumentViewerComponent,
  Link
} from '@opencrvs/components'
import {
  EventState,
  FormConfig,
  FieldConfig,
  isFileFieldType,
  isFileFieldWithOptionType
} from '@opencrvs/commons/client'
import { getFullUrl } from '@client/v2-events/features/files/useFileUpload'

interface DocumentViewerOptions {
  selectOptions: { value: string; label: string }[]
  documentOptions: { value: string; label: string }[]
}

function getOptions(
  fieldConfig: FieldConfig,
  form: EventState,
  intl: IntlShape
): DocumentViewerOptions {
  const value = form[fieldConfig.id]
  if (!value) {
    return { selectOptions: [], documentOptions: [] }
  }

  const fieldObj = { config: fieldConfig, value }

  if (isFileFieldType(fieldObj)) {
    const label = fieldObj.config.configuration.fileName
      ? `${intl.formatMessage(fieldObj.config.label)} (${intl.formatMessage(fieldObj.config.configuration.fileName)})`
      : intl.formatMessage(fieldObj.config.label)

    return {
      selectOptions: [
        {
          value: fieldObj.config.id,
          label
        }
      ],
      documentOptions: [
        {
          value: getFullUrl(fieldObj.value.filename),
          label: fieldObj.config.id
        }
      ]
    }
  }

  if (isFileFieldWithOptionType(fieldObj)) {
    const labelPrefix = intl.formatMessage(fieldObj.config.label)

    return fieldObj.config.options.reduce<DocumentViewerOptions>(
      (acc, { value: val, label }) => {
        const specificValue = fieldObj.value.find(
          ({ option }) => val === option
        )
        if (specificValue) {
          return {
            documentOptions: [
              ...acc.documentOptions,
              { value: getFullUrl(specificValue.filename), label: val }
            ],
            selectOptions: [
              ...acc.selectOptions,
              {
                value: val,
                label: `${labelPrefix} (${intl.formatMessage(label)})`
              }
            ]
          }
        }
        return acc
      },
      { selectOptions: [], documentOptions: [] }
    )
  }

  return { selectOptions: [], documentOptions: [] }
}

function extractViewerOptionsFromFieldConfig(
  fieldConfigs: FieldConfig[],
  form: EventState,
  intl: IntlShape
): DocumentViewerOptions {
  return fieldConfigs.reduce<DocumentViewerOptions>(
    (acc, fieldConfig) => {
      const { selectOptions, documentOptions } = getOptions(
        fieldConfig,
        form,
        intl
      )
      return {
        documentOptions: [...acc.documentOptions, ...documentOptions],
        selectOptions: [...acc.selectOptions, ...selectOptions]
      }
    },
    { selectOptions: [], documentOptions: [] }
  )
}

/**
 * Extracts file-related options from the form configuration and generates
 * a structured list of selectable and viewable document options.
 *
 * @returns {DocumentViewerOptions} Options for the document viewer.
 *
 * Options are used to:
 * - Populate a dropdown for selecting available documents.
 * - Display the selected document by retrieving its corresponding URL.
 */
function getFileOptions(
  form: EventState,
  formConfig: FormConfig,
  intl: IntlShape
) {
  const fileOptions = formConfig.pages.reduce<DocumentViewerOptions>(
    (acc, page) => {
      const { selectOptions, documentOptions } =
        extractViewerOptionsFromFieldConfig(page.fields, form, intl)

      return {
        documentOptions: [...acc.documentOptions, ...documentOptions],
        selectOptions: [...acc.selectOptions, ...selectOptions]
      }
    },
    { selectOptions: [], documentOptions: [] }
  )

  return fileOptions
}

const ResponsiveDocumentViewer = styled.div<{ showInMobile: boolean }>`
  position: fixed;
  width: calc(40% - 24px);
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: ${({ showInMobile }) => (showInMobile ? 'block' : 'none')};
    margin-bottom: 11px;
  }
`

const ZeroDocument = styled.div`
  ${({ theme }) => theme.fonts.bold16};
  height: 700px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const reviewMessages = defineMessages({
  zeroDocumentsTextForAnySection: {
    defaultMessage: 'No supporting documents',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsTextForAnySection'
  },
  editDocuments: {
    defaultMessage: 'Add attachement',
    description: 'Edit documents text',
    id: 'review.documents.editDocuments'
  }
})

export function DocumentViewer({
  form,
  formConfig,
  onEdit,
  showInMobile,
  disabled
}: {
  formConfig: FormConfig
  form: EventState
  onEdit: () => void
  showInMobile?: boolean
  disabled?: boolean
}) {
  const intl = useIntl()
  const fileOptions = getFileOptions(form, formConfig, intl)

  return (
    <ResponsiveDocumentViewer showInMobile={!!showInMobile}>
      <DocumentViewerComponent id="document_section" options={fileOptions}>
        {fileOptions.documentOptions.length === 0 && (
          <ZeroDocument id={`zero_document`}>
            {intl.formatMessage(reviewMessages.zeroDocumentsTextForAnySection)}
            {!disabled && (
              <Link
                id="edit-document"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                {intl.formatMessage(reviewMessages.editDocuments)}
              </Link>
            )}
          </ZeroDocument>
        )}
      </DocumentViewerComponent>
    </ResponsiveDocumentViewer>
  )
}
