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
  ActionFormData,
  FieldConfig,
  FormConfig,
  isFileFieldType,
  isFileFieldWithOptionType
} from '@opencrvs/commons/client'
import { IDocumentViewerOptions } from '@opencrvs/components'
import { getFullURL } from '@client/v2-events/features/files/useFileUpload'

export function useFileOptions(
  form: ActionFormData,
  formConfig: FormConfig,
  intl: IntlShape
) {
  const [fileOptions, setFileOptions] = useState<IDocumentViewerOptions>({
    selectOptions: [],
    documentOptions: []
  })

  useEffect(() => {
    function getOptions(fieldConfig: FieldConfig): IDocumentViewerOptions {
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
              value: getFullURL(fieldObj.value.filename),
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
                  { value: getFullURL(specificValue.filename), label: val }
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

    function reduceFields(fieldConfigs: FieldConfig[]): IDocumentViewerOptions {
      return fieldConfigs.reduce<IDocumentViewerOptions>(
        (acc, fieldConfig) => {
          const { selectOptions, documentOptions } = getOptions(fieldConfig)
          return {
            documentOptions: [...acc.documentOptions, ...documentOptions],
            selectOptions: [...acc.selectOptions, ...selectOptions]
          }
        },
        { selectOptions: [], documentOptions: [] }
      )
    }

    const computedFileOptions = formConfig.pages.reduce<IDocumentViewerOptions>(
      (acc, page) => {
        const { selectOptions, documentOptions } = reduceFields(page.fields)
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
