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
import { InputField, TextInput } from '@opencrvs/components/lib/forms'
import { GeneralActionId } from '@client/views/SysAdmin/Config/Application'
import { EMPTY_STRING } from '@client/utils/constants'
import { Alert } from '@opencrvs/components/lib/icons/Alert'
import { updateOfflineConfigData } from '@client/offline/actions'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import ContentComponent from '@client/views/SysAdmin/Config/NIDPhoneNumContent'
import { IOfflineData } from '@client/offline/reducer'
import {
  isApplyButtonDisabled,
  getTitle,
  getMessage,
  callUpdateNIDPatternMutation,
  callUpdateApplicationNameMutation,
  callUpdatePhoneNumberPatternMutation
} from '@client/views/SysAdmin/Config/Utils'

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
  margin-bottom: 20px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    flex-direction: column-reverse;
  }
`
export const Field = styled.div`
  margin-bottom: 30px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-bottom: 0px;
  }
`
export const HalfWidthInput = styled(TextInput)`
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
export type IApplicationConfig = {
  APPLICATION_NAME?: string
  NID_NUMBER_PATTERN?: string
  PHONE_NUMBER_PATTERN?: string
}
export type IState = {
  applicationName: string
  nidPattern: string
  nidExample: string
  testNid: boolean
  phoneNumberPattern: string
  phoneNumberExample: string
  testPhoneNumber: boolean
  updatingValue: boolean
  errorOccured: boolean
  errorMessages: string
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
    this.state = {
      applicationName:
        props.offlineCountryConfiguration.config.APPLICATION_NAME,
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
          this.setUpdatingValue,
          this.setError
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
          this.setUpdatingValue,
          this.setError
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
          this.setUpdatingValue,
          this.setError
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
  }

  render() {
    const { intl, changeModalName, toggleConfigModal, valueChanged } =
      this.props
    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={getTitle(intl, changeModalName)}
        autoHeight={true}
        titleHeightAuto={changeModalName === GeneralActionId.NID_PATTERN}
        show={this.showChangeModal}
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
                  NID_NUMBER_PATTERN: this.state.nidPattern,
                  PHONE_NUMBER_PATTERN: this.state.phoneNumberPattern
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
