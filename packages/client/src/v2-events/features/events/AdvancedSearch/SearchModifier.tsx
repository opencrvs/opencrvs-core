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
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Pill, Link as StyledLink } from '@opencrvs/components/lib'
import { ROUTES } from '@client/v2-events/routes'
import { constantsMessages } from '@client/v2-events/messages'

const messagesToDefine = {
  edit: {
    defaultMessage: 'Edit',
    description: 'Edit button text',
    id: 'v2.buttons.edit'
  }
}

const messages = defineMessages(messagesToDefine)

const SearchParamContainer = styled.div`
  margin: 16px 0px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.primaryDark};
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    max-height: 200px;
    overflow-y: scroll;
  }
`

function convertPathToLabel(path: string): string {
  if (!path.includes('.')) {
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  const parts = path.split('.')
  const capitalizedFirst = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  return [capitalizedFirst, ...parts.slice(1)].join(' ')
}

export function SearchModifierComponent({
  eventType,
  searchParams
}: {
  eventType: string
  searchParams: Record<string, string>
}) {
  const navigate = useNavigate()
  const intl = useIntl()
  const eventSearchParamLabel = `${intl.formatMessage(constantsMessages.event)} : ${convertPathToLabel(eventType)}`
  const searchParamLabels = Object.entries(searchParams).map(
    ([key, value]) => `${convertPathToLabel(key)} : ${value}`
  )

  const allSearchParamLabels = [eventSearchParamLabel, ...searchParamLabels]

  return (
    <>
      <SearchParamContainer>
        {allSearchParamLabels.map((label) => (
          <Pill key={label} label={label} size="small" type="default"></Pill>
        ))}
        <StyledLink
          font="bold14"
          onClick={() =>
            navigate(ROUTES.V2.ADVANCED_SEARCH.path, {
              state: { searchParams, eventType }
            })
          }
        >
          {intl.formatMessage(messages.edit)}
        </StyledLink>
      </SearchParamContainer>
    </>
  )
}
