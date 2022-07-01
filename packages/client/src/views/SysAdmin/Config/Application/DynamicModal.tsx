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
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import styled from '@client/styledComponents'
import { InputField, TextInput, Select } from '@opencrvs/components/lib/forms'
import {
  BirthActionId,
  DeathActionId,
  GeneralActionId
} from '@client/views/SysAdmin/Config/Application'
import { EMPTY_STRING } from '@client/utils/constants'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import ContentComponent from './NIDPhoneNumContent'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { IAttachmentValue } from '@client/forms'
import {
  getCurrencyObject,
  getCurrencySelectOptions,
  getTitle,
  getMessage,
  isApplyButtonDisabled,
  callApplicationConfigMutation,
  getFormattedFee,
  getCurrency
} from '@client/views/SysAdmin/Config/Application/utils'

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

export const InputContainer = styled.div`
  display: flex;
  margin-top: 30px;
  justify-content: center;
  align-items: center;
  gap: 8px;
`

export const HalfWidthInput = styled(TextInput)`
  width: 300px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const SmallWidthInput = styled(TextInput)`
  width: 78px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    width: 100%;
  }
`
const ErrorMessage = styled.div`
  position: relative;
  color: ${({ theme }) => theme.colors.negative};
  margin-left: 6px;
`
export type ICurrency = {
  isoCode: string | undefined
  languagesAndCountry: string[]
}
export type ICountryLogo = {
  fileName: string
  file: string
}

export type IBirth = {
  REGISTRATION_TARGET: number
  LATE_REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    LATE: number
    DELAYED: number
  }
}
export type IDeath = {
  REGISTRATION_TARGET: number
  FEE: {
    ON_TIME: number
    DELAYED: number
  }
}

export type IApplicationConfig = {
  APPLICATION_NAME: string
  NID_NUMBER_PATTERN: string
  PHONE_NUMBER_PATTERN: string
  COUNTRY_LOGO: ICountryLogo
  CURRENCY: ICurrency
  BIRTH: IBirth
  DEATH: IDeath
  HIDE_EVENT_REGISTER_INFORMATION: boolean
  ADDRESSES: number
}

export type IActionType =
  | keyof typeof GeneralActionId
  | keyof typeof BirthActionId
  | keyof typeof DeathActionId

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
  phoneNumberPattern: string
  phoneNumberExample: string
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
}

export type IFullProps = IProps

function DynamicModalComponent(props: IProps) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const offlineCountryConfiguration = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )
  const [applicationName, setApplicationName] = React.useState(
    offlineCountryConfiguration.config.APPLICATION_NAME
  )
  const [currency, setCurrency] = React.useState(
    `${offlineCountryConfiguration.config.CURRENCY.languagesAndCountry[0]}-${offlineCountryConfiguration.config.CURRENCY.isoCode}`
  )
  const [birthRegistrationTarget, setBirthRegistrationTarget] = React.useState(
    String(offlineCountryConfiguration.config.BIRTH.REGISTRATION_TARGET)
  )
  const [birthLateRegistrationTarget, setBirthLateRegistrationTarget] =
    React.useState(
      String(offlineCountryConfiguration.config.BIRTH.LATE_REGISTRATION_TARGET)
    )
  const [deathRegistrationTarget, setDeathRegistrationTarget] = React.useState(
    String(offlineCountryConfiguration.config.DEATH.REGISTRATION_TARGET)
  )
  const [birthOnTimeFee, setBirthOnTimeFee] = React.useState(
    offlineCountryConfiguration.config.BIRTH.FEE.ON_TIME.toLocaleString()
  )
  const [birthLateFee, setBirthLateFee] = React.useState(
    offlineCountryConfiguration.config.BIRTH.FEE.LATE.toLocaleString()
  )
  const [birthDelayedFee, setBirthDelayedFee] = React.useState(
    offlineCountryConfiguration.config.BIRTH.FEE.DELAYED.toLocaleString()
  )
  const [deathOnTimeFee, setDeathOnTimeFee] = React.useState(
    offlineCountryConfiguration.config.DEATH.FEE.ON_TIME.toLocaleString()
  )
  const [deathDelayedFee, setDeathDelayedFee] = React.useState(
    offlineCountryConfiguration.config.DEATH.FEE.DELAYED.toLocaleString()
  )
  const [nidPattern, setNidPattern] = React.useState(
    String(offlineCountryConfiguration.config.NID_NUMBER_PATTERN)
  )
  const [nidExample, setNidExample] = React.useState(EMPTY_STRING)
  const [phoneNumberPattern, setPhoneNumberPattern] = React.useState(
    String(offlineCountryConfiguration.config.PHONE_NUMBER_PATTERN)
  )
  const [phoneNumberExample, setPhoneNumberExample] =
    React.useState(EMPTY_STRING)
  const [errorOccured, setErrorOccured] = React.useState(false)
  const [errorMessages, setErrorMessages] = React.useState(EMPTY_STRING)
  const [govtLogo, setGovtLogo] = React.useState(EMPTY_STRING)
  const [logoFile, setLogoFile] = React.useState<{
    name?: string
    type: string
    data: string
  }>({
    name: EMPTY_STRING,
    type: EMPTY_STRING,
    data: EMPTY_STRING
  })
  const [isFileUploading, setIsFileUploading] = React.useState(false)
  const [logoFileName, setLogoFileName] = React.useState(EMPTY_STRING)
  const [isValueUpdating, setIsValueUpdating] = React.useState(false)
  const showChangeModal = Boolean(props.changeModalName)
  const state: IState = {
    applicationName,
    currency,
    birthRegistrationTarget,
    birthLateRegistrationTarget,
    deathRegistrationTarget,
    birthOnTimeFee,
    birthLateFee,
    birthDelayedFee,
    deathOnTimeFee,
    deathDelayedFee,
    nidPattern,
    nidExample,
    phoneNumberPattern,
    phoneNumberExample,
    errorOccured,
    errorMessages,
    govtLogo,
    logoFile,
    logoFileName,
    isFileUploading
  }

  const handleApplicationName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    setApplicationName(value)
  }

  const handleBirthRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      setBirthRegistrationTarget(value)
      setBirthLateRegistrationTarget(
        Number(value) > Number(birthLateRegistrationTarget)
          ? String(Number(value) + 2)
          : birthLateRegistrationTarget
      )
    }
  }

  const handleDeathRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      setDeathRegistrationTarget(value)
    }
  }

  const handleBirthOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setBirthOnTimeFee(getFormattedFee(value))
  }

  const handleBirthLateFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setBirthLateFee(getFormattedFee(value))
  }

  const handleBirthDelayedFee = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    setBirthDelayedFee(getFormattedFee(value))
  }

  const handleDeathOnTimeFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = String(event.target.value)
    setDeathOnTimeFee(getFormattedFee(value))
  }

  const handleDeathDelayedFee = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    setDeathDelayedFee(getFormattedFee(value))
  }

  const handleBirthLateRegistrationTarget = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = String(event.target.value)
    if ((!value.includes('.') && /^\d+$/.test(value)) || !value) {
      setBirthLateRegistrationTarget(value)
    }
  }

  const handleGovtLogo = (data: string) => {
    setGovtLogo(data)
  }

  const handleNIDPattern = (event: React.ChangeEvent<HTMLInputElement>) => {
    const pattern = event.target.value
    setNidPattern(pattern)
  }

  const handleNIDExample = (event: React.ChangeEvent<HTMLInputElement>) => {
    const example = event.target.value
    setNidExample(example)
  }

  const handlePhoneNumberPattern = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pattern = event.target.value
    setPhoneNumberPattern(pattern)
  }

  const handlePhoneNumberExample = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const example = event.target.value
    setPhoneNumberExample(example)
  }

  const handleLogoFile = (data: IAttachmentValue) => {
    setLogoFile(data)
  }

  const handleLogoFileName = (attachment: IAttachmentValue) => {
    setLogoFileName(attachment.name ?? EMPTY_STRING)
  }

  const onUploadingStateChanged = (isUploading: boolean) => {
    setIsFileUploading(isUploading)
  }

  const setError = (errorMessage: string) => {
    setErrorOccured(true)
    setErrorMessages(errorMessage)
  }

  async function mutationHandler(
    modalName: IActionType,
    appConfig: IApplicationConfig,
    valueChanged: (
      notificationStatus: NOTIFICATION_TYPE,
      messages: string
    ) => void
  ) {
    if (
      modalName === GeneralActionId.COUNTRY_LOGO &&
      appConfig.COUNTRY_LOGO?.file &&
      appConfig.COUNTRY_LOGO?.fileName
    ) {
      if (isWithinFileLength(appConfig.COUNTRY_LOGO.file as string) === false) {
        setError(intl.formatMessage(messages.govtLogoFileLimitError))
        setGovtLogo(EMPTY_STRING)
        handleLogoFile({
          name: EMPTY_STRING,
          type: EMPTY_STRING,
          data: EMPTY_STRING
        })
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          intl.formatMessage(messages.govtLogoFileLimitError)
        )
      }
    }

    if (!errorOccured) {
      try {
        await callApplicationConfigMutation(
          modalName,
          appConfig,
          offlineCountryConfiguration,
          dispatch,
          setIsValueUpdating
        )
        const notificationText =
          modalName === GeneralActionId.APPLICATION_NAME
            ? intl.formatMessage(messages.applicationNameChangeNotification)
            : modalName === GeneralActionId.NID_NUMBER_PATTERN
            ? intl.formatMessage(messages.nidPatternChangeNotification)
            : modalName === GeneralActionId.PHONE_NUMBER_PATTERN
            ? intl.formatMessage(messages.phoneNumberChangeNotification)
            : modalName === GeneralActionId.COUNTRY_LOGO
            ? intl.formatMessage(messages.govtLogoChangeNotification)
            : modalName === GeneralActionId.CURRENCY
            ? intl.formatMessage(messages.applicationCurrencyChangeNotification)
            : modalName === BirthActionId.BIRTH_REGISTRATION_TARGET
            ? intl.formatMessage(
                messages.applicationBirthRegTargetChangeNotification
              )
            : modalName === BirthActionId.BIRTH_LATE_REGISTRATION_TARGET
            ? intl.formatMessage(
                messages.applicationBirthLateRegTargetChangeNotification
              )
            : modalName === BirthActionId.BIRTH_ON_TIME_FEE
            ? intl.formatMessage(
                messages.applicationBirthOnTimeFeeChangeNotification
              )
            : modalName === BirthActionId.BIRTH_LATE_FEE
            ? intl.formatMessage(
                messages.applicationBirthLateFeeChangeNotification
              )
            : modalName === BirthActionId.BIRTH_DELAYED_FEE
            ? intl.formatMessage(
                messages.applicationBirthDelayedFeeChangeNotification
              )
            : modalName === DeathActionId.DEATH_REGISTRATION_TARGET
            ? intl.formatMessage(
                messages.applicationDeathRegTargetChangeNotification
              )
            : modalName === DeathActionId.DEATH_ON_TIME_FEE
            ? intl.formatMessage(
                messages.applicationDeathOnTimeFeeChangeNotification
              )
            : modalName === DeathActionId.DEATH_DELAYED_FEE
            ? intl.formatMessage(
                messages.applicationDeathDelayedFeeChangeNotification
              )
            : EMPTY_STRING
        valueChanged(NOTIFICATION_TYPE.SUCCESS, notificationText)
      } catch {
        setError(intl.formatMessage(messages.applicationConfigChangeError))
        valueChanged(
          NOTIFICATION_TYPE.ERROR,
          modalName === GeneralActionId.COUNTRY_LOGO
            ? intl.formatMessage(messages.govtLogoChangeError)
            : intl.formatMessage(messages.applicationConfigChangeError)
        )
      }
    }
  }

  const isWithinFileLength = (base64data: string) => {
    const baseStr = base64data.substring(22)
    const decoded = window.atob(baseStr)
    if (decoded.length >= 2000000) {
      return false
    }
    return true
  }

  return (
    <ResponsiveModal
      id={`${props.changeModalName}Modal`}
      title={getTitle(intl, props.changeModalName)}
      autoHeight={true}
      titleHeightAuto={true}
      show={showChangeModal}
      contentScrollableY={
        props.changeModalName === GeneralActionId.CURRENCY ? true : false
      }
      actions={[
        <CancelButton
          key="cancel"
          id="modal_cancel"
          onClick={props.toggleConfigModal}
        >
          {intl.formatMessage(buttonMessages.cancel)}
        </CancelButton>,
        <ApplyButton
          key="apply"
          id="apply_change"
          disabled={isApplyButtonDisabled(state, props.changeModalName)}
          onClick={() => {
            mutationHandler(
              props.changeModalName as IActionType,
              {
                APPLICATION_NAME: applicationName,
                CURRENCY: getCurrencyObject(currency),
                BIRTH: {
                  REGISTRATION_TARGET: parseInt(birthRegistrationTarget),
                  LATE_REGISTRATION_TARGET: parseInt(
                    birthLateRegistrationTarget
                  ),
                  FEE: {
                    ON_TIME: parseFloat(birthOnTimeFee.replace(/,/g, '')),
                    LATE: parseFloat(birthLateFee.replace(/,/g, '')),
                    DELAYED: parseFloat(birthDelayedFee.replace(/,/g, ''))
                  }
                },
                DEATH: {
                  REGISTRATION_TARGET: parseInt(deathRegistrationTarget),
                  FEE: {
                    ON_TIME: parseFloat(deathOnTimeFee.replace(/,/g, '')),
                    DELAYED: parseFloat(deathDelayedFee.replace(/,/g, ''))
                  }
                },
                NID_NUMBER_PATTERN: nidPattern,
                PHONE_NUMBER_PATTERN: phoneNumberPattern,
                COUNTRY_LOGO: {
                  file: govtLogo,
                  fileName: logoFileName
                },
                HIDE_EVENT_REGISTER_INFORMATION:
                  offlineCountryConfiguration.config
                    .HIDE_EVENT_REGISTER_INFORMATION,
                ADDRESSES: offlineCountryConfiguration.config.ADDRESSES
              },
              props.valueChanged
            )
          }}
        >
          {intl.formatMessage(buttonMessages.apply)}
        </ApplyButton>
      ]}
      handleClose={props.toggleConfigModal}
    >
      <Message>{getMessage(intl, props.changeModalName)}</Message>
      {errorOccured && (
        <ErrorContent>
          <Alert color="invert" />
          <ErrorMessage>
            <div>{errorMessages}</div>
          </ErrorMessage>
        </ErrorContent>
      )}
      {props.changeModalName === GeneralActionId.APPLICATION_NAME && (
        <Content>
          <Field>
            <InputField id="applicationName" touched={true} required={false}>
              <HalfWidthInput
                id="applicationName"
                type="text"
                error={false}
                value={applicationName}
                onChange={handleApplicationName}
              />
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === GeneralActionId.NID_NUMBER_PATTERN && (
        <ContentComponent
          intl={intl}
          changeModalName={props.changeModalName}
          pattern={nidPattern}
          example={nidExample}
          setPattern={handleNIDPattern}
          setExample={handleNIDExample}
          patternErrorMessage={intl.formatMessage(
            messages.nidPatternChangeError
          )}
        />
      )}
      {props.changeModalName === GeneralActionId.PHONE_NUMBER_PATTERN && (
        <ContentComponent
          intl={intl}
          changeModalName={props.changeModalName}
          pattern={phoneNumberPattern}
          example={phoneNumberExample}
          setPattern={handlePhoneNumberPattern}
          setExample={handlePhoneNumberExample}
          patternErrorMessage={intl.formatMessage(
            messages.phoneNumberChangeError
          )}
        />
      )}
      {props.changeModalName === GeneralActionId.COUNTRY_LOGO && (
        <Content>
          <Field id="govtLogoFile">
            <SimpleDocumentUploader
              label={logoFile.name ? logoFile.name : ''}
              disableDeleteInPreview={false}
              name={intl.formatMessage(messages.govermentLogoLabel)}
              allowedDocType={['image/png', 'image/svg']}
              onComplete={(file) => {
                setErrorOccured(false)
                setErrorMessages(EMPTY_STRING)
                handleGovtLogo((file as IAttachmentValue).data as string)
                handleLogoFile(file as IAttachmentValue)
                handleLogoFileName(file as IAttachmentValue)
              }}
              files={logoFile}
              onUploadingStateChanged={onUploadingStateChanged}
              error={errorMessages}
            />
          </Field>
        </Content>
      )}
      {props.changeModalName === GeneralActionId.CURRENCY && (
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
                  setCurrency(val)
                }}
                value={currency}
                options={getCurrencySelectOptions()}
              />
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === BirthActionId.BIRTH_REGISTRATION_TARGET && (
        <Content>
          <Field>
            <InputField
              id="applicationBirthRegTarget"
              touched={true}
              required={false}
            >
              <InputContainer>
                <SmallWidthInput
                  id="applicationBirthRegTarget"
                  type="text"
                  error={false}
                  value={birthRegistrationTarget}
                  onChange={handleBirthRegistrationTarget}
                />
                <span>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </span>
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName ===
        BirthActionId.BIRTH_LATE_REGISTRATION_TARGET && (
        <Content>
          <Field>
            <InputField
              id="applicationBirthLateRegTarget"
              touched={true}
              required={false}
            >
              <InputContainer>
                <SmallWidthInput
                  id="applicationBirthLateRegTarget"
                  type="text"
                  error={false}
                  value={birthLateRegistrationTarget}
                  onChange={handleBirthLateRegistrationTarget}
                />
                <span>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </span>
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === DeathActionId.DEATH_REGISTRATION_TARGET && (
        <Content>
          <Field>
            <InputField
              id="applicationDeathRegTarget"
              touched={true}
              required={false}
            >
              <InputContainer>
                <SmallWidthInput
                  id="applicationDeathRegTarget"
                  type="text"
                  error={false}
                  value={deathRegistrationTarget}
                  onChange={handleDeathRegistrationTarget}
                />
                <span>
                  {intl.formatMessage(messages.eventTargetInputLabel)}
                </span>
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === BirthActionId.BIRTH_ON_TIME_FEE && (
        <Content>
          <Field>
            <InputField
              id="applicationBirthOnTimeFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationBirthOnTimeFee"
                  type="text"
                  error={false}
                  value={birthOnTimeFee}
                  onChange={handleBirthOnTimeFee}
                />
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === BirthActionId.BIRTH_LATE_FEE && (
        <Content>
          <Field>
            <InputField
              id="applicationBirthLateFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationBirthLateFee"
                  type="text"
                  error={false}
                  value={birthLateFee}
                  onChange={handleBirthLateFee}
                />
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === BirthActionId.BIRTH_DELAYED_FEE && (
        <Content>
          <Field>
            <InputField
              id="applicationBirthDelayedFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationBirthDelayedFee"
                  type="text"
                  error={false}
                  value={birthDelayedFee}
                  onChange={handleBirthDelayedFee}
                />
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === DeathActionId.DEATH_ON_TIME_FEE && (
        <Content>
          <Field>
            <InputField
              id="applicationDeathOnTimeFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationDeathOnTimeFee"
                  type="text"
                  error={false}
                  value={deathOnTimeFee}
                  onChange={handleDeathOnTimeFee}
                />
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
      {props.changeModalName === DeathActionId.DEATH_DELAYED_FEE && (
        <Content>
          <Field>
            <InputField
              id="applicationDeathDelayedFee"
              touched={true}
              required={false}
            >
              <InputContainer>
                <span>{getCurrency(offlineCountryConfiguration)}</span>
                <HalfWidthInput
                  id="applicationDeathDelayedFee"
                  type="text"
                  error={false}
                  value={deathDelayedFee}
                  onChange={handleDeathDelayedFee}
                />
              </InputContainer>
            </InputField>
          </Field>
        </Content>
      )}
    </ResponsiveModal>
  )
}

export const DynamicModal = DynamicModalComponent
