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

import { TranslationConfig } from './TranslationConfig'

import { flattenDeep, omitBy } from 'lodash'
import { workqueues } from '../workqueues'
import {
  ActionType,
  DeclarationActions,
  DeclarationUpdateAction,
  LatentActions
} from './ActionType'
import { EventConfig } from './EventConfig'
import { EventMetadataKeys, eventMetadataLabelMap } from './EventMetadata'
import { FieldConfig } from './FieldConfig'
import { WorkqueueConfig } from './WorkqueueConfig'
import { ActionUpdate, EventState } from './ActionDocument'
import {
  FormPageConfig,
  PageConfig,
  PageTypes,
  VerificationPageConfig
} from './PageConfig'
import { isFieldVisible, validate } from '../conditionals/validate'
import { FieldType } from './FieldType'
import { getOrThrow } from '../utils'
import { Draft } from './Draft'
import { EventDocument } from './EventDocument'
import { getUUID } from '../uuid'
import { formatISO } from 'date-fns'
import {
  ActionConfig,
  DeclarationActionConfig,
  ReviewPageConfig
} from './ActionConfig'
import { DeclarationFormConfig } from './FormConfig'

function isMetadataField<T extends string>(
  field: T | EventMetadataKeys
): field is EventMetadataKeys {
  return field in eventMetadataLabelMap
}

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
  return flattenDeep([config.actions.map(getActionMetadataFields)])
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
 *
 */
