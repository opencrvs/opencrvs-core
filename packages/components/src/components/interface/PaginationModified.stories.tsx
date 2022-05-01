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
import { PaginationModified, IPaginationProps } from './PaginationModified'
import React from 'react'

export default {
  title: 'Components/Interface/DataTable/PaginationModified',
  component: PaginationModified
} as Meta

const Template: Story<IPaginationProps> = (args) => (
  <PaginationModified {...args} />
)
export const PaginationDesktop = Template.bind({})
PaginationDesktop.args = {
  size: 'small',
  initialPage: 1,
  totalPages: 10,
  onPageChange: (pageNo: number) => alert(`${pageNo}`)
}
export const MobilePagination = Template.bind({})
MobilePagination.args = {
  initialPage: 1,
  totalPages: 10,
  onPageChange: (pageNo: number) => alert(`${pageNo}`),
  size: 'large'
}
