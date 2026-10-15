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
/* eslint-disable max-lines */
import {
  ActionType,
  ConditionalType,
  errorMessages,
  eventQueryDataGenerator,
  field,
  FieldType,
  flag,
  generateEventDocument,
  getDeclaration,
  TestUserRole,
  TokenUserType,
  user
} from '@opencrvs/commons'
import { tennisClubMembershipEvent } from '@opencrvs/commons/fixtures'
import { getEventValidatorContext } from '@opencrvs/commons/events'
import { getFieldErrors, validateNotifyAction } from './index'

export const testContext = {
  user: {
    sub: 'user_12345',
    scope: [],
    role: TestUserRole.enum.LOCAL_REGISTRAR,
    userType: TokenUserType.enum.user
  },
  leafAdminStructureLocationIds: []
}

describe('getFieldErrors()', () => {
  it('should return an empty array there are no fields to validate', () => {
    const errors = getFieldErrors([], {}, {})
    expect(errors).toEqual([])
  })

  it('should return an error if a required field is not provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          defaultValue: false,
          label: {
            id: 'test.checkbox.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          }
        }
      ],
      {},
      testContext
    )
    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          defaultValue: false,
          label: {
            id: 'test.checkbox.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          }
        }
      ],
      { 'test.checkbox': true },
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should return an error if a value for a conditionally hidden required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          defaultValue: false,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.checkbox': true },
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a value for a conditionally hidden required field is not provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          defaultValue: false,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        }
      ],
      {},
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a value for a user-based conditionally hidden required field is not provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          defaultValue: false,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: user.hasRole(TestUserRole.enum.FIELD_AGENT)
            }
          ]
        }
      ],
      {},
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should return an error if a value for a user-based conditionally required field is not provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.text',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: user.hasRole(TestUserRole.enum.LOCAL_REGISTRAR)
            }
          ]
        }
      ],
      {},
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a value for a user-based conditionally required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.text',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: user.hasRole(TestUserRole.enum.LOCAL_REGISTRAR)
            }
          ]
        }
      ],
      {
        'test.text': 'some value'
      },
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return an error if a value for a conditionally visible required field is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.checkbox',
          type: FieldType.CHECKBOX,
          required: true,
          defaultValue: false,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.checkbox': true },
      { ...testContext, baseFormState: { 'test.text': 'helloooo' } }
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return error if multiple fields with same id are configured, and value is provided', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.text').isEqualTo('helloooo')
            }
          ]
        },
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('test.other').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.input': 'not empty', 'test.text': 'helloooo' },
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  /*
   * `flag(...)` in a *field* conditional resolves through `context.eventState` — this
   * path gets no `EventIndex` argument, so without it every event looks unflagged and
   * the server would reject values the client legitimately collected.
   */
  describe('flag() in a field conditional', () => {
    const flaggedField = {
      id: 'test.input',
      type: FieldType.TEXT,
      required: true,
      label: {
        id: 'test.field.label',
        defaultMessage: 'Test Field',
        description: 'Test Field Description'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: flag('sealed') }
      ]
    }

    const document = generateEventDocument({
      configuration: tennisClubMembershipEvent,
      actions: [{ type: ActionType.CREATE }, { type: ActionType.DECLARE }]
    })

    it('accepts a value when the event carries the flag that makes the field visible', () => {
      const errors = getFieldErrors(
        [flaggedField],
        { 'test.input': 'not empty' },
        {
          ...testContext,
          event: {
            document,
            state: eventQueryDataGenerator({ flags: ['sealed'] })
          }
        }
      )

      expect(errors).toEqual([])
    })

    it('rejects a value when the event does not carry the flag', () => {
      const errors = getFieldErrors(
        [flaggedField],
        { 'test.input': 'not empty' },
        {
          ...testContext,
          event: { document, state: eventQueryDataGenerator({ flags: [] }) }
        }
      )

      expect(errors).toEqual([
        {
          message: errorMessages.hiddenField.defaultMessage,
          id: 'test.input',
          value: 'not empty'
        }
      ])
    })
  })

  it('should return errors for field with custom validation if value does not pass validation', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          validation: [
            {
              message: {
                id: 'test.field.validation.message',
                defaultMessage: 'Failed validation!',
                description: 'Test Field Validation Message Description'
              },
              validator: field('test.input').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.input': 'not hello!' },
      testContext
    )

    expect(errors).toMatchSnapshot()
  })

  it('should not return errors for field with custom validations if value passes validation', () => {
    const errors = getFieldErrors(
      [
        {
          id: 'test.input',
          type: FieldType.TEXT,
          required: true,
          label: {
            id: 'test.field.label',
            defaultMessage: 'Test Field',
            description: 'Test Field Description'
          },
          validation: [
            {
              message: {
                id: 'test.field.validation.message',
                defaultMessage: 'Failed validation!',
                description: 'Test Field Validation Message Description'
              },
              validator: field('test.input').isEqualTo('helloooo')
            }
          ]
        }
      ],
      { 'test.input': 'helloooo' },
      testContext
    )

    expect(errors).toMatchSnapshot()
  })
})

