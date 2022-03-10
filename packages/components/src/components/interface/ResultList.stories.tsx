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
import { ResultList, IResult } from '.'
import React from 'react'

interface IProps {
  list: IResult[]
}

const Template: Story<IProps> = (args) => <ResultList {...args} />

export const ResultListView = Template.bind({})
ResultListView.args = {
  list: [
    {
      info: [
        {
          label: 'Name',
          value: 'John Doe'
        },
        {
          label: 'D.o.B',
          value: '10.10.2018'
        },
        {
          label: 'Date of declaration',
          value: '10.10.2018'
        },
        {
          label: 'Tracking ID',
          value: '1234567'
        }
      ],
      status: [
        {
          label: 'Birth',
          type: 'gray'
        },
        {
          label: 'Declaration',
          type: 'orange'
        }
      ]
    },
    {
      info: [
        {
          label: 'Name',
          value: 'Jane Doe'
        },
        {
          label: 'D.o.D',
          value: '10.10.2018'
        },
        {
          label: 'Date of declaration',
          value: '10.10.2018'
        },
        {
          label: 'Tracking ID',
          value: '1234567'
        }
      ],
      status: [
        {
          label: 'Death',
          type: 'gray'
        },
        {
          label: 'Declaration',
          type: 'orange'
        }
      ]
    },
    {
      info: [
        {
          label: 'Name',
          value: 'Jackson Strong'
        },
        {
          label: 'D.o.M',
          value: '10.10.2018'
        },
        {
          label: 'Date of registration',
          value: '10.10.2018'
        },
        {
          label: 'Registration number',
          value: '1234567'
        }
      ],
      status: [
        {
          label: 'Marriage',
          type: 'gray'
        },
        {
          label: 'Registered',
          type: 'green'
        }
      ]
    },
    {
      info: [
        {
          label: 'Name',
          value: 'Moon Walker'
        },
        {
          label: 'D.o.B',
          value: '10.10.2018'
        },
        {
          label: 'Date of collection',
          value: '10.10.2018'
        },
        {
          label: 'Registration number',
          value: '1234567'
        }
      ],
      status: [
        {
          label: 'Birth',
          type: 'gray'
        },
        {
          label: 'Collected',
          type: 'collected'
        }
      ]
    }
  ]
}
export default {
  title: 'Components/Interface/ResultList',
  component: ResultList
} as Meta
