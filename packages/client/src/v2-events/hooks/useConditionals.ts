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
  UserContext,
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
  runFieldValidations
} from '@opencrvs/commons/client'
import { getToken, getTokenPayload } from '@client/utils/authUtils'
import { useLocations } from './useLocations'

// @todo move this to separate file called useContext.ts
export function useContext(): UserContext {
  const token = getToken()
  const tokenPayload = getTokenPayload(token)

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const adminStructureLocations = locations.filter(
    (location) => location.locationType === 'ADMIN_STRUCTURE'
  )

  return { user: tokenPayload ?? undefined, locations: adminStructureLocations }
}

// @todo: rename to useValidationFunctionsWithContext()
// also rename this file
export function useConditionals() {
  const context = useContext()

  return {
    isFieldVisible: (field: FieldConfig, form: ActionUpdate | EventState) =>
      isFieldVisible(field, form, context),
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
    }) => runFieldValidations({ field, values, context })
  }
}
