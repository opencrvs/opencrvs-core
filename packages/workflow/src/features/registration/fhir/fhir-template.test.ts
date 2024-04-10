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
import { Bundle, Task } from '@opencrvs/commons/types'
import { getTaskResourceFromFhirBundle } from '@workflow/features/registration/fhir/fhir-template'
import { testFhirBundle } from '@workflow/test/utils'

describe('Verify fhir templates', () => {
  describe('getTaskResource', () => {
    it('returns the task resource properly when FhirBundle is sent', () => {
      const taskResourse = getTaskResourceFromFhirBundle(testFhirBundle)

      expect(taskResourse).toBeDefined()
      expect(taskResourse).toEqual(testFhirBundle.entry[1].resource)
    })
    it('returns the task resource properly when Task BundleEntry is sent', () => {
      const payload = {
        type: 'document',
        entry: [{ ...testFhirBundle.entry[1] }]
      } as Bundle<Task>
      const taskResourse = getTaskResourceFromFhirBundle(payload)

      expect(taskResourse).toBeDefined()
      if (
        testFhirBundle &&
        testFhirBundle.entry &&
        testFhirBundle.entry[1] &&
        testFhirBundle.entry[1].resource
      ) {
        expect(taskResourse).toEqual(testFhirBundle.entry[1].resource)
      } else {
        throw new Error('Failed')
      }
    })
  })
})