export const findActionPages = (
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

/**
 *
 * @param pageFields - All the fields in the event configuration
 * @param refFields - The fields referencing values within the event configuration (e.g. summary fields) or within system provided metadata fields (e.g. createdAt, updatedBy)
 * @returns referenced fields with populated labels
 */
export const resolveLabelsFromKnownFields = ({
  pageFields,
  refFields
}: {
  pageFields: { id: string; label: TranslationConfig }[]
  refFields: {
    // @TODO: To enforce type safety we might need to create types without using zod
    id: EventMetadataKeys | string
    label?: TranslationConfig
  }[]
}) => {
  return refFields.map((field) => {
    if (field.label) {
      return field
    }

    if (isMetadataField(field.id)) {
      return {
        ...field,
        label: eventMetadataLabelMap[field.id]
      }
    }

    const pageLabel = pageFields.find((pageField) => pageField.id === field.id)

    if (!pageLabel) {
      throw new Error(`Referenced field ${field.id} does not have a label`)
    }

    return {
      ...field,
      label: pageLabel.label
    }
  })
}

function isDeclarationActionConfig(
  action: ActionConfig
): action is DeclarationActionConfig {
  return DeclarationActions.safeParse(action.type).success
}

export function getActiveDeclarationFields(configuration: EventConfig) {
  return configuration.declaration
    .filter((dec) => dec.active)

    .flatMap(({ pages }) => pages.flatMap((page) => page.fields))
}

export function getAllActiveActionReviewFields(configuration: EventConfig) {
  const actions = configuration.actions.filter(isDeclarationActionConfig)

  return actions.flatMap(
    (action) => action.review?.flatMap((review) => review.fields) ?? []
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
  actionType: DeclarationUpdateAction
) {
  const activeDeclarationId = configuration.declaration.find(
    (dec) => dec.active
  )?.version.id

  if (!activeDeclarationId) {
    throw new Error('No active declaration found')
  }

  const [actionConfig] = configuration.actions.filter(
    (a): a is DeclarationActionConfig => a.type === actionType
  )

  return (
    actionConfig.review?.find(
      (review) => review.declarationVersionId === activeDeclarationId
    )?.fields ?? []
  )
}

export function getAllActiveDeclarationFields(
  configuration: EventConfig
): FieldConfig[] {
  const reviewFields = getAllActiveActionReviewFields(configuration)
  const declarationFields = getActiveDeclarationFields(configuration)

  return [...declarationFields, ...reviewFields]
}

export function getActiveDeclarationAndReviewFields(
  configuration: EventConfig,
  actionType: DeclarationUpdateAction
) {
  const reviewFields =
    actionType === ActionType.REQUEST_CORRECTION
      ? []
      : getActiveActionReviewFields(configuration, actionType)

  const declarationFields = getActiveDeclarationFields(configuration)

  return [...declarationFields, ...reviewFields]
}

export const findActiveDeclarationWithActionReview = (
  configuration: EventConfig,
  action: ActionType
):
  | {
      declarationConfig: DeclarationFormConfig
      review?: ReviewPageConfig
    }
  | undefined => {
  const declarationConfig = configuration.declaration.find((d) => d.active)

  if (!declarationConfig) {
    return undefined
  }

  const actionConfig = configuration.actions.find((a) => a.type === action)

  if (!!actionConfig && isDeclarationActionConfig(actionConfig)) {
    return {
      declarationConfig,
      review: actionConfig.review?.find(
        (r) => r.declarationVersionId === declarationConfig.version.id
      )
    }
  }

  return {
    declarationConfig
  }
}

export function getAllPages(configuration: EventConfig): FormPageConfig[] {
  return configuration.declaration
    .filter((declaration) => declaration.active)
    .flatMap((form) => form.pages)
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

/** TODO: Handle by actionType to get the right forms */
export const findActiveActionForm = (
  configuration: EventConfig,
  action: ActionType
):
  | {
      declarationConfig: DeclarationFormConfig
      review?: ReviewPageConfig
    }
  | undefined => {
  const declarationConfig = configuration.declaration.find((d) => d.active)

  if (!declarationConfig) {
    return undefined
  }

  const actionConfig = configuration.actions.find((a) => a.type === action)

  if (!!actionConfig && isDeclarationActionConfig(actionConfig)) {
    return {
      declarationConfig,
      review: actionConfig.review?.find(
        (r) => r.declarationVersionId === declarationConfig.version.id
      )
    }
  }

  return {
    declarationConfig
  }
}

export const findActiveActionFormPages = (
  configuration: EventConfig,
  action: ActionType
) => {
  return findActiveActionForm(configuration, action)?.declarationConfig.pages
}

export const getFormFields = (formConfig: DeclarationFormConfig) => {
  return formConfig.pages.flatMap((p) => p.fields)
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
  formConfig: DeclarationFormConfig,
  formData: ActionUpdate
) => {
  return formConfig.pages
    .filter((p) => isPageVisible(p, formData))
    .flatMap((p) => p.fields)
}

/**
 * Returns only form fields for the action type, if any, excluding review fields.
 */
export const findActiveActionFormFields = (
  configuration: EventConfig,
  action: ActionType
): FieldConfig[] | undefined => {
  const form = findActiveActionForm(configuration, action)

  /** Let caller decide whether to throw an error when fields are missing, or default to empty array */
  return form ? getFormFields(form.declarationConfig) : undefined
}

/**
 * Returns all fields for the action type, including review fields, if any.
 */
export const findActiveActionFields = (
  configuration: EventConfig,
  action: ActionType,
  declaration?: ActionUpdate
): FieldConfig[] | undefined => {
  const form = findActiveActionForm(configuration, action)
  const reviewFields = form?.review?.fields

  let formFields: FieldConfig[] | undefined = undefined

  if (form) {
    formFields = declaration
      ? getVisiblePagesFormFields(form.declarationConfig, declaration)
      : getFormFields(form.declarationConfig)
  }

  const allFields = formFields
    ? formFields.concat(reviewFields ?? [])
    : reviewFields

  /** Let caller decide whether to throw an error when fields are missing, or default to empty array */
  return allFields
}

export const getActiveActionFormPages = (
  configuration: EventConfig,
  action: ActionType
) => {
  return getOrThrow(
    findActiveActionForm(configuration, action)?.declarationConfig.pages,
    'Form configuration not found for type: ' + configuration.id
  )
}

/**
 * Returns all fields for the action type, including review fields, or throws
 */
export function getActiveActionFields(
  configuration: EventConfig,
  action: ActionType
): FieldConfig[] {
  if (LatentActions.some((latentAction) => latentAction === action)) {
    return getActiveActionFields(configuration, ActionType.DECLARE)
  }
  const fields = findActiveActionFields(configuration, action)

  if (!fields) {
    throw new Error(`No active field config found for action type ${action}`)
  }

  return fields
}

export function getEventConfiguration(
  eventConfigurations: EventConfig[],
  type: string
): EventConfig {
  const config = eventConfigurations.find((config) => config.id === type)
  if (!config) {
    throw new Error(`Event configuration not found for type: ${type}`)
  }
  return config
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
