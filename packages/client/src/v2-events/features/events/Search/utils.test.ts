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
  EventStatus,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { FIELD_SEPARATOR } from '@client/v2-events/components/forms/utils'
import { joinValues } from '@client/v2-events/utils'
import {
  getAdvancedSearchFieldErrors,
  flattenFieldErrors,
  getDefaultSearchFields,
  buildDataCondition
} from './utils'

describe('getAdvancedSearchFieldErrors', () => {
  it('should return no errors for empty values', () => {
    const mockFormValues = { 'applicant.dob': '3' }
    const errors = getAdvancedSearchFieldErrors(
      tennisClubMembershipEvent,
      mockFormValues
    )
    expect(errors).toEqual({
      'applicant.name': {
        errors: []
      },
      'recommender.name': {
        errors: []
      },
      'applicant.email': {
        errors: []
      },
      'applicant.dob': {
        errors: [
          {
            message: {
              defaultMessage: 'Invalid date field',
              description: 'Error message when date field is invalid',
              id: 'v2.error.invalidDate'
            }
          },
          {
            message: {
              id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.dob.error',
              defaultMessage: 'Please enter a valid date',
              description: 'This is the error message for invalid date'
            }
          }
        ]
      }
    })
  })
})

describe('flattenFieldErrors', () => {
  it('should flatten nested field errors into a single array', () => {
    const errors = {
      'event.status': {
        errors: [{ message: { defaultMessage: 'Invalid status' } }]
      },
      'event.trackingId': {
        errors: [{ message: { defaultMessage: 'Tracking ID too short' } }]
      }
    }
    const flat = flattenFieldErrors(errors)

    expect(flat).toEqual([
      {
        message: {
          defaultMessage: 'Invalid status'
        }
      },
      {
        message: {
          defaultMessage: 'Tracking ID too short'
        }
      }
    ])
  })
})

describe('getDefaultSearchFields', () => {
  it('should generate default search field configurations for known field IDs', () => {
    const fields = getDefaultSearchFields(
      tennisClubMembershipEvent.advancedSearch[0]
    )
    const ids = fields.map((f) => f.id)
    expect(ids).toContain('event.legalStatus.REGISTERED.createdAtLocation')
    expect(ids).toContain('event.legalStatus.REGISTERED.createdAt')
    expect(ids).toContain('event.status')
    expect(ids).toContain('event.updatedAt')
  })
})

describe('buildDataCondition', () => {
  it('should return anyOf condition for status=ALL', () => {
    const state = { 'event.status': 'ALL' }
    const result = buildDataCondition(state, tennisClubMembershipEvent)
    const eventStatusField = joinValues(
      'event.status'.split('.'),
      FIELD_SEPARATOR
    )
    //@ts-ignore
    expect(result[eventStatusField]).toEqual({
      type: 'anyOf',
      terms: [
        EventStatus.enum.CREATED,
        EventStatus.enum.NOTIFIED,
        EventStatus.enum.DECLARED,
        EventStatus.enum.VALIDATED,
        EventStatus.enum.REGISTERED,
        EventStatus.enum.CERTIFIED,
        EventStatus.enum.REJECTED,
        EventStatus.enum.ARCHIVED
      ]
    })
  })

  it('should generate exact match condition for trackingId', () => {
    const state = { 'event.legalStatus.REGISTERED.createdAtLocation': 'ABC123' }
    const result = buildDataCondition(state, tennisClubMembershipEvent)
    const field = joinValues(
      'event.legalStatus.REGISTERED.createdAtLocation'.split('.'),
      FIELD_SEPARATOR
    )
    expect(
      //@ts-ignore
      result[field]
    ).toEqual({
      type: 'exact',
      term: 'ABC123'
    })
  })
})
