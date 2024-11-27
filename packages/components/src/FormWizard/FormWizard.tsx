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
import { Field, FormFieldRenderer } from './FormFieldRenderer'
import { FormProvider, useForm } from 'react-hook-form'
import { flatten } from './flatten-object'
import { Button } from '../Button'

// @TODO: Fix types so that the currentPage + pages + components disallow anything that is not in the components map.
export type Page = {
  id: string
  fields: Field<Record<string, React.ComponentType<any>>>[]
}

type Values = Record<string, string>

export const FormWizard = <
  Component extends Record<string, React.ComponentType<any>>
>({
  currentPage,
  pages,
  defaultValues,
  components,
  onNextPage,
  onSubmit
}: {
  currentPage: number
  pages: Page[]
  defaultValues: Values
  components: Component
  onNextPage: (() => void) | undefined
  onSubmit: (data: Values) => void
}) => {
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
