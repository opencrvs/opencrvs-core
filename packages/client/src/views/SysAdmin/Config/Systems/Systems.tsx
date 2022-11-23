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
import { Header } from '@client/components/Header/Header'
import { Navigation } from '@client/components/interface/Navigation'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import { integrationMessages } from '@client/i18n/messages/views/integrations'
import { EMPTY_STRING } from '@client/utils/constants'
import { System, SystemStatus, SystemType } from '@client/utils/gateway'
import { Label } from '@client/views/Settings/items/components'
import {
  Alert,
  CheckboxGroup,
  Divider,
  InputField,
  Link,
  Pill,
  Select,
  Spinner,
  Stack,
  TextInput,
  Toast,
  ToggleMenu
} from '@opencrvs/components'
import { Button } from '@opencrvs/components/lib/Button'
import { Content } from '@opencrvs/components/lib/Content'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import { Frame } from '@opencrvs/components/lib/Frame'
import { Icon } from '@opencrvs/components/lib/Icon'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { Text } from '@opencrvs/components/lib/Text'

import React, { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useSystems } from './useSystems'

interface ToggleModal {
  modalVisible: boolean
  selectedClient: System | null
}

const TopText = styled(Text)`
  margin-top: 20px;
`
const ButtonLink = styled(Link)`
  text-align: left;
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

export enum WebhookOption {
  birth = 'BIRTH',
  death = 'DEATH'
}

export interface WebHookSetting {
  event: string
  permissions: string[]
}

export function SystemList() {
  const intl = useIntl()
  const [showModal, setShowModal] = React.useState(false)
  const [toggleKeyModal, setToggleKeyModal] = useState<ToggleModal>({
    modalVisible: false,
    selectedClient: null
  })

  const [selectedTab, setSelectedTab] = React.useState(WebhookOption.birth)

  const [showPermission, setPermission] = React.useState(false)

  const checkboxHandler = (items: string[], type: string) => {
    const val: WebHookSetting = {
      event: type,
      permissions: items
    }
    type === WebhookOption.birth
      ? setBirthPermissions(val)
      : setDeathPermissions(val)
  }

  const sysType = {
    HEALTH: intl.formatMessage(integrationMessages.healthSystem),
    NATIONAL_ID: intl.formatMessage(integrationMessages.mosip),
    RECORD_SEARCH: intl.formatMessage(integrationMessages.recordSearch),
    WEBHOOK: intl.formatMessage(integrationMessages.webhook)
  }

  const toggleModal = () => {
    setShowModal((prev) => !prev)
  }

  const {
    birthPermissions,
    setBirthPermissions,
    deathPermissions,
    setDeathPermissions,
    existingSystems,
    deactivateSystem,
    systemToToggleActivation,
    setSystemToToggleActivation,
    activateSystem,
    registerSystem,
    registerSystemData,
    newClientName,
    newSystemType,
    setNewSystemType,
    onChangeClientName,
    activateSystemLoading,
    deactivateSystemLoading,
    registerSystemLoading,
    registerSystemError,
    activateSystemData,
    deactivateSystemData,
    activateSystemError,
    deactivateSystemError,
    clearNewSystemDraft,
    resetData,
    shouldWarnAboutNationalId
  } = useSystems()

  function changeActiveStatusIntl(status: SystemStatus) {
    if (status !== SystemStatus.Active) {
      return intl.formatMessage(integrationMessages.activate)
    } else {
      return intl.formatMessage(integrationMessages.deactivate)
    }
  }

  const toggleRevealKeyModal = useCallback(
    function toggleRevealKeyModal(system?: System) {
      if (system !== undefined) {
        setToggleKeyModal({
          ...toggleKeyModal,
          modalVisible: true,
          selectedClient: system
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

  const getMenuItems = (system: System) => {
    const menuItems: { handler: () => void; label: string }[] = [
      {
        handler: () => {
          toggleRevealKeyModal(system)
        },
        label: intl.formatMessage(integrationMessages.revealKeys)
      }
    ]

    if (system.type === SystemType.Webhook) {
      menuItems.push({
        handler: () => {
          setPermission((prevState) => !prevState)
        },
        label: 'Edit '
      })
    }

    menuItems.push({
      handler: () => {
        setSystemToToggleActivation(system)
      },
      label: changeActiveStatusIntl(system.status)
    })

    menuItems.push({
      handler: () => {},
      label: intl.formatMessage(integrationMessages.delete)
    })

    return menuItems
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
            <Icon name="Plus" />
            {intl.formatMessage(integrationMessages.createClient)}
          </Button>
        ]}
      >
        {intl.formatMessage(integrationMessages.pageIntroduction)}

        <ListViewSimplified>
          {existingSystems.map((system: System) => (
            <ListViewItemSimplified
              key={system.clientId}
              actions={
                <>
                  {system.status === SystemStatus.Active ? (
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
                    menuItems={getMenuItems(system)}
                    toggleButton={<VerticalThreeDots />}
                  />
                </>
              }
              label={system.name}
              value={sysType[system.type]}
            />
          ))}

          {showPermission && (
            <ResponsiveModal
              actions={[
                <Button
                  onClick={() => {
                    setPermission(false)
                  }}
                  type="primary"
                >
                  Submit
                </Button>,
                <Button
                  onClick={() => {
                    setPermission(false)
                  }}
                  type="secondary"
                >
                  Cancel
                </Button>
              ]}
              show={showPermission}
              handleClose={() => {
                setPermission(false)
              }}
              title="Webhook"
              autoHeight={true}
              titleHeightAuto={true}
            >
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
                  onTabClick={(tabId: WebhookOption) => setSelectedTab(tabId)}
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
                      value={birthPermissions.permissions ?? []}
                      onChange={(newValue) => {
                        console.log('new val', newValue)
                        checkboxHandler(newValue, WebhookOption.birth)
                      }}
                    />
                  </>
                ) : (
                  <>
                    <CheckboxGroup
                      id="test-checkbox-group2"
                      options={[
                        {
                          label: intl.formatMessage(
                            integrationMessages.registrationDetails
                          ),
                          value: 'registration-details'
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
                        },
                        {
                          label: 'Disease Details',
                          value: 'disease-details'
                        }
                      ]}
                      name="test-checkbox-group1"
                      value={deathPermissions.permissions ?? []}
                      onChange={(newValue) => {
                        checkboxHandler(newValue, WebhookOption.death)
                      }}
                    />
                  </>
                )}
              </>
            </ResponsiveModal>
          )}

          {systemToToggleActivation && (
            <ResponsiveModal
              title={
                systemToToggleActivation.status === SystemStatus.Active
                  ? intl.formatMessage(integrationMessages.deactivateClient)
                  : intl.formatMessage(integrationMessages.activateClient)
              }
              contentHeight={50}
              responsive={false}
              actions={[
                <Button
                  type="tertiary"
                  id="cancel"
                  key="cancel"
                  onClick={() => {
                    setSystemToToggleActivation(undefined)
                  }}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </Button>,

                systemToToggleActivation.status === SystemStatus.Active ? (
                  <Button
                    type="primary"
                    key="confirm"
                    id="confirm"
                    loading={deactivateSystemLoading}
                    onClick={() => {
                      deactivateSystem()
                    }}
                  >
                    {intl.formatMessage(buttonMessages.confirm)}
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    key="confirm"
                    id="confirm"
                    loading={activateSystemLoading}
                    onClick={() => {
                      activateSystem()
                    }}
                  >
                    {intl.formatMessage(buttonMessages.confirm)}
                  </Button>
                )
              ]}
              show={true}
              handleClose={() => setSystemToToggleActivation(undefined)}
            >
              {systemToToggleActivation.status === SystemStatus.Active
                ? intl.formatMessage(integrationMessages.deactivateClientText)
                : intl.formatMessage(integrationMessages.activateClientText)}
            </ResponsiveModal>
          )}
        </ListViewSimplified>

        <ResponsiveModal
          actions={[
            <Link
              onClick={() => {
                toggleRevealKeyModal()
                resetData()
              }}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </Link>
          ]}
          autoHeight={true}
          titleHeightAuto={true}
          show={toggleKeyModal.modalVisible}
          handleClose={() => {
            toggleRevealKeyModal()
            resetData()
          }}
          title={toggleKeyModal.selectedClient?.name ?? ''}
        >
          {intl.formatMessage(integrationMessages.uniqueKeysDescription)}

          <Stack direction="column" alignItems="flex-start">
            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientId)}
            </TopText>
            <Text variant="reg16" element="span">
              {toggleKeyModal.selectedClient?.clientId}
            </Text>
          </Stack>

          <Stack direction="column" alignItems="flex-start">
            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.clientSecret)}
            </TopText>
            <ButtonLink>
              {intl.formatMessage(buttonMessages.refresh)}
            </ButtonLink>
          </Stack>

          <Stack direction="column" alignItems="flex-start">
            <TopText variant="bold16" element="span">
              {intl.formatMessage(integrationMessages.shaSecret)}
            </TopText>
            <Text variant="reg16" element="span">
              {toggleKeyModal.selectedClient?.shaSecret}
            </Text>
          </Stack>
        </ResponsiveModal>
      </Content>
      <ResponsiveModal
        actions={
          registerSystemData
            ? []
            : [
                <Link
                  onClick={() => {
                    toggleModal()
                    clearNewSystemDraft()
                    resetData()
                  }}
                >
                  {intl.formatMessage(buttonMessages.cancel)}
                </Link>,
                <Button
                  disabled={
                    !newSystemType ||
                    newClientName === EMPTY_STRING ||
                    shouldWarnAboutNationalId
                  }
                  onClick={() => {
                    registerSystem(birthPermissions, deathPermissions)
                  }}
                  type="primary"
                >
                  {intl.formatMessage(buttonMessages.create)}
                </Button>
              ]
        }
        autoHeight={true}
        titleHeightAuto={true}
        show={showModal}
        handleClose={() => {
          toggleModal()
          clearNewSystemDraft()
          resetData()
        }}
        title={
          registerSystemData?.registerSystem?.system.name ??
          intl.formatMessage(integrationMessages.createClient)
        }
      >
        <Text variant="reg16" element="p">
          {!registerSystemData && !registerSystemLoading
            ? intl.formatMessage(integrationMessages.newIntegrationDescription)
            : intl.formatMessage(integrationMessages.uniqueKeysDescription)}
        </Text>

        {!registerSystemData && !registerSystemLoading && (
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
                  value={newClientName}
                  onChange={onChangeClientName}
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
                  onChange={(val) => {
                    setNewSystemType(val as SystemType)
                  }}
                  value={newSystemType ?? SystemType.Health}
                  options={[
                    {
                      label: intl.formatMessage(
                        integrationMessages.healthNotification
                      ),
                      value: SystemType.Health
                    },
                    {
                      label: intl.formatMessage(integrationMessages.mosip),
                      value: SystemType.NationalId
                    },
                    {
                      label: intl.formatMessage(
                        integrationMessages.recordSearch
                      ),
                      value: SystemType.RecordSearch
                    },
                    {
                      label: intl.formatMessage(integrationMessages.webhook),
                      value: SystemType.Webhook
                    }
                  ]}
                />
              </InputField>
            </Field>

            {shouldWarnAboutNationalId && (
              <PaddedAlert type="error">
                {intl.formatMessage(integrationMessages.onlyOneNationalIdError)}
              </PaddedAlert>
            )}

            {newSystemType === SystemType.Health && (
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

            {(newSystemType === SystemType.NationalId ||
              newSystemType === SystemType.RecordSearch) && (
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

            {newSystemType === SystemType.Webhook && (
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
                  onTabClick={(tabId: WebhookOption) => setSelectedTab(tabId)}
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
                      value={birthPermissions.permissions ?? []}
                      onChange={(newValue) => {
                        checkboxHandler(newValue, WebhookOption.birth)
                      }}
                    />
                  </>
                ) : (
                  <>
                    <CheckboxGroup
                      id="test-checkbox-group2"
                      options={[
                        {
                          label: intl.formatMessage(
                            integrationMessages.registrationDetails
                          ),
                          value: 'registration-details'
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
                        },
                        {
                          label: 'Disease Details',
                          value: 'disease-details'
                        }
                      ]}
                      name="test-checkbox-group1"
                      value={deathPermissions.permissions ?? []}
                      onChange={(newValue) => {
                        checkboxHandler(newValue, WebhookOption.death)
                      }}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}

        {!registerSystemData && registerSystemLoading && (
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

        {registerSystemData?.registerSystem && (
          <Stack alignItems="flex-start" direction="column" gap={16}>
            <Stack alignItems="flex-start" direction="column" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientId)}
              </Text>
              <Text variant="reg16" element="span">
                {registerSystemData.registerSystem.system.clientId}
              </Text>
            </Stack>
            <Stack alignItems="flex-start" direction="column" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.clientSecret)}
              </Text>
              <Text variant="reg16" element="span">
                {registerSystemData.registerSystem.clientSecret}
              </Text>
            </Stack>
            <Stack alignItems="flex-start" direction="column" gap={8}>
              <Text variant="bold16" element="span">
                {intl.formatMessage(integrationMessages.shaSecret)}
              </Text>
              <Text variant="reg16" element="span">
                {registerSystemData.registerSystem.system.shaSecret}
              </Text>
            </Stack>
          </Stack>
        )}
      </ResponsiveModal>

      {activateSystemData && (
        <Toast
          type="success"
          id="toggleClientStatusToast"
          onClose={() => resetData()}
        >
          {intl.formatMessage(integrationMessages.activateClientStatus)}
        </Toast>
      )}
      {deactivateSystemData && (
        <Toast
          type="success"
          id="toggleClientStatusToast"
          onClose={() => resetData()}
        >
          {intl.formatMessage(integrationMessages.deactivateClientStatus)}
        </Toast>
      )}
      {(activateSystemError ||
        deactivateSystemError ||
        registerSystemError) && (
        <Toast
          type="error"
          id="toggleClientStatusToast"
          onClose={() => {
            resetData()
          }}
        >
          {intl.formatMessage(integrationMessages.error)}
        </Toast>
      )}
    </Frame>
  )
}
