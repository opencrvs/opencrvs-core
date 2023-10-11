import {
  Bundle,
  BundleEntry,
  BundleEntryWithFullUrl,
  DocumentReference,
  Extension,
  PaymentReconciliation,
  Practitioner,
  Task,
  Unsaved
} from '@opencrvs/commons/types'
import { HEARTH_URL } from '@workflow/constants'
import fetch from 'node-fetch'

import {
  ApproveRequestInput,
  CorrectionRequestInput,
  CorrectionRequestPaymentInput
} from './correction-request'
import { MAKE_CORRECTION_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import { getUUID } from '@opencrvs/commons'

export function createCorrectionProofOfLegalCorrectionDocument(
  subjectReference: string,
  attachmentURL: string,
  attachmentType: string
): Unsaved<BundleEntry<DocumentReference>> {
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
): [Unsaved<BundleEntry<PaymentReconciliation>>]

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput,
  attachmentURL?: string
): [
  Unsaved<BundleEntry<PaymentReconciliation>>,
  Unsaved<BundleEntry<DocumentReference>>
]

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput,
  attachmentURL?: string
):
  | [
      Unsaved<BundleEntry<PaymentReconciliation>>,
      Unsaved<BundleEntry<DocumentReference>>
    ]
  | [Unsaved<BundleEntry<PaymentReconciliation>>] {
  const temporaryPaymentId = getUUID()
  const temporaryDocumentReferenceId = getUUID()

  const paymentBundleEntry: Unsaved<BundleEntry<PaymentReconciliation>> = {
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
  }

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

export function createCorrectionEncounter(): Unsaved<
  BundleEntry<fhir3.Encounter>
> {
  return {
    fullUrl: `urn:uuid:${getUUID()}`,
    resource: {
      resourceType: 'Encounter',
      status: 'finished'
    }
  }
}

export function createCorrectedTask(
  previousTask: Task, // @todo do not require previous task, pass values from outside
  correctionDetails: CorrectionRequestInput | ApproveRequestInput,
  correctionEncounter:
    | Unsaved<BundleEntry<fhir3.Encounter>>
    | BundleEntry<fhir3.Encounter>,
  paymentReconciliation?:
    | Unsaved<BundleEntry<PaymentReconciliation>>
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
      valueString: update.newValue
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
export function createCorrectionRequestTask(
  previousTask: Task,
  correctionDetails: CorrectionRequestInput,
  correctionEncounter: Unsaved<BundleEntry<fhir3.Encounter>>,
  practitioner: Practitioner,
  paymentReconciliation?: Unsaved<BundleEntry<PaymentReconciliation>>
): Task {
  const conditionalExtensions: Extension[] = []

  if (paymentReconciliation) {
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
      valueString: update.newValue
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

export function findFromBundleById(
  bundle: Bundle,
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

export async function sendBundleToHearth(payload: Bundle): Promise<Bundle> {
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
