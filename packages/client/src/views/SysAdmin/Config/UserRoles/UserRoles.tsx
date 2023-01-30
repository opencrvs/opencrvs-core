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
import { Header } from '@client/components/Header/Header'
import { useIntl } from 'react-intl'
import { Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import {
  LoadingIndicator,
  useOnlineStatus
} from '@client/views/OfficeHome/LoadingIndicator'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { GetSystemRolesQuery, Role } from '@client/utils/gateway'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { useMutation, useQuery } from '@apollo/client'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { Link } from '@opencrvs/components/lib/Link'
import { Text } from '@opencrvs/components/lib/Text'
import { getSystemRolesQuery } from '@client/forms/user/query/queries'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { getUserSystemRole } from '@client/views/SysAdmin//Team/utils'
import { getLanguage } from '@client/i18n/selectors'
import { useSelector } from 'react-redux'
import { getUserRole } from './utils'
import { Stack } from '@opencrvs/components'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { useModal } from '@client/hooks/useModal'
import { UserRoleManagementModal } from '@client/views/UserRoles/UserRoleManagementModal'

export type RolesInput = (Omit<Role, '_id'> & { _id?: string })[]

export type ISystemRole = NonNullable<
  GetSystemRolesQuery['getSystemRoles']
>[number]

export type IRoles = Array<{
  labels: Array<{
    lang: string
    label: string
  }> | null
}>

const UserRoles = () => {
  const intl = useIntl()
  const [userRoleMgntModalNode, openUserRoleManage] = useModal()
  const language = useSelector(getLanguage)
  const { loading, error, data } = useQuery<GetSystemRolesQuery>(
    getSystemRolesQuery,
    {
      fetchPolicy: 'no-cache'
    }
  )

  const roleChangeHandler = async (systemRole: ISystemRole) => {
    //TODO: call mutation using the changedRoles
    const changedRoles = await openUserRoleManage<RolesInput | null>(
      (close) => (
        <UserRoleManagementModal
          systemRole={systemRole}
          closeCallback={close}
        />
      )
    )
  }

  return (
    <>
      <Frame
        header={
          <AppBar
            desktopLeft={<HistoryNavigator />}
            desktopRight={<ProfileMenu key="profileMenu" />}
            mobileLeft={<HistoryNavigator hideForward />}
          />
        }
        navigation={<Navigation />}
        skipToContentText={intl.formatMessage(
          constantsMessages.skipToMainContent
        )}
      >
        <Content
          title={intl.formatMessage(messages.userRoles)}
          titleColor={'copy'}
          subtitle={intl.formatMessage(messages.userRolesSubtitle, {
            link: (
              <Link
                onClick={() => {
                  window.open('https://www.opencrvs.org/', '_blank')
                }}
                font="reg16"
              >
                Link
              </Link>
            )
          })}
        >
          {error && <GenericErrorToast />}
          {loading && <LoadingIndicator loading />}
          {!error && !loading && (
            <ListViewSimplified key={`listViewSimplified`}>
              <ListViewItemSimplified
                label={
                  <Text variant="bold14" element="span" color="grey400">
                    {intl.formatMessage(messages.systemRoles)}
                  </Text>
                }
                value={
                  <Text variant="bold14" element="span" color="grey400">
                    {intl.formatMessage(messages.role)}
                  </Text>
                }
              />
              {(data?.getSystemRoles ?? []).map((systemRole) => {
                return (
                  <ListViewItemSimplified
                    label={
                      <Label id={`${systemRole?.value}_label`}>
                        {getUserSystemRole(
                          { systemRole: systemRole?.value },
                          intl
                        )}
                      </Label>
                    }
                    value={
                      <Value id={`${systemRole?.value}_value`}>
                        <Stack direction="column" alignItems="stretch" gap={2}>
                          {getUserRole(
                            language,
                            systemRole?.roles as IRoles
                          ).map((role) => {
                            return <span>{role}</span>
                          })}
                        </Stack>
                      </Value>
                    }
                    actions={
                      <Link
                        font="reg16"
                        onClick={() => {
                          roleChangeHandler(systemRole)
                        }}
                      >
                        <span>{intl.formatMessage(buttonMessages.change)}</span>
                      </Link>
                    }
                  />
                )
              })}
            </ListViewSimplified>
          )}
          {userRoleMgntModalNode}
        </Content>
      </Frame>
    </>
  )
}

export default UserRoles
