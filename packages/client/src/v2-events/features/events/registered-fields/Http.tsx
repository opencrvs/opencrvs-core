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

import React, { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { isEqual } from 'lodash'
import {
  FieldValue,
  getMixedPath,
  HttpField,
  HttpFieldValue,
  isTemplateVariable,
  SystemVariables
} from '@opencrvs/commons/client'
import { getToken } from '@client/utils/authUtils'
import { useSystemVariables } from '@client/v2-events/hooks/useSystemVariables'

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeout?: number } = {}
) {
  const { timeout, headers, ...rest } = init
  const controller = new AbortController()
  const id = timeout ? setTimeout(() => controller.abort(), timeout) : null
  try {
    return await fetch(input, {
      ...rest,
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${getToken()}`,
        ...headers
      },
      signal: controller.signal
    })
  } finally {
    if (id) {
      clearTimeout(id)
    }
  }
}

interface HttpError extends Error {
  statusCode: number
}

async function fetchHttpFieldValue(
  cfg: Omit<HttpField['configuration'], 'trigger'>,
  systemVariables: SystemVariables
) {
  const baseUrl = window.location.origin
  const url = new URL(cfg.url, baseUrl)

  if (cfg.params) {
    for (const [k, v] of Object.entries(cfg.params)) {
      url.searchParams.append(k, String(v))
    }
  }

  if (cfg.body) {
    for (const [k, v] of Object.entries(cfg.body)) {
      cfg.body[k] = isTemplateVariable(v)
        ? (getMixedPath(systemVariables, v) ?? v)
        : v
    }
  }

  const res = await fetchWithTimeout(url, {
    method: cfg.method,
    body: cfg.body ? JSON.stringify(cfg.body) : undefined,
    timeout: cfg.timeout,
    headers: cfg.headers
  })

  if (!res.ok) {
    const err = new Error(res.statusText || 'HTTP error') as HttpError
    err.statusCode = res.status
    throw err
  }

  return res.text()
}

function HttpInput({
  parentValue,
  configuration,
  onChange
}: {
  parentValue?: FieldValue
  configuration: Omit<HttpField['configuration'], 'trigger'>
  onChange: (val: HttpFieldValue) => void
}) {
  const systemVariables = useSystemVariables()
  const firstRunRef = useRef(true)
  const prevParentRef = useRef<FieldValue | undefined>(undefined)

  const mutation = useMutation<unknown, HttpError>({
    mutationFn: async () => fetchHttpFieldValue(configuration, systemVariables),
    onMutate: () => {
      onChange({ loading: true, error: null, data: null })
    },
    onSuccess: (data) => {
      onChange({ loading: false, error: null, data })
    },
    onError: (error: HttpError) => {
      if (error.name === 'AbortError') {
        onChange({
          loading: false,
          error: { statusCode: 408, message: 'The request timed out.' },
          data: null
        })
      } else {
        onChange({
          loading: false,
          error: {
            statusCode: error.statusCode,
            message: error.message
          },
          data: null
        })
      }
    }
  })

  React.useEffect(() => {
    // 1) skip on first mount
    if (firstRunRef.current) {
      firstRunRef.current = false
      prevParentRef.current = parentValue
      return
    }

    // 2) trigger on following mounts if the value tracked changes
    if (!isEqual(parentValue, prevParentRef.current)) {
      prevParentRef.current = parentValue
      mutation.mutate()
    }
  }, [parentValue, mutation])

  return null
}

export const Http = {
  Input: HttpInput,
  Output: null,
  stringify: (value: string | undefined) => {
    return value?.toString() || ''
  }
}
