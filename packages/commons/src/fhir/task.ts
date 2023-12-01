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

import { Nominal } from '../nominal'
import {
  ASSIGNED_EXTENSION_URL,
  Bundle,
  BundleEntry,
  BusinessStatus,
  Coding,
  DOWNLOADED_EXTENSION_URL,
  DUPLICATE_TRACKING_ID,
  Extension,
  FLAGGED_AS_POTENTIAL_DUPLICATE,
  MAKE_CORRECTION_EXTENSION_URL,
  MARKED_AS_DUPLICATE,
  MARKED_AS_NOT_DUPLICATE,
  OPENCRVS_SPECIFICATION_URL,
  REINSTATED_EXTENSION_URL,
  Resource,
  ResourceIdentifier,
  Saved,
  UNASSIGNED_EXTENSION_URL,
  VERIFIED_EXTENSION_URL,
  VIEWED_EXTENSION_URL,
  findExtension,
  isSaved
} from '.'
import { UUID } from '..'

export type TrackingID = Nominal<string, 'TrackingID'>
export type RegistrationNumber = Nominal<string, 'RegistrationNumber'>

export type TaskIdentifier =
  | {
      system: 'http://opencrvs.org/specs/id/mosip-aid'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/draft-id'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/birth-tracking-id'
      value: TrackingID
    }
  | {
      system: 'http://opencrvs.org/specs/id/death-tracking-id'
      value: TrackingID
    }
  | {
      system: 'http://opencrvs.org/specs/id/marriage-tracking-id'
      value: TrackingID
    }
  | {
      system: 'http://opencrvs.org/specs/id/birth-registration-number'
      value: RegistrationNumber
    }
  | {
      system: 'http://opencrvs.org/specs/id/death-registration-number'
      value: RegistrationNumber
    }
  | {
      system: 'http://opencrvs.org/specs/id/marriage-registration-number'
      value: RegistrationNumber
    }
  | {
      system: 'http://opencrvs.org/specs/id/system_identifier'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/paper-form-id'
      value: string
    }
  | {
      system: 'http://opencrvs.org/specs/id/dhis2_event_identifier'
      value: string
    }

export type ExtractValue<T> = Extract<TaskIdentifier, { system: T }>['value']

type ExtractSystem<T> = T extends { system: string } ? T['system'] : never
type AllSystems = ExtractSystem<TaskIdentifier>

type AfterLastSlash<S extends string> =
  S extends `${infer _Start}/${infer Rest}` ? AfterLastSlash<Rest> : S

export type TaskIdentifierSystemType = AfterLastSlash<AllSystems>

export type Task = Omit<
  fhir3.Task,
  'extension' | 'businessStatus' | 'code' | 'intent' | 'identifier' | 'status'
> & {
  lastModified: string
  status: 'ready' | 'requested' | 'draft' | 'accepted' | 'rejected'
  extension: Array<Extension>
  businessStatus: BusinessStatus
  intent?: fhir3.Task['intent']
  identifier: Array<TaskIdentifier>
  code: Omit<fhir3.CodeableConcept, 'coding'> & {
    coding: Array<
      Omit<fhir3.Coding, 'code' | 'system'> & {
        system: 'http://opencrvs.org/specs/types'
        code: 'BIRTH' | 'DEATH' | 'MARRIAGE'
      }
    >
  }
  // This field is missing from the fhir3 spec
  // @todo Where exactly it's used?
  encounter?: fhir3.Reference
}

export type SavedTask = Omit<Task, 'focus' | 'id'> & {
  id: UUID
  focus: {
    reference: ResourceIdentifier
  }
}

export type TaskHistory = Saved<Task> & {
  resourceType: 'TaskHistory'
}

export type CorrectionRequestedTask = Omit<Task, 'encounter' | 'requester'> & {
  encounter: {
    reference: `Encounter/${string}`
  }
  requester: {
    agent: { reference: `Practitioner/${string}` }
  }
}

