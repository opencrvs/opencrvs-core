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
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import {
  FloatingNotification,
  NOTIFICATION_TYPE,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/formConfig'
import { buttonMessages } from '@client/i18n/messages'
import { EMPTY_STRING } from '@client/utils/constants'
import {
  LinkButton,
  PrimaryButton,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import styled from 'styled-components'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { RadioGroup } from '@opencrvs/components/lib/forms'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import {
  callApplicationConfigMutation,
  NOTIFICATION_STATUS
} from '@client/views/SysAdmin/Config/Application/utils'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { messages as configMessages } from '@client/i18n/messages/views/config'
import { IApplicationConfig } from '@client/utils/referenceApi'

const Label = styled.span`
  ${({ theme }) => theme.fonts.reg16};
  color: ${({ theme }) => theme.colors.grey600};
`
const CenteredToggle = styled(Toggle)`
  align-self: center;
`
const RadioGroupWrapper = styled.div`
  margin-top: 30px;
`
const ErrorContent = styled.div`
  display: flex;
  margin-bottom: 10px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const Containter = styled.div`
  flex: 1;
  height: min-content;
  margin: 32px auto 0;
`
const ErrorMessage = styled.div`
  position: relative;
  color: ${({ theme }) => theme.colors.negative};
  margin-left: 6px;
`

const DescriptionMessage = styled.div`
  position: relative;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

export enum ConfigActionType {
  HIDE_EVENT_REGISTER_INFORMATION = 'HIDE_EVENT_REGISTER_INFORMATION',
  ADDRESSES = 'ADDRESSES'
}

function FormConfigSettingsComponent() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [modalName, setModalName] = React.useState<
    ConfigActionType | typeof EMPTY_STRING
  >(EMPTY_STRING)
  const [introductionPage, setIntroductionPage] = React.useState(
    offlineCountryConfiguration.config.HIDE_EVENT_REGISTER_INFORMATION
  )
  const [numberOfAddresses, setNumberOfAddresses] = React.useState(
    offlineCountryConfiguration.config.ADDRESSES
  )
  const [showModal, setShowModal] = React.useState(false)
  const [errorOccured, setErrorOccured] = React.useState(false)
  const [showNotification, setShowNotification] = React.useState(false)
  const [notificationMessages, setNotificationMessages] =
    React.useState(EMPTY_STRING)
  const [notificationStatus, setNotificationStatus] =
    React.useState<NOTIFICATION_STATUS>(NOTIFICATION_STATUS.IDLE)

  const changeValue = async () => {
    if (
      modalName === ConfigActionType.ADDRESSES ||
      modalName === ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION
    ) {
      try {
        await callApplicationConfigMutation(
          modalName,
          modalName === ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION
            ? {
                ...offlineCountryConfiguration.config,
                [ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION]:
                  introductionPage
              }
            : {
                ...offlineCountryConfiguration.config,
                [ConfigActionType.ADDRESSES]: numberOfAddresses
              },
          dispatch,
          setNotificationStatus
        )
        toggleConfigModal()
        setShowNotification(true)
        setNotificationMessages(
          modalName === ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION
            ? intl.formatMessage(messages.introductionPageSuccessNotification, {
                action: introductionPage
                  ? intl.formatMessage(messages.disable)
                  : intl.formatMessage(messages.enable)
              })
            : intl.formatMessage(messages.noOfAddressesSuccessNotification)
        )
      } catch {
        setErrorOccured(true)
      }
    }
  }

  const toggleOnChange = () => {
    setIntroductionPage(!introductionPage)
  }

  const handleNumberOfAddresses = (noOfAddresses: string) => {
    setNumberOfAddresses(parseInt(noOfAddresses))
  }

  const toggleConfigModal = () => {
    setShowModal(!showModal)
  }

  return (
    <Containter>
      <Content
        title={intl.formatMessage(messages.settingsTitle)}
        titleColor={'copy'}
        subtitle={intl.formatMessage(messages.globalSettingsDescription)}
      >
        <ListViewSimplified>
          <ListViewItemSimplified
            label={intl.formatMessage(messages.introductionSettings)}
            value={[
              <span id="Introduction-page_value">
                {introductionPage
                  ? intl.formatMessage(messages.disable)
                  : intl.formatMessage(messages.enable)}
              </span>
            ]}
            actions={[
              <LinkButton
                id={'introductionPageSettings'}
                onClick={() => {
                  setModalName(ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION)
                  toggleConfigModal()
                }}
              >
                {intl.formatMessage(buttonMessages.change)}
              </LinkButton>
            ]}
          />
          <ListViewItemSimplified
            label={intl.formatMessage(messages.addressesSettings)}
            value={<span id="numberOfAddresses">{numberOfAddresses}</span>}
            actions={[
              <LinkButton
                id={'addressesSettings'}
                onClick={() => {
                  setModalName(ConfigActionType.ADDRESSES)
                  toggleConfigModal()
                }}
              >
                {intl.formatMessage(buttonMessages.change)}
              </LinkButton>
            ]}
          />
        </ListViewSimplified>
      </Content>
      <ResponsiveModal
        id={`${modalName}Modal`}
        show={showModal}
        title={
          modalName === ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION
            ? intl.formatMessage(messages.introductionPageSettingsDialogTitle)
            : modalName === ConfigActionType.ADDRESSES
            ? intl.formatMessage(messages.addressesSettingsDialogTitle)
            : EMPTY_STRING
        }
        autoHeight={true}
        handleClose={toggleConfigModal}
        actions={[
          <TertiaryButton id="cancel" key="cancel" onClick={toggleConfigModal}>
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          <PrimaryButton
            id="apply"
            key="apply"
            disabled={notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS}
            onClick={() => {
              changeValue()
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </PrimaryButton>
        ]}
      >
        {modalName === ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION ? (
          <DescriptionMessage>
            {intl.formatMessage(messages.introductionPageSettingsDialogDesc)}
          </DescriptionMessage>
        ) : modalName === ConfigActionType.ADDRESSES ? (
          intl.formatMessage(messages.addressesSettingsDialogDesc)
        ) : (
          EMPTY_STRING
        )}

        {modalName === ConfigActionType.HIDE_EVENT_REGISTER_INFORMATION ? (
          <ListViewSimplified>
            <ListViewItemSimplified
              label={
                <Label>
                  {intl.formatMessage(messages.showIntroductionPage)}
                </Label>
              }
              actions={
                <CenteredToggle
                  id="introductionPage"
                  defaultChecked={!introductionPage}
                  onChange={toggleOnChange}
                />
              }
            />
          </ListViewSimplified>
        ) : modalName === ConfigActionType.ADDRESSES ? (
          <RadioGroupWrapper id="numberOfAddress">
            <RadioGroup
              onChange={(val: string) => handleNumberOfAddresses(val)}
              options={[
                {
                  label: '1',
                  value: '1'
                },
                {
                  label: '2',
                  value: '2'
                }
              ]}
              name={'numberOfAddresses'}
              value={numberOfAddresses.toString() as string}
            />
          </RadioGroupWrapper>
        ) : (
          <></>
        )}

        {errorOccured && (
          <ErrorContent>
            <Alert color="invert" />
            <ErrorMessage>
              <div>
                {intl.formatMessage(
                  configMessages.applicationConfigChangeError
                )}
              </div>
            </ErrorMessage>
          </ErrorContent>
        )}
      </ResponsiveModal>
      <FloatingNotification
        id="form-settings-notification"
        type={
          notificationStatus === NOTIFICATION_STATUS.IN_PROGRESS
            ? NOTIFICATION_TYPE.IN_PROGRESS
            : NOTIFICATION_TYPE.SUCCESS
        }
        show={showNotification}
        callback={() => {
          setShowNotification(false)
        }}
      >
        {notificationMessages}
      </FloatingNotification>
    </Containter>
  )
}

export const FormConfigSettings = FormConfigSettingsComponent
