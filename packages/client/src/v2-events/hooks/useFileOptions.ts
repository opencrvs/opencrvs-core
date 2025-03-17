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

import { useEffect, useState } from 'react'
import { IntlShape } from 'react-intl'
import {
  EventState,
  FieldConfig,
  FormConfig,
  isFileFieldType,
  isFileFieldWithOptionType
} from '@opencrvs/commons/client'
import { IDocumentViewerOptions } from '@opencrvs/components'
import { getFullUrl } from '@client/v2-events/features/files/useFileUpload'

function getOptions(
  fieldConfig: FieldConfig,
  form: EventState,
  intl: IntlShape
): IDocumentViewerOptions {
  const value = form[fieldConfig.id]
  if (!value) {
    return { selectOptions: [], documentOptions: [] }
  }

  const fieldObj = { config: fieldConfig, value }

  if (isFileFieldType(fieldObj)) {
    return {
      selectOptions: [
        {
          value: fieldObj.config.id,
          label: intl.formatMessage(fieldObj.config.label)
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

    return fieldObj.config.options.reduce<IDocumentViewerOptions>(
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
): IDocumentViewerOptions {
  return fieldConfigs.reduce<IDocumentViewerOptions>(
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
 * This hook processes all file fields in the form and returns an object
 * containing:
 * - `selectOptions`: Options for dropdown selection of documents.
 * - `documentOptions`: URLs of uploaded files for document preview.
 *
 * These options are used by the `DocumentViewer` component to:
 * - Populate a dropdown for selecting available documents.
 * - Display the selected document by retrieving its corresponding URL.
 *
 * @returns {IDocumentViewerOptions} Options prop for the `DocumentViewer` component.
 */
export function useFileOptions(
  form: EventState,
  formConfig: FormConfig,
  intl: IntlShape
) {
  const [fileOptions, setFileOptions] = useState<IDocumentViewerOptions>({
    selectOptions: [],
    documentOptions: []
  })

  useEffect(() => {
    const computedFileOptions = formConfig.pages.reduce<IDocumentViewerOptions>(
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

    setFileOptions(computedFileOptions)
  }, [form, formConfig.pages, intl])

  return fileOptions
}
