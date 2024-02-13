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
import { ApolloLink } from '@apollo/client'
import traverse from 'traverse'

import { extractPersistDirectivePaths } from '@client/utils/persistence/transform'

/**
 * Given a data result object path, return the equivalent query selection path.
 *
 * @param {Array} path The data result object path. i.e.: ["a", 0, "b"]
 * @return {String} the query selection path. i.e.: "a.b"
 */
const toQueryPath = (path: any[]) =>
  path.filter((key) => isNaN(Number(key))).join('.')

/**
 * Given a data result object, attach __persist values.
 */
const attachPersists = (paths: any[], object: any) => {
  const queryPaths = paths.map(toQueryPath)

  return traverse(object).forEach(function () {
    if (
      !this.isRoot &&
      this.node &&
      typeof this.node === 'object' &&
      Object.keys(this.node).length &&
      !Array.isArray(this.node)
    ) {
      const path = toQueryPath(this.path)

      const shouldAddPersistFlag = queryPaths.find(
        (queryPath) =>
          queryPath.indexOf(path) === 0 || path.indexOf(queryPath) === 0
      )
      if (shouldAddPersistFlag) {
        this.update({
          __persist: true,
          ...this.node
        })
      }
    }
  })
}

class PersistLink extends ApolloLink {
  public directive = 'persist'

  /**
   * Link query requester.
   */
  request = (operation: any, forward: any) => {
    const { query, paths } = extractPersistDirectivePaths(
      operation.query,
      this.directive
    )
    // Replace query with one without @persist directives.
    operation.query = query

    // Remove requesting __persist fields.
    operation.query = visit(operation.query, {
      Field: ({ name: { value: name } }: any): any => {
        if (name === '__persist') {
          return null
        }
      }
    })

    return forward(operation).map((result: any) => {
      if (result.data) {
        result.data = attachPersists(paths, result.data)
      }

      return result
    })
  }
}

const createPersistLink = () => new PersistLink()

export { PersistLink, createPersistLink }
