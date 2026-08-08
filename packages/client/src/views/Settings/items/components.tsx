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
import * as React from 'react'
import styled from 'styled-components'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { IListItemProps } from '@opencrvs/components/lib/List'

export const DynamicHeightLinkButton = styled(LinkButton)`
  height: auto;
`

export const Message = styled.div`
  margin-bottom: 16px;
`
export const Label = styled.label`
  margin-bottom: 8px;
`

/**
 * One setting, as returned by its hook.
 *
 * The row belongs in the settings list's table; the dialogs and toasts it opens
 * do not, so the two travel separately and the page renders each in its place.
 * Keeping them in one hook leaves the state that joins them — which dialog is
 * open, which toast is showing — inside the setting it belongs to.
 */
export interface SettingsRow {
  /** Identifies the setting, for the row's key and test id. */
  id: string
  item: IListItemProps
  overlay?: React.ReactNode
}
