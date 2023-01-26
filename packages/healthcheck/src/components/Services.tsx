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
import React from 'react'

const Table = styled.table`
  td,
  th {
    padding: 8px;
    text-align: left;
  }

  ${({ theme }) => {
    return `color: ${theme.colors.yellow}`
  }}
`

export const Services = ({ services }: { services: Service[] }) => {
  return (
    <Table>
      <thead>
        <tr>
          <th>
            <Text variant="h1" element="h1">
              asdfasdf
            </Text>
          </th>
          <th>URL</th>
          <th>Status</th>
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
  )
}
