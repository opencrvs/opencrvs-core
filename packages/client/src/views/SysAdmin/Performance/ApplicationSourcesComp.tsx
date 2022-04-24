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
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface'
import React from 'react'
import {
  PerformanceTitle,
  PerformanceValue,
  PerformanceListHeader,
  ListContainer
} from '@client/views/SysAdmin/Performance/utils'

interface ApplicationSourcesProps {
  data: { label: string; value: number }[]
}

const applicationSrcDummy = [
  {
    label: 'Field Agents',
    value: 100
  },
  {
    label: 'Registrars',
    value: 100
  },
  {
    label: 'Registration Agents',
    value: 100
  }
]

export function ApplicationSourcesComp(props: ApplicationSourcesProps) {
  const { data } = props
  return (
    <ListContainer>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={
            <PerformanceListHeader>
              Sources of applications
            </PerformanceListHeader>
          }
        />
        {data &&
          data.map((source) => {
            return (
              <ListViewItemSimplified
                label={<PerformanceTitle>{source.label}</PerformanceTitle>}
                value={<PerformanceValue>{source.value}</PerformanceValue>}
              />
            )
          })}
      </ListViewSimplified>
    </ListContainer>
  )
}