describe('core action dialog form validation', () => {
  const dialogField = {
    id: 'notify.dialog.comments',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'notify.dialog.comments.label',
      defaultMessage: 'Comments',
      description: 'Dialog comments field'
    }
  }

  // The fixture already ships a NOTIFY action (without a `form`), so the dialog
  // field is added to it rather than to a second NOTIFY action, which would be
  // shadowed by the first one.
  const eventConfigWithNotifyForm = {
    ...tennisClubMembershipEvent,
    actions: tennisClubMembershipEvent.actions.map((action) =>
      action.type === ActionType.NOTIFY
        ? { ...action, form: [dialogField] }
        : action
    )
  }

  it('accepts NOTIFY annotation values matching the NOTIFY dialog form', () => {
    const errors = validateNotifyAction({
      eventConfig: eventConfigWithNotifyForm,
      annotation: { 'notify.dialog.comments': 'reported at facility' },
      declaration: {},
      context: testContext
    })

    expect(errors).toEqual([])
  })

  it('rejects NOTIFY annotation values not present in any configured field', () => {
    const errors = validateNotifyAction({
      eventConfig: eventConfigWithNotifyForm,
      annotation: { 'unknown.field': 'boom' },
      declaration: {},
      context: testContext
    })

    expect(errors).toHaveLength(1)
  })
})

