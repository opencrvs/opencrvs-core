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
import { defineConfig } from './defineConfig'
import { EventConfig, EventConfigInput } from './EventConfig'
import { ActionType } from './ActionType'
import { FieldType } from './FieldType'
import { FieldConfig, FieldConfigInput } from './FieldConfig'
import {
  getActionConfig,
  getDeclaration,
  getDeclarationFields,
  getNotificationFields,
  getNotificationForm
} from './utils'
import { tennisClubMembershipEvent } from '../fixtures'
import { field } from './field'

const declaration = getDeclaration(tennisClubMembershipEvent)

const declareActionIndex = tennisClubMembershipEvent.actions.findIndex(
  (action) => action.type === ActionType.DECLARE
)

const actionsWithoutDeclaration: EventConfigInput['actions'] =
  tennisClubMembershipEvent.actions.map((action) => {
    if (action.type !== ActionType.DECLARE) {
      return action
    }
    const { declaration: _, ...rest } = action
    return rest
  })

describe('defineConfig()', () => {
  let warn: jest.SpyInstance

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('should keep a declaration given on the DECLARE action', () => {
    const config = defineConfig(tennisClubMembershipEvent)

    expect(getDeclaration(config)).toEqual(declaration)
    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('defines `declaration` at the top level')
    )
  })

  it('should move a top-level declaration onto the DECLARE action', () => {
    const config = defineConfig({
      ...tennisClubMembershipEvent,
      actions: actionsWithoutDeclaration,
      declaration
    })

    expect(getDeclaration(config)).toEqual(declaration)
    expect(config).not.toHaveProperty('declaration')
  })

  it('should warn that a top-level declaration is deprecated', () => {
    defineConfig({
      ...tennisClubMembershipEvent,
      actions: actionsWithoutDeclaration,
      declaration
    })

    expect(warn).toHaveBeenCalledWith(
      `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` at the top level, which is deprecated and will be removed in a future release. Define it on the DECLARE action instead.`
    )
  })

  it('should throw when declaration is given both at the top level and on the DECLARE action', () => {
    expect(() =>
      defineConfig({ ...tennisClubMembershipEvent, declaration })
    ).toThrow(
      `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` both at the top level and on the DECLARE action (\`actions[${declareActionIndex}].declaration\`). Define it in only one of these places.`
    )
  })

  it('should throw when declaration is given nowhere', () => {
    expect(() =>
      defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutDeclaration
      })
    ).toThrow(
      `Event '${tennisClubMembershipEvent.id}' does not define \`declaration\`. Define it either at the top level or on the DECLARE action (\`actions[${declareActionIndex}].declaration\`).`
    )
  })

  it('should throw when the event has no DECLARE action', () => {
    expect(() =>
      defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutDeclaration.filter(
          (action) => action.type !== ActionType.DECLARE
        ),
        declaration
      })
    ).toThrow(
      `Event must have a DECLARE action. Found none for event ${tennisClubMembershipEvent.id}`
    )
  })

  describe('action versions', () => {
    const declareAction = tennisClubMembershipEvent.actions[declareActionIndex]
    const declareActionWithoutDeclaration =
      actionsWithoutDeclaration[declareActionIndex]
    const actionCount = tennisClubMembershipEvent.actions.length

    it('should accept an action given as versions with different effectiveFrom values', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: [
          ...tennisClubMembershipEvent.actions.filter(
            (action) => action.type !== ActionType.DECLARE
          ),
          { ...declareAction, effectiveFrom: '2020-01-01' },
          { ...declareAction, effectiveFrom: '2025-01-01' }
        ]
      })

      expect(
        config.actions
          .filter((action) => action.type === ActionType.DECLARE)
          .map((action) => action.effectiveFrom)
      ).toEqual(['2020-01-01', '2025-01-01'])
    })

    it('should accept an action given as one version without effectiveFrom', () => {
      const config = defineConfig(tennisClubMembershipEvent)

      expect(config.actions[declareActionIndex].effectiveFrom).toBeUndefined()
    })

    it('should accept a version without effectiveFrom alongside dated versions', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareAction, effectiveFrom: '2020-01-01' }
          ]
        })
      ).not.toThrow()
    })

    it('should throw naming the action and the date when two versions have the same effectiveFrom', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareAction, effectiveFrom: '2020-01-01' },
            { ...declareAction, effectiveFrom: '2020-01-01' }
          ]
        })
      ).toThrow(
        `Action 'DECLARE' of event '${tennisClubMembershipEvent.id}' has more than one version with \`effectiveFrom\` '2020-01-01'. Each version must have a different \`effectiveFrom\`.`
      )
    })

    it('should throw when two versions have no effectiveFrom', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [...tennisClubMembershipEvent.actions, declareAction]
        })
      ).toThrow(
        `Action 'DECLARE' of event '${tennisClubMembershipEvent.id}' has more than one version without \`effectiveFrom\`. At most one version may omit it.`
      )
    })

    it('should move a top-level declaration onto every version of the DECLARE action', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: [
          ...actionsWithoutDeclaration,
          { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
        ],
        declaration
      })

      const declareVersions = config.actions.filter(
        (action) => action.type === ActionType.DECLARE
      )
      expect(declareVersions).toHaveLength(2)
      declareVersions.forEach((action) =>
        expect(action.declaration).toEqual(declaration)
      )
    })

    it('should throw naming the versions without a declaration when only some versions define one', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
          ]
        })
      ).toThrow(
        `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` on some versions of the DECLARE action but not on \`actions[${actionCount}].declaration\` (\`effectiveFrom\` '2020-01-01'). Define it on every version, or remove it from every version and define it once at the top level.`
      )
    })

    it('should throw naming the versions with a declaration when a top-level declaration is also given', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...tennisClubMembershipEvent.actions,
            { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
          ],
          declaration
        })
      ).toThrow(
        `Event '${tennisClubMembershipEvent.id}' defines \`declaration\` both at the top level and on versions of the DECLARE action (\`actions[${declareActionIndex}].declaration\` (no \`effectiveFrom\`)). Define it either only at the top level, to share it across every version, or on every version and not at the top level.`
      )
    })

    it('should throw naming every version when no version defines a declaration and none is given at the top level', () => {
      expect(() =>
        defineConfig({
          ...tennisClubMembershipEvent,
          actions: [
            ...actionsWithoutDeclaration,
            { ...declareActionWithoutDeclaration, effectiveFrom: '2020-01-01' }
          ]
        })
      ).toThrow(
        `Event '${tennisClubMembershipEvent.id}' does not define \`declaration\`. Define it either at the top level or on every version of the DECLARE action (\`actions[${declareActionIndex}].declaration\` (no \`effectiveFrom\`), \`actions[${actionCount}].declaration\` (\`effectiveFrom\` '2020-01-01')).`
      )
    })
  })

  describe('notification form fallback', () => {
    const notificationFormWarning = `Event '${tennisClubMembershipEvent.id}' has no NOTIFY form. Using the DECLARE form with all fields optional. Configure \`actions[NOTIFY].notificationForm\`. This fallback will be removed in a future release.`

    const declareAction = tennisClubMembershipEvent.actions[declareActionIndex]
    if (declareAction.type !== ActionType.DECLARE) {
      throw new Error('Expected the DECLARE action')
    }

    /** NOTIFY as the country configured it, without the form generated by defineConfig for the fixture. */
    const notifyActionWithoutForm = (() => {
      const action = tennisClubMembershipEvent.actions.find(
        (a) => a.type === ActionType.NOTIFY
      )
      if (action?.type !== ActionType.NOTIFY) {
        throw new Error('Expected the NOTIFY action')
      }
      const { notificationForm: _form, review: _review, ...rest } = action
      return rest
    })()

    const actionsWithNotify = (
      notifyAction: EventConfigInput['actions'][number]
    ): EventConfigInput['actions'] =>
      tennisClubMembershipEvent.actions.map((action) =>
        action.type === ActionType.NOTIFY ? notifyAction : action
      )

    const actionsWithoutNotify = tennisClubMembershipEvent.actions.filter(
      (action) => action.type !== ActionType.NOTIFY
    )

    const getNotifyAction = (config: EventConfig) => {
      const action = getActionConfig({
        eventConfiguration: config,
        actionType: ActionType.NOTIFY
      })
      if (action?.type !== ActionType.NOTIFY) {
        throw new Error('Expected the NOTIFY action')
      }
      return action
    }

    const notificationForm = {
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
          fields: getDeclarationFields(tennisClubMembershipEvent).filter(
            ({ id }) => id === 'applicant.name'
          )
        }
      ]
    }

    const notifyOnlyReview = {
      title: declareAction.review.title,
      fields: [
        {
          id: 'notifier.signature',
          type: FieldType.SIGNATURE,
          label: {
            id: 'event.tennis-club-membership.notify.review.signature.label',
            defaultMessage: 'Signature of notifier',
            description: 'Label of the notifier signature'
          },
          signaturePromptLabel: {
            id: 'event.tennis-club-membership.notify.review.signature.prompt',
            defaultMessage: 'Draw signature',
            description: 'Title of the signature modal'
          }
        } satisfies FieldConfigInput
      ]
    }

    const expectAllOptional = (fields: FieldConfig[]) => {
      for (const f of fields) {
        expect(f.required).toBe(false)
        expect(f.validation ?? []).toEqual([])
        if (f.type === FieldType.FIELD_GROUP) {
          expectAllOptional(f.fields)
        }
      }
    }

    it('should use a configured notification form as is, without warning', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithNotify({
          ...notifyActionWithoutForm,
          notificationForm,
          review: notifyOnlyReview
        })
      })

      expect(getNotificationForm(config)).toMatchObject(notificationForm)
      expect(getNotifyAction(config).review).toMatchObject(notifyOnlyReview)
      expect(warn).not.toHaveBeenCalled()
    })

    it('should generate the review from the DECLARE review, without warning, when only the notification form is configured', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithNotify({
          ...notifyActionWithoutForm,
          notificationForm
        })
      })

      const { review } = getNotifyAction(config)
      expect(getNotificationForm(config)).toMatchObject(notificationForm)
      expect(review.title).toEqual(declareAction.review.title)
      expect(review.fields.map(({ id }) => id)).toEqual(
        declareAction.review.fields.map(({ id }) => id)
      )
      expectAllOptional(review.fields)
      expect(warn).not.toHaveBeenCalled()
    })

    it('should generate a NOTIFY action from the DECLARE action when the event has none', () => {
      const conditionals = [
        {
          type: 'SHOW' as const,
          conditional: field('applicant.name').isFalsy()
        }
      ]
      const dialogCopy = {
        notify: {
          id: 'event.tennis-club-membership.dialog.notify',
          defaultMessage: 'Send incomplete?',
          description: 'Notify confirmation'
        },
        declare: {
          id: 'event.tennis-club-membership.dialog.declare',
          defaultMessage: 'Declare?',
          description: 'Declare confirmation'
        },
        register: {
          id: 'event.tennis-club-membership.dialog.register',
          defaultMessage: 'Register?',
          description: 'Register confirmation'
        }
      }

      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutNotify.map((action) =>
          action.type === ActionType.DECLARE
            ? { ...action, icon: 'PaperPlaneTilt', conditionals, dialogCopy }
            : action
        )
      })

      const notifyAction = getNotifyAction(config)
      expect(notifyAction).toMatchObject({
        label: declareAction.label,
        icon: 'PaperPlaneTilt',
        conditionals,
        flags: declareAction.flags,
        supportingCopy: dialogCopy.notify
      })
      expect(notifyAction).not.toHaveProperty('deduplication')

      // Placed right before the DECLARE action
      const notifyIndex = config.actions.indexOf(notifyAction)
      expect(config.actions[notifyIndex + 1].type).toBe(ActionType.DECLARE)
    })

    it('should not put a notification form in the config when none is configured', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutNotify
      })

      expect(getNotifyAction(config)).not.toHaveProperty('notificationForm')
    })

    it('should derive the notification form from the declaration, and generate the review from the DECLARE review, with every field optional', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutNotify
      })

      const notifyAction = getNotifyAction(config)
      const notificationFields = getNotificationFields(config)

      expect(notificationFields.map(({ id }) => id)).toEqual(
        getDeclarationFields(config).map(({ id }) => id)
      )
      expectAllOptional(notificationFields)

      expect(notifyAction.review.title).toEqual(declareAction.review.title)
      expect(notifyAction.review.fields.map(({ id }) => id)).toEqual(
        declareAction.review.fields.map(({ id }) => id)
      )
      expectAllOptional(notifyAction.review.fields)
    })

    it('should make required fields, their validations and field group subfields optional', () => {
      const label = {
        id: 'event.tennis-club-membership.test.label',
        defaultMessage: 'Test',
        description: 'Test label'
      }
      const requiredField = {
        id: 'applicant.nickname',
        type: FieldType.TEXT,
        label,
        required: true,
        validation: [
          {
            validator: field('applicant.nickname').isValidEnglishName(),
            message: label
          }
        ]
      } satisfies FieldConfig
      const fieldGroup = {
        id: 'applicant.group',
        type: FieldType.FIELD_GROUP,
        label,
        required: true,
        fields: [{ ...requiredField, id: 'applicant.group.nickname' }]
      } satisfies FieldConfig

      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutNotify.map((action) =>
          action.type === ActionType.DECLARE
            ? {
                ...action,
                declaration: {
                  ...declaration,
                  pages: declaration.pages.map((page, index) =>
                    index === 0
                      ? {
                          ...page,
                          fields: [...page.fields, requiredField, fieldGroup]
                        }
                      : page
                  )
                }
              }
            : action
        )
      })

      const findById = (fields: FieldConfig[], id: string) =>
        fields.find((f) => f.id === id)
      const notificationFields = getNotificationFields(config)
      const notificationGroup = findById(notificationFields, 'applicant.group')

      expect(findById(notificationFields, 'applicant.nickname')).toMatchObject({
        required: false
      })
      expect(notificationGroup).toMatchObject({
        required: false,
        fields: [{ id: 'applicant.group.nickname', required: false }]
      })
      expectAllOptional(notificationFields)

      // The declaration itself is untouched
      expect(
        findById(getDeclarationFields(config), 'applicant.nickname')
      ).toMatchObject({
        required: true,
        validation: [{ message: label }]
      })
    })

    it('should keep the NOTIFY settings of a NOTIFY action without a notification form', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithNotify(notifyActionWithoutForm)
      })

      const notifyAction = getNotifyAction(config)
      expect(notifyAction).toMatchObject(notifyActionWithoutForm)
      expect(notifyAction.label).not.toEqual(declareAction.label)
      expect(getNotificationFields(config).map(({ id }) => id)).toEqual(
        getDeclarationFields(config).map(({ id }) => id)
      )
      expectAllOptional(notifyAction.review.fields)
    })

    it('should keep a configured NOTIFY review when only the notification form is missing', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithNotify({
          ...notifyActionWithoutForm,
          review: notifyOnlyReview
        })
      })

      expect(getNotifyAction(config).review).toMatchObject(notifyOnlyReview)
      expect(getNotificationForm(config)).toBeDefined()
    })

    it('should warn once when no notification form is configured', () => {
      defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutNotify
      })

      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledWith(notificationFormWarning)
    })

    it('should produce a config that parses unchanged and is stable when defined again', () => {
      const config = defineConfig({
        ...tennisClubMembershipEvent,
        actions: actionsWithoutNotify
      })

      expect(EventConfig.parse(config)).toEqual(config)
      expect(defineConfig(config)).toEqual(config)
    })
  })
})
