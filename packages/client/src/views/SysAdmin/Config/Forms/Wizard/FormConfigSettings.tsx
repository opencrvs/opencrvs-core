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
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
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
import { updateOfflineConfigData } from '@client/offline/actions'
import {
  callUpdateAddressesMutation,
  callUpdateHideEventRegisterInformationMutation
} from '@client/views/SysAdmin/Config/Application/utils'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { messages as configMessages } from '@client/i18n/messages/views/config'

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

type DispatchProps = {
  updateConfig: typeof updateOfflineConfigData
}

export type IFormConfigSettingsProps = IntlShapeProps & {
  applicationConfig: IOfflineData
} & DispatchProps
interface State {
  modalName: string
  introductionPage: boolean
  numberOfAddresses: number
  showModal: boolean
  errorOccured: boolean
  showNotification: boolean
  notificationMessages: string
}

enum ConfigModals {
  INTRODUCTION_PAGE = 'changeIntroductionPage',
  ADDRESSES = 'changeAddresses'
}

class FormConfigSettingsComponent extends React.Component<
  IFormConfigSettingsProps,
  State
> {
  constructor(props: IFormConfigSettingsProps) {
    super(props)
    this.state = {
      modalName: EMPTY_STRING,
      introductionPage:
        this.props.applicationConfig.config.HIDE_EVENT_REGISTER_INFORMATION,
      numberOfAddresses: this.props.applicationConfig.config.ADDRESSES,
      showModal: false,
      errorOccured: false,
      showNotification: false,
      notificationMessages: EMPTY_STRING
    }
  }

  changeValue = async () => {
    if (this.state.modalName === ConfigModals.INTRODUCTION_PAGE) {
      try {
        await callUpdateHideEventRegisterInformationMutation(
          this.state.introductionPage,
          this.props
        )
        this.toggleConfigModal()
        this.setState({
          showNotification: true,
          notificationMessages: this.props.intl.formatMessage(
            messages.introductionPageSuccessNotification,
            {
              action: this.state.introductionPage
                ? this.props.intl.formatMessage(messages.disable)
                : this.props.intl.formatMessage(messages.enable)
            }
          )
        })
      } catch {
        this.setState({
          errorOccured: true
        })
      }
    } else if (this.state.modalName === ConfigModals.ADDRESSES) {
      try {
        await callUpdateAddressesMutation(
          this.state.numberOfAddresses,
          this.props
        )
        this.toggleConfigModal()
        this.setState({
          showNotification: true,
          notificationMessages: this.props.intl.formatMessage(
            messages.noOfAddressesSuccessNotification
          )
        })
      } catch {
        this.setState({
          errorOccured: true
        })
      }
    }
  }

  toggleOnChange = () => {
    this.setState({ introductionPage: !this.state.introductionPage })
  }

  setNumberOfAddresses = (noOfAddresses: string) => {
    this.setState({ numberOfAddresses: parseInt(noOfAddresses) })
  }

  toggleConfigModal = () => {
    this.setState({ showModal: !this.state.showModal })
  }

  render() {
    const { intl } = this.props
    const { showModal, modalName, introductionPage, numberOfAddresses } =
      this.state

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
                    this.setState({
                      modalName: ConfigModals.INTRODUCTION_PAGE
                    })
                    this.toggleConfigModal()
                  }}
                >
                  {this.props.intl.formatMessage(buttonMessages.change)}
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
                    this.setState({
                      modalName: ConfigModals.ADDRESSES
                    })
                    this.toggleConfigModal()
                  }}
                >
                  {this.props.intl.formatMessage(buttonMessages.change)}
                </LinkButton>
              ]}
            />
          </ListViewSimplified>
        </Content>
        <ResponsiveModal
          id={`${modalName}Modal`}
          show={showModal}
          title={
            modalName === ConfigModals.INTRODUCTION_PAGE
              ? intl.formatMessage(messages.introductionPageSettingsDialogTitle)
              : modalName === ConfigModals.ADDRESSES
              ? intl.formatMessage(messages.addressesSettingsDialogTitle)
              : EMPTY_STRING
          }
          autoHeight={true}
          handleClose={this.toggleConfigModal}
          actions={[
            <TertiaryButton
              id="cancel"
              key="cancel"
              onClick={this.toggleConfigModal}
            >
              {intl.formatMessage(buttonMessages.cancel)}
            </TertiaryButton>,
            <PrimaryButton
              id="apply"
              key="apply"
              onClick={() => {
                this.changeValue()
              }}
            >
              {intl.formatMessage(buttonMessages.apply)}
            </PrimaryButton>
          ]}
        >
          {modalName === ConfigModals.INTRODUCTION_PAGE ? (
            <DescriptionMessage>
              {intl.formatMessage(messages.introductionPageSettingsDialogDesc)}
            </DescriptionMessage>
          ) : modalName === ConfigModals.ADDRESSES ? (
            intl.formatMessage(messages.addressesSettingsDialogDesc)
          ) : (
            EMPTY_STRING
          )}

          {modalName === ConfigModals.INTRODUCTION_PAGE ? (
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
                    onChange={this.toggleOnChange}
                  />
                }
              />
            </ListViewSimplified>
          ) : modalName === ConfigModals.ADDRESSES ? (
            <RadioGroupWrapper id="numberOfAddress">
              <RadioGroup
                onChange={(val: string) => this.setNumberOfAddresses(val)}
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

          {this.state.errorOccured && (
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
          type={NOTIFICATION_TYPE.SUCCESS}
          show={this.state.showNotification}
          callback={() => {
            this.setState({ showNotification: false })
          }}
        >
          {this.state.notificationMessages}
        </FloatingNotification>
      </Containter>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    applicationConfig: getOfflineData(state)
  }
}

export const FormConfigSettings = connect(mapStateToProps, {
  updateConfig: updateOfflineConfigData
})(injectIntl(FormConfigSettingsComponent))
