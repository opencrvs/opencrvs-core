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

import React, { useState } from 'react'
import { Text } from '@opencrvs/components/lib/Text'
import { ResponsiveModal, Select, Stack, TextInput } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { Icon } from '@opencrvs/components/lib/Icon'
import styled from 'styled-components'
import { getAvailableLanguages } from '@client/i18n/utils'
import { useSelector } from 'react-redux'
import { getLanguages } from '@client/i18n/selectors'
import { getUserSystemRole } from '@client/views/SysAdmin/Team/utils'
import { messages } from '@client/i18n/messages/views/config'
import _ from 'lodash'
import {
  ISystemRole,
  RolesInput
} from '@client/views/SysAdmin/Config/UserRoles/UserRoles'

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

interface ILanguageOptions {
  [key: string]: string
}

interface IProps {
  systemRole: ISystemRole
  closeCallback: (result: RolesInput | null) => void
}

const LanguageSelect = styled(Select)`
  width: 175px;
  border-radius: 2px;

  .react-select__control {
    max-height: 32px;
    min-height: 32px;
  }

  .react-select__value-container {
    display: block;
  }

  div {
    ${({ theme }) => theme.fonts.reg14};
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`

function stripTypenameFromRoles(roles: ISystemRole['roles']) {
  return roles.map(({ __typename, ...rest }) => ({
    ...rest,
    labels: rest.labels.map(({ __typename, ...rest }) => rest)
  }))
}

export function UserRoleManagementModal(props: IProps) {
  const [userRoles, setUserRoles] = useState<RolesInput>(
    stripTypenameFromRoles(props.systemRole.roles)
  )
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [currentClipBoard, setCurrentClipBoard] = useState<string>('')
  const intl = useIntl()
  const [actives, setActives] = useState(new Array(userRoles.length).fill(true))

  const availableLangs = getAvailableLanguages()
  const languages = useSelector(getLanguages)
  const langChoice = availableLangs.reduce<ILanguageOptions[]>(
    (choices, lang) =>
      languages[lang]
        ? [
            ...choices,
            {
              value: lang,
              label: intl.formatMessage(messages.language, {
                language: languages[lang].lang
              })
            }
          ]
        : choices,
    []
  )

  const isRoleUpdateValid = () => {
    if (_.isEqual(userRoles, stripTypenameFromRoles(props.systemRole.roles))) {
      return false
    }
    const inCompleteRoleEntries = userRoles.filter((role) => {
      for (const label of role.labels) {
        if (label.label === '') {
          return true
        }
      }
      return false
    })

    if (inCompleteRoleEntries.length > 0) {
      return false
    }
    return true
  }

  const updateRole = () => {
    const newLabels = availableLangs.map((lang) => {
      if (lang === currentLanguage) {
        return {
          lang: currentLanguage,
          label: currentClipBoard
        }
      }
      return { lang: lang, label: '' }
    })

    setUserRoles([...userRoles, { labels: newLabels }])
    setCurrentClipBoard('')
    setActives(new Array(userRoles.length).fill(false))
  }

  return (
    <ResponsiveModal
      key={props.systemRole.id}
      title={
        getUserSystemRole({ systemRole: props.systemRole.value }, intl) || ''
      }
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
          disabled={!isRoleUpdateValid()}
          onClick={() => {
            props.closeCallback(userRoles)
          }}
        >
          {intl.formatMessage(buttonMessages.apply)}
        </Button>
      ]}
      show={true}
      handleClose={() => props.closeCallback(null)}
    >
      <Text variant="reg16" element="p" color="grey500">
        {intl.formatMessage(messages.roleUpdateInstruction, {
          systemRole:
            getUserSystemRole({ systemRole: props.systemRole.value }, intl) ||
            ''
        })}
      </Text>

      <Stack direction="column" alignItems="stretch">
        <LanguageSelect
          id="SelectLanguage"
          onChange={(val: string) => {
            setCurrentLanguage(val)
          }}
          value={currentLanguage}
          options={langChoice}
          placeholder=""
        />
        {userRoles.map((item, index) => {
          return (
            <Stack
              key={item._id ?? `new-role-${index}`}
              justifyContent="flex-start"
            >
              <StyledTextInput
                id="roleNameInput"
                value={
                  item.labels.find((e) => e.lang === currentLanguage)?.label ||
                  ''
                }
                isDisabled={actives[index]}
                focusInput={!actives[index]}
                onChange={(e) => {
                  const newUserRoles = userRoles.map((userRole, idx) => {
                    if (index !== idx) return userRole
                    return {
                      ...userRole,
                      labels: userRole.labels.map((label) => {
                        if (label.lang === currentLanguage) {
                          return { ...label, label: e.target.value }
                        }
                        return label
                      })
                    }
                  })
                  setUserRoles(newUserRoles)
                }}
                onBlur={() =>
                  setActives(new Array(userRoles.length).fill(true))
                }
              />
              {actives[index] && !item._id && (
                <Button
                  id="editButton"
                  type="icon"
                  onClick={() => {
                    const newActiveItems = new Array(userRoles.length).fill(
                      true
                    )
                    newActiveItems[index] = false
                    setActives(newActiveItems)
                  }}
                >
                  <Icon name="Pencil" color="primary" />
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
          <Button disabled={!currentClipBoard} type="icon" onClick={updateRole}>
            <Icon name="Plus" color="primary" />
          </Button>
        </Stack>
      </Stack>
    </ResponsiveModal>
  )
}
