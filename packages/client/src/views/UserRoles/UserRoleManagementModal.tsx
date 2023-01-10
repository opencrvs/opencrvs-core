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

import React, { useState } from 'react'
import { Text } from '@opencrvs/components/lib/Text'
import { ResponsiveModal, Stack, TextInput } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { Icon } from '@opencrvs/components/lib/Icon'
import styled from '@client/styledComponents'

const StyledTextInput = styled(TextInput)`
  ${({ theme }) => theme.fonts.reg14};
  height: 40px;
  border: solid 1px ${({ theme }) => theme.colors.grey600};
  align-self: center;
  :disabled {
    border-color: ${({ theme }) => theme.colors.grey300};
    color: ${({ theme }) => theme.colors.grey500};
  }
`

interface IUserRole {
  lang: string
  label: string
}

interface IUserRoleDetail {
  value: string
  roles: IUserRole[]
  active: boolean
}

interface IUserRoleManagementModalProps {
  userRolesDetail: IUserRoleDetail
  closeCallback: (result: any) => void
}

export function UserRoleManagementModal(props: IUserRoleManagementModalProps) {
  const [userRoles, setUserRoles] = useState<IUserRole[]>(
    props.userRolesDetail.roles
  )

  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [currentClipBoard, setCurrentClipBoard] = useState<string>('')
  const intl = useIntl()
  const [actives, setActives] = useState(new Array(userRoles.length).fill(true))

  return (
    <ResponsiveModal
      title={props.userRolesDetail.value}
      autoHeight
      responsive={false}
      actions={[
        <Button
          type="tertiary"
          id="cancel"
          key="cancel"
          onClick={() => {
            props.closeCallback(null)
          }}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </Button>,
        <Button
          type="primary"
          key="confirm"
          id="confirm"
          onClick={() => {
            props.closeCallback(userRoles)
          }}
        >
          {intl.formatMessage(buttonMessages.confirm)}
        </Button>
      ]}
      show={true}
      handleClose={() => props.closeCallback(null)}
    >
      <Text variant="reg16" element="p" color="grey500">
        Add the roles to be assigned the system role of Field Agent
      </Text>

      <Stack direction="column" alignItems="stretch">
        {userRoles
          .filter((item, index) => item.lang === currentLanguage)
          .map((item, index) => {
            return (
              <Stack justifyContent="flex-start">
                <StyledTextInput
                  value={item.label}
                  isDisabled={actives[index]}
                  focusInput={!actives[index]}
                  onChange={(e) => {
                    console.log(actives)
                    // setUserRoles([
                    //   ...userRoles,
                    //   {
                    //     lang: 'en',
                    //     label: e.target.value
                    //   }
                    // ])
                  }}
                  onBlur={() => {
                    const dupactve = [...userRoles.map((e) => true)]
                    setActives(dupactve)
                  }}
                />
                {actives[index] && (
                  <Button
                    type="icon"
                    onClick={() => {
                      const dupactve = new Array(userRoles.length).fill(true)
                      dupactve[index] = false
                      setActives(dupactve)
                      console.log(actives)
                      // setUserRoles([
                      //   ...userRoles,
                      //   {
                      //     lang: 'en',
                      //     label: currentClipBoard
                      //   }
                      // ])
                      // setCurrentClipBoard('')
                    }}
                  >
                    <Icon name="Edit" color="primary" />
                  </Button>
                )}
              </Stack>
            )
          })}

        <Stack justifyContent="flex-start">
          <StyledTextInput
            placeholder="Add new role here"
            value={currentClipBoard}
            onChange={(e) => {
              setCurrentClipBoard(e.target.value)
            }}
          />
          <Button
            disabled={!currentClipBoard}
            type="icon"
            onClick={() => {
              setUserRoles([
                ...userRoles,
                {
                  lang: currentLanguage,
                  label: currentClipBoard
                }
              ])
              setCurrentClipBoard('')
            }}
          >
            <Icon name="Plus" color="primary" />
          </Button>
        </Stack>
      </Stack>
    </ResponsiveModal>
  )
}
