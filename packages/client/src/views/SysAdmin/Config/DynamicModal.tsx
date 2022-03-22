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
import { PrimaryButton, TertiaryButton } from '@opencrvs/components/lib/buttons'
import {
  NOTIFICATION_TYPE,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/config'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import styled from '@client/styledComponents'
import { InputField, TextInput, Select } from '@opencrvs/components/lib/forms'
import {
  BirthActionId,
  DeathActionId,
  GeneralActionId
} from '@client/views/SysAdmin/Config/Application'
import { EMPTY_STRING } from '@client/utils/constants'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { updateOfflineConfigData } from '@client/offline/actions'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  getCurrencyObject,
  getCurrencySelectOptions,
  getTitle,
  getMessage,
  isApplyButtonDisabled,
  callUpdateApplicationNameMutation,
  callUpdateApplicationCurrencyMutation,
  callUpdateApplicationBirthMutation,
  callUpdateApplicationDeathMutation
} from '@client/views/SysAdmin/Config/utils'

const Message = styled.div`
  margin-bottom: 16px;
`
const Text = styled.div<{
  align?: 'right' | 'left'
}>`
  margin-left: ${({ align }) => (align === 'left' ? '0px' : '8px')};
  margin-right: ${({ align }) => (align === 'left' ? '8px' : '0px')};
  margin-top: 22px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bigBodyStyle};
`
const ApplyButton = styled(PrimaryButton)`
  height: 40px;
  & div {
    padding: 0 8px;
  }
`
const CancelButton = styled(TertiaryButton)`
  height: 40px;
  & div {
    padding: 0;
  }
`
const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const ErrorContent = styled.div`
  display: flex;
  margin-bottom: 20px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const Field = styled.div`
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`
const HalfWidthInput = styled(TextInput)`
  width: 300px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const SmallWidthInput = styled(TextInput)`
  margin-top: 16px;
  width: 78px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const ErrorMessage = styled.div`
  position: relative;
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.negative};
  margin-left: 6px;
