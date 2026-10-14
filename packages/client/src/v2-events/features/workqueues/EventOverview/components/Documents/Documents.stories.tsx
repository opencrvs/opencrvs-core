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

import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { http, HttpResponse } from 'msw'
import React from 'react'
import superjson from 'superjson'
import { expect, within } from 'storybook/test'
import {
  ActionDocument,
  ActionType,
  createPrng,
  DocumentPath,
  EventConfig,
  EventDocument,
  FieldType,
  FileFieldValue,
  FileFieldWithOptionValue,
  generateActionDocument,
  generateRandomDatetime,
  getCurrentEventState,
  getDeclaration,
  getUUID,
  tennisClubMembershipEvent,
  TestUserRole,
  withDeclaration
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventOverviewIndex } from '../../EventOverview'

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const refData = testDataGenerator()

// The Documents tab downloads the event on demand (useGetOrDownloadEvent), which
// precaches the record's users and fetches each file from a presigned URL. A
// fake presigned URL and the bytes served from it keep that file precaching off
// the network, so it resolves instantly instead of hanging the test.
const PRESIGNED_FILE_URL =
  'http://localhost:3535/ocrvs/documents-story-file.png'
const ONE_PX_PNG = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  ),
  (c) => c.charCodeAt(0)
)

const SUPPORTING_DOC_FIELD_ID = 'applicant.supportingDoc'
const SUPPORTING_DOC_LABEL = 'Supporting document'
const IDENTITY_DOCS_FIELD_ID = 'applicant.identityDocuments'
const IDENTITY_DOCS_LABEL = 'Identity documents'

const tennisClubDeclaration = getDeclaration(tennisClubMembershipEvent)
const [applicantPage, ...otherPages] = tennisClubDeclaration.pages

/**
 * The tennis club configuration with two file fields added to the applicant
 * page: a single FILE and a FILE_WITH_OPTIONS. Serialised the way a country
 * configuration reaches the client (JSON only, no chainable builder helpers).
 */
const eventConfig = JSON.parse(
  JSON.stringify(
    withDeclaration(tennisClubMembershipEvent, {
      ...tennisClubDeclaration,
      pages: [
        {
          ...applicantPage,
          fields: [
            ...applicantPage.fields,
            {
              id: SUPPORTING_DOC_FIELD_ID,
              type: FieldType.FILE,
              configuration: { maxFileSize: 5 * 1024 * 1024 },
              label: {
                defaultMessage: SUPPORTING_DOC_LABEL,
                description: 'Label for the supporting document file field',
                id: 'event.tennis-club-membership.action.declare.form.field.supportingDoc.label'
              }
            },
            {
              id: IDENTITY_DOCS_FIELD_ID,
              type: FieldType.FILE_WITH_OPTIONS,
              configuration: { maxFileSize: 5 * 1024 * 1024 },
              label: {
                defaultMessage: IDENTITY_DOCS_LABEL,
                description: 'Label for the identity documents file field',
                id: 'event.tennis-club-membership.action.declare.form.field.identityDocuments.label'
              },
              options: [
                {
                  value: 'passport',
                  label: {
                    defaultMessage: 'Passport',
                    description: 'Passport option',
                    id: 'event.tennis-club-membership.identityDocuments.passport.label'
                  }
                },
                {
                  value: 'license',
                  label: {
                    defaultMessage: 'License',
                    description: 'License option',
                    id: 'event.tennis-club-membership.identityDocuments.license.label'
                  }
                }
              ]
            }
          ]
        },
        ...otherPages
      ]
    })
  )
) as EventConfig

// Countries label the correction action "Correct", since one action serves both a
// correction request and a direct correction. The Documents tab must still tell them apart.
eventConfig.actions = eventConfig.actions.map((action) =>
  action.type === ActionType.REQUEST_CORRECTION
    ? {
        ...action,
        label: {
          defaultMessage: 'Correct',
          description: 'Label for the correction action',
          id: 'event.tennis-club-membership.action.correction.story.label'
        }
      }
    : action
)

