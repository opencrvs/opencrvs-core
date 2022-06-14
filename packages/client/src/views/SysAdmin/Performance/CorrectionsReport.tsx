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
import { ListViewItemSimplified } from '@opencrvs/components/lib/interface'
import React from 'react'
import {
  calculateTotal,
  PerformanceTitle,
  PerformanceValue,
  PerformanceListHeader,
  ReportContainer,
  ListContainer
} from '@client/views/SysAdmin/Performance/utils'
import { GQLCorrectionMetric } from '@opencrvs/gateway/src/graphql/schema'
import { messages } from '@client/i18n/messages/views/performance'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'
import { CorrectionReason } from '@client/forms/correction/reason'
import { useIntl } from 'react-intl'

interface CorrectionsReportProps {
  data: Array<GQLCorrectionMetric>
}

export function CorrectionsReport({ data }: CorrectionsReportProps) {
  const intl = useIntl()
  if (!data) return <></>
  return (
    <ListContainer>
      <ReportContainer>
        <ListViewItemSimplified
          label={
            <div>
              <PerformanceListHeader>Corrections</PerformanceListHeader>
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
            <div>
              <PerformanceValue>{calculateTotal(data)}</PerformanceValue>
            </div>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(correctionMessages.clericalError)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              {calculateTotal(
                data.filter(
                  ({ reason }) => reason === CorrectionReason.CLERICAL_ERROR
                )
              )}
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(correctionMessages.materialError)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              {calculateTotal(
                data.filter(
                  ({ reason }) => reason === CorrectionReason.MATERIAL_ERROR
                )
              )}
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(correctionMessages.materialOmission)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              {calculateTotal(
                data.filter(
                  ({ reason }) => reason === CorrectionReason.MATERIAL_OMISSION
                )
              )}
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(correctionMessages.judicialOrder)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              {calculateTotal(
                data.filter(
                  ({ reason }) => reason === CorrectionReason.JUDICIAL_ORDER
                )
              )}
            </PerformanceValue>
          }
        />
        <ListViewItemSimplified
          label={
            <PerformanceTitle>
              {intl.formatMessage(messages.otherCorrectionReason)}
            </PerformanceTitle>
          }
          value={
            <PerformanceValue>
              {calculateTotal(
                data.filter(({ reason }) => reason === CorrectionReason.OTHER)
              )}
            </PerformanceValue>
          }
        />
      </ReportContainer>
    </ListContainer>
  )
}
