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
import { useState } from 'react'

// TODO: Paginate with react-router-dom v6 using ?page=1... etc.
export function usePagination(
  /** Amount of pages to iterate through */
  pages: number,
  firstPage = 0
) {
  const [page, setPage] = useState(firstPage)

  function next() {
    return setPage(page + 1)
  }

  const previous = page > 0 ? () => setPage(page - 1) : undefined

  return {
    page,
    next,
    total: pages,
    previous
  }
}
