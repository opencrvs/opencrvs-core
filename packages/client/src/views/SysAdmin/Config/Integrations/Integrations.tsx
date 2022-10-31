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
import { messages } from '@client/i18n/messages/views/formConfig'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { Header } from '@client/components/Header/Header'
import { Plus, VerticalThreeDots } from '@client/../../components/lib/icons'
import { WebhookOption } from '@client/utils/gateway'

import {
  Alert,
  CheckboxGroup,
  FormTabs,
  InputField,
  Link,
  Pill,
  Select,
  Spinner,
  TextInput,
  ToggleMenu
} from '@client/../../components/lib'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { Button } from '@client/../../components/lib/Button'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import styled from 'styled-components'
import { LinkButton } from '@client/../../components/lib/buttons'
import { Toggle } from '@client/../../components/lib/Toggle'
import { EMPTY_STRING } from '@client/utils/constants'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}

export function IntegrationList() {
  const intl = useIntl()
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
    setToggleModal((prev: any) => !prev)
  }

  const changeModalInfo = () => {
    setCreateClientInfo(!createClientInfo)
    setGenerateClientInfo(!generateClientInfo)
  }

  const AlertSyled = styled(Alert)`
    --color: rgb(56, 162, 157);
    margin-top: 30px;
    min-height: 5rem;
  `
  const TextInputStyled = styled(TextInput)`
    width: 100%;
  `

  const SelectOptionStyled = styled(Select)`
    width: 100%;
  `
  const DivSection = styled.div`
    margin-top: 20px;
  `

  const Border = styled.div`
    border-top: 1px solid rgb(238, 238, 238);
    height: 20px;
  `

  const Label = styled.div`
    margin-top: 5px;
  `
  const ClientInfoLabel = styled.div`
    color: rgb(0, 0, 0);
    justify-content: left;
  `
  const StyledSpinner = styled(Spinner)`
    margin: 10px 0;
  `

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    if (!value.includes('.') && !/^\d+$/.test(value)) {
      setClientName(value)
    }
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
        title={intl.formatMessage(messages.integrations)}
        topActionButtons={[
          <Button type="secondary" onClick={toggleModal}>
            <Plus /> {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}

        <ListViewSimplified>
          <ListViewItemSimplified
            actions={
              <>
                <Pill label="Active" type="active" />
                <ToggleMenu
                  id="toggleMenu"
                  menuItems={[
                    {
                      handler: () => {},
                      label: intl.formatMessage(integrationMessages.revealKeys)
                    },
                    {
                      handler: () => {},
                      label: intl.formatMessage(integrationMessages.disable)
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
            label="Sweet Health"
            value="Health Integration"
          />
        </ListViewSimplified>
      </Content>
      <ResponsiveModal
        actions={[
          <Link onClick={toggleModal}>
            {' '}
            {intl.formatMessage(buttonMessages.cancel)}
          </Link>,
          <Button
            disabled={
              clientType === '' || clientName === '' || selectedItems === ['']
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
            <DivSection>
              <InputField
                id="name_of_client"
                touched={false}
                required={true}
                label={intl.formatMessage(integrationMessages.name)}
              >
                <TextInputStyled
                  id="client_name"
                  type="text"
                  value={clientName}
                  onChange={onChangeText}
                  error={false}
                />
              </InputField>
            </DivSection>

            <DivSection>
              <InputField
                id="select-input"
                touched={false}
                label={intl.formatMessage(integrationMessages.type)}
              >
                <SelectOptionStyled
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
            </DivSection>

            {clientType === 'health-notification' && (
              <AlertSyled type="warning">
                A notification client (eg. health systems) sends notification of
                birth and death to OpenCRVS for processing. {'\n'}
                Please visit{'\n'}
                <LinkButton
                  style={{ textAlign: 'left', fontWeight: 'bold' }}
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                >
                  documentation.opencrvs.org
                </LinkButton>
              </AlertSyled>
            )}

            {(clientType === 'mosip' ||
              clientType === 'record-search' ||
              clientType === 'webhook') && (
              <AlertSyled type="warning">
                ...Please visit
                <LinkButton
                  style={{ textAlign: 'left', fontWeight: 'bold' }}
                  onClick={() => {
                    window.open('https://documentation.opencrvs.org/', '_blank')
                  }}
                >
                  documentation.opencrvs.org
                </LinkButton>
              </AlertSyled>
            )}

            {clientType === 'webhook' && (
              <DivSection>
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
                <Border></Border>
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
                    <Border></Border>

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
                    <DivSection
                      style={{ display: 'flex', alignItems: 'flex-end' }}
                    >
                      <Toggle
                        defaultChecked={!NoPII}
                        onChange={toggleOnChange}
                      />
                      <Label style={{ marginLeft: 5 }}>
                        {intl.formatMessage(integrationMessages.PIIDataLabel)}
                      </Label>
                    </DivSection>
                  </>
                ) : (
                  <></>
                )}
              </DivSection>
            )}
          </div>
        )}

        {generateClientInfo && (
          <DivSection>
            <ClientInfoLabel>
              Client ID
              <StyledSpinner size={24} id="Spinner" />
            </ClientInfoLabel>
            <ClientInfoLabel>
              Client secret
              <StyledSpinner size={24} id="Spinner" />
            </ClientInfoLabel>
            <ClientInfoLabel>
              SHA secret
              <StyledSpinner size={24} id="Spinner" />
            </ClientInfoLabel>
          </DivSection>
        )}
      </ResponsiveModal>
    </Frame>
  )
}
