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
import { configApplicationMutations } from '@client/views/SysAdmin/Config/mutations'
import { updateOfflineConfigData } from '@client/offline/actions'
import { IStoreState } from '@client/store'
import { getOfflineData } from '@client/offline/selectors'
import ContentComponent from '@client/views/SysAdmin/Config/NIDPhoneNumContent'
import { IOfflineData } from '@client/offline/reducer'

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

export type IApplicationConfigName = {
  APPLICATION_NAME?: string
  NID_NUMBER_PATTERN?: string
}
type State = {
  applicationName: string
  nidPattern: string
  nidExample: string
  testNid: boolean
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

type IFullProps = IProps & IntlShapeProps & DispatchProps

export function isValidRegEx(pattern: string): boolean {
  try {
    const value = ''
    value.match(pattern)
  } catch {
    return false
  }
  if (pattern === '') return false
  return true
}

class DynamicModalComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      applicationName:
        props.offlineCountryConfiguration.config.APPLICATION_NAME,
      nidPattern:
        props.offlineCountryConfiguration.config.NID_NUMBER_PATTERN.toString(),
      nidExample: EMPTY_STRING,
      testNid: false,
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
    } else if (
      modalName === GeneralActionId.NID_PATTERN &&
      value.NID_NUMBER_PATTERN
    ) {
      this.callUpdateNIDPatternMutation(value.NID_NUMBER_PATTERN)
        .then(() => {
          valueChanged(
            NOTIFICATION_TYPE.SUCCESS,
            this.props.intl.formatMessage(messages.nidPatternChangeNotification)
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

  async callUpdateNIDPatternMutation(nidPattern: string) {
    try {
      this.setState({ updatingValue: true })
      const res = await configApplicationMutations.mutateApplicationConfig({
        NID_NUMBER_PATTERN: nidPattern
      })
      if (res && res.data) {
        this.setState({ updatingValue: false })
        const NID_NUMBER_PATTERN =
          res.data.updateApplicationConfig.NID_NUMBER_PATTERN
        const offlineConfig = {
          config: {
            ...this.props.offlineCountryConfiguration.config,
            NID_NUMBER_PATTERN
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

  getTitle() {
    const { intl, changeModalName } = this.props
    if (changeModalName === GeneralActionId.APPLICATION_NAME)
      return intl.formatMessage(messages.applicationNameLabel)
    else if (changeModalName === GeneralActionId.NID_PATTERN)
      return intl.formatMessage(messages.nidPatternTitle)
    else return EMPTY_STRING
  }

  isApplyButtonDisable() {
    const { changeModalName } = this.props
    if (changeModalName === GeneralActionId.APPLICATION_NAME) {
      return !Boolean(this.state.applicationName)
    } else if (changeModalName === GeneralActionId.NID_PATTERN) {
      return (
        !isValidRegEx(this.state.nidPattern) || !Boolean(this.state.nidPattern)
      )
    } else return true
  }

  isValidExample(pattern: string, example: string) {
    if (
      !isValidRegEx(pattern) ||
      !new RegExp(pattern).test(example) ||
      !pattern ||
      !example
    ) {
      return false
    }
    return true
  }

  render() {
    const { intl, changeModalName, toggleConfigModal, valueChanged } =
      this.props
    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={this.getTitle()}
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
            disabled={this.isApplyButtonDisable()}
            onClick={() => {
              this.mutationHandler(
                changeModalName,
                {
                  APPLICATION_NAME: this.state.applicationName,
                  NID_NUMBER_PATTERN: this.state.nidPattern
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
            : intl.formatMessage(messages.nidPatternChangeMessage)}
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
        {changeModalName === GeneralActionId.NID_PATTERN && (
          <ContentComponent
            intl={intl}
            changeModalName={changeModalName}
            pattern={this.state.nidPattern}
            example={this.state.nidExample}
            setPattern={this.setNIDPattern}
            setExample={this.setNIDExample}
            isValidExample={this.isValidExample}
            patternErrorMessage={intl.formatMessage(
              messages.nidPatternChangeError
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
