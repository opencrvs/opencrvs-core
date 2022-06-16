/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import {
  RegStatus,
  EVENT_TYPE
} from '@workflow/features/registration/fhir/constants'
import {
  ASSIGNED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL
} from '@workflow/features/task/fhir/constants'

export function isRejectedTask(taskResource: fhir.Task) {
  return getTaskBusinessStatus(taskResource) === RegStatus.REJECTED
}

export function isArchiveTask(taskResource: fhir.Task) {
  return getTaskBusinessStatus(taskResource) === RegStatus.ARCHIVED
}

export function getTaskBusinessStatus(
  taskResource: fhir.Task
): RegStatus | undefined {
  return taskResource.businessStatus?.coding?.[0]?.code as RegStatus | undefined
}

export function hasReinstatedExtension(taskResource: fhir.Task) {
  return (
    taskResource.extension?.findIndex(
      (extension) => extension.url === REINSTATED_EXTENSION_URL
    ) !== -1
  )
}

export function hasAssignedExtension(taskResource: fhir.Task) {
  return (
    taskResource.extension?.findIndex(
      (extension) => extension.url === ASSIGNED_EXTENSION_URL
    ) !== -1
  )
}

export function taskHasInput(taskResource: fhir.Task) {
  return !!(taskResource.input && taskResource.input.length > 0)
}

export function getTaskEventType(task: fhir.Task) {
  const eventType = task?.code?.coding?.[0].code

  if (eventType === EVENT_TYPE.DEATH) {
    return EVENT_TYPE.DEATH
  } else {
    return EVENT_TYPE.BIRTH
  }
}

export function filterTaskExtensions(
  extensions: fhir.Extension[],
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
