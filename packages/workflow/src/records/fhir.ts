import { HEARTH_URL } from '@workflow/constants'

import { BundleEntryWithFullUrl, Bundle, Task } from '@opencrvs/commons'

import fetch from 'node-fetch'
import { CorrectionRequestInput } from './correction-request'

export function createCorrectionRequestTask(
  previousTask: Task,
  correctionDetails: CorrectionRequestInput
) {
  return {
    resourceType: 'Task',
    status: 'requested',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      {
        url: 'http://opencrvs.org/specs/extension/contact-person',
        valueString: correctionDetails.requester
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: correctionDetails.requester
      },
      {
        url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
        valueBoolean: correctionDetails.hasShowedVerifiedDocument
      }
    ],
    input: correctionDetails.values.map((update) => ({
      valueCode: update.section,
      valueId: update.fieldName,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      valueString: update.newValue
    })),
    reason: {
      text: correctionDetails.reason,
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/otherReason',
          valueString: ''
        }
      ]
    },
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'CORRECTION_REQUESTED'
        }
      ]
    }
  }
}

export function findFromBundleById(
  bundle: fhir.Bundle,
  id: string
): BundleEntryWithFullUrl {
  const resource = bundle.entry?.find((item) => item.resource?.id === id)

  if (!resource) {
    throw new Error('Resource not found in bundle with id ' + id)
  }

  if (!resource.fullUrl) {
    throw new Error(
      'A resource was found but it did not have a fullUrl. This should not happen.'
    )
  }

  return resource as BundleEntryWithFullUrl
}

export function isComposition(
  resource: fhir.Resource
): resource is fhir.Composition {
  return resource.resourceType === 'Composition'
}
export function isEncounter(
  resource: fhir.Resource
): resource is fhir.Encounter {
  return resource.resourceType === 'Encounter'
}
export function isRelatedPerson(
  resource: fhir.Resource
): resource is fhir.RelatedPerson {
  return resource.resourceType === 'RelatedPerson'
}
export function isTask(resource: fhir.Resource): resource is Task {
  return resource.resourceType === 'Task'
}

export async function sendBundleToHearth(
  payload: fhir.Bundle
): Promise<fhir.Bundle> {
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${res.statusText}`
    )
  }

  return res.json()
}

export async function getTaskHistory(taskId: string): Promise<Bundle<Task>> {
  const res = await fetch(
    new URL(`/fhir/Task/${taskId}/_history?_count=100`, HEARTH_URL).href,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Fetching task history from Hearth failed with [${res.status}] body: ${res.statusText}`
    )
  }

  return res.json()
}

export function sortTasksDescending(tasks: Task[]) {
  return tasks.slice().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  })
}
