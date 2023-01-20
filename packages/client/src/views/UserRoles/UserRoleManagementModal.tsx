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
import { ResponsiveModal, Select, Stack, TextInput } from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { Icon } from '@opencrvs/components/lib/Icon'
import styled from '@client/styledComponents'
import { getAvailableLanguages } from '@client/i18n/utils'
import { useSelector } from 'react-redux'
import { getLanguages } from '@client/i18n/selectors'
import { getUserSystemRole } from '@client/views/SysAdmin/Team/utils'
import { messages } from '@client/i18n/messages/views/config'

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

interface IUserRoleLabel {
  lang: string
  label: string
}

interface IUserRole {
  value: string
  labels: IUserRoleLabel[]
}

interface IUserRoleDetail {
  value: string
  roles: IUserRole[]
  active?: boolean
}

interface IUserRoleManagementModalProps {
  userRolesDetail: IUserRoleDetail
  closeCallback: (result: any) => void
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

export function UserRoleManagementModal(props: IUserRoleManagementModalProps) {
  const [userRoles, setUserRoles] = useState<IUserRole[]>(
    props.userRolesDetail.roles
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
              label: languages[lang].displayName
            }
          ]
        : choices,
    []
  )

  const isRoleUpdateValid = () => {
    if (_.isEqual(userRoles, props.userRolesDetail.roles)) {
      return false
    }
    const inCompleteRoleEntries = userRoles.filter((role, idx) => {
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

  return (
    <ResponsiveModal
      title={
        getUserSystemRole({ systemRole: props.userRolesDetail.value }, intl) ||
        ''
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
            getUserSystemRole(
              { systemRole: props.userRolesDetail.value },
              intl
            ) || ''
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
            <Stack justifyContent="flex-start">
              <StyledTextInput
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
                onBlur={() => {
                  const newActiveItems = [...userRoles.map((e) => true)]
                  setActives(newActiveItems)
                }}
              />
              {actives[index] && (
                <Button
                  type="icon"
                  onClick={() => {
                    const newActiveItems = new Array(userRoles.length).fill(
                      true
                    )
                    newActiveItems[index] = false
                    setActives(newActiveItems)
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
              const newUserRoles = userRoles.map((userRole, idx) => {
                return {
                  ...userRole,
                  labels: userRole.labels.map((label) => {
                    if (label.lang === currentLanguage) {
                      return { ...label }
                    }
                    return label
                  })
                }
              })

              const newLabels = availableLangs.map((lang) => {
                if (lang === currentLanguage) {
                  return {
                    lang: currentLanguage,
                    label: currentClipBoard
                  }
                }
                return { lang: lang, label: '' }
              })

              newUserRoles.push({
                value: 'new',
                labels: newLabels
              })
              setUserRoles(newUserRoles)
              setCurrentClipBoard('')
              const newActiveItems = new Array(userRoles.length).fill(false)
              setActives(newActiveItems)
            }}
          >
            <Icon name="Plus" color="primary" />
          </Button>
        </Stack>
      </Stack>
    </ResponsiveModal>
  )
}
