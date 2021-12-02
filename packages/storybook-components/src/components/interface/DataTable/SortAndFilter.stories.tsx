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
import { SortAndFilter, ISortAndFilterPrpos } from './SortAndFilter'

export default {
  title: 'Components/Interface/DataTable/SortAndFilter',
  component: SortAndFilter
} as Meta

const Template: Story<ISortAndFilterPrpos> = args => <SortAndFilter {...args} />
export const Filter = Template.bind({})
Filter.args = {
  sortBy: {
    input: {
      label: 'Sort By'
    },
    selects: {
      name: 'Sort',
      values: { Sort1: '' },
      options: [
        {
          name: 'Sort1',
          options: [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' }
          ],
          value: 'Sort1'
        }
      ]
    }
  },
  filterBy: {
    input: {
      label: 'Filter By'
    },
    selects: {
      name: 'Filter',
      values: { Filter1: '', Filter2: '', Filter3: '' },
      options: [
        {
          name: 'Filter1',
          options: [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' }
          ],
          value: 'Filter1'
        },
        {
          name: 'Filter2',
          options: [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' }
          ],
          value: 'Filter2'
        },
        {
          name: 'Filter3',
          options: [
            { value: 'chocolate', label: 'Chocolate' },
            { value: 'strawberry', label: 'Strawberry' },
            { value: 'vanilla', label: 'Vanilla' }
          ],
          value: 'Filter3'
        }
      ]
    }
  }
}
