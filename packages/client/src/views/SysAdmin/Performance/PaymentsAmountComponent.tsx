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
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/performance'

interface PaymentsAmountProps {
  data: Array<GQLPaymentMetric>
}

const enum PAYMENT_TYPE {
  CERTIFICATION = 'certification',
  CORRECTION = 'correction'
}

export function PaymentsAmountComponent(props: PaymentsAmountProps) {
  const { data } = props
  const intl = useIntl()
  return (
    <ListContainer>
      <ListViewSimplified>
        <ListViewItemSimplified
          label={
            <div>
              <PerformanceListHeader>
                {intl.formatMessage(messages.performanceTotalPaymentsHeader)}
              </PerformanceListHeader>
            </div>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceTotalLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              $ {calculateTotalPaymentAmount(data)}
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceCertificationFeeLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              ${' '}
              {calculateTotalPaymentAmount(
                data.filter(
                  (payment) =>
                    payment.paymentType === PAYMENT_TYPE.CERTIFICATION
                )
              )}
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.performanceCorrectionFeeLabel)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              ${' '}
              {calculateTotalPaymentAmount(
                data.filter(
                  (payment) => payment.paymentType === PAYMENT_TYPE.CORRECTION
                )
              )}
            </PerformanceValue>
          }
        />
      </ListViewSimplified>
    </ListContainer>
  )
}
