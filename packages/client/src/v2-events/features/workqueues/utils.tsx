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

import { Dictionary, mapKeys } from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'

const INTERNAL_SEPARATOR = '___'

/**
 * Replaces dots with triple underscores in the object keys.
 * This is needed to support dot notation in the message variables.
 */
function convertDotToTripleUnderscore<T extends {}>(
  obj: T
): Dictionary<T[keyof T]> {
  const keysWithUnderscores = mapKeys(obj, (_, key) => {
    return key.replace(/\./g, INTERNAL_SEPARATOR)
  })

  return keysWithUnderscores
}

/**
 * Replace dots with triple underscores within the curly braces.
 * This is needed to support dot notation in the message variables.
 */
function convertDotInCurlyBraces(str: string): string {
  return str.replace(/{([^}]+)}/g, (match, content) => {
    // Replace dots with triple underscores within the curly braces
    const transformedContent = content.replace(/\./g, INTERNAL_SEPARATOR)
    return `{${transformedContent}}`
  })
}

/**
 * intl with formatMessage that supports "flat object" dot notation in the message.
 *
 * @example intl.formatMessage(`string {with.nested.value}`, {
 * 'with.nested.value': 'nested value'}) // string nested value`
 */
export function useIntlFormatMessageWithFlattenedParams() {
  const intl = useIntl()

  function formatMessage<T extends {}>(message: MessageDescriptor, params?: T) {
    const variables = convertDotToTripleUnderscore(params ?? {})

    return (
      intl
        .formatMessage(
          {
            id: message.id,
            description: message.description,
            defaultMessage: convertDotInCurlyBraces(
              message.defaultMessage as string
            )
          },
          variables
        )
        // When multiple variables are provided, we trim to ensure empty content in case both are missing.
        // We might need to adjust this and allow more freedom for configuration (e.g. provide values and join pattern)
        .trim()
    )
  }

  return {
    ...intl,
    formatMessage
  }
}
