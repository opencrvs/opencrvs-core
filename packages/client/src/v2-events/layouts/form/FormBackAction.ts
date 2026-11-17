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
import {
  EventState,
  isPageVisible,
  PageConfig,
  ValidatorContext
} from '@opencrvs/commons/client'

/**
 * Derives the form header's Back action from the current pagination state.
 *
 * The Back button always means "previous form page", so there is no back action
 * on the first visible page. Page visibility is reactive form state (pages can
 * be conditionally shown), so the previous page is resolved against the visible
 * pages — not the raw page list — matching the navigation the form body uses.
 *
 * Returns `undefined` when there is no previous page, which the header reads as
 * "render no Back button".
 */
export function getFormBackAction({
  formPages,
  formData,
  validatorContext,
  pageId,
  onNavigateToPage
}: {
  formPages: PageConfig[]
  formData: EventState
  validatorContext: ValidatorContext
  pageId: string
  onNavigateToPage: (nextPageId: string) => void
}): (() => void) | undefined {
  const visiblePages = formPages.filter((page) =>
    isPageVisible(page, formData, validatorContext)
  )
  const pageIdx = visiblePages.findIndex((p) => p.id === pageId)

  if (pageIdx <= 0) {
    return undefined
  }

  const previousPageId = visiblePages[pageIdx - 1].id
  return () => onNavigateToPage(previousPageId)
}
