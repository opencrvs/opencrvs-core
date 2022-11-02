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
import { Content } from '@opencrvs/components/lib/Content'
import { useIntl } from 'react-intl'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { Header } from '@client/components/Header/Header'
import { Plus, VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { WebhookOption } from '@client/utils/gateway'
import {
  Alert,
  CheckboxGroup,
  Divider,
  FormTabs,
  InputField,
  Link,
  Pill,
  Select,
  Spinner,
  Stack,
  TextInput,
  ToggleMenu
} from '@opencrvs/components/lib'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import styled from 'styled-components'
import { Toggle } from '@opencrvs/components/lib/Toggle'
import { EMPTY_STRING } from '@client/utils/constants'
import { connect, useSelector } from 'react-redux'
import { getOfflineData } from '@client/offline/selectors'
import { Text } from '@opencrvs/components/lib/Text'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

const PaddedAlert = styled(Alert)`
  margin-top: 16px;
`
const Label = styled.label`
  margin-top: 5px;
`
const StyledSpinner = styled(Spinner)`
  margin: 10px 0;
`
const Field = styled.div`
  margin-top: 10px;
`
const TextInputField = styled(TextInput)`
  width: 100%;
`
const SelectInputField = styled(Select)`
  width: 100%;
`

export function Integrations() {
  const intl = useIntl()
  const offlineData = useSelector(getOfflineData)
  const [showModal, setToggleModal] = React.useState<boolean>(false)
  const [createClientInfo, setCreateClientInfo] = React.useState<boolean>(true)
  const [generateClientInfo, setGenerateClientInfo] =
    React.useState<boolean>(false)
  const [clientName, setClientName] = React.useState<string>(EMPTY_STRING)
  const [clientType, setClientType] = React.useState<string>(EMPTY_STRING)
  const [selectedTab, setSelectedTab] = React.useState<string>(
    WebhookOption.birth
  )
  const [selectedItems, setSelectedItems] = useState(['registration-details'])
  const [selectedItemsNoPII, setSelectedItemsNoPII] = useState([
    'registration-details-noPII'
  ])
  const [NoPII, setSelected] = React.useState(false)

  const toggleModal = () => {
    setToggleModal((prev) => !prev)
  }

  const changeModalInfo = () => {
    setCreateClientInfo(!createClientInfo)
    setGenerateClientInfo(!generateClientInfo)
  }

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setClientName(value)
  }

  const toggleOnChange = () => {
    setSelected(!NoPII)
  }

  return (
    <Frame
      header={<Header />}
      navigation={<Navigation loadWorkqueueStatuses={false} />}
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        title={intl.formatMessage(integrationMessages.pageTitle)}
        topActionButtons={[
          <Button type="secondary" onClick={toggleModal}>
            <Plus /> {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}

        <ListViewSimplified>
          {offlineData.integrations.map((integration) => (
            <ListViewItemSimplified
              actions={
                <>
                  {integration.status === 'active' ? (
                    <Pill
                      label={intl.formatMessage(integrationMessages.active)}
                      type="active"
                    />
                  ) : (
                    <Pill
                      label={intl.formatMessage(integrationMessages.inactive)}
                      type="inactive"
                    />
                  )}

                  <ToggleMenu
                    id="toggleMenu"
                    menuItems={[
                      {
                        handler: () => {},
                        label: intl.formatMessage(
                          integrationMessages.revealKeys
                        )
                      },
                      {
                        handler: () => {},
                        label:
                          integration.status === 'active'
                            ? intl.formatMessage(integrationMessages.disable)
                            : intl.formatMessage(integrationMessages.enable)
                      },
                      {
                        handler: () => {},
                        label: intl.formatMessage(integrationMessages.delete)
                      }
                    ]}
                    toggleButton={<VerticalThreeDots />}
                  />
                </>
              }
              label={integration.name}
              value="-"
            />
          ))}
        </ListViewSimplified>
      </Content>
      <ResponsiveModal
        actions={[
          <Link onClick={toggleModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </Link>,
          <Button
            disabled={
              clientType === '' || clientName === '' || selectedItems.length < 1
            }
            onClick={changeModalInfo}
            type="primary"
          >
            {intl.formatMessage(buttonMessages.create)}
          </Button>
        ]}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        handleClose={toggleModal}
        title={
          createClientInfo
            ? intl.formatMessage(integrationMessages.createClient)
            : 'Sweet Health'
        }
      >
        {createClientInfo
          ? intl.formatMessage(integrationMessages.supportingDescription)
          : intl.formatMessage(integrationMessages.uniqueKeysDescription)}

        {createClientInfo && (
          <div>
            <Field>
              <InputField
                id="name_of_client"
                touched={false}
                required={true}
                label={intl.formatMessage(integrationMessages.name)}
              >
                <TextInputField
                  id="client_name"
                  type="text"
                  value={clientName}
                  onChange={onChangeText}
                  error={false}
                />
              </InputField>
            </Field>

            <Field>
              <InputField
                id="select-input"
                touched={false}
                label={intl.formatMessage(integrationMessages.type)}
              >
                <SelectInputField
                  onChange={(val: string) => {
                    setClientType(val)
                  }}
                  value={clientType}
                  options={[
                    {
                      label: intl.formatMessage(
                        integrationMessages.healthNotification
                      ),
                      value: 'health-notification'
                    },
                    {
                      label: intl.formatMessage(integrationMessages.mosip),
                      value: 'mosip'
                    },
                    {
                      label: intl.formatMessage(
                        integrationMessages.recordSearch
                      ),
                      value: 'record-search'
                    },
                    {
                      label: intl.formatMessage(integrationMessages.webhook),
                      value: 'webhook'
                    }
                  ]}
                />
              </InputField>
            </Field>

            {clientType === 'health-notification' && (
              <AlertSyled type="info">
                {intl.formatMessage(
                  integrationMessages.healthnotificationAlertDescription
                )}
                <Link
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                  font="bold16"
                >
                  documentation.opencrvs.org
                </Link>
              </AlertSyled>
            )}

            {(clientType === 'mosip' ||
              clientType === 'record-search' ||
              clientType === 'webhook') && (
              <AlertSyled type="info">
                {intl.formatMessage(integrationMessages.otherAlertDescription)}
                {'\n'}
                <Link
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                  font="bold16"
                >
                  documentation.opencrvs.org
                </Link>
              </AlertSyled>
            )}

            {clientType === 'webhook' && (
              <div>
                <InputField
                  id="select-input"
                  touched={false}
                  label={intl.formatMessage(integrationMessages.label)}
                >
                  <Label>
                    {intl.formatMessage(integrationMessages.webhookDescription)}
                  </Label>
                </InputField>
                <FormTabs
                  sections={[
                    {
                      id: WebhookOption.birth,
                      title: intl.formatMessage(integrationMessages.birth)
                    },
                    {
                      id: WebhookOption.death,
                      title: intl.formatMessage(integrationMessages.death)
                    }
                  ]}
                  activeTabId={selectedTab}
                  onTabClick={(tabId) => setSelectedTab(tabId)}
                />
                <Divider />
                {selectedTab === WebhookOption.birth ? (
                  <>
                    <CheckboxGroup
                      id="test-checkbox-group1"
                      options={[
                        {
                          label: intl.formatMessage(
                            integrationMessages.registrationDetails
                          ),
                          value: 'registration-details'
                        },
                        {
                          label: intl.formatMessage(
                            integrationMessages.childDetails
                          ),
                          value: 'child-details'
                        },
                        {
                          label: intl.formatMessage(
                            integrationMessages.motherDetails
                          ),
                          value: 'mothers-details'
                        },
                        {
                          label: intl.formatMessage(
                            integrationMessages.fatherDetails
                          ),
                          value: 'fathers-details'
                        },
                        {
                          label: intl.formatMessage(
                            integrationMessages.informantDetails
                          ),
                          value: 'informant-details'
                        }
                      ]}
                      name="test-checkbox-group1"
                      value={selectedItems}
                      onChange={(newValue) => {
                        setSelectedItems(newValue)
                      }}
                    />
                    <Divider />

                    {NoPII && (
                      <CheckboxGroup
                        id="test-checkbox-group1"
                        options={[
                          {
                            label: intl.formatMessage(
                              integrationMessages.registrationDetailsNoPII
                            ),
                            value: 'registration-details-noPII'
                          },
                          {
                            label: intl.formatMessage(
                              integrationMessages.childDetailsNoPII
                            ),
                            value: 'child-details-noPII'
                          },
                          {
                            label: intl.formatMessage(
                              integrationMessages.motherDetailsNoPII
                            ),
                            value: 'mothers-details-noPII'
                          },
                          {
                            label: intl.formatMessage(
                              integrationMessages.fatherDetailsNoPII
                            ),
                            value: 'fathers-details-noPII'
                          },
                          {
                            label: intl.formatMessage(
                              integrationMessages.informantDetailsNoPII
                            ),
                            value: 'informant-details-noPII'
                          }
                        ]}
                        name="test-checkbox-group1"
                        value={selectedItemsNoPII}
                        onChange={(newValue) => setSelectedItemsNoPII(newValue)}
                      />
                    )}

                    <Stack
                      alignItems="center"
                      direction="row"
                      gap={8}
                      justifyContent="flex-start"
                    >
                      <Toggle
                        defaultChecked={!NoPII}
                        onChange={toggleOnChange}
                      />
                      <div>
                        {intl.formatMessage(integrationMessages.PIIDataLabel)}
                      </div>
                    </Stack>
                  </>
                ) : (
                  <></>
                )}
              </div>
            )}
          </div>
        )}

        {generateClientInfo && (
          <>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientId)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientSecret)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
            <Text variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.shaSecret)}
              <StyledSpinner size={24} id="Spinner" />
            </Text>
          </>
        )}
      </ResponsiveModal>
    </Frame>
  )
}

export const IntegrationList = connect()(Integrations)
