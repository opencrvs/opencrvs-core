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
import { Spinner } from '@opencrvs/components'
import { CustomFieldValue } from '@opencrvs/commons/client'

interface InputProps {
  id: string
  src: string
  onChange: (val: CustomFieldValue) => void
  value?: unknown
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void
  disabled?: boolean
  configuration: unknown
}
interface OutputProps {
  id: string
  src: string
  value?: unknown
}

async function importModule(url: string): Promise<any> {
  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const mod = await import(/* @vite-ignore */ url)
  return mod
}

function Loader(
  props:
    | (InputProps & { component: 'Input' })
    | (OutputProps & { component: 'Output' })
) {
  const [loadedModule, setLoadedModule] = React.useState<{
    Input: React.FC<InputProps>
    Output: React.FC<OutputProps>
  } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const { component, ...otherProps } = props
  React.useEffect(() => {
    const loadModules = async () => {
      try {
        const importedModule = await importModule(props.src)
        setLoadedModule(importedModule)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Failed to import a custom ${props.component.toLowerCase()} dynamically:`,
          error
        )
      } finally {
        setLoading(false)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    loadModules()
  }, [props.component, props.src])

  if (loading) {
    return <Spinner id={props.id} />
  }

  if (!loadedModule) {
    return <div>Failed to load component</div>
  }

  const Component = loadedModule[
    component
  ] as typeof props.component extends 'Input'
    ? React.FC<InputProps>
    : React.FC<OutputProps>

  return <Component {...otherProps} />
}

function Input(props: InputProps) {
  return <Loader component="Input" {...props} />
}

function Output(props: OutputProps) {
  return <Loader component="Output" {...props} />
}

export const Custom = {
  Input,
  Output
}
