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
import ContentComponent from './NIDPhoneNumContent'
import { IOfflineData } from '@client/offline/reducer'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { IAttachmentValue } from '@client/forms'
import {
  getCurrencyObject,
  getCurrencySelectOptions,
  getTitle,
  getMessage,
  isApplyButtonDisabled,
  callUpdateNIDPatternMutation,
  callUpdateApplicationNameMutation,
  callUpdateApplicationCurrencyMutation,
  callUpdateApplicationBirthMutation,
  callUpdateApplicationDeathMutation,
  getFormattedFee,
  getCurrency,
  callUpdatePhoneNumberPatternMutation,
  callUpdateGovtLogoMutation
} from './utils'

const Message = styled.div`
  margin-bottom: 16px;
`
const Text = styled.div<{
  align?: 'right' | 'left'
}>`
  margin-left: ${({ align }) => (align === 'left' ? '0px' : '8px')};
  margin-right: ${({ align }) => (align === 'left' ? '8px' : '0px')};
  margin-top: 34px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.reg16};
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
export const Content = styled.div`
  display: flex;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
const ErrorContent = styled.div`
  display: flex;
  margin-bottom: 10px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
export const Field = styled.div`
  width: 100%;
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`
export const HalfWidthInput = styled(TextInput)<{
  topMargin?: boolean
}>`
  margin-top: ${({ topMargin }) => (topMargin ? '30px' : '0px')};
  width: 300px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const SmallWidthInput = styled(TextInput)`
  margin-top: 30px;
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

export type IApplicationConfig = {
  APPLICATION_NAME?: string
  NID_NUMBER_PATTERN?: string
  PHONE_NUMBER_PATTERN?: string
  COUNTRY_LOGO?: {
    fileName: string
    file: string
  }
  CURRENCY?: ICurrency
  BIRTH?: IBirth
  DEATH?: IDeath
}

export type IState = {
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
  nidPattern: string
  nidExample: string
  testNid: boolean
  phoneNumberPattern: string
  phoneNumberExample: string
  testPhoneNumber: boolean
  updatingValue: boolean
  errorOccured: boolean
  errorMessages: string
  govtLogo: string
  logoFile: IAttachmentValue
  logoFileName: string
  isFileUploading: boolean
}
interface IProps {
  changeModalName: string
  showNotification: boolean
  toggleConfigModal: () => void
  valueChanged: (
    notificationStatus: NOTIFICATION_TYPE,
    messages: string
  ) => void
  offlineCountryConfiguration: IOfflineData
}

type DispatchProps = {
  updateConfig: typeof updateOfflineConfigData
}

export type IFullProps = IProps & IntlShapeProps & DispatchProps
class DynamicModalComponent extends React.Component<IFullProps, IState> {
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
      nidPattern:
        props.offlineCountryConfiguration.config.NID_NUMBER_PATTERN.toString(),
      nidExample: EMPTY_STRING,
      testNid: false,
      phoneNumberPattern:
        props.offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN.toString(),
      phoneNumberExample: EMPTY_STRING,
      testPhoneNumber: false,
      updatingValue: false,
      errorOccured: false,
      errorMessages: EMPTY_STRING,
      govtLogo: EMPTY_STRING,
      logoFile: { name: EMPTY_STRING, type: EMPTY_STRING, data: EMPTY_STRING },
      isFileUploading: false,
      logoFileName: EMPTY_STRING
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
    const value = event.target.value.toString()
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      this.setState(() => ({
        birthRegistrationTarget: value
      }))
    }
  }

  setDeathRegistrationTarget = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toString()
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      this.setState(() => ({
        deathRegistrationTarget: value
      }))
    }
  }

  setBirthOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toString()
    this.setState(() => ({
      birthOnTimeFee: getFormattedFee(value)
    }))
  }

  setBirthLateFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toString()
    this.setState(() => ({
      birthLateFee: getFormattedFee(value)
    }))
  }

  setBirthDelayedFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toString()
    this.setState(() => ({
      birthDelayedFee: getFormattedFee(value)
    }))
  }

  setDeathOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toString()
    this.setState(() => ({
      deathOnTimeFee: getFormattedFee(value)
    }))
  }

  setDeathDelayedFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toString()
    this.setState(() => ({
      deathDelayedFee: getFormattedFee(value)
    }))
  }

  setBirthLateRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value.toString()
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      this.setState(() => ({
        birthLateRegistrationTarget: value
      }))
    }
  }

  setGovtLogo = (data: string) => {
    this.setState(() => ({
      govtLogo: data
    }))
  }

  setNIDPattern = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pattern = event.target.value
    this.setState(() => ({
      nidPattern: pattern
    }))
  }

  setNIDExample = (event: React.ChangeEvent<HTMLInputElement>) => {
    const example = event.target.value
    this.setState(() => ({
      nidExample: example
    }))
  }

  setPhoneNumberPattern = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pattern = event.target.value
    this.setState(() => ({
      phoneNumberPattern: pattern
    }))
  }

  setPhoneNumberExample = (event: React.ChangeEvent<HTMLInputElement>) => {
    const example = event.target.value
    this.setState(() => ({
      phoneNumberExample: example
    }))
  }

  setLogoFile(data: IAttachmentValue) {
    this.setState(() => ({
      logoFile: data
    }))
  }

  setLogoFileName = (attachment: IAttachmentValue) => {
    this.setState(() => ({
      logoFileName: attachment.name ? attachment.name : EMPTY_STRING
    }))
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState(() => ({
      isFileUploading: isUploading
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

  async mutationHandler(
    modalName: string,
    value: IApplicationConfig,
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
    } else if (
      modalName === GeneralActionId.NID_PATTERN &&
      value.NID_NUMBER_PATTERN
    ) {
      try {
        await callUpdateNIDPatternMutation(
          value.NID_NUMBER_PATTERN,
          this.props,
          this.setUpdatingValue
        )
        valueChanged(
          NOTIFICATION_TYPE.SUCCESS,
          this.props.intl.formatMessage(messages.nidPatternChangeNotification)
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
      modalName === GeneralActionId.PHONE_NUMBER &&
      value.PHONE_NUMBER_PATTERN
    ) {
      try {
        await callUpdatePhoneNumberPatternMutation(
          value.PHONE_NUMBER_PATTERN,
          this.props,
          this.setUpdatingValue
        )
        valueChanged(
          NOTIFICATION_TYPE.SUCCESS,
          this.props.intl.formatMessage(messages.phoneNumberChangeNotification)
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
    }
    if (
      modalName === GeneralActionId.GOVT_LOGO &&
      value.COUNTRY_LOGO?.file &&
      value.COUNTRY_LOGO?.fileName
    ) {
      if (
        this.isWithinFileLength(value.COUNTRY_LOGO.file as string) === false
      ) {
        this.setError(
          this.props.intl.formatMessage(messages.govtLogoFileLimitError)
        )
        this.setState({
          govtLogo: EMPTY_STRING,
          logoFile: {
            name: EMPTY_STRING,
            type: EMPTY_STRING,
            data: EMPTY_STRING
          }
        })
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          this.props.intl.formatMessage(messages.govtLogoFileLimitError)
        )
      } else {
        try {
          await callUpdateGovtLogoMutation(
            value.COUNTRY_LOGO.file,
            value.COUNTRY_LOGO.fileName,
            this.props,
            this.setUpdatingValue
          )
          valueChanged(
            NOTIFICATION_TYPE.SUCCESS,
            this.props.intl.formatMessage(messages.govtLogoChangeNotification)
          )
        } catch {
          this.setState({
            errorOccured: true,
            errorMessages: this.props.intl.formatMessage(
              messages.govtLogoChangeError
            )
          })
          valueChanged(
            NOTIFICATION_TYPE.ERROR,
            this.props.intl.formatMessage(messages.govtLogoChangeError)
          )
        }
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

  isWithinFileLength(base64data: string) {
    const baseStr = base64data.substring(22)
    const decoded = window.atob(baseStr)
    if (decoded.length >= 2000000) {
      return false
    }
    return true
  }

  render() {
    const {
      intl,
      changeModalName,
      toggleConfigModal,
      valueChanged,
      offlineCountryConfiguration
    } = this.props
    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={getTitle(intl, changeModalName)}
        autoHeight={true}
        titleHeightAuto={changeModalName === GeneralActionId.NID_PATTERN}
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
                      ON_TIME: parseFloat(
                        this.state.birthOnTimeFee.replace(/\,/g, '')
                      ),
                      LATE: parseFloat(
                        this.state.birthLateFee.replace(/\,/g, '')
                      ),
                      DELAYED: parseFloat(
                        this.state.birthDelayedFee.replace(/\,/g, '')
                      )
                    }
                  },
                  DEATH: {
                    REGISTRATION_TARGET: parseInt(
                      this.state.deathRegistrationTarget
                    ),
                    FEE: {
                      ON_TIME: parseFloat(
                        this.state.deathOnTimeFee.replace(/\,/g, '')
                      ),
                      DELAYED: parseFloat(
                        this.state.deathDelayedFee.replace(/\,/g, '')
                      )
                    }
                  },
                  NID_NUMBER_PATTERN: this.state.nidPattern,
                  PHONE_NUMBER_PATTERN: this.state.phoneNumberPattern,
                  COUNTRY_LOGO: {
                    file: this.state.govtLogo,
                    fileName: this.state.logoFileName
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
        {changeModalName === GeneralActionId.NID_PATTERN && (
          <ContentComponent
            intl={intl}
            changeModalName={changeModalName}
            pattern={this.state.nidPattern}
            example={this.state.nidExample}
            setPattern={this.setNIDPattern}
            setExample={this.setNIDExample}
            patternErrorMessage={intl.formatMessage(
              messages.nidPatternChangeError
            )}
          />
        )}
        {changeModalName === GeneralActionId.PHONE_NUMBER && (
          <ContentComponent
            intl={intl}
            changeModalName={changeModalName}
            pattern={this.state.phoneNumberPattern}
            example={this.state.phoneNumberExample}
            setPattern={this.setPhoneNumberPattern}
            setExample={this.setPhoneNumberExample}
            patternErrorMessage={intl.formatMessage(
              messages.phoneNumberChangeError
            )}
          />
        )}
        {changeModalName === GeneralActionId.GOVT_LOGO && (
          <Content>
            <Field id="govtLogoFile">
              <SimpleDocumentUploader
                label={this.state.logoFile.name ? this.state.logoFile.name : ''}
                disableDeleteInPreview={false}
                name={intl.formatMessage(messages.govermentLogoLabel)}
                allowedDocType={['image/png', 'image/svg']}
                onComplete={(file) => {
                  this.setState({
                    errorOccured: false,
                    errorMessages: EMPTY_STRING
                  })
                  this.setGovtLogo((file as IAttachmentValue).data as string)
                  this.setLogoFile(file as IAttachmentValue)
                  this.setLogoFileName(file as IAttachmentValue)
                }}
                files={this.state.logoFile}
                onUploadingStateChanged={this.onUploadingStateChanged}
                error={this.state.errorMessages}
              />
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
                  type="text"
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
                  type="text"
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
                  type="text"
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
                <Text align="left">
                  {getCurrency(offlineCountryConfiguration)}
                </Text>
                <HalfWidthInput
                  id="applicationBirthOnTimeFee"
                  type="text"
                  topMargin={true}
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
                <Text align="left">
                  {getCurrency(offlineCountryConfiguration)}
                </Text>
                <HalfWidthInput
                  id="applicationBirthLateFee"
                  type="text"
                  topMargin={true}
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
                <Text align="left">
                  {getCurrency(offlineCountryConfiguration)}
                </Text>

                <HalfWidthInput
                  id="applicationBirthDelayedFee"
                  type="text"
                  topMargin={true}
                  error={false}
                  value={this.state.birthDelayedFee}
                  onChange={this.setBirthDelayedFee}
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
                <Text align="left">
                  {getCurrency(offlineCountryConfiguration)}
                </Text>

                <HalfWidthInput
                  id="applicationDeathOnTimeFee"
                  type="text"
                  topMargin={true}
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
                <Text align="left">
                  {getCurrency(offlineCountryConfiguration)}
                </Text>

                <HalfWidthInput
                  id="applicationDeathDelayedFee"
                  type="text"
                  topMargin={true}
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