describe('NOTIFY review field validation', () => {
  const reviewField = {
    id: 'notifier.comment',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'notifier.comment.label',
      defaultMessage: 'Comment of the notifier',
      description: 'Notify-only review field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('applicant.email').isEqualTo('notifier@example.com')
      }
    ]
  }

  const declarationForm = getDeclaration(tennisClubMembershipEvent)
  const notificationForm = {
    ...declarationForm,
    pages: declarationForm.pages
      .filter((page) => page.id === 'applicant')
      .map((page) => ({
        ...page,
        fields: page.fields.filter((f) =>
          ['applicant.name', 'applicant.email'].includes(f.id)
        )
      }))
  }

  function configWithNotify({
    withNotificationForm
  }: {
    withNotificationForm: boolean
  }) {
    return {
      ...tennisClubMembershipEvent,
      actions: tennisClubMembershipEvent.actions.map((action) =>
        action.type === ActionType.NOTIFY
          ? {
              ...action,
              ...(withNotificationForm && { notificationForm }),
              review: { ...action.review, fields: [reviewField] }
            }
          : action
      )
    }
  }

  const declaration = {
    'applicant.name': { firstname: 'John', surname: 'Doe' },
    'applicant.email': 'notifier@example.com'
  }

  describe('with a notification form', () => {
    it('rejects a missing required dialog field', () => {
      const dialogField = {
        id: 'notify.dialog.comments',
        type: FieldType.TEXT,
        required: true,
        label: {
          id: 'notify.dialog.comments.label',
          defaultMessage: 'Comments',
          description: 'Dialog comments field'
        }
      }

      const eventConfig = configWithNotify({ withNotificationForm: true })

      const errors = validateNotifyAction({
        eventConfig: {
          ...eventConfig,
          actions: eventConfig.actions.map((action) =>
            action.type === ActionType.NOTIFY
              ? { ...action, form: [dialogField] }
              : action
          )
        },
        annotation: {},
        declaration: {
          ...declaration,
          'applicant.email': 'someone.else@example.com'
        },
        context: testContext
      })

      expect(errors).toEqual([
        expect.objectContaining({
          message: errorMessages.requiredField.defaultMessage,
          id: 'notify.dialog.comments'
        })
      ])
    })

    it('rejects a missing required review field shown by a declaration value', () => {
      const errors = validateNotifyAction({
        eventConfig: configWithNotify({ withNotificationForm: true }),
        annotation: {},
        declaration,
        context: testContext
      })

      expect(errors).toContainEqual(
        expect.objectContaining({
          message: errorMessages.requiredField.defaultMessage,
          id: 'notifier.comment'
        })
      )
    })

    it('does not require a review field hidden by a declaration value', () => {
      const errors = validateNotifyAction({
        eventConfig: configWithNotify({ withNotificationForm: true }),
        annotation: {},
        declaration: {
          ...declaration,
          'applicant.email': 'someone.else@example.com'
        },
        context: testContext
      })

      expect(errors).toEqual([])
    })
  })

  describe('without a notification form', () => {
    it('does not require a missing review field', () => {
      const errors = validateNotifyAction({
        eventConfig: configWithNotify({ withNotificationForm: false }),
        annotation: {},
        declaration,
        context: testContext
      })

      expect(errors).toEqual([])
    })

    it('validates a review field value shown by a declaration value', () => {
      const errors = validateNotifyAction({
        eventConfig: configWithNotify({ withNotificationForm: false }),
        annotation: { 'notifier.comment': 123 },
        declaration,
        context: testContext
      })

      expect(errors).toContainEqual(
        expect.objectContaining({ id: 'notifier.comment' })
      )
    })
  })

  it('requires a review field shown by a saved declaration value when notifying with edits', () => {
    const eventConfig = configWithNotify({ withNotificationForm: true })
    const document = generateEventDocument({
      configuration: eventConfig,
      actions: [
        { type: ActionType.CREATE },
        {
          type: ActionType.NOTIFY,
          declarationOverrides: { 'applicant.email': 'notifier@example.com' }
        },
        { type: ActionType.EDIT, declarationOverrides: {} }
      ]
    })

    const errors = validateNotifyAction({
      eventConfig,
      annotation: {},
      declaration: { 'applicant.name': declaration['applicant.name'] },
      context: {
        ...testContext,
        event: getEventValidatorContext(document, eventConfig)
      }
    })

    expect(errors).toContainEqual(
      expect.objectContaining({
        message: errorMessages.requiredField.defaultMessage,
        id: 'notifier.comment'
      })
    )
  })

  it('validates an EDIT dialog field value shown by a declaration value', () => {
    const eventConfig = {
      ...tennisClubMembershipEvent,
      actions: tennisClubMembershipEvent.actions.map((action) =>
        action.type === ActionType.NOTIFY
          ? { ...action, form: [reviewField] }
          : action
      )
    }

    const errors = validateNotifyAction({
      eventConfig,
      annotation: { 'notifier.comment': 123 },
      declaration,
      context: testContext,
      actionType: ActionType.EDIT
    })

    expect(errors).toContainEqual(
      expect.objectContaining({ id: 'notifier.comment' })
    )
  })
})
