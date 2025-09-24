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
  ActionUpdate,
  EventState,
  FieldConfig,
  isFieldVisible,
  getCurrentEventState,
  EventConfig,
  EventDocument,
  ActionConfig,
  omitHiddenAnnotationFields,
  FormConfig,
  omitHiddenPaginatedFields,
  omitHiddenFields,
  runFieldValidations,
  isFieldEnabled,
  AdvancedSearchConfigWithFieldsResolved,
  isFieldDisplayedOnReview
} from '@opencrvs/commons/client'

import { getAdvancedSearchFieldErrors } from '../features/events/Search/utils'
import { hasFieldChanged } from '../features/events/actions/correct/utils'
import { useContext } from './useContext'

export function useValidationFunctionsWithContext() {
  const context = useContext()

  return {
    isFieldVisible: (field: FieldConfig, form: ActionUpdate | EventState) =>
      isFieldVisible(field, form, context),
    isFieldEnabled: (field: FieldConfig, form: ActionUpdate | EventState) =>
      isFieldEnabled(field, form, context),
    hasFieldChanged: (
      field: FieldConfig,
      form: EventState,
      previousFormValues: EventState
    ) => hasFieldChanged(field, form, previousFormValues, context),
    isFieldDisplayedOnReview: (
      field: FieldConfig,
      form: ActionUpdate | EventState
    ) => isFieldDisplayedOnReview(field, form, context),
    getCurrentEventState: (event: EventDocument, config: EventConfig) =>
      getCurrentEventState(event, config, context),
    omitHiddenFields: <T extends EventState | ActionUpdate>(
      fields: FieldConfig[],
      values: T
    ) => omitHiddenFields(fields, values, context),
    omitHiddenAnnotationFields: (
      actionConfig: ActionConfig,
      declaration: EventState,
      annotation: ActionUpdate
    ) =>
      omitHiddenAnnotationFields(
        actionConfig,
        declaration,
        annotation,
        context
      ),
    omitHiddenPaginatedFields: (
      formConfig: FormConfig,
      declaration: EventState
    ) => omitHiddenPaginatedFields(formConfig, declaration, context),
    runFieldValidations: ({
      field,
      values
    }: {
      field: FieldConfig
      values: ActionUpdate
    }) => runFieldValidations({ field, values, context }),
    getAdvancedSearchFieldErrors: (
      sections: AdvancedSearchConfigWithFieldsResolved[],
      values: EventState
    ) => getAdvancedSearchFieldErrors(sections, values, context)
  }
}
