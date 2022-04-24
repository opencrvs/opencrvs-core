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
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import * as React from 'react'
import {
  ListContainer,
  PerformanceListHeader,
  PerformanceTitle,
  PerformanceValue
} from './utils'

interface ICertificationRateData {
  label: string
  value: number
}

interface ICertificationRateProps {
  data: ICertificationRateData[]
}

export function CertificationRateComponent(props: ICertificationRateProps) {
  return (
    <ListContainer>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={
            <PerformanceListHeader>Certificates issued</PerformanceListHeader>
          }
        />
        <ListViewItemSimplified
          label={<PerformanceTitle>Total</PerformanceTitle>}
          value={<PerformanceValue>{props.data[0].value}</PerformanceValue>}
        />

        <ListViewItemSimplified
          label={<PerformanceTitle>Certification rate</PerformanceTitle>}
          value={<PerformanceValue>{props.data[1].value}%</PerformanceValue>}
        />
      </ListViewSimplified>
    </ListContainer>
  )
}
