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
import { Pill, Spinner } from '@opencrvs/components'
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

interface CustomFieldModule {
  Input: React.ComponentType<InputProps>
  Output: React.ComponentType<OutputProps>
}

/**
 * What the client hands to the default export of a custom field module.
 * The module must use this React instance: a second copy of React cannot
 * run hooks inside the client's render tree.
 */
interface CustomFieldModuleContext {
  React: typeof React
}

const loadedModules = new Map<string, Promise<CustomFieldModule>>()

async function importModule(src: string): Promise<CustomFieldModule> {
  // https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
  const imported: { default?: unknown } = await import(/* @vite-ignore */ src)

  if (typeof imported.default !== 'function') {
    throw new Error(
      `Custom field module ${src} must have a default export ({ React }) => ({ Input, Output })`
    )
  }

  const context: CustomFieldModuleContext = { React }
  const created = imported.default(context) as Partial<CustomFieldModule>

  if (
    typeof created.Input !== 'function' ||
    typeof created.Output !== 'function'
  ) {
    throw new Error(
      `Custom field module ${src} must return both Input and Output components`
    )
  }

  return { Input: created.Input, Output: created.Output }
}

/**
 * Loads each module only once, so that every render gets the same component
 * identities and React does not remount the field.
 */
async function loadModule(src: string) {
  const cached = loadedModules.get(src)
  if (cached) {
    return cached
  }

  const loading = importModule(src).catch((error: unknown) => {
    // Let the next mount try again, e.g. after a network error
    loadedModules.delete(src)
    throw error
  })
  loadedModules.set(src, loading)
  return loading
}

function LoadError() {
  return (
    <Pill
      label={
        <>
          {/* eslint-disable-next-line react/jsx-no-literals */}
          <div>Error loading component</div>
        </>
      }
      pillTheme="dark"
      size="small"
      type="inactive"
    />
  )
}

/**
 * Keeps an error thrown by country config code inside the field,
 * so that the rest of the form still works.
 */
class CustomFieldErrorBoundary extends React.Component<
  { src: string; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error(`Custom field ${this.props.src} failed to render:`, error)
  }

  render() {
    if (this.state.hasError) {
      return <LoadError />
    }
    return this.props.children
  }
}

function Loader(
  props:
    | (InputProps & { component: 'Input' })
    | (OutputProps & { component: 'Output' })
) {
  const [loadedModule, setLoadedModule] =
    React.useState<CustomFieldModule | null>(null)
  const [loading, setLoading] = React.useState(true)
  const { component, ...otherProps } = props

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)

    loadModule(props.src)
      .then((mod) => {
        if (!cancelled) {
          setLoadedModule(mod)
        }
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line no-console
        console.error(
          `Failed to import a custom ${props.component.toLowerCase()} dynamically:`,
          error
        )
        if (!cancelled) {
          setLoadedModule(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [props.component, props.src])

  if (loading) {
    return <Spinner id={props.id} />
  }

  if (!loadedModule) {
    return <LoadError />
  }

  const Component = loadedModule[
    component
  ] as typeof props.component extends 'Input'
    ? React.ComponentType<InputProps>
    : React.ComponentType<OutputProps>

  return (
    <CustomFieldErrorBoundary src={props.src}>
      <Component {...otherProps} />
    </CustomFieldErrorBoundary>
  )
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
