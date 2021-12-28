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
import { Meta, Story } from '@storybook/react'
import { ListTable } from './ListTable'
import { IColumn, IDynamicValues, IFooterFColumn } from '../GridTable/types'
import { ArrowDownBlue } from '../../icons'
import React from 'react'

export default {
  title: 'Components/Interface/ListTable',
  component: ListTable
} as Meta

interface IProps {
  id?: string
  content: IDynamicValues[]
  columns: IColumn[]
  footerColumns?: IFooterFColumn[]
  noResultText: string
  tableHeight?: number
  onPageChange?: (currentPage: number) => void
  disableScrollOnOverflow?: boolean
  pageSize?: number
  totalItems?: number
  currentPage?: number
  isLoading?: boolean
  tableTitle?: string
  hideBoxShadow?: boolean
  hideTableHeader?: boolean
  loadMoreText?: string
  highlightRowOnMouseOver?: boolean
  isFullPage?: boolean
  fixedWidth?: number
  sortIconInverted: boolean
  sortKey: string | null
  tableOffsetTop: number
}

const list = [
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  },
  {
    name: 'Euan',
    role: 'Registrar',
    type: 'Chairman',
    status: 'Active'
  }
]
const columns = [
  {
    label: 'Name',
    width: 30,
    key: 'name',
    isSortable: true,
    icon: <ArrowDownBlue />,
    sortFunction: (key: any) => alert(`Sort by: ${key}`)
  },
  {
    label: 'Role',
    width: 30,
    key: 'role',
    isSortable: true,
    icon: <ArrowDownBlue />,
    sortFunction: (key: any) => alert(`Sort by: ${key}`)
  },
  {
    label: 'Type',
    width: 30,
    key: 'type'
  },
  {
    label: 'Status',
    width: 10,
    key: 'status'
  }
]
const footerColumns = [
  {
    label: '',
    width: 30
  },
  {
    label: 'Rule',
    width: 30
  },
  {
    label: 'Type',
    width: 30
  },
  {
    label: 'Status',
    width: 10
  }
]

const Template: Story<IProps> = (args) => <ListTable {...args} />
export const ListView = Template.bind({})
ListView.args = {
  tableTitle: 'Table Title',
  content: list,
  columns: { columns },
  noResultText: 'No result to display',
  footerColumns: { footerColumns }
}