export function isCorrectionRequestedTask(
  task: Task
): task is CorrectionRequestedTask {
  return task.businessStatus.coding.some(
    ({ code }) => code === 'CORRECTION_REQUESTED'
  )
}

export function getBusinessStatus(task: Task) {
  const code = task.businessStatus.coding.find(({ code }) => code)
  if (!code) {
    throw new Error('No business status code found')
  }
  return code.code
}

export function isTaskBundleEntry<T extends BundleEntry>(
  entry: T
): entry is (T & BundleEntry<Task>) | (T & Saved<BundleEntry<SavedTask>>) {
  return entry.resource.resourceType === 'Task'
}

export function isTask<T extends Resource>(
  resource: T
): resource is (T & Task) | (T & SavedTask) {
  return resource.resourceType === 'Task'
}

export function isTaskHistory<T extends Resource>(
  resource: T
): resource is T & TaskHistory {
  return resource.resourceType === 'TaskHistory'
}

export function isTaskOrTaskHistory<T extends Resource>(
  resource: T
): resource is (T & TaskHistory) | (T & Task) {
  return ['TaskHistory', 'Task'].includes(resource.resourceType)
}

export function getTaskFromBundle<T extends Bundle>(bundle: T) {
  const task = bundle.entry.map(({ resource }) => resource).find(isTask)

  if (!task || !isSaved(task)) {
    throw new Error('No task found in bundle')
  }
  return task
}

export function sortTasksDescending(tasks: Task[]) {
  return tasks.slice().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  })
}

export const enum TaskAction {
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  UNASSIGNED = 'UNASSIGNED',
  REINSTATED = 'REINSTATED',
  REQUESTED_CORRECTION = 'REQUESTED_CORRECTION',
  APPROVED_CORRECTION = 'APPROVED_CORRECTION',
  REJECTED_CORRECTION = 'REJECTED_CORRECTION',
  CORRECTED = 'CORRECTED',
  DOWNLOADED = 'DOWNLOADED',
  VIEWED = 'VIEWED',
  MARKED_AS_DUPLICATE = 'MARKED_AS_DUPLICATE',
  MARKED_AS_NOT_DUPLICATE = 'MARKED_AS_NOT_DUPLICATE',
  FLAGGED_AS_POTENTIAL_DUPLICATE = 'FLAGGED_AS_POTENTIAL_DUPLICATE'
}

export const enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  ARCHIVED = 'ARCHIVED',
  DECLARED = 'DECLARED',
  DECLARATION_UPDATED = 'DECLARATION_UPDATED',
  WAITING_VALIDATION = 'WAITING_VALIDATION',
  CORRECTION_REQUESTED = 'CORRECTION_REQUESTED',
  VALIDATED = 'VALIDATED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED',
  ISSUED = 'ISSUED'
}

export function getStatusFromTask(task: Task) {
  const statusType = task.businessStatus?.coding?.find(
    (coding: Coding) =>
      coding.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
  )
  return statusType && (statusType.code as TaskStatus)
}

export function getActionFromTask(task: Task) {
  const extensions = task.extension || []

  if (findExtension(DOWNLOADED_EXTENSION_URL, extensions)) {
    return TaskAction.DOWNLOADED
  } else if (findExtension(ASSIGNED_EXTENSION_URL, extensions)) {
    return TaskAction.ASSIGNED
  } else if (findExtension(UNASSIGNED_EXTENSION_URL, extensions)) {
    return TaskAction.UNASSIGNED
  } else if (findExtension(VERIFIED_EXTENSION_URL, extensions)) {
    return TaskAction.VERIFIED
  } else if (findExtension(REINSTATED_EXTENSION_URL, extensions)) {
    return TaskAction.REINSTATED
  } else if (findExtension(VIEWED_EXTENSION_URL, extensions)) {
    return TaskAction.VIEWED
  } else if (findExtension(MARKED_AS_DUPLICATE, extensions)) {
    return TaskAction.MARKED_AS_DUPLICATE
  } else if (findExtension(MARKED_AS_NOT_DUPLICATE, extensions)) {
    return TaskAction.MARKED_AS_NOT_DUPLICATE
  } else if (findExtension(FLAGGED_AS_POTENTIAL_DUPLICATE, extensions)) {
    return TaskAction.FLAGGED_AS_POTENTIAL_DUPLICATE
  } else if (findExtension(MAKE_CORRECTION_EXTENSION_URL, extensions)) {
    return TaskAction.CORRECTED
  }
  if (
    task.businessStatus?.coding?.find(
      (coding: Coding) => coding.code === 'CORRECTION_REQUESTED'
    )
  ) {
    if (task.status === 'requested') {
      return TaskAction.REQUESTED_CORRECTION
    } else if (task.status === 'accepted') {
      return TaskAction.APPROVED_CORRECTION
    } else if (task.status === 'rejected') {
      return TaskAction.REJECTED_CORRECTION
    }
  }
  return null
}

