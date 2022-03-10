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
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { EMPTY_STRING } from '@client/utils/constants'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { configApplicationMutations } from '@client/views/SysAdmin/Config/mutations'
import { updateOfflineConfigData } from '@client/offline/actions'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { countries as countryList, lookup } from 'country-data'
import { orderBy, uniqBy } from 'lodash'

const Message = styled.div`
  margin-bottom: 16px;
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
const ErrorMessage = styled.div`
  position: relative;
  ${({ theme }) => theme.fonts.semiBoldFont};
  color: ${({ theme }) => theme.colors.error};
  margin-left: 6px;
`

type ICurrency = {
  isoCode: string | undefined
  languagesAndCountry: string[]
}

export type IApplicationConfigName = {
  APPLICATION_NAME?: string
  CURRENCY?: ICurrency
}

type State = {
  applicationName: string
  currency: string
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

type ICountrylist = {
  alpha2: string
  alpha3: string
  countryCallingCodes: string[]
  currencies: string[]
  emoji: string
  ioc: string
  languages: string[]
  name: string
  status: string
}
interface ICurrencyOptions {
  [key: string]: string
}

type DispatchProps = {
  updateConfig: typeof updateOfflineConfigData
}

type IFullProps = IProps & IntlShapeProps & DispatchProps
class DynamicModalComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      applicationName:
        this.props.offlineCountryConfiguration.config.APPLICATION_NAME,
      currency: `${this.props.offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]}-${this.props.offlineCountryConfiguration.config.CURRENCY.isoCode}`,
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

  getCurrencyObject = (value: string) => {
    const arr = value.split('-')
    return {
      isoCode: arr.pop(),
      languagesAndCountry: [arr.join('-')]
    }
  }

  mutationHandler(
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
      this.callUpdateApplicationNameMutation(value.APPLICATION_NAME)
        .then(() => {
          valueChanged(
            NOTIFICATION_TYPE.SUCCESS,
            this.props.intl.formatMessage(
              messages.applicationNameChangeNotification
            )
          )
        })
        .catch(() => {
          this.setState({
            errorOccured: true,
            errorMessages: this.props.intl.formatMessage(
              messages.applicationConfigChangeError
            )
          })
          valueChanged(
            NOTIFICATION_TYPE.ERROR,
            this.props.intl.formatMessage(messages.applicationConfigChangeError)
          )
        })
    } else if (modalName === GeneralActionId.CURRENCY && value.CURRENCY) {
      this.callUpdateApplicationCurrencyMutation(value.CURRENCY)
        .then(() => {
          valueChanged(
            NOTIFICATION_TYPE.SUCCESS,
            this.props.intl.formatMessage(
              messages.applicationCurrencyChangeNotification
            )
          )
        })
        .catch(() => {
          this.setState({
            errorOccured: true,
            errorMessages: this.props.intl.formatMessage(
              messages.applicationConfigChangeError
            )
          })
          valueChanged(
            NOTIFICATION_TYPE.ERROR,
            this.props.intl.formatMessage(messages.applicationConfigChangeError)
          )
        })
    }
  }

  async callUpdateApplicationNameMutation(applicationName: string) {
    try {
      this.setState({ updatingValue: true })
      const res = await configApplicationMutations.mutateApplicationConfig({
        APPLICATION_NAME: applicationName
      })
      if (res && res.data) {
        this.setState({ updatingValue: false })
        const APPLICATION_NAME =
          res.data.updateApplicationConfig.APPLICATION_NAME
        const offlineConfig = {
          config: {
            ...this.props.offlineCountryConfiguration.config,
            APPLICATION_NAME
          }
        }
        this.props.updateConfig(offlineConfig)
      }
    } catch (err) {
      this.setState({
        errorOccured: true,
        errorMessages: this.props.intl.formatMessage(
          messages.applicationConfigChangeError
        )
      })
    }
  }

  async callUpdateApplicationCurrencyMutation(currency: ICurrency) {
    try {
      this.setState({ updatingValue: true })
      const res = await configApplicationMutations.mutateApplicationConfig({
        CURRENCY: currency
      })
      if (res && res.data) {
        this.setState({ updatingValue: false })
        const CURRENCY = res.data.updateApplicationConfig.CURRENCY
        const offlineConfig = {
          config: {
            ...this.props.offlineCountryConfiguration.config,
            CURRENCY
          }
        }
        this.props.updateConfig(offlineConfig)
      }
    } catch (err) {
      this.setState({
        errorOccured: true,
        errorMessages: this.props.intl.formatMessage(
          messages.applicationConfigChangeError
        )
      })
    }
  }

  getCurrencySelectOptions() {
    const currencyOptions = [] as ICurrencyOptions[]
    countryList.all.map((element: ICountrylist) => {
      const countryLanguage = lookup.languages({
        alpha3: element.languages[0]
      })
      const countryCurrency = lookup.currencies({
        code: element.currencies[0]
      })

      if (Boolean(element.currencies.length) && Boolean(countryLanguage[0])) {
        currencyOptions.push({
          value: `${countryLanguage[0].alpha2}-${element.alpha2}-${element.currencies[0]}`,
          label: countryCurrency[0].name
        })
      }
    })
    const uniqCurrencyOptions = uniqBy(currencyOptions, 'label')
    const sortedCountryOptions = orderBy(
      uniqCurrencyOptions,
      ['label'],
      ['asc']
    )
    return sortedCountryOptions
  }

  getTitle() {
    const { intl, changeModalName } = this.props
    if (changeModalName === GeneralActionId.APPLICATION_NAME)
      return intl.formatMessage(messages.applicationNameLabel)
    else if (changeModalName === GeneralActionId.CURRENCY)
      return intl.formatMessage(messages.currencyLable)
    else return EMPTY_STRING
  }

  isApplyButtonDisable() {
    const { changeModalName } = this.props
    if (changeModalName === GeneralActionId.APPLICATION_NAME) {
      return !Boolean(this.state.applicationName)
    } else if (changeModalName === GeneralActionId.CURRENCY) {
      return !Boolean(this.state.currency)
    } else return true
  }

  render() {
    const { intl, changeModalName, toggleConfigModal, valueChanged } =
      this.props

    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={this.getTitle()}
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
            disabled={this.isApplyButtonDisable()}
            onClick={() => {
              this.mutationHandler(
                changeModalName,
                {
                  APPLICATION_NAME: this.state.applicationName,
                  CURRENCY: this.getCurrencyObject(this.state.currency)
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
        <Message>
          {changeModalName === GeneralActionId.APPLICATION_NAME
            ? intl.formatMessage(messages.applicationNameChangeMessage)
            : changeModalName === GeneralActionId.CURRENCY
            ? intl.formatMessage(messages.applicationCurrencyChangeMessage)
            : EMPTY_STRING}
        </Message>
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
                  options={this.getCurrencySelectOptions()}
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
