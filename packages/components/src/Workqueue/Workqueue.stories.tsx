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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Workqueue } from './Workqueue'
import { DeclarationIcon, Download, Downloaded } from '../icons'
import React from 'react'
import { Stack } from '../Stack'
import { Link } from '../Link'
import { Button } from '../Button'

export default {
  title: 'Data/Workqueue',
  component: Workqueue
} as ComponentMeta<typeof Workqueue>

const onReviewClick = () => {
  alert('Review clicked')
}

const IconWithName = ({ children }: { children: string }) => (
  <Stack gap={16}>
    <DeclarationIcon color="orange" />
    <Link onClick={() => alert('John Doe clicked')}>{children}</Link>
  </Stack>
)

export const Default: ComponentStory<typeof Workqueue> = () => {
  const content = [
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '3 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-12-10',
      event: 'Birth',
      actions: [
        {
          label: 'Review',
          handler: onReviewClick
        },
        {
          actionComponent: (
            <Button type="icon" aria-label="Unassign record from myself">
              <Downloaded />
            </Button>
          )
        }
      ]
    },
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '5 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-11-10',
      event: 'Death',
      actions: [
        {
          actionComponent: (
            <Button type="icon" aria-label="Assign record to myself">
              <Download />
            </Button>
          )
        }
      ]
    },
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '23 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-11-10',
      event: 'Marriage',
      actions: [
        {
          label: 'Review',
          handler: onReviewClick
        },
        {
          actionComponent: (
            <Button type="icon" aria-label="Unassign record from myself">
              <Downloaded />
            </Button>
          )
        }
      ]
    },
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '12 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-09-10',
      event: 'Birth',
      actions: [
        {
          label: 'Review',
          handler: onReviewClick
        },
        {
          actionComponent: (
            <Button type="icon" aria-label="Unassign record from myself">
              <Downloaded />
            </Button>
          )
        }
      ]
    },
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '3 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-10-10',
      event: 'Birth',
      actions: [
        {
          actionComponent: (
            <Button type="icon" aria-label="Assign record to myself">
              <Download />
            </Button>
          )
        }
      ]
    },
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '18 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-10-10',
      event: 'Marriage',
      actions: [
        {
          actionComponent: (
            <Button type="icon" aria-label="Assign record to myself">
              <Download />
            </Button>
          )
        }
      ]
    },
    {
      iconWithName: <IconWithName>John Doe</IconWithName>,
      date_of_declaration: '23 days ago',
      tracking_id: '1234567',
      date_of_event: '2017-10-09',
      event: 'Birth',
      actions: [
        {
          actionComponent: (
            <Button type="icon" aria-label="Assign record to myself">
              <Download />
            </Button>
          )
        }
      ]
    }
  ]

  const columns = [
    {
      label: 'Name',
      width: 20,
      key: 'iconWithName'
    },
    {
      label: 'Type',
      width: 20,
      key: 'event'
    },
    {
      label: 'Date of declaration',
      width: 20,
      key: 'date_of_declaration'
    },
    {
      label: 'Date of event',
      width: 20,
      key: 'date_of_event'
    },
    {
      width: 20,
      key: 'actions',
      isActionColumn: true
    }
  ]

  return (
    <Workqueue
      content={content}
      columns={columns}
      noResultText="No result to display"
    />
  )
}