const actionDefaults = {
  createdAt: generateRandomDatetime(
    createPrng(42),
    new Date('2024-03-01'),
    new Date('2024-04-01')
  ),
  createdBy: refData.user.id.localRegistrar,
  createdByRole: TestUserRole.enum.LOCAL_REGISTRAR,
  createdAtLocation: refData.user.localRegistrar().v2.primaryOfficeId,
  transactionId: getUUID()
} satisfies Partial<ActionDocument>

const supportingDocA: FileFieldValue = {
  path: 'supporting-doc-a.png' as DocumentPath,
  originalFilename: 'birth-certificate.png',
  type: 'image/png'
}

const supportingDocB: FileFieldValue = {
  path: 'supporting-doc-b.png' as DocumentPath,
  originalFilename: 'birth-certificate-corrected.png',
  type: 'image/png'
}

const identityDocuments: FileFieldWithOptionValue = [
  {
    path: 'passport.png' as DocumentPath,
    originalFilename: 'passport.png',
    type: 'image/png',
    option: 'passport'
  },
  {
    path: 'license.png' as DocumentPath,
    originalFilename: 'license.png',
    type: 'image/png',
    option: 'license'
  }
]

function assigned() {
  return generateActionDocument({
    configuration: eventConfig,
    action: ActionType.ASSIGN,
    defaults: {
      ...actionDefaults,
      assignedTo: refData.user.id.localRegistrar
    }
  })
}

/**
 * A record whose documents were uploaded across two actions:
 *  - DECLARE uploads the supporting document and two identity documents.
 *  - EDIT replaces the supporting document and removes the identity documents.
 * So the history holds four upload events (two supporting docs, two identity
 * docs), and the removal contributes none.
 */
const eventWithDocuments: EventDocument = {
  ...tennisClubMembershipEventDocument,
  actions: [
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.CREATE,
      defaults: { ...actionDefaults, declaration: {} }
    }),
    assigned(),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.DECLARE,
      defaults: {
        ...actionDefaults,
        declaration: {
          'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' },
          'applicant.dob': '1999-11-11',
          [SUPPORTING_DOC_FIELD_ID]: supportingDocA,
          [IDENTITY_DOCS_FIELD_ID]: identityDocuments
        }
      }
    }),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.EDIT,
      defaults: {
        ...actionDefaults,
        declaration: {
          [SUPPORTING_DOC_FIELD_ID]: supportingDocB,
          [IDENTITY_DOCS_FIELD_ID]: null
        }
      }
    }),
    assigned()
  ]
}

/** A record with no uploaded documents. */
const eventWithoutDocuments: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.CREATE,
      defaults: { ...actionDefaults, declaration: {} }
    }),
    assigned(),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.DECLARE,
      defaults: {
        ...actionDefaults,
        declaration: {
          'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' },
          'applicant.dob': '1999-11-11'
        }
      }
    }),
    assigned()
  ]
}

// Identity-document files whose option value doubles as the display name
// (unknown options fall back to their raw value on the Documents tab).
function identityDocsNamed(names: string[]): FileFieldWithOptionValue {
  return names.map((name, index) => ({
    path: `identity-${index}.png` as DocumentPath,
    originalFilename: `identity-${index}.png`,
    type: 'image/png',
    option: name
  }))
}

// Uploaded with the declaration (older).
const declaredIdentityDocs = identityDocsNamed([
  'Affidavit',
  'Birth certificate',
  'Court order',
  'Hospital record',
  'Immunization card',
  'National ID',
  'Passport',
  'Residence permit',
  'School record',
  'Vaccination record'
])

// Uploaded later, when the record was registered (newer).
const registeredIdentityDocs = identityDocsNamed([
  'Addendum',
  'Updated certificate'
])

/**
 * A record with more documents than fit on one page (12 > the page size of 10),
 * uploaded across two actions on different days. Exercises the Documents tab's
 * ordering: newest upload first (the registration docs), and within one upload
 * time ordered by name. Documents from EDIT actions are intentionally excluded,
 * so these are spread over DECLARE and REGISTER instead.
 */
