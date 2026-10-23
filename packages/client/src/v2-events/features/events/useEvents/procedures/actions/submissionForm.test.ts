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

describe('getSubmissionForm', () => {
  it.each([ActionType.NOTIFY, 'editAndNotify'])(
    'returns the notification form for %s',
    (submission) => {
      expect(getSubmissionForm(eventConfiguration, submission)).toEqual(
        getNotificationForm(eventConfiguration)
      )
    }
  )

  it.each([
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

    const clean = (submission: string) =>
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
