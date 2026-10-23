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

import { EventConfig } from './EventConfig'
import { tennisClubMembershipEvent } from '../fixtures'
import { ActionType } from './ActionType'
import { AdvancedSearchField } from './AdvancedSearchConfig'
import { field } from './field'
import { FieldType } from './FieldType'
import { FieldConfig } from './FieldConfig'
import { getDeclarationFields } from './utils'

describe('EventConfig', () => {
  it('should successfully validate a valid event config', () => {
    const res = EventConfig.safeParse(tennisClubMembershipEvent)
    expect(res.success).toBe(true)
  })

  it('should fail validation with invalid event config', () => {
    const res = EventConfig.safeParse({})
    expect(res.success).toBe(false)
  })

  describe('validateActionOrder()', () => {
    it('should successfully validate an action order with valid core actions', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'REGISTER']
      })

      expect(res.success).toBe(true)
    })

    it('should unsuccessfully validate an action order with invalid action', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'INVALID_ACTION', 'REGISTER']
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues[0].message).toBe(
        'Invalid action type in action order: INVALID_ACTION'
      )
    })

    it('should successfully validate an action order with custom actions', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actionOrder: ['DECLARE', 'MY_CUSTOM_ACTION', 'REGISTER'],
        actions: [
          ...tennisClubMembershipEvent.actions,
          {
            type: ActionType.CUSTOM,
            customActionType: 'MY_CUSTOM_ACTION',
            form: [],
            label: {
              defaultMessage: 'My custom action',
              description: 'This is the label for the custom action',
              id: 'event.tennis-club-membership.custom-action.label'
            },
            auditHistoryLabel: {
              defaultMessage: 'My custom action',
              description: 'This is the label for the custom action',
              id: 'event.tennis-club-membership.custom-action.audit-history-label'
            }
          }
        ]
      })

      expect(res.success).toBe(true)
    })
  })

  describe('validateExactlyOneDeclareAction()', () => {
    const declareAction = tennisClubMembershipEvent.actions.find(
      (action) => action.type === ActionType.DECLARE
    )

    it('should pass validation when the event has exactly one DECLARE action', () => {
      const res = EventConfig.safeParse(tennisClubMembershipEvent)

      expect(res.success).toBe(true)
    })

    it('should fail validation when the event has no DECLARE action', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: tennisClubMembershipEvent.actions.filter(
          (action) => action.type !== ActionType.DECLARE
        )
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions'],
          message: `Event must have exactly one DECLARE action. Found 0 for event ${tennisClubMembershipEvent.id}`
        })
      )
    })

    it('should fail validation when the event has more than one DECLARE action', () => {
      const res = EventConfig.safeParse({
        ...tennisClubMembershipEvent,
        actions: [...tennisClubMembershipEvent.actions, declareAction]
      })

      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path: ['actions'],
          message: `Event must have exactly one DECLARE action. Found 2 for event ${tennisClubMembershipEvent.id}`
        })
      )
    })
  })

  describe('advanced search defaultValue', () => {
    const path = ['advancedSearch', 0, 'fields', 0, 'defaultValue']

    function withSearchField(searchField: AdvancedSearchField) {
      return {
        ...tennisClubMembershipEvent,
        advancedSearch: [
          {
            ...tennisClubMembershipEvent.advancedSearch[1],
            fields: [searchField]
          }
        ]
      }
    }

    it('accepts true and false on a field type that takes no value', () => {
      for (const defaultValue of [true, false]) {
        const res = EventConfig.safeParse(
          withSearchField(field('applicant.name', { defaultValue }).fuzzy())
        )
        expect(res.success).toBe(true)
      }
    })

    it('accepts a string that is a valid value for the form field', () => {
      const res = EventConfig.safeParse(
        withSearchField(
          field('applicant.email', {
            defaultValue: 'applicant@example.com'
          }).exact()
        )
      )
      expect(res.success).toBe(true)
    })

    it('accepts a date on a date field searched as an exact date', () => {
      const res = EventConfig.safeParse(
        withSearchField(
          field('applicant.dob', { defaultValue: '2000-01-01' }).exact()
        )
      )
      expect(res.success).toBe(true)
    })

    it('accepts a number on a number field', () => {
      const res = EventConfig.safeParse(
        withSearchField(field('applicant.age', { defaultValue: 30 }).exact())
      )
      expect(res.success).toBe(true)
    })

    it('rejects a value on a field type that only takes true or false', () => {
      const res = EventConfig.safeParse(
        withSearchField(
          field('applicant.name', { defaultValue: 'John Doe' }).fuzzy()
        )
      )
      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path,
          message:
            'Advanced search field applicant.name is a NAME field, which does not support a defaultValue value, only true or false. Field types that support a defaultValue value: TEXT, TEXTAREA, EMAIL, PHONE, ID, SELECT, RADIO_GROUP, COUNTRY, LOCATION, ADMINISTRATIVE_AREA, NUMBER, DATE.'
        })
      )
    })

    it('rejects a string on a date field searched as a range', () => {
      const res = EventConfig.safeParse(
        withSearchField(
          field('applicant.dob', { defaultValue: '2000-01-01' }).range()
        )
      )
      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path,
          message:
            'Advanced search field applicant.dob is searched as a date range, so its defaultValue can only be true or false.'
        })
      )
    })

    it('rejects a string that is not a valid value for the form field', () => {
      const res = EventConfig.safeParse(
        withSearchField(
          field('applicant.dob', { defaultValue: 'not-a-date' }).exact()
        )
      )
      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path,
          message:
            'Advanced search field applicant.dob has defaultValue "not-a-date", which is not a valid DATE value.'
        })
      )
    })

    it('rejects any defaultValue on a field that searches across several form fields', () => {
      const res = EventConfig.safeParse(
        withSearchField({
          fieldId: 'applicant.anyName',
          fieldType: 'field',
          type: FieldType.TEXT,
          label: {
            id: 'event.tennis-club-membership.search.anyName',
            defaultMessage: 'Any name',
            description: 'Label for a search field covering several names'
          },
          config: {
            type: 'fuzzy',
            searchFields: ['applicant.name', 'recommender.name']
          },
          defaultValue: true
        })
      )
      expect(res.success).toBe(false)
      expect(res.error?.issues).toContainEqual(
        expect.objectContaining({
          path,
          message:
            'Advanced search field applicant.anyName searches across several form fields, so it does not support a defaultValue.'
        })
      )
    })
  })

  describe('validateNotificationForm()', () => {
    const notifyActionIndex = tennisClubMembershipEvent.actions.findIndex(
      (action) => action.type === ActionType.NOTIFY
    )

    const getDeclarationField = (id: string) => {
      const field = getDeclarationFields(tennisClubMembershipEvent).find(
        (f) => f.id === id
      )
      if (!field) {
        throw new Error(`Field ${id} not found in tennis club declaration`)
      }
      return field
    }

    function withNotificationForm(fields: FieldConfig[]) {
      return {
        ...tennisClubMembershipEvent,
        actions: tennisClubMembershipEvent.actions.map((action) =>
          action.type === ActionType.NOTIFY
            ? {
                ...action,
                notificationForm: {
                  label: {
                    id: 'event.tennis-club-membership.notify.form.label',
                    defaultMessage: 'Tennis club membership notification',
                    description: 'Label of the notification form'
                  },
                  pages: [
                    {
                      id: 'applicant',
                      title: {
                        id: 'event.tennis-club-membership.notify.form.page.applicant.title',
                        defaultMessage: 'Applicant',
                        description: 'Title of the applicant page'
                      },
                      fields
                    }
                  ]
                }
              }
            : action
        )
      }
    }

    const fieldPath = (fieldIndex: number) => [
      'actions',
      notifyActionIndex,
      'notificationForm',
      'pages',
      0,
      'fields',
      fieldIndex
    ]

    it('should pass validation when NOTIFY has no notification form', () => {
      const res = EventConfig.safeParse(tennisClubMembershipEvent)

      expect(res.success).toBe(true)
    })

    it('should pass validation when the notification form fields are a subset of the declaration form fields', () => {
      const res = EventConfig.safeParse(
        withNotificationForm([
          getDeclarationField('applicant.name'),
          getDeclarationField('applicant.dob')
        ])
      )

      expect(res.success).toBe(true)
    })

    it('should fail validation when a notification form field is not in the declaration form', () => {
      const res = EventConfig.safeParse(
        withNotificationForm([
          getDeclarationField('applicant.name'),
          {
            id: 'applicant.favouriteColour',
            type: FieldType.TEXT,
            label: {
              id: 'event.tennis-club-membership.notify.field.favouriteColour.label',
              defaultMessage: 'Favourite colour',
              description: 'Label of a field that is not in the declaration'
            }
          }
        ])
      )

      expect(res.success).toBe(false)
      expect(res.error?.issues).toEqual([
        expect.objectContaining({
          path: fieldPath(1),
          message: `Notification form field 'applicant.favouriteColour' does not exist in the declaration form of event '${tennisClubMembershipEvent.id}'. Notification form fields must also be defined in the DECLARE action's declaration.`
        })
      ])
    })

    it('should fail validation when a notification form field has a different type than the declaration form field', () => {
      const res = EventConfig.safeParse(
        withNotificationForm([
          {
            ...getDeclarationField('applicant.email'),
            type: FieldType.TEXT
          } as FieldConfig
        ])
      )

      expect(res.success).toBe(false)
      expect(res.error?.issues).toEqual([
        expect.objectContaining({
          path: fieldPath(0),
          message: `Notification form field 'applicant.email' is of type TEXT, but the declaration form field with the same id in event '${tennisClubMembershipEvent.id}' is of type EMAIL.`
        })
      ])
    })

    it('should report every invalid notification form field', () => {
      const res = EventConfig.safeParse(
        withNotificationForm([
          getDeclarationField('applicant.name'),
          {
            ...getDeclarationField('applicant.email'),
            type: FieldType.TEXT
          } as FieldConfig,
          {
            id: 'applicant.favouriteColour',
            type: FieldType.TEXT,
            label: {
              id: 'event.tennis-club-membership.notify.field.favouriteColour.label',
              defaultMessage: 'Favourite colour',
              description: 'Label of a field that is not in the declaration'
            }
          }
        ])
      )

      expect(res.success).toBe(false)
      expect(res.error?.issues.map((issue) => issue.path)).toEqual([
        fieldPath(1),
        fieldPath(2)
      ])
    })
  })
})
