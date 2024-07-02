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
  filterTaskExtensions,
  getTaskBusinessStatus,
  isArchiveTask,
  isRejectedTask,
  getTaskEventType,
  hasExtension
} from '@workflow/features/task/fhir/utils'
import { testFhirTaskBundle } from '@workflow/test/utils'
import {
  RegStatus,
  EVENT_TYPE
} from '@workflow/features/registration/fhir/constants'
import { REINSTATED_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import { cloneDeep } from 'lodash'
import { Task } from '@opencrvs/commons/types'

const task = testFhirTaskBundle.entry[0].resource

describe('getTaskBusinessStatus()', () => {
  it('should return the businessStatus of the task', () => {
    expect(getTaskBusinessStatus(task)).toBe(RegStatus.DECLARED)
  })
})

describe('isArchiveTask()', () => {
  it('should return true if businessStatus is archived', () => {
    const archiveTask = cloneDeep(task)
    archiveTask.businessStatus.coding[0].code = RegStatus.ARCHIVED
    expect(isArchiveTask(archiveTask)).toBeTruthy()
  })

  it('should return false if businessStatus is not archived', () => {
    expect(isArchiveTask(task)).toBeFalsy()
  })
})

describe('isRejectedTask()', () => {
  it('should return true if businessStatus is rejected', () => {
    const rejectedTask = cloneDeep(task)
    rejectedTask.businessStatus.coding[0].code = RegStatus.REJECTED
    expect(isRejectedTask(rejectedTask)).toBeTruthy()
  })

  it('should return false if businessStatus is not archived', () => {
    expect(isRejectedTask(task)).toBeFalsy()
  })
})

describe('hasExtension()', () => {
  it('should return false if task has no reinstated extension', () => {
    expect(hasExtension(task, REINSTATED_EXTENSION_URL)).toBeFalsy()
  })

  it('should return true if task has reinstated extension', () => {
    const taskWithReinstatedExtension = {
      ...task,
      extension: [
        {
          url: REINSTATED_EXTENSION_URL,
          valueString: 'DECLARED'
        }
      ]
    }
    expect(
      hasExtension(
        taskWithReinstatedExtension as unknown as Task,
        REINSTATED_EXTENSION_URL
      )
    ).toBeTruthy()
  })
})

describe('getTaskEventType()', () => {
  it('should return the event type of the task', () => {
    expect(getTaskEventType(task)).toBe(EVENT_TYPE.BIRTH)
  })
})

describe('filterTaskExtensions()', () => {
  const extensions = [
    {
      url: 'test-url',
      valueString: 'DECLARED'
    },
    {
      url: 'test-url2',
      valueString: 'ARCHIVED'
    }
  ]

  it('should filter out the given extensions that do not match the given status', () => {
    const result = filterTaskExtensions(
      extensions,
      ['test-url'],
      RegStatus.ARCHIVED
    )
    expect(result.length).toBe(1)
    expect(result[0].url).toBe('test-url2')
  })

  it('should not filter out the given extensions that match the given status', () => {
    const result = filterTaskExtensions(
      extensions,
      ['test-url'],
      RegStatus.DECLARED
    )
    expect(result.length).toBe(2)
  })
})
