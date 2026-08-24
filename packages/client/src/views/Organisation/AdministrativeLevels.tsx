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
import React, { Fragment } from 'react'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { constantsMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  Content,
  Link,
  List,
  BreadCrumb,
  Divider
} from '@opencrvs/components/lib'
import { IBreadCrumbData } from '@opencrvs/components/src/Breadcrumb'
import { useParams, useNavigate } from 'react-router-dom'
import { formatUrl } from '@client/navigation'
import styled from 'styled-components'
import { usePermissions } from '@client/hooks/useAuthorization'
import * as routes from '@client/navigation/routes'
import { stringify } from 'querystring'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import {
  ClientAdministrativeArea,
  ClientLocation,
  getAdministrativeAreaHierarchy,
  resolveVersion,
  todayISO,
  UUID
} from '@opencrvs/commons/client'
import { useAdministrativeAreas } from '@client/v2-events/hooks/useAdministrativeAreas'
import { resolveLocationName } from '@client/v2-events/utils';

const DEFAULT_PAGINATION_LIST_SIZE = 10

type IRouteProps = {
  locationId: string
}

type IGetNewLevel = {
  childLocations: (ClientLocation | ClientAdministrativeArea)[]
  breadCrumb: IBreadCrumbData[]
}

const NoRecord = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h3};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 20px;
`

export function AdministrativeLevels() {
  const intl = useIntl()
  const { locationId } = useParams<IRouteProps>()
  const { canAccessOffice } = usePermissions()
  const navigate = useNavigate()
  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()

  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const locations = getLocations.useSuspenseQuery()

  // The organisation view is a present-tense surface: names and active status
  // are resolved at today's date.
  const today = todayISO()
  const isActiveToday = (entity: ClientLocation | ClientAdministrativeArea) =>
    resolveVersion(entity.versions, today).status === 'active'
  const nameToday = (entity: ClientLocation | ClientAdministrativeArea) =>
    resolveLocationName(entity, today)

  const getNewLevel = (
    currentlySelectedLocationId: UUID | null
  ): IGetNewLevel => {
    const childLocations = [...locations.values()].filter(
      (location) =>
        isActiveToday(location) &&
        location.administrativeAreaId === currentlySelectedLocationId
    )

    const childAdministrativeAreas = [...administrativeAreas.values()].filter(
      (area) =>
        isActiveToday(area) && area.parentId === currentlySelectedLocationId
    )

    let dataOfBreadCrumb: IBreadCrumbData[] = [
      {
        label: intl.formatMessage(constantsMessages.countryName),
        paramId: ''
      }
    ]

    if (currentlySelectedLocationId) {
      const locationBreadCrumb: IBreadCrumbData[] =
        getAdministrativeAreaHierarchy(
          currentlySelectedLocationId,
          administrativeAreas
        )
          .reverse()
          .map((area) => ({ label: nameToday(area), paramId: area.id }))

      dataOfBreadCrumb = [...dataOfBreadCrumb, ...locationBreadCrumb]
    }

    return {
      breadCrumb: dataOfBreadCrumb,
      childLocations: [...childAdministrativeAreas, ...childLocations]
    }
  }

  const dataLocations = getNewLevel(UUID.safeParse(locationId).data ?? null)
  const totalNumber = dataLocations.childLocations.length
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1)

  React.useEffect(() => {
    setCurrentPageNumber(1)
  }, [locationId])

  const changeLevelAction = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault()
    navigate(formatUrl(routes.ORGANISATIONS_INDEX, { locationId: id }))
  }

  const onClickBreadCrumb = (crumb: IBreadCrumbData) => {
    setCurrentPageNumber(1)
    navigate(
      formatUrl(routes.ORGANISATIONS_INDEX, { locationId: crumb.paramId ?? '' })
    )
  }

  return (
    <Content
      title={intl.formatMessage(navigationMessages.organisation)}
      showTitleOnMobile={false}
    >
      <Fragment key={'.0'}>
        <BreadCrumb
          items={dataLocations.breadCrumb}
          onSelect={onClickBreadCrumb}
        />
        <Divider />
        {dataLocations.childLocations.length > 0 ? (
          <List>
            {dataLocations.childLocations
              ?.slice(
                (currentPageNumber - 1) * DEFAULT_PAGINATION_LIST_SIZE,
                currentPageNumber * DEFAULT_PAGINATION_LIST_SIZE
              )
              .map((level: ClientLocation | ClientAdministrativeArea) => (
                <List.Item
                  key={level.id}
                  label={
                    ClientAdministrativeArea.safeParse(level).success ? (
                      <Link
                        onClick={(e) => {
                          setCurrentPageNumber(1)
                          changeLevelAction(e, level.id)
                        }}
                      >
                        {nameToday(level)}
                      </Link>
                    ) : (
                      <Link
                        disabled={!canAccessOffice(level)}
                        onClick={() =>
                          navigate({
                            pathname: routes.TEAM_USER_LIST,
                            search: stringify({
                              locationId: level.id
                            })
                          })
                        }
                      >
                        {nameToday(level)}
                      </Link>
                    )
                  }
                />
              ))}
          </List>
        ) : (
          <NoRecord id="no-record">
            {intl.formatMessage(constantsMessages.noResults)}
          </NoRecord>
        )}
      </Fragment>
      {totalNumber > DEFAULT_PAGINATION_LIST_SIZE && (
        <Pagination
          currentPage={currentPageNumber}
          totalPages={Math.ceil(totalNumber / DEFAULT_PAGINATION_LIST_SIZE)}
          onPageChange={(currentPage: number) =>
            setCurrentPageNumber(currentPage)
          }
        />
      )}
    </Content>
  )
}
