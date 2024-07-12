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
import { useIntl } from 'react-intl'
import { Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import {
  GetSystemRolesQuery,
  Role,
  SystemRoleInput,
  UpdateRoleMutation,
  UpdateRoleMutationVariables
} from '@client/utils/gateway'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { useMutation, useQuery } from '@apollo/client'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { HistoryNavigator } from '@client/components/Header/HistoryNavigator'
import { Link } from '@opencrvs/components/lib/Link'
import { Text } from '@opencrvs/components/lib/Text'
import {
  getSystemRolesQuery,
  updateRoleQuery
} from '@client/forms/user/query/queries'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { getUserSystemRole } from '@client/views/SysAdmin//Team/utils'
import { getLanguage } from '@client/i18n/selectors'
import { useDispatch, useSelector } from 'react-redux'
import { getUserRole } from './utils'
import { Stack, Toast } from '@opencrvs/components'
import { ProfileMenu } from '@client/components/ProfileMenu'
import { useModal } from '@client/hooks/useModal'
import { UserRoleManagementModal } from '@client/views/UserRoles/UserRoleManagementModal'
import { offlineDataReady } from '@client/offline/actions'
import { getOfflineData } from '@client/offline/selectors'

export type RolesInput = (Omit<Role, '_id'> & { _id?: string })[]

export type ISystemRole = NonNullable<
  GetSystemRolesQuery['getSystemRoles']
>[number]

const UserRoles = () => {
  const intl = useIntl()
  const [userRoleMgntModalNode, openUserRoleManage] = useModal()
  const language = useSelector(getLanguage)
  const dispatch = useDispatch()
  const offlineData = useSelector(getOfflineData)
  const { loading, error, data, refetch } = useQuery<GetSystemRolesQuery>(
    getSystemRolesQuery,
    {
      fetchPolicy: 'no-cache'
    }
  )

  const [
    updateRoleMutate,
    { data: roleUpdateSuccess, error: updateRoleError, reset }
  ] = useMutation<UpdateRoleMutation, UpdateRoleMutationVariables>(
    updateRoleQuery,
    {
      onCompleted: ({ updateRole }) => {
        if (updateRole) {
          refetch()
          dispatch(offlineDataReady(offlineData))
        }
      }
    }
  )

  const roleChangeHandler = async (systemRole: ISystemRole) => {
    const changedRoles = await openUserRoleManage<RolesInput | null>(
      (close) => (
        <UserRoleManagementModal
          systemRole={systemRole}
          closeCallback={close}
        />
      )
    )
    if (changedRoles) {
      const mutateAbleSystemRole: SystemRoleInput = {
        id: systemRole.id,
        roles: changedRoles
      }
      updateRoleMutate({
        variables: {
          systemRole: mutateAbleSystemRole
        }
      })
    }
  }

  return (
    <>
      <Frame
        header={
          <AppBar
            desktopLeft={<HistoryNavigator />}
            desktopRight={<ProfileMenu key="profileMenu" />}
            mobileLeft={<HistoryNavigator hideForward />}
            mobileTitle={intl.formatMessage(messages.userRoles)}
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
          {!!updateRoleError || (error && <GenericErrorToast />)}
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
                    key={systemRole.id}
                    label={
                      <Label id={`${systemRole.value}_label`}>
                        {getUserSystemRole(
                          { systemRole: systemRole.value },
                          intl
                        )}
                      </Label>
                    }
                    value={
                      <Value id={`${systemRole.value}_value`}>
                        <Stack direction="column" alignItems="stretch" gap={2}>
                          {systemRole.roles.map((role) => (
                            <span key={role._id}>
                              {getUserRole(language, role)}
                            </span>
                          ))}
                        </Stack>
                      </Value>
                    }
                    actions={
                      <Link
                        id="changeButton"
                        key={'change-button-' + systemRole.id}
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

      {roleUpdateSuccess && (
        <Toast type="success" id="updateRoleSuccess" onClose={() => reset()}>
          {intl.formatMessage(messages.systemRoleSuccessMsg)}
        </Toast>
      )}
    </>
  )
}

export default UserRoles
