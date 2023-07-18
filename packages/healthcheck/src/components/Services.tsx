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

import { Service, Status } from '@/lib/check-health'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import {
  LeftNavigation,
  NavigationGroup,
  NavigationItem
} from '@opencrvs/components/lib/SideNavigation'
import { SearchTool } from '@opencrvs/components/lib/SearchTool'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Content } from '@opencrvs/components/lib/Content'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Button } from '@opencrvs/components/lib/Button'
import { Stack } from '@opencrvs/components/lib/Stack'
// import { Table } from '@opencrvs/components/lib/Table'
import {
  BackArrow,
  Hamburger,
  SearchBlue,
  TrackingID,
  ForwardArrowDeepBlue,
  BRN,
  Phone
} from '@opencrvs/components/lib/icons'
import React from 'react'
import Sidebar from './Sidebar'

const Table = styled.table`
  td,
  th {
    padding: 8px;
    text-align: left;
  }
`

export const Services = ({ services }: { services: Service[] }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>
            <Text variant="bold18" element="span">
              Service
            </Text>
          </th>
          <th>
            <Text variant="bold18" element="span">
              URL
            </Text>
          </th>
          <th>
            <Text variant="bold18" element="span">
              Status
            </Text>
          </th>
        </tr>
      </thead>
      <tbody>
        {services.map((service) => (
          <tr key={service.name}>
            <td>{service.name}</td>
            <td>{service.url}</td>
            <td>{service.status === Status.OK ? '✅' : '❌'}</td>
          </tr>
        ))}
      </tbody>
    </Table>

    // <Sidebar />
  )
}