`

export type ICurrency = {
  isoCode: string | undefined
  languagesAndCountry: string[]
}

export type IBirth = {
  REGISTRATION_TARGET?: number
  LATE_REGISTRATION_TARGET?: number
  FEE?: {
    ON_TIME?: number
    LATE?: number
    DELAYED?: number
  }
}
export type IDeath = {
  REGISTRATION_TARGET?: number
  FEE?: {
    ON_TIME?: number
    DELAYED?: number
  }
}

export type IApplicationConfigName = {
  APPLICATION_NAME?: string
  CURRENCY?: ICurrency
  BIRTH?: IBirth
  DEATH?: IDeath
}

export type State = {
  applicationName: string
  currency: string
  birthRegistrationTarget: string
  birthLateRegistrationTarget: string
  deathRegistrationTarget: string
  birthOnTimeFee: string
  birthLateFee: string
  birthDelayedFee: string
  deathOnTimeFee: string
  deathDelayedFee: string
  updatingValue: boolean
  errorOccured: boolean
  errorMessages: string
}
interface IProps {
  changeModalName: string
  showNotification: boolean
  offlineCountryConfiguration: IOfflineData
  toggleConfigModal: () => void
  valueChanged: (
    notificationStatus: NOTIFICATION_TYPE,
    messages: string
  ) => void
}

type DispatchProps = {
  updateConfig: typeof updateOfflineConfigData
}

export type IFullProps = IProps & IntlShapeProps & DispatchProps
class DynamicModalComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    const { offlineCountryConfiguration } = this.props
    this.state = {
      applicationName: offlineCountryConfiguration.config.APPLICATION_NAME,
      currency: `${offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]}-${this.props.offlineCountryConfiguration.config.CURRENCY.isoCode}`,
      birthRegistrationTarget:
        offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET.toString(),
      birthLateRegistrationTarget:
        offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET.toString(),
      deathRegistrationTarget:
        offlineCountryConfiguration.config.DEATH.REGISTRATION_TARGET.toString(),
      birthOnTimeFee:
        offlineCountryConfiguration.config.BIRTH.FEE.ON_TIME.toString(),
      birthLateFee:
        offlineCountryConfiguration.config.BIRTH.FEE.LATE.toString(),
      birthDelayedFee:
        offlineCountryConfiguration.config.BIRTH.FEE.DELAYED.toString(),
      deathOnTimeFee:
        offlineCountryConfiguration.config.DEATH.FEE.ON_TIME.toString(),
      deathDelayedFee:
        offlineCountryConfiguration.config.DEATH.FEE.DELAYED.toString(),
      updatingValue: false,
      errorOccured: false,
      errorMessages: EMPTY_STRING
    }
  }

  showChangeModal: boolean = !!!this.props.changeModalName ? false : true

  setApplicationName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      applicationName: value
    }))
  }

  setBirthRegistrationTarget = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      birthRegistrationTarget: value
    }))
  }

  setDeathRegistrationTarget = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      deathRegistrationTarget: value
    }))
  }

  setBirthOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      birthOnTimeFee: value
    }))
  }

  setBirthLateFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      birthLateFee: value
    }))
  }

  setBirthDelayedFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      birthDelayedFee: value
    }))
  }

  setDeathOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      deathOnTimeFee: value
    }))
  }

  setDeathDelayedFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    this.setState(() => ({
      deathDelayedFee: value
    }))
  }

  setBirthLateRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    this.setState(() => ({
      birthLateRegistrationTarget: value
    }))
  }

  setUpdatingValue = (value: boolean) => {
    this.setState({
      updatingValue: value
    })
  }

  setError = (errorMessage: string) => {
    this.setState({
      errorOccured: true,
      errorMessages: errorMessage
    })
  }

  getCurrency = () => {
    const { offlineCountryConfiguration } = this.props
    const currency = new Intl.NumberFormat(
      offlineCountryConfiguration.config.CURRENCY.languagesAndCountry,
      {
        style: 'currency',
        currency: offlineCountryConfiguration.config.CURRENCY.isoCode
      }
    )
      .format(0)
      .replace(/[0-9\.,]/g, '')

    return currency
  }

  async mutationHandler(
    modalName: string,
    value: IApplicationConfigName,
    valueChanged: (
      notificationStatus: NOTIFICATION_TYPE,
      messages: string
    ) => void
  ) {
    if (
      modalName === GeneralActionId.APPLICATION_NAME &&
      value.APPLICATION_NAME
    ) {
      try {
        await callUpdateApplicationNameMutation(
          value.APPLICATION_NAME,
          this.props,
          this.setUpdatingValue
        )
        valueChanged(
          NOTIFICATION_TYPE.SUCCESS,
          this.props.intl.formatMessage(
            messages.applicationNameChangeNotification
          )
        )
      } catch {
        this.setError(
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
      }
    } else if (modalName === GeneralActionId.CURRENCY && value.CURRENCY) {
      try {
        await callUpdateApplicationCurrencyMutation(
          value.CURRENCY,
          this.props,
          this.setUpdatingValue
        )
        valueChanged(
          NOTIFICATION_TYPE.SUCCESS,
          this.props.intl.formatMessage(
            messages.applicationCurrencyChangeNotification
          )
        )
      } catch {
        this.setError(
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
      }
    } else if (
      (modalName === BirthActionId.BIRTH_REGISTRATION_TARGET ||
        modalName === BirthActionId.BIRTH_LATE_REGISTRATION_TARGET ||
        modalName === BirthActionId.BIRTH_ON_TIME_FEE ||
        modalName === BirthActionId.BIRTH_LATE_FEE ||
        modalName === BirthActionId.BIRTH_DELAYED_FEE) &&
      (value.BIRTH?.REGISTRATION_TARGET ||
        value.BIRTH?.LATE_REGISTRATION_TARGET ||
        value.BIRTH?.FEE)
    ) {
      try {
        await callUpdateApplicationBirthMutation(
          value.BIRTH,
          this.props,
          this.setUpdatingValue
        )
        const notificationText =
          modalName === BirthActionId.BIRTH_REGISTRATION_TARGET
            ? this.props.intl.formatMessage(
                messages.applicationBirthRegTargetChangeNotification
              )
            : modalName === BirthActionId.BIRTH_LATE_REGISTRATION_TARGET
            ? this.props.intl.formatMessage(
                messages.applicationBirthLateRegTargetChangeNotification
              )
            : modalName === BirthActionId.BIRTH_ON_TIME_FEE
            ? this.props.intl.formatMessage(
                messages.applicationBirthOnTimeFeeChangeNotification
              )
            : modalName === BirthActionId.BIRTH_LATE_FEE
            ? this.props.intl.formatMessage(
                messages.applicationBirthLateFeeChangeNotification
              )
            : modalName === BirthActionId.BIRTH_DELAYED_FEE
            ? this.props.intl.formatMessage(
                messages.applicationBirthDelayedFeeChangeNotification
              )
            : EMPTY_STRING

        valueChanged(NOTIFICATION_TYPE.SUCCESS, notificationText)
      } catch {
        this.setError(
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
      }
    } else if (
      (modalName === DeathActionId.DEATH_REGISTRATION_TARGET ||
        modalName === DeathActionId.DEATH_ON_TIME_FEE ||
        modalName === DeathActionId.DEATH_DELAYED_FEE) &&
      (value.DEATH?.REGISTRATION_TARGET || value.DEATH?.FEE)
    ) {
      try {
        await callUpdateApplicationDeathMutation(
          value.DEATH,
          this.props,
          this.setUpdatingValue
        )
        const notificationText =
          modalName === DeathActionId.DEATH_REGISTRATION_TARGET
            ? this.props.intl.formatMessage(
                messages.applicationDeathRegTargetChangeNotification
              )
            : modalName === DeathActionId.DEATH_ON_TIME_FEE
            ? this.props.intl.formatMessage(
                messages.applicationDeathOnTimeFeeChangeNotification
              )
            : modalName === DeathActionId.DEATH_DELAYED_FEE
            ? this.props.intl.formatMessage(
                messages.applicationDeathDelayedFeeChangeNotification
              )
            : EMPTY_STRING

        valueChanged(NOTIFICATION_TYPE.SUCCESS, notificationText)
      } catch {
        this.setError(
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          this.props.intl.formatMessage(messages.applicationConfigChangeError)
        )
      }
    }
  }

  render() {
    const { intl, changeModalName, toggleConfigModal, valueChanged } =
      this.props
    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={getTitle(intl, changeModalName)}
        show={this.showChangeModal}
        contentScrollableY={
          changeModalName === GeneralActionId.CURRENCY ? true : false
        }
        actions={[
          <CancelButton
            key="cancel"
            id="modal_cancel"
            onClick={toggleConfigModal}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </CancelButton>,
          <ApplyButton
            key="apply"
            id="apply_change"
            disabled={isApplyButtonDisabled(this.state, changeModalName)}
            onClick={() => {
              this.mutationHandler(
                changeModalName,
                {
                  APPLICATION_NAME: this.state.applicationName,
                  CURRENCY: getCurrencyObject(this.state.currency),
                  BIRTH: {
                    REGISTRATION_TARGET: parseInt(
                      this.state.birthRegistrationTarget
                    ),
                    LATE_REGISTRATION_TARGET: parseInt(
                      this.state.birthLateRegistrationTarget
                    ),
                    FEE: {
                      ON_TIME: parseInt(this.state.birthOnTimeFee),
                      LATE: parseInt(this.state.birthLateFee),
                      DELAYED: parseInt(this.state.birthDelayedFee)
                    }
                  },
                  DEATH: {
                    REGISTRATION_TARGET: parseInt(
                      this.state.deathRegistrationTarget
                    ),
                    FEE: {
                      ON_TIME: parseInt(this.state.deathOnTimeFee),
                      DELAYED: parseInt(this.state.deathDelayedFee)
                    }
                  }
                },
                valueChanged
              )
            }}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </ApplyButton>
        ]}
        handleClose={toggleConfigModal}
        contentHeight={175}
      >
        <Message>{getMessage(intl, changeModalName)}</Message>
        {this.state.errorOccured && (
          <ErrorContent>
            <Alert color="invert" />
            <ErrorMessage>
              <div>{this.state.errorMessages}</div>
            </ErrorMessage>
          </ErrorContent>
        )}
        {changeModalName === GeneralActionId.APPLICATION_NAME && (
          <Content>
            <Field>
              <InputField id="applicationName" touched={true} required={false}>
                <HalfWidthInput
                  id="applicationName"
                  type="text"
                  error={false}
                  value={this.state.applicationName}
                  onChange={this.setApplicationName}
                />
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === GeneralActionId.CURRENCY && (
          <Content>
            <Field>
              <InputField
                id="applicationCurrency"
                touched={true}
                required={false}
              >
                <Select
                  id="selectCurrency"
                  isDisabled={false}
                  onChange={(val: string) => {
                    this.setState({
                      currency: val
                    })
                  }}
                  value={this.state.currency}
                  options={getCurrencySelectOptions()}
                />
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === BirthActionId.BIRTH_REGISTRATION_TARGET && (
          <Content>
            <Field>
              <InputField
                id="applicationBirthRegTarget"
                touched={true}
                required={false}
              >
                <SmallWidthInput
                  id="applicationBirthRegTarget"
                  type="number"
                  error={false}
                  value={this.state.birthRegistrationTarget}
                  onChange={this.setBirthRegistrationTarget}
                />
                <Text>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </Text>
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === BirthActionId.BIRTH_LATE_REGISTRATION_TARGET && (
          <Content>
            <Field>
              <InputField
                id="applicationBirthLateRegTarget"
                touched={true}
                required={false}
              >
                <SmallWidthInput
                  id="applicationBirthLateRegTarget"
                  type="number"
                  error={false}
                  value={this.state.birthLateRegistrationTarget}
                  onChange={this.setBirthLateRegistrationTarget}
                />
                <Text>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </Text>
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === DeathActionId.DEATH_REGISTRATION_TARGET && (
          <Content>
            <Field>
              <InputField
                id="applicationDeathRegTarget"
                touched={true}
                required={false}
              >
                <SmallWidthInput
                  id="applicationDeathRegTarget"
                  type="number"
                  error={false}
                  value={this.state.deathRegistrationTarget}
                  onChange={this.setDeathRegistrationTarget}
                />
                <Text>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </Text>
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === BirthActionId.BIRTH_ON_TIME_FEE && (
          <Content>
            <Field>
              <InputField
                id="applicationBirthOnTimeFee"
                touched={true}
                required={false}
              >
                <Text align="left">{this.getCurrency()}</Text>
                <SmallWidthInput
                  id="applicationBirthOnTimeFee"
                  type="number"
                  error={false}
                  value={this.state.birthOnTimeFee}
                  onChange={this.setBirthOnTimeFee}
                />
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === BirthActionId.BIRTH_LATE_FEE && (
          <Content>
            <Field>
              <InputField
                id="applicationBirthLateFee"
                touched={true}
                required={false}
              >
                <Text align="left">{this.getCurrency()}</Text>
                <SmallWidthInput
                  id="applicationBirthLateFee"
                  type="number"
                  error={false}
                  value={this.state.birthLateFee}
                  onChange={this.setBirthLateFee}
                />
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === BirthActionId.BIRTH_DELAYED_FEE && (
          <Content>
            <Field>
              <InputField
                id="applicationBirthDelayedFee"
                touched={true}
                required={false}
              >
                <Text align="left">{this.getCurrency()}</Text>

                <SmallWidthInput
                  id="applicationBirthDelayedFee"
                  type="number"
                  error={false}
                  value={this.state.birthDelayedFee}
                  onChange={this.setDeathOnTimeFee}
                />
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === DeathActionId.DEATH_ON_TIME_FEE && (
          <Content>
            <Field>
              <InputField
                id="applicationDeathOnTimeFee"
                touched={true}
                required={false}
              >
                <Text align="left">{this.getCurrency()}</Text>

                <SmallWidthInput
                  id="applicationDeathOnTimeFee"
                  type="number"
                  error={false}
                  value={this.state.deathOnTimeFee}
                  onChange={this.setDeathOnTimeFee}
                />
              </InputField>
            </Field>
          </Content>
        )}
        {changeModalName === DeathActionId.DEATH_DELAYED_FEE && (
          <Content>
            <Field>
              <InputField
                id="applicationDeathDelayedFee"
                touched={true}
                required={false}
              >
                <Text align="left">{this.getCurrency()}</Text>

                <SmallWidthInput
                  id="applicationDeathDelayedFee"
                  type="number"
                  error={false}
                  value={this.state.deathDelayedFee}
                  onChange={this.setDeathDelayedFee}
                />
              </InputField>
            </Field>
          </Content>
        )}
      </ResponsiveModal>
    )
  }
}

function mapStateToProps(state: IStoreState) {
  return {
    offlineCountryConfiguration: getOfflineData(state)
  }
}

export const DynamicModal = connect(mapStateToProps, {
  updateConfig: updateOfflineConfigData
})(injectIntl(DynamicModalComponent))
