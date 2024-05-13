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
import { Bundle, Composition, isTask, Task } from '@opencrvs/commons/types'
import { CompositionSection } from 'fhir/r3'

export function getTaskResourceFromFhirBundle(fhirBundle: Bundle): Task {
  const resources = fhirBundle.entry.map((entry) => entry.resource)

  const task = resources.find(isTask)

  if (!task) {
    throw new Error('No task resource found')
  }

  return task
}

export function getSectionEntryBySectionCode(
  composition: Composition | undefined,
  sectionCode: string
): fhir3.Reference {
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: CompositionSection) => {
      if (!section.code || !section.code.coding) {
        return false
      }
      return section.code.coding.some((coding) => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(
      `Invalid person section found for given code: ${sectionCode}`
    )
  }
  return personSection.entry[0]
}
