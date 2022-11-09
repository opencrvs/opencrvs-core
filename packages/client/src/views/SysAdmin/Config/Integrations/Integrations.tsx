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
import React, { useCallback, useState, useEffect } from 'react'
import { Content } from '@opencrvs/components/lib/Content'
import { useIntl } from 'react-intl'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Navigation } from '@client/components/interface/Navigation'
import { Header } from '@client/components/Header/Header'
import { Plus, VerticalThreeDots } from '@opencrvs/components/lib/icons'
import {
  Alert,
  InputField,
  Link,
  Pill,
  Select,
  Spinner,
  TextInput,
  ToggleMenu,
  Toast,
  Stack
} from '@opencrvs/components/lib'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { Button } from '@opencrvs/components/lib/Button'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { EMPTY_STRING } from '@client/utils/constants'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import styled from 'styled-components'
import { connect, useSelector, useDispatch } from 'react-redux'
import { gql } from '@apollo/client'
import { updateOfflineIntegrations } from '@client/offline/actions'
import { Mutation } from '@apollo/client/react/components'
import { Integration } from '@client/utils/referenceApi'
import { getOfflineData } from '@client/offline/selectors'
import { Text } from '@opencrvs/components/lib/Text'
import { Icon } from '@opencrvs/components/lib/Icon'

export const statuses = {
  PENDING: 'pending',
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEACTIVATED: 'deactivated'
}
export enum NOTIFICATION_STATUS {
  SUCCESS = 'success',
  IDLE = 'idle',
  IN_PROGRESS = 'inProgress',
  ERROR = 'error'
}
export interface IntegrationType {
  client_id: string
  name: string
  sha_secret: string
  status: string
}

interface ToggleModal {
  modalVisible: boolean
  selectedClient: Integration | null
}
type Secret = {
  client_id: string
  client_secret: string
  sha_secret: string
  name: string
  status: string
}
const TopText = styled(Text)`
  margin-top: 20px;
`
const ButtonLink = styled(Link)`
  text-align: left;
`

export const registerSystemClient = gql`
  mutation registerSystemClient($clientDetails: ClientRegistrationPayload) {
    registerSystemClient(clientDetails: $clientDetails) {
      client_id
      client_secret
      sha_secret
      name
      status
    }
  }
`

export const deactivateClient = gql`
  mutation deactivateSystemClient($clientDetails: ClientPayload) {
    deactivateSystemClient(clientDetails: $clientDetails) {
      status
      _id
      username
      client_id
    }
  }
`
export const activateClient = gql`
  mutation reactivateSystemClient($clientDetails: ClientPayload) {
    reactivateSystemClient(clientDetails: $clientDetails) {
      status
      _id
      username
      client_id
    }
  }
`

const PaddedAlert = styled(Alert)`
  margin-top: 16px;
`

