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
import {
  GQLLocation,
  GQLIdentifier
} from '@opencrvs/gateway/src/graphql/schema'

export const Header = styled.h1`
  color: ${({ theme }) => theme.colors.menuBackground};
  ${({ theme }) => theme.fonts.h4Style};
`

export function getMonthDateRange(year: number, month: number) {
  const currentMonth = month % 12 > 0 ? month % 12 : month
  const currentYear = year + Math.trunc((month - 1) / 12)
  const start = moment([currentYear, currentMonth - 1])
  const end = moment(start).endOf('month')

  return {
    start,
    end
  }
}
export const ReportHeader = styled.div`
  margin: 32px 0 24px 0;
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

export const ActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  margin: 0 -24px 0 -24px;
  padding: 12px 24px 11px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`

export const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;

  & > :first-child {
    margin: 0 8px 8px 0;
  }

  & > :nth-child(2) {
    margin: 0 8px 8px 0;
  }

  & > :nth-child(3) {
    margin: 0 8px 8px 0;
  }

  & > :last-child {
    margin: 0;
  }
`
export function getJurisidictionType(location: GQLLocation): string | null {
  let jurisdictionType = null

  const jurisdictionTypeIdentifier =
    location.identifier &&
    (location.identifier as GQLIdentifier[]).find(
      ({ system }: GQLIdentifier) =>
        system && system === 'http://opencrvs.org/specs/id/jurisdiction-type'
    )

  if (jurisdictionTypeIdentifier) {
    jurisdictionType = jurisdictionTypeIdentifier.value as string
  }

  return jurisdictionType
}
