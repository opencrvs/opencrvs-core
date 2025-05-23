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
import { defineMessages, IntlShape, useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { stringify } from 'query-string'
import { capitalize } from 'lodash'
import { Pill, Link as StyledLink } from '@opencrvs/components/lib'
import {
  EventConfig,
  EventFieldId,
  FieldValue,
  Inferred
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { constantsMessages } from '@client/v2-events/messages'
import { filterEmptyValues } from '@client/v2-events/utils'
import {
  getFormDataStringifier,
  RecursiveStringRecord
} from '@client/v2-events/hooks/useFormDataStringifier'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { getSearchParamsFieldConfigs } from './utils'

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
  const [first, ...rest] = path.split('.')
  const capitalizedFirst = capitalize(first)
  return [capitalizedFirst, ...rest].join(' ')
}

function buildSearchParamLabels(
  fieldConfigs: Inferred[],
  searchParams: RecursiveStringRecord,
  intl: IntlShape
): string[] {
  return Object.entries(searchParams)
    .map(([key, value]) => {
      const field = fieldConfigs.find((f) => f.id === key)
      if (!field) {
        return null
      }
      // Determine if its not a EventMetadata field, then show prefix (ex: 'child.firstName)
      const showPrefix = !EventFieldId.options.some((x) => key.includes(x))
      /*
        Example:
        key = "child.firstname", 'mother.firstname", "informant.firstname"

        Breakdown:
        - key.includes('.') => true               // (it's a key with '.', as per convention)
        - key.split('.')[0] => "child"            // extract the parent path
        - convertPathToLabel("child") => "Child"  // capitalize the parent key
        - prefix = "Child "                       // space added after prefix

        - intl.formatMessage(field.label) => "First name(s)" // localized label, retrieved from respective FieldConfig

        Final output:
        "Child First name(s): [value]"
      */

      const prefix = showPrefix
        ? convertPathToLabel(key.split('.')[0]) + ' '
        : ''
      const label = intl.formatMessage(field.label)
      return `${prefix}${label}: ${value}`
    })
    .filter((entry): entry is string => Boolean(entry))
}

export function SearchModifierComponent({
  eventConfig,
  searchParams
}: {
  eventConfig: EventConfig
  searchParams: Record<string, FieldValue>
}) {
  const navigate = useNavigate()
  const intl = useIntl()

  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const stringifyForm = getFormDataStringifier(intl, locations)

  /* --- Build event-label, ex: Event: V2 birth */
  const eventParamLabel = `${intl.formatMessage(constantsMessages.event)}: ${convertPathToLabel(eventConfig.id)}`

  const searchFieldConfigs = getSearchParamsFieldConfigs(
    eventConfig,
    searchParams
  )
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) =>
      searchFieldConfigs.some((config) => config.id === key)
    )
  )
  const stringifiedSearchParams = stringifyForm(
    searchFieldConfigs,
    filteredSearchParams
  )

  const searchParamsLabels = buildSearchParamLabels(
    searchFieldConfigs,
    stringifiedSearchParams,
    intl
  )

  return (
    <>
      <SearchParamContainer>
        {[eventParamLabel, ...searchParamsLabels].map((label) => (
          <Pill key={label} label={label} size="small" type="default"></Pill>
        ))}
        <StyledLink
          font="bold14"
          onClick={() => {
            const nonEmptyValues = filterEmptyValues({
              ...searchParams,
              eventType: eventConfig.id
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
