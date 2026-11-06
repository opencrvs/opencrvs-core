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
  ActionType,
  ConditionalType,
  EventConfig,
  flag,
  getDeclaration,
  getDeclarationPages,
  getNotificationForm,
  tennisClubMembershipEvent,
  ValidatorContext,
  withDeclaration
} from '@opencrvs/commons/client'
import { getCleanedDeclarationDiff, getSubmissionForm } from './declarationDiff'

const eventConfiguration = tennisClubMembershipEvent
const validatorContext: ValidatorContext = {}

type Submission = Parameters<typeof getSubmissionForm>[1]

describe('getSubmissionForm', () => {
  it.each<Submission>([ActionType.NOTIFY, 'editAndNotify'])(
    'returns the notification form for %s',
    (submission) => {
      expect(getSubmissionForm(eventConfiguration, submission)).toEqual(
        getNotificationForm(eventConfiguration)
      )
    }
  )

  it.each<Submission>([
    ActionType.DECLARE,
    ActionType.REGISTER,
    ActionType.EDIT,
    'editAndDeclare',
    'editAndRegister',
    'registerOnDeclare'
  ])('returns no form (the declaration form) for %s', (submission) => {
    expect(getSubmissionForm(eventConfiguration, submission)).toBeUndefined()
  })

  it('keeps a field that only the notification form shows when cleaning "Notify with edits"', () => {
    const fieldId = 'applicant.email'
    // The declaration form hides the field, the notification form shows it
    const declaration = getDeclaration(eventConfiguration)
    const withHiddenField = withDeclaration(eventConfiguration, {
      ...declaration,
      pages: getDeclarationPages(eventConfiguration).map((page) => ({
        ...page,
        fields: page.fields.map((pageField) =>
          pageField.id === fieldId
            ? {
                ...pageField,
                conditionals: [
                  { type: ConditionalType.SHOW, conditional: flag('sealed') }
                ]
              }
            : pageField
        )
      }))
    })
    const config = {
      ...withHiddenField,
      actions: withHiddenField.actions.map((action) =>
        action.type === ActionType.NOTIFY
          ? { ...action, notificationForm: declaration }
          : action
      )
    } as EventConfig

    const clean = (submission: Submission) =>
      getCleanedDeclarationDiff({
        eventConfiguration: config,
        form: getSubmissionForm(config, submission),
        originalDeclaration: {},
        declarationDiff: { [fieldId]: 'jane@example.com' },
        validatorContext
      })

    expect(clean('editAndNotify')).toEqual({ [fieldId]: 'jane@example.com' })
    expect(clean('editAndDeclare')).toEqual({})
  })
})

describe('getCleanedDeclarationDiff with fields not in the submitted form', () => {
  const filledName = { firstname: 'Jane', surname: 'Doe' }

  // A notification form with only the applicant's name
  const declaration = getDeclaration(eventConfiguration)
  const notificationForm = {
    ...declaration,
    pages: getDeclarationPages(eventConfiguration)
      .slice(0, 1)
      .map((page) => ({
        ...page,
        fields: page.fields.filter(({ id }) => id === 'applicant.name')
      }))
  }

  it('drops a declaration-only field from a notification', () => {
    const result = getCleanedDeclarationDiff({
      eventConfiguration,
      form: notificationForm,
      originalDeclaration: undefined,
      declarationDiff: {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      },
      validatorContext
    })

    expect(result).toEqual({ 'applicant.name': filledName })
  })

  it('drops a cleared declaration-only field from a notification', () => {
    const result = getCleanedDeclarationDiff({
      eventConfiguration,
      form: notificationForm,
      originalDeclaration: {
        'applicant.name': filledName,
        'applicant.email': 'jane@example.com'
      },
      declarationDiff: {
        'applicant.name': { firstname: 'John', surname: 'Doe' },
        'applicant.email': null
      },
      validatorContext
    })

    expect(result).toEqual({
      'applicant.name': { firstname: 'John', surname: 'Doe' }
    })
  })

  it('drops a field that is in no form of the event', () => {
    const result = getCleanedDeclarationDiff({
      eventConfiguration,
      originalDeclaration: {},
      declarationDiff: {
        'applicant.email': 'jane@example.com',
        'unknown.field': 'value'
      },
      validatorContext
    })

    expect(result).toEqual({ 'applicant.email': 'jane@example.com' })
  })
})
