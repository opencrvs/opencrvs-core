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

import { flattenDeep, omitBy } from 'lodash'
import { workqueues } from '../workqueues'
import { ActionType, DeclarationAction, DeclarationActions } from './ActionType'
import { EventConfig } from './EventConfig'
import { FieldConfig } from './FieldConfig'
import { WorkqueueConfig } from './WorkqueueConfig'
import { ActionUpdate, EventState } from './ActionDocument'
import { PageConfig, PageTypes, VerificationPageConfig } from './PageConfig'
import { isFieldVisible, validate } from '../conditionals/validate'
import { FieldType } from './FieldType'
import { Draft } from './Draft'
import { EventDocument } from './EventDocument'
import { getUUID } from '../uuid'
import { formatISO } from 'date-fns'
import { ActionConfig, DeclarationActionConfig } from './ActionConfig'
import { FormConfig } from './FormConfig'
import { getOrThrow } from '../utils'

/**
 * @returns All the fields in the event configuration.
 */
export const findPageFields = (config: EventConfig): FieldConfig[] => {
  return flattenDeep([
    config.declaration.map(({ pages }) => pages.map(({ fields }) => fields)),
    config.actions.map((action) => {
      if (action.type === ActionType.REQUEST_CORRECTION) {
        return [
          ...action.onboardingForm.flatMap(({ fields }) => fields),
          ...action.additionalDetailsForm.flatMap(({ fields }) => fields)
        ]
      }

      if (action.type === ActionType.PRINT_CERTIFICATE) {
        return (
          action?.printForm.flatMap((form) =>
            form.pages.flatMap(({ fields }) => fields)
          ) ?? []
        )
      }

      return []
    })
  ])
}

/**
 * @returns All metadata fields in the event configuration.
 */
export const findAllMetadataFields = (config: EventConfig): FieldConfig[] => {
  return flattenDeep(config.actions.map(getActionMetadataFields))
}

export const getActionMetadataFields = (actionConfig: ActionConfig) => {
  if (actionConfig.type === ActionType.REQUEST_CORRECTION) {
    return [
      ...actionConfig.onboardingForm.flatMap(({ fields }) => fields),
      ...actionConfig.additionalDetailsForm.flatMap(({ fields }) => fields)
    ]
  }

  if (actionConfig.type === ActionType.PRINT_CERTIFICATE) {
    return (
      actionConfig?.printForm.flatMap((form) =>
        form.pages.flatMap(({ fields }) => fields)
      ) ?? []
    )
  }

  if (isDeclarationActionConfig(actionConfig)) {
    return actionConfig?.review?.flatMap(({ fields }) => fields) ?? []
  }

  return []
}

/**
 * @returns All the metadata fields configured for the action type.
 * @TODO: Request correction should have same format as print certificate
 *
 */
export const findActiveActionPages = (
  config: EventConfig,
  actionType: ActionType
): PageConfig[] => {
  const action = config.actions.find((a) => a.type === actionType)

  if (action?.type === ActionType.REQUEST_CORRECTION) {
    return [...action.onboardingForm, ...action.additionalDetailsForm]
  }

  if (action?.type === ActionType.PRINT_CERTIFICATE) {
    return action?.printForm.find((form) => form.active)?.pages ?? []
  }

  return []
}

function isDeclarationActionConfig(
  action: ActionConfig
): action is DeclarationActionConfig {
  return DeclarationActions.safeParse(action.type).success
}

export function getActiveDeclarationFields(configuration: EventConfig) {
  return getActiveDeclaration(configuration).pages.flatMap(
    (page) => page.fields
  )
}

export function getDeclarationFields(
  configuration: EventConfig
): FieldConfig[] {
  return configuration.declaration.flatMap(({ pages }) =>
    pages.flatMap((page) => page.fields)
  )
}

export function getActiveDeclaration(configuration: EventConfig) {
  const [declaration] = configuration.declaration.filter((dec) => dec.active)

  if (!declaration) {
    throw new Error('No active declaration found')
  }

  return declaration
}

export function getActiveDeclarationPages(configuration: EventConfig) {
  return getActiveDeclaration(configuration).pages
}

export function getActiveActionReviewFields(
  configuration: EventConfig,
  actionType: DeclarationAction
) {
  return getActiveActionReview(configuration, actionType).fields
}

export function getActiveActionReview(
  configuration: EventConfig,
  actionType: ActionType
) {
  const [actionConfig] = configuration.actions.filter(
    (a): a is DeclarationActionConfig => a.type === actionType
  )

  const activeReviewConfig = actionConfig.review?.find(
    (review) => review.active
  )

  return getOrThrow(activeReviewConfig, 'No active review config found')
}

export function validateWorkqueueConfig(workqueueConfigs: WorkqueueConfig[]) {
  workqueueConfigs.map((workqueue) => {
    const rootWorkqueue = Object.values(workqueues).find(
      (wq) => wq.id === workqueue.id
    )
    if (!rootWorkqueue) {
      throw new Error(
        `Invalid workqueue configuration: workqueue not found with id: ${workqueue.id}`
      )
    }
  })
}

export function isPageVisible(page: PageConfig, formValues: ActionUpdate) {
  if (!page.conditional) {
    return true
  }

  return validate(page.conditional, {
    $form: formValues,
    $now: formatISO(new Date(), { representation: 'date' })
  })
}

export const getVisiblePagesFormFields = (
  formConfig: FormConfig,
  formData: ActionUpdate
) => {
  return formConfig.pages
    .filter((p) => isPageVisible(p, formData))
    .flatMap((p) => p.fields)
}

function isOptionalUncheckedCheckbox(field: FieldConfig, form: EventState) {
  if (field.type !== FieldType.CHECKBOX || field.required) {
    return false
  }

  return !form[field.id]
}

export function stripHiddenFields(fields: FieldConfig[], data: EventState) {
  return omitBy(data, (_, fieldId) => {
    const field = fields.find((f) => f.id === fieldId)

    if (!field) {
      return true
    }

    if (isOptionalUncheckedCheckbox(field, data)) {
      return true
    }

    return !isFieldVisible(field, data)
  })
}

export function findActiveDrafts(event: EventDocument, drafts: Draft[]) {
  const actions = event.actions
    .slice()
    .filter(({ type }) => type !== ActionType.READ)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const lastAction = actions[actions.length - 1]
  return (
    drafts
      // Temporally allows equal timestamps as the generated demo data is not perfect yet
      // should be > rather than >=
      .filter(({ createdAt }) => createdAt >= lastAction.createdAt)
      .filter(({ eventId }) => eventId === event.id)
  )
}

export function createEmptyDraft(
  eventId: string,
  draftId: string,
  actionType: ActionType
) {
  return {
    id: draftId,
    eventId,
    createdAt: new Date().toISOString(),
    transactionId: getUUID(),
    action: {
      type: actionType,
      data: {},
      metadata: {},
      createdAt: new Date().toISOString(),
      createdBy: '@todo',
      createdAtLocation: '@todo'
    }
  }
}

export function isVerificationPage(
  page: PageConfig
): page is VerificationPageConfig {
  return page.type === PageTypes.enum.VERIFICATION
}
