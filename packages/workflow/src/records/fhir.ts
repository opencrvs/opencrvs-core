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
  Bundle,
  BundleEntry,
  DocumentReference,
  Extension,
  PaymentReconciliation,
  Practitioner,
  Task,
  URNReference,
  URLReference,
  SavedTask,
  Composition,
  SavedComposition,
  isURLReference,
  isComposition,
  SavedBundle,
  Resource,
  urlReferenceToUUID,
  ValidRecord
} from '@opencrvs/commons/types'
import { HEARTH_URL } from '@workflow/constants'
import fetch from 'node-fetch'
import { getUUID, UUID } from '@opencrvs/commons'
import { MAKE_CORRECTION_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import {
  ApproveRequestInput,
  CorrectionRequestInput,
  CorrectionRequestPaymentInput,
  ChangedValuesInput
} from '@workflow/records/correction-request'
import { internal } from '@hapi/boom'

function getFHIRValueField(value: unknown) {
  if (typeof value === 'string') {
    return { valueString: value }
  }

  if (typeof value === 'number') {
    return { valueInteger: value }
  }

  if (typeof value === 'boolean') {
    return { valueBoolean: value }
  }

  throw new Error('Invalid value type')
}

export function createCorrectionProofOfLegalCorrectionDocument(
  subjectReference: URNReference,
  attachmentURL: string,
  attachmentType: string
): BundleEntry<DocumentReference> {
  const temporaryDocumentReferenceId = getUUID()
  return {
    fullUrl: `urn:uuid:${temporaryDocumentReferenceId}`,
    resource: {
      resourceType: 'DocumentReference',
      masterIdentifier: {
        value: temporaryDocumentReferenceId,
        system: 'urn:ietf:rfc:3986'
      },
      status: 'current',
      subject: {
        reference: subjectReference
      },
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/documentType',
            code: attachmentType
          }
        ]
      },
      content: [
        {
          attachment: {
            contentType: 'image/jpg',
            data: attachmentURL
          }
        }
      ],
      identifier: []
    }
  }
}

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput
): [BundleEntry<PaymentReconciliation>]

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput,
  attachmentURL?: string
): [BundleEntry<PaymentReconciliation>, BundleEntry<DocumentReference>]

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput,
  attachmentURL?: string
):
  | [BundleEntry<PaymentReconciliation>, BundleEntry<DocumentReference>]
  | [BundleEntry<PaymentReconciliation>] {
  const temporaryPaymentId = getUUID()
  const temporaryDocumentReferenceId = getUUID()

  const paymentBundleEntry = {
    fullUrl: `urn:uuid:${temporaryPaymentId}`,
    resource: {
      resourceType: 'PaymentReconciliation',
      status: 'active',
      detail: [
        {
          type: {
            coding: [
              {
                code: paymentDetails.type
              }
            ]
          },
          amount: {
            value: paymentDetails.amount
          },
          date: paymentDetails.date
        }
      ],
      outcome: {
        coding: [
          {
            code: paymentDetails.outcome
          }
        ]
      }
    }
  } satisfies BundleEntry<PaymentReconciliation>

  if (!attachmentURL) {
    return [paymentBundleEntry]
  }

  return [
    paymentBundleEntry,
    {
      fullUrl: `urn:uuid:${temporaryDocumentReferenceId}`,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          value: temporaryDocumentReferenceId,
          system: 'urn:ietf:rfc:3986'
        },
        status: 'current',
        subject: {
          reference: `urn:uuid:${temporaryPaymentId}`
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/payment',
            valueReference: {
              reference: `urn:uuid:${temporaryPaymentId}`
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/documentType',
              code: 'PROOF_OF_PAYMENT'
            }
          ]
        },
        content: [
          {
            attachment: {
              contentType: 'image/jpg',
              data: attachmentURL
            }
          }
        ],
        identifier: []
      }
    }
  ]
}

export function createCorrectionEncounter() {
  const encounter = {
    fullUrl: `urn:uuid:${getUUID()}` as const,
    resource: {
      resourceType: 'Encounter' as const,
      status: 'finished' as const
    }
  } satisfies BundleEntry<fhir3.Encounter>

  return encounter
}

export function createCorrectedTask(
  previousTask: Task, // @todo do not require previous task, pass values from outside
  correctionDetails: CorrectionRequestInput | ApproveRequestInput,
  correctionEncounter:
    | BundleEntry<fhir3.Encounter>
    | BundleEntry<fhir3.Encounter>,
  paymentReconciliation?:
    | BundleEntry<PaymentReconciliation>
    | BundleEntry<PaymentReconciliation>
): Task {
  const conditionalExtensions: Extension[] = []

  if (paymentReconciliation?.fullUrl) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/paymentDetails',
      valueReference: {
        reference: paymentReconciliation.fullUrl
      }
    })
  }

  if (correctionDetails.requesterOther) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/requestingIndividualOther',
      valueString: correctionDetails.requesterOther
    })
  }

  return {
    resourceType: 'Task',
    status: 'ready',
    intent: 'order',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    encounter: { reference: correctionEncounter.fullUrl },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      ),
      ...conditionalExtensions,
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      {
        url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired',
        valueBoolean: correctionDetails.noSupportingDocumentationRequired
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: correctionDetails.requester
      },
      {
        url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
        valueBoolean: correctionDetails.hasShowedVerifiedDocument
      },
      {
        url: MAKE_CORRECTION_EXTENSION_URL,
        valueString: 'REGISTERED'
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
      ...getFHIRValueField(update.newValue)
    })),
    reason: {
      text: correctionDetails.reason,
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/otherReason',
          valueString: correctionDetails.otherReason
        }
      ]
    },
    note: [
      {
        text: correctionDetails.note
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'REGISTERED'
        }
      ]
    }
  }
}

