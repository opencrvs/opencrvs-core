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
import {
  Content,
  Link,
  ListViewItemSimplified,
  ListViewSimplified,
  Text
} from '@opencrvs/components'
import { useDispatch, useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { ILocation } from '@client/offline/reducer'
import { useLocation, useHistory } from 'react-router'
import { goToOrganizationList } from '@client/navigation'

export function ListOfOrganizations() {
  const intl = useIntl()
  const params = useLocation()
  const levelOne = useSelector<IStoreState, any>((state) =>
    Object.values(
      state.offline.offlineData.locations as { [key: string]: ILocation }
    ).filter((s) => s.partOf === 'Location/0')
  )
  const [level, setLevel] = React.useState<ILocation[]>(levelOne)
  const history = useHistory()
  const dispatch = useDispatch()
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
            label={
              <BreadCrumb
                Links={[
                  {
                    pathname: history.location.pathname,
                    search: history.location.search
                  }
                ]}
              />
            }
          />
          {level?.map((level: ILocation, index: number) => (
            <ListViewItemSimplified
              key={index}
              label={
                <Link
                  element="a"
                  onClick={(e) => {
                    console.log(params.search)
                    return dispatch(
                      goToOrganizationList(`Location/${level.id}`)
                    )
                  }}
                >
                  {level?.name}
                </Link>
              }
            />
          ))}
        </ListViewSimplified>
      </Content>
    </Frame>
  )
}

function BreadCrumb(props: { Links: Record<any, string>[] }) {
  return (
    <Text variant="h4" element="span">
      {props.Links.map((x, idx) => {
        return props.Links.indexOf(x) === props.Links.length - 1 ? (
          <span key={idx}> {x?.pathname.replace('/', '') ?? ''} </span>
        ) : (
          <Link key={idx} element="a">
            {x?.pathname}
          </Link>
        )
      })}
    </Text>
  )
}
