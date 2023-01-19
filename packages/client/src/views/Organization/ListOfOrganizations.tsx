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
  Stack
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
  index: string
}

type IGetNewLevel = {
  currentLevel: null | ILocation
  dataLevel: ILocation[]
}

export function ListOfOrganizations() {
  const intl = useIntl()
  const { index } = useParams<IRouteProps>()
  const dispatch = useDispatch()
  //
  const getNewLevel =
    (index: string) =>
    (store: IStoreState): IGetNewLevel => {
      const indexString = index ?? '0'
      const locations = store.offline.offlineData.locations as {
        [key: string]: ILocation
      }
      const offices = store.offline.offlineData.offices as {
        [key: string]: ILocation
      }

      let dataLevel = Object.values(locations).filter(
        (s) => s.partOf === `Location/${indexString}`
      )

      let currentLevel = null

      if (indexString !== '0') {
        const keyLevel = Object.keys(locations)
        currentLevel = keyLevel.includes(indexString)
          ? locations[indexString]
          : null
      }

      if (dataLevel.length === 0) {
        dataLevel = Object.values(offices).filter(
          (s) => s.partOf === `Location/${indexString}`
        )

        const keyLevel = Object.keys(offices)
        currentLevel = keyLevel.includes(indexString)
          ? offices[indexString]
          : null
      }

      return {
        currentLevel,
        dataLevel
      }
    }

  const levelOne = useSelector<IStoreState, any>(getNewLevel(index))
  const totalNumber = levelOne.dataLevel.length
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1)

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
    const currentLevel = levelOne.currentLevel
    if (currentLevel) {
      setLink((links) => [
        ...links,
        {
          label: currentLevel.name,
          index: currentLevel.index
        }
      ])
    } else {
      setLink((links) => {
        return links.filter((r) => r.index === null)
      })
    }
  }, [levelOne.currentLevel])
  //
  return (
    <Frame
      header={
        <Header title={intl.formatMessage(navigationMessages.organization)} />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
      navigation={<Navigation />}
    >
      <Content
        title={intl.formatMessage(navigationMessages.organization)}
        showTitleOnMobile={true}
      >
        <ListViewSimplified bottomBorder={true}>
          <ListViewItemSimplified
            label={<BreadCrumb crumbs={links} onSelect={onClickBreadCrumb} />}
          />
          {!levelOne.dataLevel.length && (
            <NoResultText id="no-record">Empty data</NoResultText>
          )}
          {levelOne.dataLevel.length > 0 &&
            levelOne.dataLevel
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
          <Link
            key={idx}
            color={!isLast(idx) ? 'primary' : 'copy'}
            disabled={isLast(idx)}
            onClick={(e) => {
              e.preventDefault()
              props.onSelect(x)
            }}
          >
            {x?.label}
          </Link>
        )
      })}
    </Stack>
  )
}
