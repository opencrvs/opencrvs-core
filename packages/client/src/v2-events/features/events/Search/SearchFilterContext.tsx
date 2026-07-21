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

import React, { createContext, useContext } from 'react'

/**
 * Signals that the shared form field components are being rendered inside an
 * advanced-search filter rather than a declaration/correction form. Location
 * and administrative-area selectors use this to switch to search semantics
 * (e.g. exclude inactive admin structures from address filters).
 *
 * Defaults to `false` so that any field rendered without a provider — every
 * ordinary form — keeps its non-search behaviour.
 */
const SearchFilterContext = createContext<boolean>(false)

export const SearchFilterProvider = ({
  children
}: {
  children: React.ReactNode
}) => (
  <SearchFilterContext.Provider value={true}>
    {children}
  </SearchFilterContext.Provider>
)

/** `true` when the current field is rendered inside an advanced-search filter. */
export const useIsSearchFilter = () => useContext(SearchFilterContext)
