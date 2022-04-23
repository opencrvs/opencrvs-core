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
  calculateTotalPaymentAmount,
  PerformanceListHeader,
  ListContainer
} from '@client/views/SysAdmin/Performance/utils'
import { GQLPaymentMetric } from '@opencrvs/gateway/src/graphql/schema'

interface PaymentsAmountProps {
  data: Array<GQLPaymentMetric>
}

export function PaymentsAmountComponent(props: PaymentsAmountProps) {
  const { data } = props
  return (
    <ListContainer>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={<PerformanceListHeader>Fees collected</PerformanceListHeader>}
        />
        <ListViewItemSimplified
          label={<PerformanceTitle>Total</PerformanceTitle>}
          value={
            <PerformanceValue>
              {calculateTotalPaymentAmount(data)}
            </PerformanceValue>
          }
        />
        {data &&
          data.map((payment) => {
            return (
              <ListViewItemSimplified
                label={
                  <PerformanceTitle>{payment.paymentType}</PerformanceTitle>
                }
                value={<PerformanceValue>{payment.total}</PerformanceValue>}
              />
            )
          })}
      </ListViewSimplified>
    </ListContainer>
  )
}
