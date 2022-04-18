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
import {
  injectIntl,
  IntlShape,
  WrappedComponentProps as IntlShapeProps
} from 'react-intl'
import { connect } from 'react-redux'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import {
  ListView,
  FloatingNotification,
  NOTIFICATION_TYPE,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/formConfig'
import { buttonMessages } from '@client/i18n/messages'
import { EMPTY_STRING } from '@client/utils/constants'
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import styled from 'styled-components'
import { Toggle } from '@opencrvs/components/lib/buttons/Toggle'
import { RadioGroup } from '@opencrvs/components/lib/forms'
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'

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

type Props = IntlShapeProps & {
  applicationConfig: IOfflineData
}
interface State {
  modalName: string
  introductionPage: boolean
  numberOfAddresses: number
  showModal: boolean
  showNotification: boolean
  notificationStatus: NOTIFICATION_TYPE
  notificationMessages: string
}

enum ConfigModals {
  INTRODUCTION_PAGE = 'changeIntroductionPage',
  ADDRESSES = 'changeAddresses'
}

class FormConfigSettingsComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      modalName: EMPTY_STRING,
      introductionPage:
        this.props.applicationConfig.config.HIDE_EVENT_REGISTER_INFORMATION,
      numberOfAddresses: this.props.applicationConfig.config.ADDRESSES,
      showModal: false,
      showNotification: false,
      notificationStatus: NOTIFICATION_TYPE.IN_PROGRESS,
      notificationMessages: EMPTY_STRING
    }
  }

  changeValue = (
    modalName: string,
    introductionPage: boolean,
    noOfAddresses: number,
    intl: IntlShape
  ) => {
    this.toggleConfigModal()
    this.setState({
      showNotification: true,
      notificationMessages:
        modalName === ConfigModals.INTRODUCTION_PAGE
          ? intl.formatMessage(messages.introductionPageSuccessNotification, {
              action: introductionPage
                ? intl.formatMessage(messages.enable)
                : intl.formatMessage(messages.disable)
            })
          : modalName === ConfigModals.ADDRESSES
          ? intl.formatMessage(messages.noOfAddressesSuccessNotification)
          : EMPTY_STRING
    })
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
      <SysAdminContentWrapper isCertificatesConfigPage={true}>
        <Content
          title={intl.formatMessage(messages.settingsTitle)}
          titleColor={'copy'}
        >
          <ListView
            items={[
              {
                label: intl.formatMessage(messages.introductionSettings),
                value: introductionPage
                  ? intl.formatMessage(messages.enable)
                  : intl.formatMessage(messages.disable),
                action: {
                  label: intl.formatMessage(buttonMessages.change),
                  handler: () => {
                    this.setState({
                      modalName: ConfigModals.INTRODUCTION_PAGE
                    })
                    this.toggleConfigModal()
                  }
                }
              },
              {
                label: intl.formatMessage(messages.addressesSettings),
                value: numberOfAddresses,
                action: {
                  label: intl.formatMessage(buttonMessages.change),
                  handler: () => {
                    this.setState({
                      modalName: ConfigModals.ADDRESSES
                    })
                    this.toggleConfigModal()
                  }
                }
              }
            ]}
          />
        </Content>
        <ResponsiveModal
          id="formConfigSettingsDialog"
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
                this.changeValue(
                  modalName,
                  introductionPage,
                  numberOfAddresses,
                  intl
                )
                this.toggleConfigModal()
              }}
            >
              {intl.formatMessage(buttonMessages.apply)}
            </PrimaryButton>
          ]}
        >
          {modalName === ConfigModals.INTRODUCTION_PAGE
            ? intl.formatMessage(messages.introductionPageSettingsDialogDesc)
            : modalName === ConfigModals.ADDRESSES
            ? intl.formatMessage(messages.addressesSettingsDialogDesc)
            : EMPTY_STRING}

          {modalName === ConfigModals.INTRODUCTION_PAGE ? (
            <ListViewSimplified>
              <ListViewItemSimplified
                label={
                  <Label>
                    {intl.formatMessage(messages.showIntroductionPage)}
                  </Label>
                }
                actions={[
                  <CenteredToggle
                    key="toggle"
                    selected={introductionPage}
                    onChange={this.toggleOnChange}
                  />
                ]}
              />
            </ListViewSimplified>
          ) : (
            <RadioGroupWrapper>
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
      </SysAdminContentWrapper>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    applicationConfig: getOfflineData(state)
  }
}

export const FormConfigSettings = connect(mapStateToProps)(
  injectIntl(FormConfigSettingsComponent)
)
