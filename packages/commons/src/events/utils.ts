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

import { flattenDeep, omitBy, mergeWith, isArray, isObject } from 'lodash'
import { workqueues } from '../workqueues'
import {
  ActionType,
  DeclarationActionType,
  DeclarationActions
} from './ActionType'
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

function isDeclarationActionConfig(
  action: ActionConfig
): action is DeclarationActionConfig {
  return DeclarationActions.safeParse(action.type).success
}

export function getDeclarationFields(
  configuration: EventConfig
): FieldConfig[] {
  return configuration.declaration.pages.flatMap(({ fields }) => fields)
}

export function getDeclarationPages(configuration: EventConfig) {
  return configuration.declaration.pages
}

export function getDeclaration(configuration: EventConfig) {
  return configuration.declaration
}

export const getActionAnnotationFields = (actionConfig: ActionConfig) => {
  if (actionConfig.type === ActionType.REQUEST_CORRECTION) {
    return [
      ...actionConfig.onboardingForm.flatMap(({ fields }) => fields),
      ...actionConfig.additionalDetailsForm.flatMap(({ fields }) => fields)
    ]
  }

  if (actionConfig.type === ActionType.PRINT_CERTIFICATE) {
    return actionConfig.printForm.pages.flatMap(({ fields }) => fields)
  }

  if (isDeclarationActionConfig(actionConfig)) {
    return actionConfig.review.fields
  }

  return []
}

export const getAllAnnotationFields = (config: EventConfig): FieldConfig[] => {
  return flattenDeep(config.actions.map(getActionAnnotationFields))
}

/**
 * @returns All the fields in the event configuration.
 */
export const findAllFields = (config: EventConfig): FieldConfig[] => {
  return flattenDeep([
    ...getDeclarationFields(config),
    ...getAllAnnotationFields(config)
  ])
}

/**
 * @TODO: Request correction should have same format as print certificate
 */
export const findRecordActionPages = (
  config: EventConfig,
  actionType: ActionType
): PageConfig[] => {
  const action = config.actions.find((a) => a.type === actionType)

  if (action?.type === ActionType.REQUEST_CORRECTION) {
    return [...action.onboardingForm, ...action.additionalDetailsForm]
  }

  if (action?.type === ActionType.PRINT_CERTIFICATE) {
    return action.printForm.pages
  }

  return []
}

export function getActionReview(
  configuration: EventConfig,
  actionType: ActionType
) {
  const [actionConfig] = configuration.actions.filter(
    (a): a is DeclarationActionConfig => a.type === actionType
  )

  return getOrThrow(
    actionConfig.review,
    `No review config found for ${actionType}`
  )
}

export function getActionReviewFields(
  configuration: EventConfig,
  actionType: DeclarationActionType
) {
  return getActionReview(configuration, actionType).fields
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

export function stripHiddenFields(
  fields: FieldConfig[],
  declaration: EventState
) {
  return omitBy(declaration, (_, fieldId) => {
    const field = fields.find((f) => f.id === fieldId)

    if (!field) {
      return true
    }

    if (isOptionalUncheckedCheckbox(field, declaration)) {
      return true
    }

    return !isFieldVisible(field, declaration)
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
      declaration: {},
      annotation: {},
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

export function deepMerge<T extends Record<string, unknown>>(
  currentDocument: T,
  actionDocument: T
): T {
  return mergeWith(
    currentDocument,
    actionDocument,
    (previousValue, incomingValue) => {
      if (incomingValue === undefined) {
        return previousValue
      }
      if (isArray(incomingValue)) {
        return incomingValue // Replace arrays instead of merging
      }
      if (isObject(previousValue) && isObject(incomingValue)) {
        return undefined // Continue deep merging objects
      }

      return incomingValue // Override with latest value
    }
  )
}
