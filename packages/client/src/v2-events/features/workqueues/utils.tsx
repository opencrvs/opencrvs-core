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

import mapKeys from 'lodash/mapKeys'
import { MessageDescriptor, useIntl } from 'react-intl'

const INTERNAL_SEPARATOR = '___'
function convertDotToTripleUnderscore(
  obj: Record<string, any>
): Record<string, any> {
  const keysWithUnderscores = mapKeys(obj, (value, key) => {
    return key.replace(/\./g, INTERNAL_SEPARATOR)
  })

  return keysWithUnderscores
}

function convertDotInCurlyBraces(str: string): string {
  return str.replace(/{([^}]+)}/g, (match, content) => {
    // Replace dots with triple underscores within the curly braces
    const transformedContent = content.replace(/\./g, INTERNAL_SEPARATOR)
    return `{${transformedContent}}`
  })
}

export const useIntlFormatMessageWithFlattenedParams = () => {
  const intl = useIntl()

  const formatMessage = (
    message: MessageDescriptor,
    params?: Record<string, any>
  ) => {
    const variables = convertDotToTripleUnderscore(params ?? {})

    return intl.formatMessage(
      {
        id: message.id,
        description: message.description,
        defaultMessage: convertDotInCurlyBraces(
          message.defaultMessage as string
        )
      },
      variables
    )
  }

  return {
    ...intl,
    formatMessage
  }
}
