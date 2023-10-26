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

import { Task } from '@opencrvs/commons/types'
import { RegStatus } from '@workflow/features/registration/fhir/constants'

export function isRejectedTask(taskResource: Task) {
  return getTaskBusinessStatus(taskResource) === RegStatus.REJECTED
}

export function isArchiveTask(taskResource: Task) {
  return getTaskBusinessStatus(taskResource) === RegStatus.ARCHIVED
}

export function getTaskBusinessStatus(
  taskResource: Task
): RegStatus | undefined {
  return taskResource.businessStatus?.coding?.[0]?.code as RegStatus | undefined
}

export function hasExtension(taskResource: Task, extensionUrl: string) {
  return taskResource.extension?.some(
    (extension) => extension.url === extensionUrl
  )
}

export function taskHasInput(taskResource: Task) {
  return !!(taskResource.input && taskResource.input.length > 0)
}

export function getTaskEventType(task: Task) {
  const eventType = task?.code?.coding?.[0].code
  return eventType
}

export function filterTaskExtensions(
  extensions: fhir3.Extension[],
  urls: string[],
  status: RegStatus | undefined
) {
  return [...extensions].filter((extension) => {
    if (urls.some((url) => url === extension.url)) {
      return extension.valueString === status
    }
    return true
  })
}
