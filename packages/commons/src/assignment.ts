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

import {
  getTaskFromSavedBundle,
  findTaskHistories,
  sortTasksDescending,
  getStatusFromTask,
  findExtension,
  UNASSIGNED_EXTENSION_URL,
  ASSIGNED_EXTENSION_URL,
  LAST_USER_EXTENSION_URL,
  LAST_OFFICE_EXTENSION_URL,
  resourceIdentifierToUUID,
  findResourceFromBundleById,
  SavedOffice,
  SavedPractitioner,
  SavedBundle
} from './fhir'

export const findAssignment = <T extends SavedBundle>(bundle: T) => {
  const task = getTaskFromSavedBundle(bundle)
  const taskHistories = findTaskHistories(bundle, sortTasksDescending)

  const allTasks = [task, ...taskHistories]
  const latestStatus = getStatusFromTask(task)

  for (const task of allTasks) {
    // if the first task found is unassignment, it's sure that the bundle is unassigned
    const isUnassigned = findExtension(UNASSIGNED_EXTENSION_URL, task.extension)

    if (isUnassigned) {
      return null
    }

    // if the status has changed before finding assignment, it's unassigned
    if (latestStatus !== getStatusFromTask(task)) {
      return null
    }

    // else.. if assignment is being found
    const isAssigned = findExtension(ASSIGNED_EXTENSION_URL, task.extension)

    if (!isAssigned) {
      continue
    }

    const regLastUserExtension = findExtension(
      LAST_USER_EXTENSION_URL,
      task.extension
    )
    const regLastOfficeExtension = findExtension(
      LAST_OFFICE_EXTENSION_URL,
      task.extension
    )
    const practitionerId = resourceIdentifierToUUID(
      regLastUserExtension!.valueReference.reference
    )
    const officeId = resourceIdentifierToUUID(
      regLastOfficeExtension!.valueReference.reference
    )
    const practitioner = findResourceFromBundleById<SavedPractitioner>(
      bundle,
      practitionerId
    )!
    const office = findResourceFromBundleById<SavedOffice>(bundle, officeId)!

    return { practitioner, office, createdAt: task.lastModified }
  }

  return null
}
