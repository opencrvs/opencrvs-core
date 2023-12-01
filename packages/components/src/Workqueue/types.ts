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
import { ColumnContentAlignment } from './Workqueue'
import * as React from 'react'

enum GQLRegStatus {
  DECLARED = 'DECLARED',
  REGISTERED = 'REGISTERED',
  CERTIFIED = 'CERTIFIED',
  REJECTED = 'REJECTED'
}

export interface IStatus {
  type: GQLRegStatus | null
  practitionerName: string
  timestamp: string | null
  practitionerRole: string
  officeName: string | Array<string | null> | null
}

export interface IColumn {
  label?: string | React.ReactNode
  /** Width in percentage */
  width: number
  key: string
  errorValue?: string
  alignment?: ColumnContentAlignment
  isActionColumn?: boolean
  isIconColumn?: boolean
  color?: string
  isSortable?: boolean
  isSorted?: boolean
  icon?: JSX.Element | React.ReactNode
  sortBy?: string
  sortFunction?: (key: string) => void
}

export interface IFooterFColumn {
  label?: string
  width: number
}

export interface IDynamicValues {
  [key: string]:
    | string
    | number
    | boolean
    | IAction[]
    | Array<string | null>
    | IStatus[]
    | React.ReactNode[]
    | JSX.Element
    | Date
    | null
    | undefined
    | Record<string, unknown>
}

export interface IActionObject {
  label: string
  handler: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  icon?: () => React.ReactNode
  disabled?: boolean
}

export interface IActionComponent {
  actionComponent: JSX.Element
}
export type IAction = IActionObject | IActionComponent