// @todo these are both legacy code
// remove them both or make them not mutate the received parameters
/*
 * @deprecated
 */
export function updateFHIRTaskBundle(
  taskEntry: BundleEntry<Task>,
  status: string,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
) {
  const taskResource = taskEntry.resource
  taskEntry.resource = updateTaskTemplate(
    taskResource,
    status,
    reason,
    comment,
    duplicateTrackingId
  )
  taskEntry.resource.lastModified = new Date().toISOString()
  const fhirBundle: Bundle<Task> = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry]
  }
  return fhirBundle
}

export function addExtensionsToTask(
  task: Task | SavedTask,
  extensions: Extension[]
) {
  return {
    ...task,
    extension: (task.extension ?? [])
      .filter(
        (ext) =>
          !extensions.some((e) => {
            return e.url === ext.url
          })
      )
      .concat(extensions)
  }
}

export const TaskActionExtension = [
  ASSIGNED_EXTENSION_URL,
  VERIFIED_EXTENSION_URL,
  UNASSIGNED_EXTENSION_URL,
  DOWNLOADED_EXTENSION_URL,
  REINSTATED_EXTENSION_URL,
  MAKE_CORRECTION_EXTENSION_URL,
  VIEWED_EXTENSION_URL,
  MARKED_AS_NOT_DUPLICATE,
  MARKED_AS_DUPLICATE,
  DUPLICATE_TRACKING_ID,
  FLAGGED_AS_POTENTIAL_DUPLICATE
]

export function clearActionExtension(task: Task) {
  return {
    ...task,
    extension: (task.extension ?? []).filter(
      (ext) =>
        !TaskActionExtension.includes(
          ext.url as (typeof TaskActionExtension)[number]
        )
    )
  }
}

/*
 * @deprecated
 */
export function taskBundleWithExtension(
  taskEntry: BundleEntry<Task> | Saved<BundleEntry<Task>>,
  extension: Extension
) {
  const task = taskEntry.resource
  task.lastModified = new Date().toISOString()
  task.extension = [...(task.extension ?? []), extension]
  const fhirBundle: Bundle<Task> = {
    resourceType: 'Bundle',
    type: 'document',
    entry: [taskEntry]
  }
  return fhirBundle
}
/*
 * @deprecated
 */
function updateTaskTemplate(
  task: Task,
  status: string,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
): Task {
  if (
    !task ||
    !task.businessStatus ||
    !task.businessStatus.coding ||
    !task.businessStatus.coding[0] ||
    !task.businessStatus.coding[0].code
  ) {
    throw new Error('Task has no businessStatus code')
  }
  task.businessStatus.coding[0].code = status
  if (!task.reason) {
    task.reason = {
      text: ''
    }
  }
  task.reason.text = reason || ''
  const statusReason = {
    text: comment || ''
  }
  task.statusReason = statusReason
  if (duplicateTrackingId) {
    task.extension = task.extension || []
    task.extension.push({
      url: `${OPENCRVS_SPECIFICATION_URL}extension/duplicateTrackingId`,
      valueString: duplicateTrackingId
    })
  }
  return task
}
