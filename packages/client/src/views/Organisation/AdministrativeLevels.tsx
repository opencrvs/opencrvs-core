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
import { useIntl } from 'react-intl'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  Content,
  ContentSize,
  Link,
  ListViewItemSimplified,
  ListViewSimplified,
  BreadCrumb,
  Divider,
  Icon
} from '@opencrvs/components/lib'
import { IBreadCrumbData } from '@opencrvs/components/src/Breadcrumb'
import { useDispatch, useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ILocation } from '@client/offline/reducer'
import { useParams } from 'react-router'
import {
  goToOrganizationList,
  goToPerformanceHome,
  goToTeamUserList
} from '@client/navigation'
import { Button } from '@opencrvs/components/lib/Button'
import startOfMonth from 'date-fns/startOfMonth'
import subMonths from 'date-fns/subMonths'
import styled from 'styled-components'
import { getLocalizedLocationName } from '@client/utils/locationUtils'

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

// const con

export function AdministrativeLevels() {
  const intl = useIntl()
  const { locationId } = useParams<IRouteProps>()
  const dispatch = useDispatch()
  //
  const getNewLevel =
    (currentlySelectedLocation: string) =>
    (store: IStoreState): IGetNewLevel => {
      const location = currentlySelectedLocation ?? '0'
      const locations = store.offline.offlineData.locations as {
        [key: string]: ILocation
      }
      const offices = store.offline.offlineData.offices as {
        [key: string]: ILocation
      }

      let childLocations = Object.values(locations).filter(
        (s) => s.partOf === `Location/${location}`
      )

      if (!childLocations.length) {
        childLocations = Object.values(offices).filter(
          (s) => s.partOf === `Location/${location}`
        )
      }

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
    dispatch(goToOrganizationList(id))
  }

  const onClickBreadCrumb = (crumb: IBreadCrumbData) => {
    setCurrentPageNumber(1)
    dispatch(goToOrganizationList(crumb.paramId))
  }

  //
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
      <Content
        size={ContentSize.NORMAL}
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
                .map((level: ILocation, index: number) => (
                  <ListViewItemSimplified
                    key={index}
                    label={
                      <Link
                        element="a"
                        onClick={(e) => {
                          if (level.type === 'ADMIN_STRUCTURE') {
                            setCurrentPageNumber(1)
                            changeLevelAction(e, level.id)
                          }
                          if (level.type === 'CRVS_OFFICE')
                            dispatch(goToTeamUserList(level.id))
                        }}
                      >
                        {getLocalizedLocationName(intl, level)}
                      </Link>
                    }
                    actions={
                      <Button
                        type="icon"
                        size="small"
                        onClick={() => {
                          dispatch(
                            goToPerformanceHome(
                              startOfMonth(subMonths(new Date(Date.now()), 11)),
                              new Date(Date.now()),
                              undefined,
                              level.id
                            )
                          )
                        }}
                      >
                        <Icon
                          name="Activity"
                          color="currentColor"
                          size="medium"
                        />
                      </Button>
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
    </Frame>
  )
}
