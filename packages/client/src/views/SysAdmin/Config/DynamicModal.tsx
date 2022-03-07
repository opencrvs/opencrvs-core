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
import {
  PrimaryButton,
  TertiaryButton,
  LinkButton
} from '@opencrvs/components/lib/buttons'
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
import { IOfflineData } from '@client/offline/reducer'
import { Cross } from '@opencrvs/components/lib/icons'
import { SuccessSmall } from '@opencrvs/components/lib/icons/SuccessSmall'

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

const ErrorMessageBottom = styled.div<{ marginTop?: number }>`
  position: relative;
  ${({ theme }) => theme.fonts.subtitleStyle};
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ marginTop }) => (marginTop ? `${marginTop}px` : `0px`)};
`

const SuccessMessage = styled.div`
  ${({ theme }) => theme.fonts.subtitleStyle};
  color: ${({ theme }) => theme.colors.success};
  margin-left: 9px;
`

const InputContainer = styled.div<{ displayFlex?: boolean }>`
  width: 100%;
  ${({ displayFlex }) =>
    displayFlex &&
    ` display: flex;
      flex-flow: row;
    `}

  padding-bottom: 32px;
  :last-child {
    padding-bottom: 0px;
  }
`

const ExampleValidityContainer = styled.div`
  margin-top: 40px;
  margin-left: 17px;
  display: flex;
  height: 21px;
`

const LinkButtonContainer = styled.div`
  margin-top: 13px;
`

type IApplicationName = {
  applicatioName: string
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

type IFullProps = IProps & IntlShapeProps & DispatchProps

function isApplicationName(
  modalName: string,
  value: IApplicationName
): value is IApplicationName {
  return modalName === GeneralActionId.APPLICATION_NAME
}
class DynamicModalComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      applicationName: EMPTY_STRING,
      nidPattern: EMPTY_STRING,
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
    value: IApplicationName,
    valueChanged: (
      notificationStatus: NOTIFICATION_TYPE,
      messages: string
    ) => void
  ) {
    if (isApplicationName(modalName, value)) {
      this.callUpdateApplicationNameMutation(value.applicatioName)
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
              messages.applicationNameChangeError
            )
          })
          valueChanged(
            NOTIFICATION_TYPE.ERROR,
            this.props.intl.formatMessage(messages.applicationNameChangeError)
          )
        })
    }
  }

  async callUpdateApplicationNameMutation(applicationName: string) {
    try {
      this.setState({ updatingValue: true })
      const res = await configApplicationMutations.updateApplicationName(
        applicationName
      )
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
          messages.applicationNameChangeError
        )
      })
    }
  }

  getTitle(props: IFullProps) {
    const { intl, changeModalName } = props
    if (changeModalName === GeneralActionId.APPLICATION_NAME)
      return intl.formatMessage(messages.applicationNameLabel)
    else return intl.formatMessage(messages.nidPatternTitle)
  }

  isValidRegEx(pattern: string) {
    try {
      const value = ''
      value.match(pattern)
    } catch {
      return false
    }
    return true
  }

  isApplyButtonDisable(props: IFullProps) {
    const { changeModalName } = props
    if (changeModalName === GeneralActionId.APPLICATION_NAME) {
      return !Boolean(this.state.applicationName.length)
    } else if (changeModalName === GeneralActionId.NID_PATTERN) {
      return (
        !this.isValidRegEx(this.state.nidPattern) ||
        !Boolean(this.state.nidPattern)
      )
    } else return true
  }

  isValidExample(pattern: string, example: string) {
    if (
      !this.isValidRegEx(pattern) ||
      !example.match(pattern) ||
      !pattern ||
      !example
    )
      return false
    else return true
  }

  render() {
    const { intl, changeModalName, toggleConfigModal, valueChanged } =
      this.props
    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={this.getTitle(this.props)}
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
            disabled={this.isApplyButtonDisable(this.props)}
            onClick={() => {
              this.mutationHandler(
                changeModalName,
                { applicatioName: this.state.applicationName },
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
          <Content>
            <Field>
              <InputContainer>
                <InputField
                  id="nidPattern"
                  touched={false}
                  required={true}
                  label={intl.formatMessage(messages.pattern)}
                  error={intl.formatMessage(messages.nidPatternChangeError)}
                  ignoreMediaQuery={true}
                >
                  <HalfWidthInput
                    id="applicationName"
                    type="text"
                    error={!this.isValidRegEx(this.state.nidPattern)}
                    value={this.state.nidPattern}
                    onChange={this.setNIDPattern}
                    ignoreMediaQuery={true}
                  />
                </InputField>
                <ErrorMessageBottom id="nid-regex-error" marginTop={6}>
                  {!this.isValidRegEx(this.state.nidPattern) &&
                    intl.formatMessage(messages.nidPatternChangeError)}
                </ErrorMessageBottom>
              </InputContainer>
              <InputContainer displayFlex={true}>
                <div>
                  <InputField
                    id="nidExample"
                    touched={false}
                    required={false}
                    label={intl.formatMessage(messages.example)}
                    ignoreMediaQuery={true}
                  >
                    <HalfWidthInput
                      id="nidExample"
                      type="text"
                      error={false}
                      value={this.state.nidExample}
                      onChange={this.setNIDExample}
                      ignoreMediaQuery={true}
                    />
                  </InputField>
                  <LinkButtonContainer>
                    <LinkButton
                      id="test-nid-example"
                      onClick={() => {
                        this.setState(() => ({
                          testNid: true
                        }))
                      }}
                      textDecoration={'none'}
                    >
                      {intl.formatMessage(messages.testNumber)}
                    </LinkButton>
                  </LinkButtonContainer>
                </div>
                {this.state.testNid && (
                  <ExampleValidityContainer>
                    {this.isValidExample(
                      this.state.nidPattern,
                      this.state.nidExample
                    ) ? (
                      <>
                        <SuccessSmall />
                        <SuccessMessage>
                          {intl.formatMessage(messages.validExample)}
                        </SuccessMessage>
                      </>
                    ) : (
                      <>
                        <Cross color={'red'} />
                        <ErrorMessageBottom>
                          {intl.formatMessage(messages.invalidExample)}
                        </ErrorMessageBottom>
                      </>
                    )}
                  </ExampleValidityContainer>
                )}
              </InputContainer>
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
