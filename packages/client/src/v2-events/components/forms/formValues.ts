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
import { ActionUpdate, EventState, FormValues } from '@opencrvs/commons/client'

/**
 * Returns the `$form` that the conditionals of a form read.
 *
 * @param values the values that the form edits.
 * @param annotates the declaration that the form annotates, or `null` when the form edits a declaration.
 * @param siblingValues the values that the form does not edit, but its conditionals read, e.g. the values of the outer form around the inner form of a field.
 */
export function formForConditionals(
  values: ActionUpdate,
  annotates: ActionUpdate | null,
  siblingValues: ActionUpdate = {}
): FormValues {
  const editedPart = { ...siblingValues, ...values }

  return annotates
    ? { declaration: annotates, annotation: editedPart }
    : { declaration: editedPart }
}

/** Merges the declaration and the annotation, as `$form` does. The annotation values win. */
export function mergeFormValues(form: FormValues): EventState {
  return { ...form.declaration, ...form.annotation } as EventState
}
