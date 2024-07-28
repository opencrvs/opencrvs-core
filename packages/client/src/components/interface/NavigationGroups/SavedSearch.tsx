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

import { Icon, NavigationGroup, NavigationItem } from '@opencrvs/components'
import { ADVANCED_SEARCH_RESULT } from '@client/navigation/routes'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { omit } from 'lodash'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { UserDetails } from '@client/utils/userUtils'

interface ISavedSearchProps {
  userDetails: UserDetails | null
  advancedSearchParams: IAdvancedSearchParamState
  pathname: string
  goToAdvancedSearchResult: () => void
}

const SavedSearch = ({
  userDetails,
  advancedSearchParams,
  pathname,
  goToAdvancedSearchResult
}: ISavedSearchProps) => {
  return (
    <NavigationGroup>
      {userDetails?.searches && userDetails.searches.length > 0 ? (
        userDetails.searches.map((bookmarkResult) => {
          return (
            <NavigationItem
              key={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
              icon={() => (
                <Icon
                  name="Star"
                  color="yellow"
                  size="medium"
                  weight="fill"
                ></Icon>
              )}
              id={`bookmarked_advanced_search_${bookmarkResult.searchId}`}
              label={bookmarkResult.name}
              disabled={
                advancedSearchParams.searchId === bookmarkResult.searchId &&
                pathname === ADVANCED_SEARCH_RESULT
              }
              onClick={() => {
                const filteredParam = omit(
                  bookmarkResult.parameters,
                  '__typename'
                ) as IAdvancedSearchParamState
                setAdvancedSearchParam({
                  ...filteredParam,
                  searchId: bookmarkResult?.searchId
                })
                goToAdvancedSearchResult()
              }}
              isSelected={
                advancedSearchParams.searchId === bookmarkResult.searchId &&
                pathname === ADVANCED_SEARCH_RESULT
              }
            />
          )
        })
      ) : (
        <></>
      )}
    </NavigationGroup>
  )
}

export default SavedSearch
