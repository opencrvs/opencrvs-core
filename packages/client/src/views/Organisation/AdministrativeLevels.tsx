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
import { Frame } from '@opencrvs/components/lib/Frame'
import { Header } from '@client/components/Header/Header'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { constantsMessages } from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'
import { IntlShape, useIntl } from 'react-intl'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  Content,
  Link,
  ListViewItemSimplified,
  ListViewSimplified,
  BreadCrumb,
  Divider,
  Icon
} from '@opencrvs/components/lib'
import { IBreadCrumbData } from '@opencrvs/components/src/Breadcrumb'
import { useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ILocation } from '@client/offline/reducer'
import { useParams, useNavigate } from 'react-router-dom'
import { formatUrl, generatePerformanceHomeUrl } from '@client/navigation'
import { Button } from '@opencrvs/components/lib/Button'
import startOfMonth from 'date-fns/startOfMonth'
import subMonths from 'date-fns/subMonths'
import styled from 'styled-components'
import { getLocalizedLocationName } from '@client/utils/locationUtils'
import { usePermissions } from '@client/hooks/useAuthorization'
import * as routes from '@client/navigation/routes'
import { stringify } from 'querystring'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { Location } from '@opencrvs/commons/client'

const DEFAULT_PAGINATION_LIST_SIZE = 10

type IRouteProps = {
  locationId: string
}

type IGetNewLevel = {
  childLocations: ILocation[]
  breadCrumb: IBreadCrumbData[]
}

const NoRecord = styled.div<{ isFullPage?: boolean }>`
  ${({ theme }) => theme.fonts.h3};
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
  color: ${({ theme }) => theme.colors.copy};
  margin-top: 20px;
`

/**
 *
 * Wrapper component that adds Frame around the page if withFrame is true.
 * Created only for minimising impact of possible regression during v2 regression test period.
 */
function WithFrame({
  children,
  isHidden,
  intl
}: {
  children: React.ReactNode
  isHidden: boolean
  intl: IntlShape
}) {
  if (isHidden) {
    return <>{children}</>
  }

  return (
    <Frame
      header={
        <Header title={intl.formatMessage(navigationMessages.organisation)} />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
      navigation={<Navigation />}
    >
      {children}
    </Frame>
  )
}

export function AdministrativeLevels({
  hideNavigation
}: {
  hideNavigation?: boolean
}) {
  const intl = useIntl()
  const { locationId } = useParams<IRouteProps>()
  const { canAccessOffice } = usePermissions()
  const navigate = useNavigate()
  const { getLocations } = useLocations()

  const getNewLevel =
    (currentlySelectedLocation?: string) =>
    (store: IStoreState): IGetNewLevel => {
      const location = currentlySelectedLocation ?? null

      const locations = getLocations.useSuspenseQuery()

      const childLocations = [...locations.values()].filter(
        ({ parentId, validUntil, locationType }) =>
          (validUntil === null || new Date(validUntil) > new Date()) &&
          parentId === location &&
          ['ADMIN_STRUCTURE', 'CRVS_OFFICE'].includes(locationType)
      )

      let dataOfBreadCrumb: IBreadCrumbData[] = [
        {
          label: intl.formatMessage(constantsMessages.countryName),
          paramId: ''
        }
      ]

      if (currentlySelectedLocation) {
        let currentLocationId = currentlySelectedLocation
        const LocationBreadCrumb: IBreadCrumbData[] | null = []
        do {
          const currentOffice = locations[currentLocationId]

          if (currentOffice) {
            LocationBreadCrumb.push({
              label: getLocalizedLocationName(intl, currentOffice),
              paramId: currentOffice.id
            })
            currentLocationId = currentOffice.partOf.split('/')[1]
          } else {
            currentLocationId = ''
          }
        } while (currentLocationId !== '')

        dataOfBreadCrumb = [
          ...dataOfBreadCrumb,
          ...LocationBreadCrumb.reverse()
        ]
      }

      return {
        breadCrumb: dataOfBreadCrumb,
        childLocations
      }
    }

  const dataLocations = useSelector<IStoreState, IGetNewLevel>(
    getNewLevel(locationId)
  )
  const totalNumber = dataLocations.childLocations.length
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1)

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
    <WithFrame isHidden={!!hideNavigation} intl={intl}>
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
          <ListViewSimplified bottomBorder rowHeight={'small'}>
            {dataLocations.childLocations.length > 0 ? (
              dataLocations.childLocations
                ?.slice(
                  (currentPageNumber - 1) * DEFAULT_PAGINATION_LIST_SIZE,
                  currentPageNumber * DEFAULT_PAGINATION_LIST_SIZE
                )
                .map((level: Location, index: number) => (
                  <ListViewItemSimplified
                    key={index}
                    label={
                      level.locationType === 'ADMIN_STRUCTURE' ? (
                        <Link
                          onClick={(e) => {
                            setCurrentPageNumber(1)
                            changeLevelAction(e, level.id)
                          }}
                        >
                          {level.name}
                        </Link>
                      ) : level.locationType === 'CRVS_OFFICE' ? (
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
                          {level.name}
                        </Link>
                      ) : null
                    }
                  />
                ))
            ) : (
              <NoRecord id="no-record">
                {intl.formatMessage(constantsMessages.noResults)}
              </NoRecord>
            )}
          </ListViewSimplified>
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
    </WithFrame>
  )
}
