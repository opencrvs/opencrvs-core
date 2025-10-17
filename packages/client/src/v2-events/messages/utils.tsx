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

import { MessageDescriptor, MessageFormatElement, useIntl } from 'react-intl'
import IntlMessageFormat, { PrimitiveType } from 'intl-messageformat'
import {
  isArgumentElement,
  isSelectElement,
  isPluralElement,
  parse
} from '@formatjs/icu-messageformat-parser'
import { useMemo } from 'react'
import { EventState } from '@opencrvs/commons/client'
import { useEventFormData } from '../features/events/useEventFormData'
import { useActionAnnotation } from '../features/events/useActionAnnotation'

const INTERNAL_SEPARATOR = '___'

// The __EMPTY__ is our common token for missing values, that can be used when configuring a message.
export const EMPTY_TOKEN = '__EMPTY__'
/**
 * Replaces dots with triple underscores in the object keys.
 * This is needed to support dot notation in the message variables.
 */
function convertDotToTripleUnderscore(obj: EventState, parentKey = '') {
  const result: Record<string, PrimitiveType> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey =
      (parentKey ? parentKey + INTERNAL_SEPARATOR : '') +
      key.replace(/\./g, INTERNAL_SEPARATOR)
    if (Array.isArray(value)) {
      value.forEach((val, id) => {
        if (typeof val === 'object' && val !== null) {
          Object.assign(
            result,
            convertDotToTripleUnderscore(
              val,
              (newKey ? newKey + INTERNAL_SEPARATOR : '') + id
            )
          )
        }
      })
      /* @TODO: Check if the typing is correct or is there a case where null could come in */
    } else if (typeof value === 'object' && value !== null) {
      if ('loading' in value) {
        // HTTP field with a `{ loading: boolean; data: any; error: any }` object will not contain any keys that we want to convert
        continue
      }

      Object.assign(result, convertDotToTripleUnderscore(value, newKey))
    } else {
      result[newKey] = !value ? EMPTY_TOKEN : value
    }
  }

  return result
}

/**
 * Replace dots with triple underscores within the curly braces.
 * This is needed to support dot notation in the message variables.
 */
function convertDotInCurlyBraces(str: string): string {
  return str.replace(/{([^}]+)}/g, (_, content) => {
    // Replace dots with triple underscores within the curly braces
    const transformedContent = content.replace(/\./g, INTERNAL_SEPARATOR)
    return `{${transformedContent}}`
  })
}

function getVariablesFromElement(element: MessageFormatElement): string[] {
  if (isArgumentElement(element)) {
    return [element.value]
  }
  if (isSelectElement(element)) {
    return [element.value].concat(
      Object.values(element.options)
        .flatMap((el) => el.value)
        .flatMap((el) => getVariablesFromElement(el))
    )
  }

  if (isPluralElement(element)) {
    return Object.values(element.options)
      .flatMap((el) => el.value)
      .flatMap((el) => getVariablesFromElement(el))
  }
  return []
}

/**
 * Flattens a nested object into a single-level object.
 */
function flattenNestedObject(
  obj: Record<string, string>,
  prefix = ''
): Record<string, string> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(acc, flattenNestedObject(value, newKey))
      } else {
        acc[newKey] = value
      }

      return acc
    },
    {} as Record<string, string>
  )
}

/**
 * intl with formatMessage that supports "flat object" dot notation in the message.
 *
 * @example intl.formatMessage(`string {with.nested.value}`, {
 * 'with.nested.value': 'nested value'}) // string nested value`
 */
export function useIntlFormatMessageWithFlattenedParams() {
  const intl = useIntl()

  function getDefaultMessage(messageDescriptor: MessageDescriptor): string {
    const defaultMessage =
      intl.messages[messageDescriptor.id as keyof typeof intl.messages] ||
      messageDescriptor.defaultMessage
    if (typeof defaultMessage !== 'string') {
      // eslint-disable-next-line no-console
      console.error(
        'Message must be a string. Encountered',
        defaultMessage,
        'when searching with',
        messageDescriptor.id
      )
      throw new Error('Message must be a string')
    }
    return defaultMessage
  }

  function variablesUsed(message: string): string[] {
    // intl-messageformat-parser does not support dot notation in the variables,
    // so we need to convert dots to triple underscores
    const sanitizedMessage = convertDotInCurlyBraces(message)
    const variables = parse(sanitizedMessage).flatMap(getVariablesFromElement)
    // We replace the triple underscopes back to dots only if there
    // was a conversion done in the first place
    if (message !== sanitizedMessage) {
      return variables.map((variable) =>
        variable.replace(new RegExp(INTERNAL_SEPARATOR, 'g'), '.')
      )
    }
    return variables
  }

  function formatMessage<T extends {}>(
    message: MessageDescriptor,
    params?: T
  ): string {
    // Flatten the params to ensure all nested properties are accessible with dot notation
    const flattenedParams = flattenNestedObject(params ?? {})
    const variables = convertDotToTripleUnderscore(flattenedParams)

    const defaultMessage = convertDotInCurlyBraces(getDefaultMessage(message))
    const variablesInMessage = variablesUsed(defaultMessage)
    const variablesWithEmptyValues = Object.fromEntries(
      variablesInMessage.map((variable) => [variable, EMPTY_TOKEN])
    )

    const formatted = new IntlMessageFormat(defaultMessage, intl.locale).format(
      { ...variablesWithEmptyValues, ...variables }
    )
    if (!formatted || typeof formatted !== 'string') {
      return ''
    }
    // When multiple variables are provided, we trim to ensure empty content in case both are missing.
    // We might need to adjust this and allow more freedom for configuration (e.g. provide values and join pattern)
    return formatted.replaceAll(EMPTY_TOKEN, '').trim()
  }

  return {
    ...intl,
    formatMessage,
    variablesUsed: (message: MessageDescriptor) =>
      variablesUsed(getDefaultMessage(message))
  }
}

export function useIntlWithFormData() {
  const intl = useIntlFormatMessageWithFlattenedParams()
  const formValues = useEventFormData((state) => state.formValues)
  const annotation = useActionAnnotation((state) => state.annotation)

  const formData = useMemo(
    () => ({ ...formValues, ...annotation }),
    [formValues, annotation]
  )

  function formatMessage<T extends {}>(message: MessageDescriptor, params?: T) {
    return intl.formatMessage(message, {
      ...formData,
      ...params
    })
  }

  return {
    ...intl,
    formatMessage
  }
}
