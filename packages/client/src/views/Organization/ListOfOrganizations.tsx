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
  Stack,
  Text
} from '@opencrvs/components'
import { useDispatch, useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ILocation } from '@client/offline/reducer'
import { useHistory, useParams } from 'react-router'
import { goToOrganizationList } from '@client/navigation'
import { Activity } from '@opencrvs/components/lib/icons'
import { Button } from '@opencrvs/components/lib/Button'

const DEFAULT_PAGINATION_LIST_SIZE = 10
export function ListOfOrganizations() {
  const intl = useIntl()
  const { index } = useParams()
  const dispatch = useDispatch()
  //
  const getNewLevel =
    (index: string) =>
    (store: IStoreState): ILocation[] => {
      let currentLevel = Object.values(
        store.offline.offlineData.locations as { [key: string]: ILocation }
      ).filter((s) => s.partOf === `Location/${index ?? '0'}`)
      if (currentLevel.length === 0) {
        currentLevel = Object.values(
          store.offline.offlineData.offices as { [key: string]: ILocation }
        ).filter((s) => s.partOf === `Location/${index ?? '0'}`)
      }
      return currentLevel
    }

  const levelOne = useSelector<IStoreState, any>(getNewLevel(index))
  const totalNumber = levelOne.length
  const [currentPageNumber, setCurrentPageNumber] = React.useState<number>(1)

  const [links, setLink] = React.useState([
    {
      label: 'Cameroon',
      to: '/organization/',
      isActive: false
    }
  ])

  //

  const changeLevelAction = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault()
    dispatch(goToOrganizationList(id))
  }

  React.useEffect(() => {
    setLink((links) => [
      ...links,
      {
        label: 'New Label',
        to: `organization/${index}`,
        isActive: true
      }
    ])
    console.log(index)
  }, [index])
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
          <ListViewItemSimplified label={<BreadCrumb Links={links} />} />
          {levelOne
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
                  >
                    <Activity />
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

function BreadCrumb(props: { Links: Record<any, string>[] }) {
  return (
    <Stack gap={8} direction="row">
      {props.Links.map((x, idx) => {
        return (
          <Link key={idx} color={x.isActive ? 'primary' : 'copy'} element="a">
            {x?.label}
          </Link>
        )
      })}
    </Stack>
  )
}

interface BreadCrumbInterface {
  label: string
  to: string
  Icon?: JSX.Element
}
const TestBreadCrumb = (props: BreadCrumbInterface[]) => {
  const [state, setState] = React.useState(props)

  const watchNavigation = (payload: BreadCrumbInterface) => {
    setState((prevState: BreadCrumbInterface[]) =>
      prevState.slice(0, state.indexOf(payload))
    )
  }

  return props.map(({ label, to, Icon }, idx: number) => (
    <Link key={idx} element="a" onClick={() => watchNavigation({ label, to })}>
      {label}
    </Link>
  ))
}

const Separator = ({ children, ...props }: any) => (
  <span style={{ color: 'teal' }} {...props}>
    {children}
  </span>
)