const StyledSpinner = styled(Spinner)`
  margin: 10px 0;
`
const Field = styled.div`
  margin-top: 16px;
`
/* TODO: Note, dispatch an action when create client is successful
using the action in ocrvs-3595 UpdateOfflineIntegrationsAction
*/
export function Integrations() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineData = useSelector(getOfflineData)
  const [createClientInfo, setCreateClientInfo] = React.useState<boolean>(true)
  const [generateClientInfo, setGenerateClientInfo] =
    React.useState<boolean>(false)
  const [clientName, setClientName] = React.useState<string>(EMPTY_STRING)
  const [clientType, setClientType] = React.useState<string>(EMPTY_STRING)
  const [showModal, setShowModal] = React.useState<boolean>(false)
  const [confirmModal, setConfirmModal] = React.useState<boolean>(false)
  const [secretAvailable, setSecretAvailable] = React.useState<boolean>(false)
  const [clientSecret, setClientSecret] = React.useState<Secret>()
  const [clientId, setClientId] = useState('')
  const [clientStatus, setClientStatus] = useState('')
  const [toggleKeyModal, setToggleKeyModal] = useState<ToggleModal>({
    modalVisible: false,
    selectedClient: null
  })

  const [notificationStatus, setNotificationStatus] = useState(
    NOTIFICATION_STATUS.IDLE
  )
  useEffect(() => {
    setSecretAvailable(true)
  }, [clientSecret])
  const toggleModal = () => {
    setShowModal((prev) => !prev)
  }

  const clearSecret = () => {
    setClientName(EMPTY_STRING)
    setClientType(EMPTY_STRING)
    setSecretAvailable(false)
    setGenerateClientInfo(false)
    setCreateClientInfo(true)
  }

  const changeModalInfo = async (mutation: () => any) => {
    await mutation().then((data: any) => {
      setClientSecret(data.data.registerSystemClient)
      dispatchNewIntegration()
    })
    setCreateClientInfo(!createClientInfo)
    setGenerateClientInfo(!generateClientInfo)
  }

  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setClientName(value)
  }

  /* TODO: Note, webhooks will be amended in OCRVS-4160

  const [NoPII, setSelected] = React.useState(false)
  const [selectedTab, setSelectedTab] = React.useState<string>(
    WebhookOption.birth
  )
  const [selectedItems, setSelectedItems] = useState(['registration-details'])
  const [selectedItemsNoPII, setSelectedItemsNoPII] = useState([
    'registration-details-noPII'
  ])
  const toggleOnChange = () => {
    setSelected(!NoPII)
  }

  */

  function returnLabelText(status: string) {
    if (status === statuses.DEACTIVATED) {
      return intl.formatMessage(integrationMessages.activate)
    } else {
      return intl.formatMessage(integrationMessages.deactivate)
    }
  }

  const toggleRevealKeyModal = useCallback(
    function toggleRevealKeyModal(integration?: Integration) {
      if (integration !== undefined) {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: true,
          selectedClient: integration
        })
      } else {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: false
        })
      }
    },
    [toggleKeyModal]
  )

  function showSuccessToast() {
    setShowModal(false)
    setNotificationStatus(NOTIFICATION_STATUS.SUCCESS)
    dispatchChanges()
  }
  function dispatchChanges() {
    const integrations = offlineData.integrations.map(
      (integration: Integration) => {
        if (integration.client_id === clientId) {
          if (clientStatus === statuses.DEACTIVATED) {
            integration = { ...integration, status: statuses.ACTIVE }
          } else {
            integration = { ...integration, status: statuses.DEACTIVATED }
          }
          return integration
        }
        return integration
      }
    )
    dispatch(updateOfflineIntegrations({ integrations }))
  }
  function dispatchNewIntegration() {
    if (clientSecret?.sha_secret && clientSecret?.client_id) {
      const integrations = [
        ...offlineData.integrations,
        {
          name: clientName,
          status: 'active',
          sha_secret: clientSecret?.sha_secret,
          client_id: clientSecret?.client_id
        }
      ]
      dispatch(updateOfflineIntegrations({ integrations }))
    }
  }
  function showErrorToast() {
    setShowModal(false)
    setNotificationStatus(NOTIFICATION_STATUS.ERROR)
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
          <Button type="secondary" onClick={() => setShowModal(true)}>
            <Plus /> {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}
        <ListViewSimplified>
          {offlineData.integrations.map((integration: Integration) => (
            <ListViewItemSimplified
              key={integration.client_id}
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
                        handler: () => {
                          toggleRevealKeyModal(integration)
                        },
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
                        handler: () => {
                          setConfirmModal(!confirmModal)
                          setClientId(integration.client_id)
                          setClientStatus(integration.status)
                        },
                        label: returnLabelText(integration.status)
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
          {notificationStatus !== NOTIFICATION_STATUS.IDLE && (
            <>
              <Toast
                type={
                  notificationStatus === NOTIFICATION_STATUS.SUCCESS
                    ? 'success'
                    : notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                    ? 'loading'
                    : 'error'
                }
                duration={3000}
                id="toggleClientStatusToast"
                onClose={() => setNotificationStatus(NOTIFICATION_STATUS.IDLE)}
              >
                {notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
                  ? intl.formatMessage(integrationMessages.loading)
                  : notificationStatus === NOTIFICATION_STATUS.SUCCESS &&
                    clientStatus === statuses.ACTIVE
                  ? intl.formatMessage(
                      integrationMessages.deactivateClientStatus
                    )
                  : notificationStatus === NOTIFICATION_STATUS.SUCCESS &&
                    clientStatus === statuses.DEACTIVATED
                  ? intl.formatMessage(integrationMessages.activateClientStatus)
                  : intl.formatMessage(integrationMessages.error)}
              </Toast>
            </>
          )}
          {confirmModal && (
            <ResponsiveModal
              title={
                clientStatus === statuses.ACTIVE
                  ? intl.formatMessage(integrationMessages.deactivateClient)
                  : intl.formatMessage(integrationMessages.activateClient)
              }
              contentHeight={50}
              responsive={false}
              actions={[
                <TertiaryButton
                  id="cancel"
                  key="cancel"
                  onClick={() => setConfirmModal(!confirmModal)}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </TertiaryButton>,

                <Mutation
                  mutation={
                    clientStatus === statuses.ACTIVE
                      ? deactivateClient
                      : activateClient
                  }
                  variables={{
                    clientDetails: {
                      client_id: clientId
                    }
                  }}
                  onCompleted={() => {
                    showSuccessToast()
                    setConfirmModal(false)
                  }}
                  onError={() => {
                    showErrorToast()
                  }}
                >
                  {(toggleClientStatus: any) => {
                    return (
                      <PrimaryButton
                        key="confirm"
                        id="confirm"
                        onClick={() => {
                          toggleClientStatus()
                        }}
                      >
                        {intl.formatMessage(buttonMessages.confirm)}
                      </PrimaryButton>
                    )
                  }}
                </Mutation>
              ]}
              show={true}
              handleClose={() => setConfirmModal(!confirmModal)}
            >
              {clientStatus === statuses.ACTIVE
                ? intl.formatMessage(integrationMessages.deactivateClientText)
                : intl.formatMessage(integrationMessages.activateClientText)}
            </ResponsiveModal>
          )}
        </ListViewSimplified>

        <ResponsiveModal
          actions={[
            <Link onClick={() => toggleRevealKeyModal()}>
              {intl.formatMessage(buttonMessages.cancel)}
            </Link>
          ]}
          autoHeight={true}
          titleHeightAuto={true}
          show={toggleKeyModal.modalVisible}
          handleClose={() => toggleRevealKeyModal()}
          title={toggleKeyModal.selectedClient?.name ?? ''}
        >
          {intl.formatMessage(integrationMessages.uniqueKeysDescription)}

          <>
            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientId)}{' '}
            </TopText>
            <Text variant="reg16" element="p">
              {' '}
              {toggleKeyModal.selectedClient?.client_id}
            </Text>

            <TopText variant="bold16" element="span">
              {' '}
              {intl.formatMessage(integrationMessages.clientSecret)}
            </TopText>
            <ButtonLink>
              {intl.formatMessage(buttonMessages.refresh)}
            </ButtonLink>

            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.shaSecret)}
            </TopText>
            <Text variant="reg16" element="p">
              {toggleKeyModal.selectedClient?.sha_secret}
            </Text>
          </>
        </ResponsiveModal>
      </Content>
      <ResponsiveModal
        actions={[
          <Link
            onClick={() => {
              toggleModal()
              clearSecret()
            }}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Link>,
          <Mutation
            mutation={registerSystemClient}
            variables={{
              clientDetails: {
                scope: 'NATIONAL_ID',
                name: [{ use: 'en', family: clientName }],
                settings: {
                  dailyQuota: 50
                }
              }
            }}
            onCompleted={() => {}}
            onError={() => {}}
          >
            {(registerSystemClient: any) => {
              return (
                <Button
                  disabled={clientType === '' || clientName === ''}
                  onClick={() => {
                    changeModalInfo(registerSystemClient)
                  }}
                  type="primary"
                >
                  {intl.formatMessage(buttonMessages.create)}
                </Button>
              )
            }}
          </Mutation>
        ]}
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        handleClose={() => {
          toggleModal()
          clearSecret()
        }}
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
          <>
            <Field>
              <InputField
                id="name_of_client"
                touched={false}
                required={true}
                label={intl.formatMessage(integrationMessages.name)}
              >
                <TextInput
                  id="client_name"
                  type="text"
                  value={clientName}
                  onChange={onChangeText}
                  error={false}
                  inputFieldWidth="100%"
                />
              </InputField>
            </Field>

            <Field>
              <InputField
                id="select-input"
                touched={false}
                label={intl.formatMessage(integrationMessages.type)}
              >
                <Select
                  ignoreMediaQuery
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
                    }
                    /* TODO: Note, this will be amended in OCRVS-4160
                    {
                      label: intl.formatMessage(integrationMessages.webhook),
                      value: 'webhook'
                    } */
                  ]}
                />
              </InputField>
            </Field>

            {clientType === 'health-notification' && (
              <PaddedAlert type="info">
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
              </PaddedAlert>
            )}

            {(clientType === 'mosip' ||
              clientType === 'record-search' ||
              clientType === 'webhook') && (
              <PaddedAlert type="info">
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
              </PaddedAlert>
            )}

            {/* TODO: Note, webhooks will be amended in OCRVS-4160
            clientType === 'webhook' && (
              <>
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
              </>
                )*/}
          </>
        )}

        {generateClientInfo && !secretAvailable && (
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

        {clientSecret && secretAvailable && (
          <>
            <Stack alignItems="flex-start" direction="column" gap={16}>
              <Stack alignItems="flex-start" direction="column" gap={8}>
                <Text variant="bold16" element="span">
                  {intl.formatMessage(integrationMessages.clientId)}
                </Text>
                <Stack
                  alignItems="center"
                  direction="row"
                  gap={8}
                  justifyContent="space-between"
                >
                  <Text variant="reg16" element="span">
                    {clientSecret.client_id}
                  </Text>
                  <Icon color="primary" name="Globe" size="small" />
                  <Text variant="reg16" color={'primary'} element="span">
                    {intl.formatMessage(integrationMessages.copy)}
                  </Text>
                </Stack>
              </Stack>
              <Stack alignItems="flex-start" direction="column" gap={8}>
                <Text variant="bold16" element="span">
                  {intl.formatMessage(integrationMessages.clientSecret)}
                </Text>
                <Stack
                  alignItems="center"
                  direction="row"
                  gap={8}
                  justifyContent="space-between"
                >
                  <Text variant="reg16" element="span">
                    {clientSecret.client_secret}
                  </Text>
                  <Icon color="primary" name="Globe" size="small" />
                  <Text variant="reg16" color={'primary'} element="span">
                    {intl.formatMessage(integrationMessages.copy)}
                  </Text>
                </Stack>
              </Stack>
              <Stack alignItems="flex-start" direction="column" gap={8}>
                <Text variant="bold16" element="span">
                  {intl.formatMessage(integrationMessages.shaSecret)}
                </Text>
                <Stack
                  alignItems="center"
                  direction="row"
                  gap={8}
                  justifyContent="space-between"
                >
                  <Text variant="reg16" element="span">
                    {clientSecret.sha_secret}
                  </Text>
                  <Icon color="primary" name="Globe" size="small" />
                  <Text variant="reg16" color={'primary'} element="span">
                    {intl.formatMessage(integrationMessages.copy)}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </>
        )}
      </ResponsiveModal>
    </Frame>
  )
}
export const IntegrationList = connect()(Integrations)
