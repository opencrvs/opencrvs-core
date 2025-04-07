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
/**
 * Taken from https://github.com/TallerWebSolutions/apollo-cache-instorage
 */
import { visit } from 'graphql'

/* eslint-disable @typescript-eslint/no-explicit-any */

const extractPersistDirectivePaths = (
  originalQuery: any,
  directive = 'persist'
) => {
  const paths: any[] = []
  const fragmentPaths: any = {}
  const fragmentPersistPaths: any = {}

  const query = visit(originalQuery, {
    FragmentSpread: (
      { name: { value: name } }: any,
      // ts complains about these not being used, however they're positional
      // parameters, so we can't remove them due to ancestors being needed.
      // @ts-ignore
      key: any,
      parent: any,
      path: any,
      ancestors: any
    ): any => {
      const root = ancestors.find(
        ({ kind }: any) =>
          kind === 'OperationDefinition' || kind === 'FragmentDefinition'
      )

      const rootKey =
        root.kind === 'FragmentDefinition' ? root.name.value : '$ROOT'

      const fieldPath = ancestors
        .filter(({ kind }: any) => kind === 'Field')
        .map(({ name: { value: name } }: any) => name)

      fragmentPaths[name] = [rootKey].concat(fieldPath)
    },
    Directive: (
      { name: { value: name } }: any,
      // ts complains about these not being used, however they're positional
      // parameters, so we can't remove them due to ancestors being needed.
      // @ts-ignore
      key: any,
      parent: any,
      path: any,
      ancestors: any
    ): any => {
      if (name === directive) {
        const fieldPath = ancestors
          .filter(({ kind }: any) => kind === 'Field')
          .map(({ name: { value: name } }: any) => name)

        const fragmentDefinition = ancestors.find(
          ({ kind }: any) => kind === 'FragmentDefinition'
        )

        // If we are inside a fragment, we must save the reference.
        if (fragmentDefinition) {
          fragmentPersistPaths[fragmentDefinition.name.value] = fieldPath
        } else if (fieldPath.length) {
          paths.push(fieldPath)
        }

        return null
      }
    }
  })

  // In case there are any FragmentDefinition items, we need to combine paths.
  if (Object.keys(fragmentPersistPaths).length) {
    visit(originalQuery, {
      FragmentSpread: (
        { name: { value: name } }: any,
        // ts complains about these not being used, however they're positional
        // parameters, so we can't remove them due to ancestors being needed.
        // @ts-ignore
        key: any,
        parent: any,
        path: any,
        ancestors: any
      ) => {
        if (fragmentPersistPaths[name]) {
          let fieldPath = ancestors
            .filter(({ kind }: any) => kind === 'Field')
            .map(({ name: { value: name } }: any) => name)

          fieldPath = fieldPath.concat(fragmentPersistPaths[name])

          const fragment = name
          let parent = fragmentPaths[fragment][0]

          while (parent && parent !== '$ROOT' && fragmentPaths[parent]) {
            fieldPath = fragmentPaths[parent].slice(1).concat(fieldPath)
            parent = fragmentPaths[parent][0]
          }

          paths.push(fieldPath)
        }
      }
    })
  }

  return { query, paths }
}

export { extractPersistDirectivePaths }
