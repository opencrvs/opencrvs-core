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

import { defineMessages, useIntl, IntlShape } from 'react-intl'
import styled from 'styled-components'
import React from 'react'
import { isNil } from 'lodash'
import { Link } from '@opencrvs/components'
import {
  EventState,
  FormConfig,
  isFileFieldType,
  isFileFieldWithOptionType,
  FieldType
} from '@opencrvs/commons/client'
import { getFullUrl } from '@client/v2-events/features/files/useFileUpload'
import {
  DocumentViewer as DocumentViewerComponent,
  DocumentViewerOptionValue
} from '@client/v2-events/components/forms/inputs/DocumentViewer'
import { Option } from '@client/v2-events/utils'

/**
 * Based on form and configuration, searches through fields to find files in the current form.
 * @returns Flat list of viewable files
 */
function getFileOptions(
  form: EventState,
  formConfig: FormConfig,
  intl: IntlShape
): Option<DocumentViewerOptionValue>[] {
  const fileFields = formConfig.pages
    .flatMap(({ fields }) => fields)
    .filter(
      (field) =>
        field.type === FieldType.FILE ||
        field.type === FieldType.FILE_WITH_OPTIONS
    )

  const selectableOptions = fileFields.reduce<
    Option<DocumentViewerOptionValue>[]
  >((options, fieldConfig) => {
    const formValue = form[fieldConfig.id]

    if (!formValue) {
      return options
    }

    const field = { config: fieldConfig, value: formValue }
    const fieldLabel = intl.formatMessage(field.config.label)

    if (isFileFieldType(field)) {
      const filename = field.config.configuration.fileName
        ? intl.formatMessage(field.config.configuration.fileName)
        : undefined

      const label = filename ? `${fieldLabel} (${filename})` : fieldLabel

      return [
        ...options,
        {
          value: {
            filename: field.value.filename,
            url: getFullUrl(field.value.filename),
            id: field.config.id
          },
          label
        }
      ]
    }

    if (isFileFieldWithOptionType(field)) {
      const fieldOptions = field.value
        .map((formVal) => {
          const fieldOption = field.config.options.find(
            ({ value }) => value === formVal.option
          )

          if (!fieldOption) {
            return null
          }

          const optionLabel = intl.formatMessage(fieldOption.label)

          return {
            value: {
              filename: formVal.filename,
              url: getFullUrl(formVal.filename),
              id: `${field.config.id}-${formVal.option}`
            },
            label: `${fieldLabel} (${optionLabel})`
          }
        })
        .filter((val) => !isNil(val))

      return [...options, ...fieldOptions]
    }

    return options
  }, [])

  return selectableOptions
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
        {fileOptions.length === 0 && (
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
