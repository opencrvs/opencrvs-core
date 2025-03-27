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

import { withSuspense } from '@client/v2-events/components/withSuspense'
import { AdvancedSearch } from './AdvancedSearch'
import { SearchResultIndex as SearchResult } from './SearchResultIndex'


const AdvancedSearchIndex = withSuspense(AdvancedSearch)
const SearchResultIndex = withSuspense(SearchResult)
export { AdvancedSearchIndex as AdvancedSearch, SearchResultIndex as SearchResult }
