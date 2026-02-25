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

import { http, HttpResponse } from 'msw'
import {
  ActionType,
  and,
  BIRTH_EVENT,
  ConditionalType,
  defineConfig,
  defineDeclarationForm,
  defineFormPage,
  field,
  FieldType,
  getCurrentEventState,
  never,
  not,
  PageTypes,
  generateTranslationConfig,
  EventState,
  SCOPES
} from '@opencrvs/commons'
import { v2BirthEvent } from '@opencrvs/commons/fixtures'
import {
  createSystemTestClient,
  createTestClient,
  setupTestCase
} from '@events/tests/utils'
import { mswServer } from '@events/tests/msw'
import { env } from '@events/environment'

describe('Overwriting parent field', () => {
  const informantOtherThanMother = and(
    not(field('informant.relation').inArray(['MOTHER'])),
    not(field('informant.relation').isFalsy())
  )

  const informant = defineFormPage({
    id: 'informant',
    type: PageTypes.enum.FORM,
    title: generateTranslationConfig("Informant's details"),
    fields: [
      {
        id: 'informant.relation',
        type: FieldType.SELECT,
        required: true,
        label: generateTranslationConfig('Relationship to child'),
        options: [
          {
            value: 'MOTHER',
            label: generateTranslationConfig('Mother')
          },
          {
            value: 'FATHER',
            label: generateTranslationConfig('Father')
          },
          {
            value: 'BROTHER',
            label: generateTranslationConfig('Brother')
          }
        ]
      },
      {
        id: 'informant.name',
        type: FieldType.NAME,
        required: true,
        hideLabel: true,
        label: generateTranslationConfig("Informant's name"),
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: informantOtherThanMother
          }
        ],
        parent: field('informant.relation')
      },
      {
        id: 'informant.dob',
        type: 'DATE',
        required: true,
        validation: [
          {
            message: generateTranslationConfig('Must be a valid Birthdate'),
            validator: field('informant.dob').isBefore().now()
          },
          {
            message: generateTranslationConfig(
              "Birth date must be before child's birth date"
            ),
            validator: field('informant.dob')
              .isBefore()
              .date(field('child.dob'))
          }
        ],
        label: generateTranslationConfig('Date of birth'),
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              not(field('informant.dobUnknown').isEqualTo(true)),
              informantOtherThanMother
            )
          }
        ],
        parent: field('informant.relation')
      },
      {
        id: 'informant.dobUnknown',
        type: FieldType.CHECKBOX,
        label: generateTranslationConfig('Exact date of birth unknown'),
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: informantOtherThanMother
          },
          {
            type: ConditionalType.DISPLAY_ON_REVIEW,
            conditional: never()
          }
        ],
        parent: field('informant.relation')
      },
      {
        id: 'informant.age',
        type: FieldType.TEXT,
        required: true,
        label: generateTranslationConfig('Age of informant'),
        configuration: {
          postfix: generateTranslationConfig('years')
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              field('informant.dobUnknown').isEqualTo(true),
              informantOtherThanMother
            )
          }
        ],
        parent: field('informant.relation')
      }
    ]
  })

  const modiedV2BirthEvent = defineConfig({
    ...v2BirthEvent,
    actions: [
      ...v2BirthEvent.actions,
      {
        type: ActionType.REQUEST_CORRECTION,
        label: generateTranslationConfig('Correct record'),
        correctionForm: {
          label: generateTranslationConfig('Correct record'),
          pages: []
        }
      }
    ],
    declaration: defineDeclarationForm({
      ...v2BirthEvent.declaration,
      pages: [...v2BirthEvent.declaration.pages, informant]
    })
  })
  it('should overwrite informant.relation via REQUEST_CORRECTION action', async () => {
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
        return HttpResponse.json([modiedV2BirthEvent])
      }),
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/v2-birth/actions/:action`,
        (ctx) => {
          const payload =
            ctx.params.action === ActionType.REGISTER
              ? { registrationNumber: `ABC${Number(new Date())}` }
              : {}

          return HttpResponse.json(payload)
        }
      )
    )
    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const declaration = {
      'child.name': { firstname: 'John', surname: 'Doe' },
      'child.dob': '2020-05-15',
      'mother.name': { firstname: 'Jane', surname: 'Doe' },
      'mother.dob': '1990-03-22',
      'mother.idType': 'NID',
      'mother.nid': 'ID123456789',
      'informant.relation': 'BROTHER',
      'informant.name': { firstname: 'Rok', surname: 'Doe' },
      'informant.dob': '1988-06-12',
      'informant.dobUnknown': false
    } satisfies EventState

    let event = await client.event.create(
      generator.event.create({ type: BIRTH_EVENT })
    )

    event = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration,
        keepAssignment: true
      })
    )
    await client.event.actions.validate.request(
      generator.event.actions.validate(event.id, {
        declaration,
        keepAssignment: true
      })
    )
    event = await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        declaration,
        keepAssignment: true
      })
    )

    let eventState = getCurrentEventState(event, modiedV2BirthEvent)
    expect(eventState.id).toBeDefined()
    expect(eventState.declaration['informant.dobUnknown']).toBe(false)
    expect(eventState.declaration['informant.dob']).toBe('1988-06-12')
    expect(eventState.declaration['informant.age']).toBeUndefined()

    event = await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id, {
        declaration: {
          'informant.relation': 'MOTHER',
          'informant.name': null,
          'informant.dob': null,
          'informant.dobUnknown': null
        },
        keepAssignment: true
      })
    )

    const requestId = event.actions[event.actions.length - 1].id

    event = await client.event.actions.correction.approve.request(
      generator.event.actions.correction.approve(event.id, requestId, {
        keepAssignment: true
      })
    )

    eventState = getCurrentEventState(event, modiedV2BirthEvent)
    expect(eventState.declaration['informant.dobUnknown']).toBeFalsy()
    expect(eventState.declaration['informant.relation']).toBe('MOTHER')
  })
})

describe('Search index should reflect corrected null informant fields', () => {
  const informant = defineFormPage({
    id: 'informant',
    type: PageTypes.enum.FORM,
    title: generateTranslationConfig("Informant's details"),
    fields: [
      {
        id: 'informant.relation',
        type: FieldType.SELECT,
        required: true,
        label: generateTranslationConfig('Relationship to child'),
        options: [
          { value: 'MOTHER', label: generateTranslationConfig('Mother') },
          { value: 'FATHER', label: generateTranslationConfig('Father') },
          { value: 'BROTHER', label: generateTranslationConfig('Brother') }
        ]
      },
      {
        id: 'informant.name',
        type: FieldType.NAME,
        required: true,
        hideLabel: true,
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: not(field('informant.relation').isEqualTo('MOTHER'))
          }
        ],
        label: generateTranslationConfig("Informant's name")
      }
    ]
  })

  const modifiedV2BirthEvent = defineConfig({
    ...v2BirthEvent,
    actions: [
      ...v2BirthEvent.actions,
      {
        type: ActionType.REQUEST_CORRECTION,
        label: generateTranslationConfig('Correct record'),
        correctionForm: {
          label: generateTranslationConfig('Correct record'),
          pages: []
        }
      }
    ],
    declaration: defineDeclarationForm({
      ...v2BirthEvent.declaration,
      pages: [...v2BirthEvent.declaration.pages, informant]
    })
  })
  it('should not return record when searching by informant.name after correction sets it to null', async () => {
    mswServer.use(
      http.get(`${env.COUNTRY_CONFIG_URL}/events`, () => {
        return HttpResponse.json([modifiedV2BirthEvent])
      }),
      http.post(
        `${env.COUNTRY_CONFIG_URL}/trigger/events/v2-birth/actions/:action`,
        (ctx) => {
          const payload =
            ctx.params.action === ActionType.REGISTER
              ? { registrationNumber: `ABC${Number(new Date())}` }
              : {}

          return HttpResponse.json(payload)
        }
      )
    )

    const { user, generator } = await setupTestCase()
    const client = createTestClient(user)

    const declaration = {
      'child.name': { firstname: 'John', surname: 'Doe' },
      'child.dob': '2020-05-15',
      'mother.name': { firstname: 'Jane', surname: 'Doe' },
      'mother.dob': '1990-03-22',
      'mother.idType': 'NID',
      'mother.nid': 'ID123456789',
      'informant.relation': 'FATHER',
      'informant.name': { firstname: 'Rok', surname: 'Doe' }
    } satisfies EventState

    // 1) Create -> Declare -> Validate -> Register
    let event = await client.event.create(
      generator.event.create({ type: BIRTH_EVENT })
    )

    event = await client.event.actions.declare.request(
      generator.event.actions.declare(event.id, {
        declaration,
        keepAssignment: true
      })
    )

    await client.event.actions.validate.request(
      generator.event.actions.validate(event.id, {
        declaration,
        keepAssignment: true
      })
    )

    event = await client.event.actions.register.request(
      generator.event.actions.register(event.id, {
        declaration,
        keepAssignment: true
      })
    )

    // sanity
    let eventState = getCurrentEventState(event, modifiedV2BirthEvent)
    expect(eventState.declaration['informant.name']).toEqual({
      firstname: 'Rok',
      surname: 'Doe'
    })

    // 2) Search by informant name should return it
    const recordSearchClient = createSystemTestClient('test-system', [
      SCOPES.RECORDSEARCH
    ])
    const { results: resultsBeforeCorrection } =
      await recordSearchClient.event.search({
        query: {
          type: 'and',
          clauses: [
            {
              eventType: BIRTH_EVENT,
              data: {
                'informant.name': { type: 'fuzzy', term: 'Rok' }
              }
            }
          ]
        }
      })

    expect(resultsBeforeCorrection).toHaveLength(1)
    expect(resultsBeforeCorrection[0].id).toBe(event.id)

    // 3) Request correction to NULL informant fields
    event = await client.event.actions.correction.request.request(
      generator.event.actions.correction.request(event.id, {
        declaration: {
          'informant.name': null,
          'informant.relation': 'MOTHER'
        },
        keepAssignment: true
      })
    )

    const requestId = event.actions[event.actions.length - 1].id

    // 4) Approve correction
    event = await client.event.actions.correction.approve.request(
      generator.event.actions.correction.approve(event.id, requestId, {
        keepAssignment: true
      })
    )

    eventState = getCurrentEventState(event, modifiedV2BirthEvent)
    expect(eventState.declaration['informant.name']).toBeUndefined()

    // 5) Now searching by informant.name should NOT return the record
    const { results: resultsAfterCorrectionByInformant } =
      await recordSearchClient.event.search({
        query: {
          type: 'and',
          clauses: [
            {
              eventType: BIRTH_EVENT,
              data: {
                'informant.name': { type: 'fuzzy', term: 'Rok' }
              }
            }
          ]
        }
      })

    expect(resultsAfterCorrectionByInformant).toHaveLength(0)

    // 6) But searching by any other field should still return it
    const { results: resultsAfterCorrectionByChildDob } =
      await recordSearchClient.event.search({
        query: {
          type: 'and',
          clauses: [
            {
              eventType: BIRTH_EVENT,
              data: {
                'child.dob': { type: 'exact', term: '2020-05-15' }
              }
            }
          ]
        }
      })

    expect(resultsAfterCorrectionByChildDob).toHaveLength(1)
    expect(resultsAfterCorrectionByChildDob[0].id).toBe(event.id)
  })
})
