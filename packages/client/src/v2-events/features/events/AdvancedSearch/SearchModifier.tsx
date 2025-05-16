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
import { stringify } from 'query-string'
import { Pill, Link as StyledLink } from '@opencrvs/components/lib'
import { ROUTES } from '@client/v2-events/routes'
import { constantsMessages } from '@client/v2-events/messages'
import { filterEmptyValues, getAllUniqueFields } from '@client/v2-events/utils'
import { getFormDataStringifier } from '@client/v2-events/hooks/useFormDataStringifier'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { useEventConfigurations } from '../useEventConfiguration'
import { getDefaultSearchFields } from './utils'

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

function convertPathToLabel(path?: string): string {
  if (!path) {
    return ''
  }
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

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const eventConfigurations = useEventConfigurations()
  const eventConfig = eventConfigurations.find(
    (config) => config.id === eventType
  )
  if (!eventConfig) {
    return null
  }
  const stringifyForm = getFormDataStringifier(intl, locations)

  const declarationFieldConfigs = getAllUniqueFields(eventConfig)
  const declarationSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key, value]) => {
      return declarationFieldConfigs.some((field) => field.id === key)
    })
  )

  const searchParamsResolved = stringifyForm(
    declarationFieldConfigs,
    declarationSearchParams
  )

  const declarationSearchParamLabels = Object.keys(searchParamsResolved)
    .map((key) => {
      const field = declarationFieldConfigs.find((f) => f.id === key)
      if (!field) {
        return null
      }
      const prefix = key.split('.').slice(0, -1) + ' '
      return `${convertPathToLabel(prefix)}${intl.formatMessage(field.label)}: ${searchParamsResolved[key]}`
    })
    .filter(Boolean)

  const eventFieldConfigs = Object.entries(eventConfig.advancedSearch).flatMap(
    ([key, x]) => getDefaultSearchFields(x)
  )
  const eventSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key, value]) => {
      return eventFieldConfigs.some((field) => field.id === key)
    })
  )

  const eventSearchParamsResolved = stringifyForm(
    eventFieldConfigs,
    eventSearchParams
  )

  const eventSearchParamLabels = Object.keys(eventSearchParamsResolved)
    .map((key) => {
      const field = eventFieldConfigs.find((f) => f.id === key)
      if (!field) {
        return null
      }
      return `${intl.formatMessage(field.label)}: ${eventSearchParamsResolved[key]}`
    })
    .filter(Boolean)

  const eventParamLabel = `${intl.formatMessage(constantsMessages.event)} : ${convertPathToLabel(eventType)}`

  const allSearchParamLabels = [
    eventParamLabel,
    ...eventSearchParamLabels,
    ...declarationSearchParamLabels
  ]

  return (
    <>
      <SearchParamContainer>
        {allSearchParamLabels.map((label) => (
          <Pill key={label} label={label} size="small" type="default"></Pill>
        ))}
        <StyledLink
          font="bold14"
          onClick={() => {
            const nonEmptyValues = filterEmptyValues({
              ...searchParams,
              eventType
            })
            const serializedParams = stringify(nonEmptyValues)
            const navigateTo = ROUTES.V2.ADVANCED_SEARCH.buildPath({})
            navigate(`${navigateTo}?${serializedParams.toString()}`)
          }}
        >
          {intl.formatMessage(messages.edit)}
        </StyledLink>
      </SearchParamContainer>
    </>
  )
}
