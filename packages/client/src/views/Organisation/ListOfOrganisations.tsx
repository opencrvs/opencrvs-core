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
  NoResultText,
  Stack,
  Text
} from '@opencrvs/components'
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
  currentLocation: null | ILocation
  childLocations: ILocation[]
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

      let currentLocation = null

      if (location !== '0') {
        const keyLevel = Object.keys(locations)
        currentLocation = keyLevel.includes(location)
          ? locations[location]
          : null
      }

      if (childLocations.length === 0) {
        childLocations = Object.values(offices).filter(
          (s) => s.partOf === `Location/${location}`
        )

        const keyLevel = Object.keys(offices)
        currentLocation = keyLevel.includes(location) ? offices[location] : null
      }

      return {
        currentLocation,
        childLocations
      }
    }

  const getBreadCrumb =
    (currentlySelectedLocation: string) =>
    (store: IStoreState): { index: null; label: string }[] => {
      const dataOfBreadCrumb = [
        {
          label: 'Cameroon',
          index: null
        }
      ]

      return dataOfBreadCrumb
    }

  const dataLocations = useSelector<IStoreState, any>(getNewLevel(locationId))
  const totalNumber = dataLocations.childLocations.length
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1)

  const breadCrumb = useSelector<IStoreState, any>(getBreadCrumb(locationId))

  const [links, setLink] = React.useState([
    {
      label: 'Cameroon',
      index: null
    }
  ])

  const changeLevelAction = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault()
    dispatch(goToOrganizationList(id))
  }

  const onClickBreadCrumb = (crumb: Record<any, string>) => {
    dispatch(goToOrganizationList(crumb.index))
  }

  React.useEffect(() => {
    const currentLocation = dataLocations.currentLocation
    if (currentLocation) {
      setLink((links) => [
        ...links,
        {
          label: currentLocation.name,
          index: currentLocation.index
        }
      ])
    } else {
      setLink((links) => {
        return links.filter((r) => r.index === null)
      })
    }
  }, [dataLocations.currentLocation])
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
            label={<BreadCrumb crumbs={links} onSelect={onClickBreadCrumb} />}
          />
          {!dataLocations.childLocations.length && (
            <NoResultText id="no-record">Empty data</NoResultText>
          )}
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
                    <Link
                      element="a"
                      onClick={(e) => changeLevelAction(e, level.id)}
                    >
                      {level?.name}
                    </Link>
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

function BreadCrumb(props: {
  crumbs: Record<any, string>[]
  onSelect: (x: Record<any, string>) => void
}) {
  const isLast = (index: number): boolean => {
    return index === props.crumbs.length - 1 && props.crumbs.length > 1
  }

  return (
    <Stack gap={8} direction="row">
      {props.crumbs.map((x, idx) => {
        return (
          <>
            {idx > 0 && '/ '}
            {!isLast(idx) ? (
              <Link
                key={idx}
                color={'primary'}
                onClick={(e) => {
                  e.preventDefault()
                  props.onSelect(x)
                }}
              >
                {x?.label}
              </Link>
            ) : (
              <Text variant={'bold16'} element={'span'}>
                {x?.label}
              </Text>
            )}
          </>
        )
      })}
    </Stack>
  )
}
