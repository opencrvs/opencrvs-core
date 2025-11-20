/* eslint-disable max-lines */
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
  cloneDeep,
  orderBy,
  isEqual
} from 'lodash'
import { ActionType, DeclarationActionType, writeActions } from './ActionType'
import { EventConfig } from './EventConfig'
import { FieldConfig } from './FieldConfig'
import {
  Action,
  ActionDocument,
  ActionStatus,
  ActionUpdate,
  EventState
} from './ActionDocument'
import { PageConfig, PageTypes, VerificationPageConfig } from './PageConfig'
import {
  isConditionMet,
  isFieldVisible,
  ValidatorContext
} from '../conditionals/validate'
import { Draft } from './Draft'
import { EventDocument } from './EventDocument'
import { getUUID, UUID } from '../uuid'
import {
  ActionConfig,
  CustomActionConfig,
  DeclarationActionConfig
} from './ActionConfig'
import { FormConfig } from './FormConfig'
import { getOrThrow } from '../utils'
import { TokenUserType } from '../authentication'
import { DateValue, SelectDateRangeValue } from './FieldValue'
import { subDays, subYears, format } from 'date-fns'

export function ageToDate(age: number, asOfDate: DateValue) {
  const date = new Date(asOfDate)
  return DateValue.parse(format(subYears(date, age), 'yyyy-MM-dd'))
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

export function getCustomActionFields(eventConfig: EventConfig): FieldConfig[] {
  const customActions = eventConfig.actions.filter(
    (action): action is CustomActionConfig => action.type === ActionType.CUSTOM
  ) satisfies CustomActionConfig[]

  if (!customActions.length) {
    return []
  }

  return customActions.flatMap((action) => action.form)
}

export function getPrintCertificatePages(configuration: EventConfig) {
  const action = configuration.actions.find(
    (a) => a.type === ActionType.PRINT_CERTIFICATE
  )

  return getOrThrow(
    action?.printForm.pages,
    `${ActionType.PRINT_CERTIFICATE} action does not have print form set.`
  )
}

export const getActionAnnotationFields = (actionConfig: ActionConfig) => {
  if (actionConfig.type === ActionType.REQUEST_CORRECTION) {
    return actionConfig.correctionForm.pages.flatMap(({ fields }) => fields)
  }

  if (actionConfig.type === ActionType.PRINT_CERTIFICATE) {
    return actionConfig.printForm.pages.flatMap(({ fields }) => fields)
  }

  if ('review' in actionConfig) {
    return actionConfig.review.fields
  }

  return []
}

// @TODO CIHAN: use this everywhere
export function getActionConfig({
  eventConfiguration,
  actionType,
  customActionType
}: {
  eventConfiguration: EventConfig
  actionType: ActionType
  customActionType?: string
}): ActionConfig | undefined {
  const actionConfig = eventConfiguration.actions.find((a) => {
    if (a.type === ActionType.CUSTOM && customActionType) {
      return a.customActionType === customActionType
    }
    return a.type === actionType
  })

  return actionConfig
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

  if ('review' in actionConfig) {
    return actionConfig.review
  }

  return undefined
}

export function getActionReviewFields(
  configuration: EventConfig,
  actionType: DeclarationActionType
) {
  const review = getActionReview(configuration, actionType)
  if (!review) {
    return []
  }
  return review.fields
}

export function isPageVisible(
  page: PageConfig,
  formValues: ActionUpdate,
  context: ValidatorContext
) {
  if (!page.conditional) {
    return true
  }

  return isConditionMet(page.conditional, formValues, context)
}

/**
 * Removes values from the form that correspond to hidden fields.
 * This function recursively omits any fields from the form values that are not visible
 * according to their FieldConfig and the current form state. It ensures that only values
 * for visible fields are retained, which is useful for conditional forms where hidden field
 * values should not affect validation or submission.
 *
 * @template T - The type of the form values
 * @param {T} formValues - The current form values
 * @param {FieldConfig[]} fields - The list of field configurations to check visibility against
 * * @param validatorContext - custom validation context
 * @returns {Partial<T>} A new object containing only the values for visible fields
 */
export function omitHiddenFields<T extends EventState | ActionUpdate>(
  fields: FieldConfig[],
  formValues: T,
  validatorContext: ValidatorContext
): Partial<T> {
  const base = cloneDeep(formValues)

  // The omitting is done recursively until the object does not change.
  // This is because the previously removed fields might affect the visibility of other fields.
  function fn(prevVisibilityContext: Partial<T>): Partial<T> {
    const cleaned = omitBy<Partial<T>>(base, (_, fieldId) => {
      const fieldConfig = fields.filter((f) => f.id === fieldId)

      return fieldConfig.length
        ? fieldConfig.every(
            (f) => !isFieldVisible(f, prevVisibilityContext, validatorContext)
          )
        : false
    })

    return isEqual(cleaned, prevVisibilityContext) ? cleaned : fn(cleaned)
  }

  return fn(base)
}

export function omitHiddenPaginatedFields<T extends EventState | ActionUpdate>(
  formConfig: FormConfig,
  values: T,
  validatorContext: ValidatorContext
) {
  const visibleFields = formConfig.pages
    .filter((p) => isPageVisible(p, values, validatorContext))
    .flatMap((p) => p.fields)

  const hiddenFields = formConfig.pages
    .filter((p) => !isPageVisible(p, values, validatorContext))
    .flatMap((p) => p.fields)

  const valuesExceptHiddenPage = omitBy(values, (_, fieldId) => {
    return hiddenFields.some((f) => f.id === fieldId)
  })

  return omitHiddenFields(
    visibleFields,
    valuesExceptHiddenPage,
    validatorContext
  )
}

/**
 *
 * @returns a draft for the event that has been created since the last non-read action.
 */
export function findActiveDraftForEvent(
  event: EventDocument,
  draft: Draft
): Draft | undefined {
  const actions = orderBy(
    event.actions.filter(({ type }) => type !== ActionType.READ),
    ['createdAt'],
    ['asc']
  )

  const lastAction = actions[actions.length - 1]
  // After migrations have been run, there should always be [0..1[ actions.
  // Temporally allows equal timestamps as the generated demo data is not perfect yet
  const isDraftActive = draft.createdAt >= lastAction.createdAt

  const isDraftForEvent = event.id === draft.eventId

  return isDraftActive && isDraftForEvent ? draft : undefined
}

export function createEmptyDraft(
  eventId: UUID,
  draftId: UUID,
  actionType: Exclude<ActionType, 'DELETE'>
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
      createdByUserType: TokenUserType.enum.user,
      createdBy: '@todo',
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
  annotation: ActionUpdate,
  context: ValidatorContext
): string[] {
  return pages
    .filter((page) => isVerificationPage(page))
    .filter((page) => isPageVisible(page, annotation, context))
    .map((page) => page.id)
}

export function omitHiddenAnnotationFields(
  actionConfig: ActionConfig,
  declaration: EventState,
  annotation: ActionUpdate,
  context: ValidatorContext
) {
  const annotationFields = getActionAnnotationFields(actionConfig)

  return omitHiddenFields(
    annotationFields,
    { ...declaration, ...annotation } satisfies ActionUpdate,
    context
  )
}

/**
 * Merges two documents together.
 *
 * @example deepMerge({'review.signature': { path: '/path.png', type: 'image/png' }}, { foo: 'bar'}) } => { 'review.signature': { path: '/path.png', type: 'image/png' }, foo: 'bar' }
 *
 * NOTE: When merging deep objects, the values from the second object will override the first one.
 * @example { annotation: {'review.signature': { path: '/path.png', type: 'image/png' }}, { annotation: { foo: 'bar'}) } } => { annotation: { foo: 'bar' } }
 */
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

export function timePeriodToDateRange(value: SelectDateRangeValue) {
  let startDate: Date
  switch (value) {
    case 'last7Days':
      startDate = subDays(new Date(), 7)
      break
    case 'last30Days':
      startDate = subDays(new Date(), 30)
      break
    case 'last90Days':
      startDate = subDays(new Date(), 90)
      break
    case 'last365Days':
      startDate = subDays(new Date(), 365)
      break
  }
  return {
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString()
  }
}

export function mergeDrafts(currentDraft: Draft, incomingDraft: Draft): Draft {
  if (currentDraft.eventId !== incomingDraft.eventId) {
    throw new Error(
      `Cannot merge drafts for different events: ${currentDraft.eventId} and ${incomingDraft.eventId}`
    )
  }

  return {
    ...currentDraft,
    ...incomingDraft,
    action: {
      ...currentDraft.action,
      ...incomingDraft.action,
      declaration: deepMerge(
        currentDraft.action.declaration,
        incomingDraft.action.declaration
      ),
      annotation: deepMerge(
        currentDraft.action.annotation ?? {},
        incomingDraft.action.annotation ?? {}
      )
    }
  }
}

function isRequestedAction(a: Action): a is ActionDocument {
  return a.status === ActionStatus.Requested
}
function isAcceptedAction(a: Action): a is ActionDocument {
  return a.status === ActionStatus.Accepted
}

export function getPendingAction(actions: Action[]): ActionDocument {
  const requestedActions = actions.filter(isRequestedAction)
  const pendingActions = requestedActions.filter(
    ({ id }) =>
      !actions.some(
        (action) => isAcceptedAction(action) && action.originalActionId === id
      )
  )

  if (pendingActions.length !== 1) {
    throw new Error(
      `Expected exactly one pending action, but found ${pendingActions.map(({ id }) => id).join(', ')}`
    )
  }

  return pendingActions[0]
}

export function getCompleteActionAnnotation(
  annotation: ActionUpdate,
  event: EventDocument,
  action: ActionDocument
): ActionUpdate {
  /*
   * When an action has an `originalActionId`, it means this action is linked
   * to another one (the "original" action).
   *
   * - The original action, with status `Requested`, was created by core.
   * - The linked action (with status `Accepted`) comes from
   *   the country configuration in response to that request.
   *
   * If we find the original action, we merge its annotation into the current one
   * so that the current action includes the original details.
   */
  if (action.originalActionId) {
    const originalAction = event.actions.find(
      ({ id }) => id === action.originalActionId
    )
    if (originalAction?.status !== ActionStatus.Requested) {
      return annotation
    }

    return deepMerge(
      deepMerge(annotation, originalAction.annotation ?? {}),
      action.annotation ?? {}
    )
  }
  return deepMerge(annotation, action.annotation ?? {})
}

export function getCompleteActionDeclaration<
  T extends EventState | ActionUpdate
>(declaration: T, event: EventDocument, action: ActionDocument): T {
  /*
   * When an action has an `originalActionId`, it means this action is linked
   * to another one (the "original" action).
   *
   * - The original action, with status `Requested`, was created by core.
   * - The linked action (with status `Accepted`) comes from
   *   the country configuration in response to that request.
   *
   * If we find the original action, we merge its declaration into the current one
   * so that the current action includes the original details.
   */
  if (action.originalActionId) {
    const originalAction = event.actions.find(
      ({ id }) => id === action.originalActionId
    )

    // Requested actions may carry partial declaration data.
    // Merge original declaration with the current one to preserve completeness.
    if (originalAction?.status === ActionStatus.Requested) {
      return deepMerge(
        deepMerge(declaration, originalAction.declaration),
        action.declaration
      )
    }
  }
  return deepMerge(declaration, action.declaration)
}

export function getAcceptedActions(event: EventDocument): ActionDocument[] {
  return event.actions.filter(isAcceptedAction).map((action) => ({
    ...action,
    declaration: getCompleteActionDeclaration({}, event, action),
    annotation: getCompleteActionAnnotation({}, event, action)
  }))
}

// Action types that are not taken into the aggregate values
const EXCLUDED_ACTIONS = [
  ActionType.REQUEST_CORRECTION,
  ActionType.PRINT_CERTIFICATE,
  ActionType.REJECT_CORRECTION
]

export function aggregateActionDeclarations(event: EventDocument): EventState {
  const allAcceptedActions = getAcceptedActions(event)
  const aggregatedActions = allAcceptedActions
    .filter((a) => !EXCLUDED_ACTIONS.some((type) => type === a.type))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return aggregatedActions.reduce((declaration, action) => {
    /*
     * If the action encountered is "APPROVE_CORRECTION", we want to apply the changed
     * details in the correction. To do this, we find the original request that this
     * approval is for and merge its details with the current data of the record.
     */
    if (action.type === ActionType.APPROVE_CORRECTION) {
      const requestAction = allAcceptedActions.find(
        ({ id }) => id === action.requestId
      )

      if (!requestAction) {
        return declaration
      }

      return getCompleteActionDeclaration(declaration, event, requestAction)
    }

    return getCompleteActionDeclaration(declaration, event, action)
  }, {})
}
