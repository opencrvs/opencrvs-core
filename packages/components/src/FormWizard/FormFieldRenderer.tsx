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

type ComponentsMap = Record<string, React.ComponentType<any>>

export type Field<C extends ComponentsMap> = {
  [K in keyof C]: {
    type: K
  } & React.ComponentProps<C[K]>
}[keyof C]

export const FormFieldRenderer = <C extends ComponentsMap>({
  fields,
  components
}: {
  fields: Field<C>[]
  components: C
}) => {
  return (
    <>
      {fields.map((field) => {
        const FormFieldComponent = components[field.type]
        return <FormFieldComponent key={field.id} {...field} />
      })}
    </>
  )
}
