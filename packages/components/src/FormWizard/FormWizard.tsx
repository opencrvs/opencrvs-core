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
import React from 'react'
import { Field, ComponentsMap, FormFieldRenderer } from './FormFieldRenderer'
import { FormProvider, useForm } from 'react-hook-form'
import { flatten } from './flatten-object'
import { Button } from '../Button'

/**
 * @example
 * { "informant.name": "John Doe", "informant.address": "123 Main St" }
 */
export type Values = Record<string, string>

/**
 * Definition of a page of the form wizard
 */
type Page<CM extends ComponentsMap> = {
  fields: Array<Field<CM>>
}

type FormWizardProps<CM extends ComponentsMap> = {
  /** The field type to component map the form wizard will use to render the fields */
  components: CM
  currentPage: number
  pages: Page<CM>[]
  defaultValues?: Values
  /** Callback when the user clicks the "Continue" button */
  onNextPage?: () => void
  /** Callback when the user submits the form wizard */
  onSubmit: (data: Values) => void
}

export const FormWizard = <CM extends ComponentsMap>({
  currentPage,
  pages,
  defaultValues,
  components,
  onNextPage,
  onSubmit
}: FormWizardProps<CM>) => {
  const methods = useForm({ defaultValues })
  const page = pages[currentPage]

  if (!page) {
    throw new Error(`Page #${currentPage} not found!`)
  }

  /**
   * By default, react-hook-form extracts `foo.bar.baz` as a deep object,
   * but we wanna flatten it to `{ "foo.bar.baz": "value" }`.
   */
  const flatOnSubmit = (data: Values) => onSubmit(flatten<Values>(data))

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(flatOnSubmit)}>
        <FormFieldRenderer fields={page.fields} components={components} />

        {onNextPage ? (
          <Button type="primary" onClick={onNextPage}>
            Continue
          </Button>
        ) : (
          // Initial simple submit for testing
          <input type="submit" value="Submit" />
        )}
      </form>
    </FormProvider>
  )
}