const eventWithManyDocuments: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.CREATE,
      defaults: { ...actionDefaults, declaration: {} }
    }),
    assigned(),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.DECLARE,
      defaults: {
        ...actionDefaults,
        createdAt: '2024-03-01T09:00:00.000Z',
        declaration: {
          'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' },
          'applicant.dob': '1999-11-11',
          [IDENTITY_DOCS_FIELD_ID]: declaredIdentityDocs
        }
      }
    }),
    generateActionDocument({
      configuration: eventConfig,
      action: ActionType.REGISTER,
      defaults: {
        ...actionDefaults,
        createdAt: '2024-03-10T09:00:00.000Z',
        declaration: {
          [IDENTITY_DOCS_FIELD_ID]: registeredIdentityDocs
        }
      }
    }),
    assigned()
  ]
}

// Applies `defaults` last, since the generator replaces e.g. a correction's `requestId`.
function storyAction<T extends ActionType>(
  type: T,
  defaults: Partial<Extract<ActionDocument, { type: T }>> = {}
): ActionDocument {
  const overrides = { ...actionDefaults, declaration: {}, ...defaults }
  return {
    ...generateActionDocument({
      configuration: eventConfig,
      action: type,
      defaults: overrides
    }),
    ...overrides
  } as ActionDocument
}

function storyFile(path: string): FileFieldValue {
  return {
    path: path as DocumentPath,
    originalFilename: path,
    type: 'image/png'
  }
}

const applicant = {
  'applicant.name': { firstname: 'Danny', surname: 'Drinkwater' },
  'applicant.dob': '1999-11-11'
}

// Passport and license declared, then edited to add a renewed passport. The edit resends
// the whole FILE_WITH_OPTIONS field on both EDIT and the DECLARE that follows it.
const eventWithEditedIdentityDocuments: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    storyAction(ActionType.CREATE),
    assigned(),
    storyAction(ActionType.DECLARE, {
      createdAt: '2024-03-01T09:00:00.000Z',
      declaration: { ...applicant, [IDENTITY_DOCS_FIELD_ID]: identityDocuments }
    }),
    ...[ActionType.EDIT, ActionType.DECLARE].map((type) =>
      storyAction(type, {
        createdAt: '2024-03-10T09:00:00.000Z',
        declaration: {
          [IDENTITY_DOCS_FIELD_ID]: [
            ...identityDocuments,
            { ...storyFile('passport-renewed.png'), option: 'passport' }
          ]
        }
      })
    ),
    assigned()
  ]
}

const correctionRequest = storyAction(ActionType.REQUEST_CORRECTION, {
  createdAt: '2024-03-10T09:00:00.000Z',
  declaration: { [SUPPORTING_DOC_FIELD_ID]: storyFile('requested.png') }
})

const directCorrection = storyAction(ActionType.REQUEST_CORRECTION, {
  createdAt: '2024-03-20T09:00:00.000Z',
  declaration: { [SUPPORTING_DOC_FIELD_ID]: storyFile('direct.png') }
})

// A rejected correction request, then a direct correction (a request its requester approved immediately).
const eventWithCorrections: EventDocument = {
  ...tennisClubMembershipEventDocument,
  id: getUUID(),
  actions: [
    storyAction(ActionType.CREATE),
    assigned(),
    storyAction(ActionType.DECLARE, {
      createdAt: '2024-03-01T09:00:00.000Z',
      declaration: applicant
    }),
    storyAction(ActionType.REGISTER, { createdAt: '2024-03-02T09:00:00.000Z' }),
    correctionRequest,
    storyAction(ActionType.REJECT_CORRECTION, {
      createdAt: '2024-03-11T09:00:00.000Z',
      requestId: correctionRequest.id
    }),
    directCorrection,
    storyAction(ActionType.APPROVE_CORRECTION, {
      createdAt: '2024-03-20T09:00:00.000Z',
      requestId: directCorrection.id,
      content: { immediateCorrection: true }
    }),
    assigned()
  ]
}

/** The Documents tab rows listing the given document, in table order. */
async function findDocumentRows(canvasElement: HTMLElement, name: string) {
  const links = await within(canvasElement).findAllByText(name)
  return links.map((link) => link.closest('[id^="row_"]'))
}

