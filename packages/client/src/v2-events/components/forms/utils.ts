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
  BUTTON,
  IButtonFormField,
  IDynamicFormField,
  IDynamicFormFieldValidators,
  IFormField,
  IFormSectionData
} from '@client/forms'
import { Validation } from '@client/utils/validate'
import { Conditional } from './conditionals'

export const getConditionalActionsForField = (
  field: IFormField,
  values: IFormSectionData
): string[] => {
  if (!field.conditionals) {
    return []
  }
  return field.conditionals
    .filter((conditional) =>
      evalExpressionInFieldDefinition(conditional.expression, {
        $form: values
      })
    )
    .map((conditional: Conditional) => conditional.action)
}

type FormData = Record<string, any>
const evalExpressionInFieldDefinition = (
  expression: string,
  /*
   * These are used in the eval expression
   */
  { $form }: { $form: FormData }
) => {
  // eslint-disable-next-line no-eval
  return eval(expression)
}

export function isFieldButton(field: IFormField): field is IButtonFormField {
  return field.type === BUTTON
}

export const getFieldValidation = (
  field: IDynamicFormField,
  values: IFormSectionData
): Validation[] => {
  const validator: Validation[] = []
  if (
    field.dynamicDefinitions &&
    field.dynamicDefinitions.validator &&
    field.dynamicDefinitions.validator.length > 0
  ) {
    field.dynamicDefinitions.validator.map(
      (element: IDynamicFormFieldValidators) => {
        const params: any[] = []
        element.dependencies.map((dependency: string) =>
          params.push(values[dependency])
        )
        const fun = element.validator(...params)
        validator.push(fun)
        return element
      }
    )
  }

  return validator
}
