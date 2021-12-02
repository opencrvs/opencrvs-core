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
import { DataRow, IDataProps } from './DataRow'

export default {
  title: 'Components/Interface/ViewData/DataRow',
  component: DataRow
} as Meta

const Template: Story<IDataProps> = args => <DataRow {...args} />
export const DataRowView = Template.bind({})
DataRowView.args = {
  label: 'Name',
  value: 'John Smith',
  action: {
    label: 'Change',
    handler: () => alert('Change')
  }
}
