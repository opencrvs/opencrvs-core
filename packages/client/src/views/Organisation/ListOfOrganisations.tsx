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
import React from 'react'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Header } from '@client/components/Header/Header'
import { navigationMessages } from '@client/i18n/messages/views/navigation'
import { constantsMessages } from '@client/i18n/messages'
import { Navigation } from '@client/components/interface/Navigation'
import { useIntl } from 'react-intl'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  Content,
  Link,
  ListViewItemSimplified,
  ListViewSimplified,
  Text,
  BreadCrumb
} from '@opencrvs/components'
import { IBreadCrumbData } from '@opencrvs/components/src/Breadcrumb'
import { useDispatch, useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ILocation, LocationType } from '@client/offline/reducer'
import { useParams } from 'react-router'
import {
  goToOrganizationList,
  goToPerformanceHome,
  goToTeamUserList
} from '@client/navigation'
import { Activity, User } from '@opencrvs/components/lib/icons'
import { Button } from '@opencrvs/components/lib/Button'
import startOfMonth from 'date-fns/startOfMonth'
import subMonths from 'date-fns/subMonths'

const DEFAULT_PAGINATION_LIST_SIZE = 10

type IRouteProps = {
  locationId: string
}

type IGetNewLevel = {
  childLocations: ILocation[]
  breadCrumb: IBreadCrumbData[]
}

export function ListOfOrganisations() {
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
          label: 'Cameroon',
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
              label: currentOffice.name,
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
        title={intl.formatMessage(navigationMessages.organisation)}
        showTitleOnMobile={true}
      >
        <ListViewSimplified bottomBorder={true}>
          <ListViewItemSimplified
            label={
              <BreadCrumb
                items={dataLocations.breadCrumb}
                onSelect={onClickBreadCrumb}
              />
            }
          />
          {dataLocations.childLocations.length > 0 &&
            dataLocations.childLocations
              ?.slice(
                (currentPageNumber - 1) * DEFAULT_PAGINATION_LIST_SIZE,
                currentPageNumber * DEFAULT_PAGINATION_LIST_SIZE
              )
              .map((level: ILocation, index: number) => (
                <ListViewItemSimplified
                  key={index}
                  label={
                    level.type === LocationType.CRVS_OFFICE ? (
                      <Text variant={'bold16'} element={'span'}>
                        {level?.name}
                      </Text>
                    ) : (
                      <Link
                        element="a"
                        onClick={(e) => changeLevelAction(e, level.id)}
                      >
                        {level?.name}
                      </Link>
                    )
                  }
                  actions={
                    <Button
                      type="icon"
                      size="large"
                      aria-label="View performance data"
                      onClick={() => {
                        if (level.type === LocationType.CRVS_OFFICE)
                          dispatch(goToTeamUserList(level.id))
                        if (level.type === LocationType.ADMIN_STRUCTURE)
                          dispatch(
                            goToPerformanceHome(
                              startOfMonth(subMonths(new Date(Date.now()), 11)),
                              new Date(Date.now()),
                              level.id
                            )
                          )
                      }}
                    >
                      {level.type === LocationType.CRVS_OFFICE && <User />}
                      {level.type === LocationType.ADMIN_STRUCTURE && (
                        <Activity />
                      )}
                    </Button>
                  }
                />
              ))}
        </ListViewSimplified>
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
