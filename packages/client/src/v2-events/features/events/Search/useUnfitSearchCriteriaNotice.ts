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
import { useEffect } from 'react'
import { showToast } from '@client/v2-events/features/events/useToastAndRedirect'

export const UNFIT_SEARCH_CRITERIA_TOAST_ID = 'search-criteria-no-longer-apply'

const message = {
  id: 'search.criteria.noLongerApply',
  defaultMessage: 'Some search criteria no longer apply',
  description:
    'Shown when values in a search link no longer fit their field, e.g. after the field changed, and were left out of the search'
}

/** Shows a warning when values of a search link were left out because they no longer fit their field. */
export function useUnfitSearchCriteriaNotice(unfitFieldIds: string[]) {
  const hasUnfit = unfitFieldIds.length > 0

  useEffect(() => {
    if (hasUnfit) {
      showToast({
        message,
        toastType: 'warning',
        toastId: UNFIT_SEARCH_CRITERIA_TOAST_ID
      })
    }
  }, [hasUnfit])
}
