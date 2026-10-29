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

/*
 * Tools to build custom field modules (FieldType._EXPERIMENTAL_CUSTOM).
 *
 * Build a custom field with esbuild:
 *
 *   import * as esbuild from 'esbuild'
 *   await esbuild.build(customFieldBuildOptions({
 *     entryPoints: { 'skill-level': 'src/custom-fields/skill-level/index.tsx' },
 *     outdir: 'build/custom-fields'
 *   }))
 *
 * The module can import React, react-dom and its own npm dependencies, and be
 * split into many files. Each entry point becomes one ES module.
 */
import {
  CUSTOM_FIELD_EXTERNALS_GLOBAL,
  CUSTOM_FIELD_EXTERNAL_MODULES
} from '@opencrvs/commons/events/CustomFieldExternals'

export interface CustomFieldInputProps<
  Value = unknown,
  Configuration = unknown
> {
  id: string
  value?: Value
  onChange: (value: Value) => void
  onBlur?: (event: unknown) => void
  disabled?: boolean
  configuration: Configuration
}

export interface CustomFieldOutputProps<Value = unknown> {
  id: string
  value?: Value
}

const NAMESPACE = 'opencrvs-custom-field-external'

/*
 * The parts of the esbuild plugin API that the plugin uses. They are typed here
 * and not imported from esbuild, so that every esbuild version accepts them.
 */
interface ResolveArgs {
  path: string
}

interface PluginBuild {
  onResolve(
    options: { filter: RegExp },
    callback: (args: ResolveArgs) => object
  ): void
  onLoad(
    options: { filter: RegExp; namespace: string },
    callback: (args: ResolveArgs) => object
  ): void
}

export interface CustomFieldExternalsPlugin {
  name: string
  setup(build: PluginBuild): void
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
}

/**
 * Makes `react`, `react/jsx-runtime` and `react-dom` read the modules of the
 * client, also inside npm dependencies. Without it, the bundle gets its own
 * copy of React and hooks fail in the client's render tree.
 */
export function customFieldExternals(): CustomFieldExternalsPlugin {
  const shared = new RegExp(
    `^(${CUSTOM_FIELD_EXTERNAL_MODULES.map(escapeRegExp).join('|')})$`
  )

  return {
    name: 'opencrvs-custom-field-externals',
    setup(build) {
      build.onResolve({ filter: shared }, (args) => ({
        path: args.path,
        namespace: NAMESPACE
      }))

      build.onResolve({ filter: /^react(-dom)?\// }, (args) => ({
        errors: [
          {
            text: `The OpenCRVS client does not share "${args.path}" with custom fields. Shared modules: ${CUSTOM_FIELD_EXTERNAL_MODULES.join(', ')}`
          }
        ]
      }))

      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => ({
        loader: 'js',
        contents: `
          const externals = globalThis[${JSON.stringify(CUSTOM_FIELD_EXTERNALS_GLOBAL)}];
          if (!externals) {
            throw new Error('Load this custom field module through the OpenCRVS client');
          }
          module.exports = externals[${JSON.stringify(args.path)}];
        `
      }))
    }
  }
}

/**
 * esbuild options for custom field modules: one ES module for each entry point,
 * with automatic JSX and the shared React of the client.
 */
export function customFieldBuildOptions({
  entryPoints,
  outdir,
  minify = true
}: {
  entryPoints: string[] | Record<string, string>
  outdir: string
  minify?: boolean
}) {
  return {
    entryPoints,
    outdir,
    minify,
    bundle: true,
    format: 'esm' as const,
    platform: 'browser' as const,
    target: 'es2020',
    jsx: 'automatic' as const,
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [customFieldExternals()]
  }
}