function handlersFor(event: EventDocument) {
  return {
    events: [
      tRPCMsw.event.config.get.query(() => [eventConfig]),
      tRPCMsw.event.get.query(() => event),
      tRPCMsw.event.search.query(() => ({
        results: [getCurrentEventState(event, eventConfig)],
        total: 1
      })),
      // Resolve the on-demand download's user + file precaching (see
      // PRESIGNED_FILE_URL) so it never hangs waiting on the network.
      tRPCMsw.user.list.query(() => [refData.user.localRegistrar().summary]),
      tRPCMsw.event.file.getPresignedUrl.query(() => ({
        presignedURL: PRESIGNED_FILE_URL
      })),
      http.get(PRESIGNED_FILE_URL, () =>
        HttpResponse.arrayBuffer(ONE_PX_PNG.buffer, {
          headers: { 'Content-Type': 'image/png' }
        })
      )
    ]
  }
}

const meta: Meta<typeof EventOverviewIndex> = {
  title: 'Documents',
  component: EventOverviewIndex,
  parameters: {
    userRole: TestUserRole.enum.LOCAL_REGISTRAR,
    offline: {
      configs: [eventConfig],
      events: [
        eventWithDocuments,
        eventWithoutDocuments,
        eventWithManyDocuments,
        eventWithEditedIdentityDocuments,
        eventWithCorrections
      ]
    }
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta
type Story = StoryObj<typeof EventOverviewIndex>

/**
 * Visual story: every upload across the record's accepted actions is listed —
 * one row per FILE upload and one row per option file of a FILE_WITH_OPTIONS
 * field (`${IDENTITY_DOCS_LABEL} (Passport)` etc.), named after the field's
 * config label and attributed to the action that added it. The supporting
 * document is uploaded in the declaration and replaced in an edit (two rows);
 * the removed identity documents contribute none.
 */
export const ShowsUploadedDocuments: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.DOCUMENTS.buildPath({
        eventId: eventWithDocuments.id
      })
    },
    msw: { handlers: handlersFor(eventWithDocuments) }
  }
}

/** Visual story: with no uploads, the empty state is shown. */
export const EmptyState: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.DOCUMENTS.buildPath({
        eventId: eventWithoutDocuments.id
      })
    },
    msw: { handlers: handlersFor(eventWithoutDocuments) }
  }
}

/**
 * Visual story: a record with more documents than fit on one page (12 > the
 * page size of 10), so the table paginates and the pagination control is shown.
 */
export const PaginatedDocuments: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.DOCUMENTS.buildPath({
        eventId: eventWithManyDocuments.id
      })
    },
    msw: { handlers: handlersFor(eventWithManyDocuments) }
  }
}

/** An edit resends the whole FILE_WITH_OPTIONS field; each file is listed once, under its first upload. */
export const ListsEachFileOfAnEditedDocumentOnce: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.DOCUMENTS.buildPath({
        eventId: eventWithEditedIdentityDocuments.id
      })
    },
    msw: { handlers: handlersFor(eventWithEditedIdentityDocuments) },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Documents (3)')
    await expect(
      await findDocumentRows(canvasElement, `${IDENTITY_DOCS_LABEL} (Passport)`)
    ).toHaveLength(2)
    await expect(
      await findDocumentRows(canvasElement, `${IDENTITY_DOCS_LABEL} (License)`)
    ).toHaveLength(1)
  }
}

/** Documents of a (here rejected) correction request read "Request correction"; a direct correction keeps its label. */
export const LabelsCorrectionRequestDocuments: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.EVENT.DOCUMENTS.buildPath({
        eventId: eventWithCorrections.id
      })
    },
    msw: { handlers: handlersFor(eventWithCorrections) },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Documents (2)')
    // Newest first: the direct correction, then the rejected correction request.
    const [directRow, requestRow] = await findDocumentRows(
      canvasElement,
      SUPPORTING_DOC_LABEL
    )
    await expect(requestRow).toHaveTextContent('Request correction')
    await expect(directRow).toHaveTextContent('Correct')
    await expect(directRow).not.toHaveTextContent('Request correction')
  }
}
