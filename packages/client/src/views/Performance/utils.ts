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
import styled from '@client/styledComponents'
import moment from 'moment'

export const Header = styled.h1`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.h4Style};
`

export function getMonthDateRange(year: number, month: number) {
  const start = moment([year, month - 1])
  const end = moment(start).endOf('month')

  return {
    start,
    end
  }
}
export const ReportHeader = styled.div`
  margin: 24px 0px;
`

export const SubHeader = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bigBodyBoldStyle};
`

export const Description = styled.div`
  margin: 8px 0px;
  color: ${({ theme }) => theme.colors.placeholder};
  ${({ theme }) => theme.fonts.bodyStyle};
`
