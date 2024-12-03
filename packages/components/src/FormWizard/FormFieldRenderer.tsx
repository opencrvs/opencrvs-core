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
import React, { useMemo } from 'react'
import { Controller, FieldValues, useFormContext, get } from 'react-hook-form'
import * as _ from 'lodash'
import { Stack } from '../Stack'
import { ErrorText } from '../ErrorText'

/**
 * @example
 * { 'TEXT': TextField, 'PARAGRAPH': Paragraph, 'DATE': DateField }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentsMap = Record<string, React.ComponentType<any>>

/** A JSON field in the form wizard that will be rendered. The type is the component to render the field. */
export type Field<CM extends ComponentsMap> = {
  /** The type of the field (e.g. TEXT, PARAGRAPH, DATE) */
  type: keyof CM
} & React.ComponentProps<CM[keyof CM]>

type FormFieldRendererProps<CM extends ComponentsMap> = {
  field: Field<CM>
  components: CM
}

export const FormFieldRenderer = <CM extends ComponentsMap>({
  field,
  components
}: FormFieldRendererProps<CM>) => {
  const context = useFormContext<FieldValues>()
  const FormFieldComponent = useMemo(
    () => components[field.type],
    [components, field.type]
  )

  // NOTE: values are in dotted format. e.g. { 'applicant.surname': 'Doe' }
  const error = get(context.formState.errors, field.id)

  return (
    <Stack direction="column" gap={8} alignItems="stretch">
      <Controller
        name={field.id}
        control={context.control}
        rules={{ required: field.required }}
        render={({ field: formField }) => (
          <FormFieldComponent key={field.id} {...field} {...formField} />
        )}
      />

      {!!error && (
        <ErrorText id={field.id}>
          {(error.message as string) || 'required'}
        </ErrorText>
      )}
    </Stack>
  )
}