export function createValidateTask(
  previousTask: Task,
  practitioner: Practitioner
): Task {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'VALIDATED'
        }
      ]
    }
  }
}

export function createUpdatedTask(
  previousTask: SavedTask,
  updatedDetails: ChangedValuesInput,
  practitioner: Practitioner
): SavedTask {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      )
    ],
    input: updatedDetails.map((update) => ({
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
      ...getFHIRValueField(update.oldValue)
    })),
    output: updatedDetails.map((update) => ({
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
      ...getFHIRValueField(update.newValue)
    })),
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'DECLARATION_UPDATED'
        }
      ]
    }
  }
}

export function createCorrectionRequestTask(
  previousTask: Task,
  correctionDetails: CorrectionRequestInput,
  correctionEncounter: BundleEntry<fhir3.Encounter>,
  practitioner: Practitioner,
  paymentReconciliation?: BundleEntry<PaymentReconciliation>
): Task {
  const conditionalExtensions: Extension[] = []

  if (paymentReconciliation) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/paymentDetails',
      valueReference: {
        // @todo implement URLReference and URNReference types for Extensions
        reference: paymentReconciliation.fullUrl as string
      }
    })
  }

  if (correctionDetails.requesterOther) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/requestingIndividualOther',
      valueString: correctionDetails.requesterOther
    })
  }

  return {
    resourceType: 'Task',
    status: 'requested',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    encounter: { reference: correctionEncounter.fullUrl },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      ...conditionalExtensions,
      {
        url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired',
        valueBoolean: correctionDetails.noSupportingDocumentationRequired
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: correctionDetails.requester
      },
      {
        url: `http://opencrvs.org/specs/extension/hasShowedVerifiedDocument` as const,
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
      ...getFHIRValueField(update.newValue)
    })),
    reason: {
      text: correctionDetails.reason,
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/otherReason',
          valueString: correctionDetails.otherReason
        }
      ]
    },
    note: [
      {
        text: correctionDetails.note
      }
    ],
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

export type TransactionResponse = Omit<fhir3.Bundle, 'entry'> & {
  entry: Array<
    Omit<fhir3.BundleEntry, 'response'> & {
      response: Omit<fhir3.BundleEntryResponse, 'location'> & {
        location: URLReference
      }
    }
  >
}

export async function sendBundleToHearth(
  payload: Bundle
): Promise<TransactionResponse> {
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  return res.json()
}

function findSavedReference(
  temporaryReference: URNReference,
  resourceBundle: Bundle,
  responseBundle: TransactionResponse
): URLReference | null {
  const indexInResponseBundle = resourceBundle.entry.findIndex(
    (entry) => entry.fullUrl === temporaryReference
  )
  if (indexInResponseBundle === -1) {
    return null
  }
  return responseBundle.entry[indexInResponseBundle].response.location
}

function toSavedComposition(
  composition: Composition,
  id: UUID,
  resourceBundle: Bundle,
  responseBundle: TransactionResponse
): SavedComposition {
  return {
    ...composition,
    id,
    section: composition.section.map((section) => ({
      ...section,
      entry: section.entry.map((sectionEntry) => {
        if (isURLReference(sectionEntry.reference)) {
          return {
            ...sectionEntry,
            reference: sectionEntry.reference
          }
        }
        const savedReference = findSavedReference(
          sectionEntry.reference,
          resourceBundle,
          responseBundle
        )
        if (!savedReference) {
          throw internal(
            `No response found for "${`${section.title} -> ${sectionEntry.reference}`} in the following transaction: ${JSON.stringify(
              responseBundle
            )}"`
          )
        }
        return {
          ...sectionEntry,
          reference: savedReference
        }
      })
    }))
  }
}

/*
 * Only the references in Composition->section->entry->reference
 * are being resolved, the others e.g.
 * DocumentReference->extension->valueReference->reference
 * need to be added if needed
 */
export function toSavedBundle<T extends Resource>(
  resourceBundle: Bundle<T>,
  responseBundle: TransactionResponse
): SavedBundle<T> {
  return {
    ...resourceBundle,
    entry: resourceBundle.entry.map((entry, index) => {
      if (isComposition(entry.resource)) {
        return {
          fullUrl: responseBundle.entry[index].response.location,
          resource: toSavedComposition(
            entry.resource,
            urlReferenceToUUID(responseBundle.entry[index].response.location),
            resourceBundle,
            responseBundle
          )
        }
      }
      return {
        ...entry,
        fullUrl: responseBundle.entry[index].response.location,
        resource: {
          ...entry.resource,
          id: urlReferenceToUUID(responseBundle.entry[index].response.location)
        }
      }
    })
  } as SavedBundle<T>
}

export function mergeBundles(
  record: ValidRecord,
  newOrUpdatedResourcesBundle: SavedBundle
): SavedBundle {
  const existingResourceIds = record.entry.map(({ resource }) => resource.id)
  const newEntries = newOrUpdatedResourcesBundle.entry.filter(
    ({ resource }) => !existingResourceIds.includes(resource.id)
  )
  return {
    ...record,
    entry: [
      ...record.entry.map((previousEntry) => ({
        ...previousEntry,
        resource:
          newOrUpdatedResourcesBundle.entry.find(
            (newEntry) => newEntry.resource.id === previousEntry.resource.id
          )?.resource ?? previousEntry.resource
      })),
      ...newEntries
    ]
  }
}

export async function findTaskFromIdentifier(
  identifier: string
): Promise<Bundle<SavedTask>> {
  const res = await fetch(
    new URL(`/fhir/Task?identifier=${identifier}`, HEARTH_URL).href,
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
