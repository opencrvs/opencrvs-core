/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { GQLHumanName, GQLComment } from '@opencrvs/gateway/src/graphql/schema'

interface INamesMap {
  [key: string]: string
}

export const createNamesMap = (names: GQLHumanName[]): INamesMap =>
  names.filter(Boolean).reduce((prevNamesMap: INamesMap, name) => {
    if (!name.use) {
      prevNamesMap['default'] = `${name.firstNames || ''} ${
        name.familyName || ''
      }`.trim()
      return prevNamesMap
    }

    prevNamesMap[name.use] = `${name.firstNames || ''} ${
      name.familyName || ''
    }`.trim()
    return prevNamesMap
  }, {})

export const extractCommentFragmentValue = (
  comments: GQLComment[],
  fragmentItem: string
): string => {
  let fragmentValue = ''

  for (const comment of comments) {
    if (comment.comment) {
      const commentFragments = comment.comment.split('&')
      for (const fragment of commentFragments) {
        if (fragment.includes(`${fragmentItem}=`)) {
          fragmentValue = fragment.replace(`${fragmentItem}=`, '')
          break
        }
      }
    }

    if (fragmentValue.length > 0) {
      break
    }
  }

  return fragmentValue
}

export const sentenceCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
