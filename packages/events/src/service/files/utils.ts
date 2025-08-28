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
import { differenceWith, first, isEqual, orderBy } from 'lodash'
import {
  Draft,
  EventConfig,
  EventDocument,
  FieldConfig,
  FileFieldType,
  getActionAnnotationFields,
  AnyFileField,
  getDeclarationFields,
  getMixedPath,
  FileFieldWithOptionValue,
  FileFieldValue,
  ActionUpdate,
  dangerouslyGetCurrentEventStateWithDrafts,
  EventState,
  getCurrentEventState,
  ActionDocument
} from '@opencrvs/commons'

function isFieldWithFile(field: FieldConfig): field is AnyFileField {
  return FileFieldType.safeParse(field.type).success
}

/**
 *
 * @param field File field
 * @param update single action or event state.
 * @returns normalised file reference based on the field id and event state.
 */
function getFileReferences(
  field: AnyFileField,
  update: ActionUpdate | EventState
): { id: string; value: string }[] {
  const value = getMixedPath<AnyFileField['defaultValue']>(update, field.id)

  if (!value) {
    return []
  }

  const maybeFileOptions = FileFieldWithOptionValue.safeParse(value)
  if (maybeFileOptions.success) {
    return maybeFileOptions.data.map((opt) => ({
      id: field.id,
      value: opt.path
    }))
  }

  const maybeFile = FileFieldValue.safeParse(value)

  if (maybeFile.success) {
    return [{ id: field.id, value: maybeFile.data.path }]
  }

  if (typeof value === 'string') {
    return [{ id: field.id, value }]
  }

  throw new Error(
    `Unknown filetype, ${field.type} with value: ${JSON.stringify(value)}`
  )
}

/**
 *  Since API allows sending PATCH requests with only the changed fields,
 *  we need to check the current event state with the current draft.
 * @returns file references that are not present in the current event state but are when previous draft is applied to the state.
 */
function getUnreferencedDeclarationDraftFiles({
  event,
  currentDraft,
  previousDraft,
  configuration
}: {
  event: EventDocument
  currentDraft?: Draft
  previousDraft: Draft
  configuration: EventConfig
}) {
  const currentEventState = currentDraft
    ? dangerouslyGetCurrentEventStateWithDrafts({
        event,
        draft: currentDraft,
        configuration
      })
    : getCurrentEventState(event, configuration)

  const previousEventState = dangerouslyGetCurrentEventStateWithDrafts({
    event,
    draft: {
      // Given previous draft, if event has been updated afterwards (running deletion after submission of actual action.) the data would never get applied.
      ...previousDraft,
      createdAt: new Date().toISOString(),
      action: {
        ...previousDraft.action,
        createdAt: new Date().toISOString()
      }
    },
    configuration
  })

  const declarationFileFields =
    getDeclarationFields(configuration).filter(isFieldWithFile)

  const currentDeclarationFiles = declarationFileFields.flatMap((field) =>
    getFileReferences(field, currentEventState.declaration)
  )

  const previousDeclarationFiles = declarationFileFields.flatMap((field) =>
    getFileReferences(field, previousEventState.declaration)
  )

  return differenceWith(
    previousDeclarationFiles,
    currentDeclarationFiles,
    isEqual
  )
}

function getUnreferencedAnnotationDraftFiles({
  currentAction,
  previousDraft,
  configuration
}: {
  currentAction: Draft['action'] | ActionDocument
  previousDraft: Draft
  configuration: EventConfig
}) {
  if (currentAction.type !== previousDraft.action.type) {
    // eslint-disable-next-line no-console
    console.warn(
      'Previous draft was for different action. Not comparing file references between them.'
    )
    return []
  }

  const currentDraftActionConfig = configuration.actions.find(
    (action) => action.type === previousDraft.action.type
  )

  if (!currentDraftActionConfig) {
    // eslint-disable-next-line no-console
    console.warn(
      `No configuration found for action ${previousDraft.action.type}.`
    )
  }

  const annotationFileFields = currentDraftActionConfig
    ? getActionAnnotationFields(currentDraftActionConfig).filter(
        isFieldWithFile
      )
    : []

  // @TODO: There might be a case where annotation shares id with declaration field? Should it limited by the configuration?
  const currentAnnotationFiles = annotationFileFields.flatMap((field) =>
    getFileReferences(field, currentAction.annotation ?? {})
  )

  const previousAnnotationFiles = annotationFileFields.flatMap((field) =>
    getFileReferences(field, previousDraft.action.annotation ?? {})
  )

  return differenceWith(
    previousAnnotationFiles,
    currentAnnotationFiles,
    isEqual
  )
}

/**
 *
 * @returns all the filenames that are referenced in the current draft, but not in the previous draft.
 */
export function getUnreferencedDraftFiles({
  event,
  currentDraft,
  previousDraft,
  configuration
}: {
  event: EventDocument
  /**
   * Current draft is optional, because we might be comparing the previous draft with the current event state. (e.g. actual action has been submitted)
   */
  currentDraft?: Draft
  previousDraft: Draft
  configuration: EventConfig
}) {
  const unreferencedDeclarationDraftFiles =
    getUnreferencedDeclarationDraftFiles({
      event,
      currentDraft,
      previousDraft,
      configuration
    })

  const currentAction =
    currentDraft?.action ??
    first(
      orderBy(
        event.actions.filter(
          (action) => action.type === previousDraft.action.type
        ),
        ['createdAt'],
        'desc'
      )
    )

  if (!currentAction) {
    // This should not happen. It means that the previous draft action type was invalid.
    // eslint-disable-next-line no-console
    console.error(
      `Could not find corresponding action ${previousDraft.action.type} for event: ${event.id}`
    )

    return unreferencedDeclarationDraftFiles
  }

  const unreferencedAnnotationDraftFiles = getUnreferencedAnnotationDraftFiles({
    // @TODO: for some reason declaration is omitted from some type?
    currentAction: currentAction as Draft['action'] | ActionDocument,
    previousDraft,
    configuration
  })

  return [
    ...unreferencedDeclarationDraftFiles,
    ...unreferencedAnnotationDraftFiles
  ]
}
