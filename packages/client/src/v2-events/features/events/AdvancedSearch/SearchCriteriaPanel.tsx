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
import { EventConfig, FieldValue, Inferred } from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { constantsMessages } from '@client/v2-events/messages'
import { filterEmptyValues } from '@client/v2-events/utils'
import { ValueOutput } from '@client/v2-events/features/events/components/Output'
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
  eventConfig: EventConfig,
  fieldConfigs: Inferred[],
  searchParams: Record<string, FieldValue>,
  intl: IntlShape
): React.ReactNode[] {
  return Object.entries(searchParams).map(([key, value]) => {
    const field = fieldConfigs.find((f) => f.id === key)
    if (!field) {
      return null
    }
    // Determine if its not a EventMetadata field, then show prefix (ex: 'child.firstName)
    const hidePrefix = eventConfig.advancedSearch
      .flatMap((section) => section.fields)
      .find(
        (f) => f.fieldId === key && f.hideSearchLabelPrefix
      )?.hideSearchLabelPrefix
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
        "Child First name(s): value"
      */

    const prefix = hidePrefix ? '' : convertPathToLabel(key.split('.')[0]) + ' '
    const label = intl.formatMessage(field.label)
    const valueOutput = <ValueOutput config={field} value={value} />
    const output = (
      <>
        {prefix}
        {label}
        {':'} {valueOutput}
      </>
    )
    return (
      <Pill key={field.id} label={output} size="small" type="default"></Pill>
    )
  })
}

export function SearchCriteriaPanel({
  eventConfig,
  searchParams
}: {
  eventConfig: EventConfig
  searchParams: Record<string, FieldValue>
}) {
  const navigate = useNavigate()
  const intl = useIntl()

  /* --- Build event-label, ex: Event: V2 birth */
  const searchFieldConfigs = getSearchParamsFieldConfigs(
    eventConfig,
    searchParams
  )
  const filteredSearchParams = Object.fromEntries(
    Object.entries(searchParams).filter(([key]) =>
      searchFieldConfigs.some((config) => config.id === key)
    )
  )

  const searchParamsLabels = buildSearchParamLabels(
    eventConfig,
    searchFieldConfigs,
    filteredSearchParams,
    intl
  )

  return (
    <>
      <SearchParamContainer>
        <Pill
          key={constantsMessages.event.id}
          label={`${intl.formatMessage(constantsMessages.event)}: ${convertPathToLabel(eventConfig.id)}`}
          size="small"
          type="default"
        ></Pill>
        {searchParamsLabels.map((label) => (
          <>{label}</>
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
