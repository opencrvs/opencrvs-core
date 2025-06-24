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
  flattenDeep,
  omitBy,
  mergeWith,
  isArray,
  isObject,
  get,
  has,
  isNil,
  uniqBy,
  cloneDeep
} from 'lodash'
import {
  ActionType,
  DeclarationActionType,
  DeclarationActions,
  writeActions
} from './ActionType'
import { EventConfig } from './EventConfig'
import { FieldConfig } from './FieldConfig'
import {
  Action,
  ActionStatus,
  ActionUpdate,
  EventState
} from './ActionDocument'
import { PageConfig, PageTypes, VerificationPageConfig } from './PageConfig'
import { isConditionMet, isFieldVisible } from '../conditionals/validate'
import { Draft } from './Draft'
import { EventDocument } from './EventDocument'
import { getUUID } from '../uuid'
import { ActionConfig, DeclarationActionConfig } from './ActionConfig'
import { FormConfig } from './FormConfig'
import { getOrThrow } from '../utils'
import { TokenUserType } from '../authentication'

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
    return actionConfig.correctionForm.pages.flatMap(({ fields }) => fields)
  }

  if (actionConfig.type === ActionType.PRINT_CERTIFICATE) {
    return actionConfig.printForm.pages.flatMap(({ fields }) => fields)
  }

  if (isDeclarationActionConfig(actionConfig)) {
    return actionConfig.review.fields
  }

  return []
}

function getAllAnnotationFields(config: EventConfig): FieldConfig[] {
  return flattenDeep(config.actions.map(getActionAnnotationFields))
}

export function getAllUniqueFields(eventConfig: EventConfig) {
  return uniqBy(getDeclarationFields(eventConfig), (field) => field.id)
}

export function getDeclarationFieldById(
  config: EventConfig,
  fieldId: string
): FieldConfig {
  const field = getAllUniqueFields(config).find((f) => f.id === fieldId)

  return getOrThrow(field, `Field with id ${fieldId} not found in event config`)
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
    return action.correctionForm.pages
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

export function isPageVisible(page: PageConfig, formValues: ActionUpdate) {
  if (!page.conditional) {
    return true
  }

  return isConditionMet(page.conditional, formValues)
}

export function omitHiddenFields<T extends EventState | ActionUpdate>(
  fields: FieldConfig[],
  values: T,
  visibleVerificationPageIds: string[] = []
) {
  return omitBy<T>(values, (_, fieldId) => {
    // We dont want to omit visible verification page values
    if (visibleVerificationPageIds.includes(fieldId)) {
      return false
    }

    // There can be multiple field configurations with the same id, with e.g. different options and conditions
    const fieldConfigs = fields.filter((f) => f.id === fieldId)

    if (!fieldConfigs.length) {
      return true
    }

    // As long as one of the field configs is visible, the field should be included
    return fieldConfigs.every((f) => !isFieldVisible(f, values))
  })
}

export function omitHiddenPaginatedFields(
  formConfig: FormConfig,
  declaration: EventState
) {
  const visiblePagesFormFields = formConfig.pages
    .filter((p) => isPageVisible(p, declaration))
    .flatMap((p) => p.fields)

  return omitHiddenFields(visiblePagesFormFields, declaration)
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
): Draft {
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
      createdByUserType: TokenUserType.Enum.user,
      createdBy: '@todo',
      createdAtLocation: '@todo',
      status: ActionStatus.Accepted,
      transactionId: '@todo',
      createdByRole: '@todo'
    }
  }
}

export function isVerificationPage(
  page: PageConfig
): page is VerificationPageConfig {
  return page.type === PageTypes.enum.VERIFICATION
}

export function getVisibleVerificationPageIds(
  pages: PageConfig[],
  annotation: ActionUpdate
): string[] {
  return pages
    .filter((page) => isVerificationPage(page))
    .filter((page) => isPageVisible(page, annotation))
    .map((page) => page.id)
}

export function getActionVerificationPageIds(
  actionConfig: ActionConfig,
  annotation: ActionUpdate
): string[] {
  if (actionConfig.type === ActionType.REQUEST_CORRECTION) {
    return getVisibleVerificationPageIds(
      actionConfig.correctionForm.pages,
      annotation
    )
  }

  if (actionConfig.type === ActionType.PRINT_CERTIFICATE) {
    return getVisibleVerificationPageIds(
      actionConfig.printForm.pages,
      annotation
    )
  }

  return []
}

export function omitHiddenAnnotationFields(
  actionConfig: ActionConfig,
  declaration: EventState,
  annotation: ActionUpdate
) {
  const annotationFields = getActionAnnotationFields(actionConfig)

  const visibleVerificationPageIds = getActionVerificationPageIds(
    actionConfig,
    annotation
  )

  return omitHiddenFields(
    annotationFields,
    { ...declaration, ...annotation },
    visibleVerificationPageIds
  )
}

export function deepMerge<
  T extends Record<string, unknown>,
  K extends Record<string, unknown>
>(currentDocument: T, actionDocument: K): T & K {
  /**
   * Cloning is essential since mergeWith mutates the first argument.
   */
  const currentDocumentClone = cloneDeep(currentDocument)
  return mergeWith(
    cloneDeep(currentDocumentClone),
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

export function findLastAssignmentAction(actions: Action[]) {
  return actions
    .filter(
      ({ type }) => type === ActionType.ASSIGN || type === ActionType.UNASSIGN
    )
    .reduce<
      Action | undefined
    >((latestAction, action) => (!latestAction || action.createdAt > latestAction.createdAt ? action : latestAction), undefined)
}

/** Tell compiler that accessing record with arbitrary key might result to undefined
 * Use when you **cannot guarantee**  that key exists in the record
 */
export type IndexMap<T> = {
  [id: string]: T | undefined
}

export function isWriteAction(actionType: ActionType): boolean {
  return writeActions.safeParse(actionType).success
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
 * Returns the value of the object at the given path with the ability of resolving mixed paths. See examples.
 *
 * @param obj Entity we want to get the value from
 * @param path property path e.g. `a.b.c`
 * @param defaultValue
 * @returns the value of the object at the given path.
 */
export function getMixedPath<T = unknown>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T | undefined
): T | undefined {
  const parts = path.split('.')

  // We don't know the type of the object at the path is.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolve = (current: unknown, segments: string[]): any => {
    if (current == null || segments.length === 0) {
      return current
    }

    // Try all compound segment combinations from longest to shortest
    for (let i = segments.length; i > 0; i--) {
      const compoundKey = segments.slice(0, i).join('.')

      if (has(current, compoundKey)) {
        const next = get(current, compoundKey)
        return resolve(next, segments.slice(i))
      }
    }

    return undefined
  }

  const result = resolve(obj, parts)
  return isNil(result) ? defaultValue : result
}

export function getEventConfigById(eventConfigs: EventConfig[], id: string) {
  const eventConfig = eventConfigs.find(
    (eventConfiguration) => eventConfiguration.id === id
  )
  return getOrThrow(eventConfig, `Event config for ${id} not found`)
}
