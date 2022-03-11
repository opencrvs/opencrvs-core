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
import { IOfflineData } from '@client/offline/reducer'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { IAttachmentValue } from '@client/forms'

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
type IApplicationConfigName = {
  APPLICATION_NAME?: string
  GOVT_LOGO?: string
  COUNTRY_LOGO_FILE_NAME?: string
}
type State = {
  applicationName: string
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

class DynamicModalComponent extends React.Component<IFullProps, State> {
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      applicationName:
        props.offlineCountryConfiguration.config.APPLICATION_NAME,
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

  setGovtLogo = (data: string) => {
    this.setState(() => ({
      govtLogo: data
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
              messages.applicationNameChangeError
            )
          })
          valueChanged(
            NOTIFICATION_TYPE.ERROR,
            this.props.intl.formatMessage(messages.applicationNameChangeError)
          )
        })
    } else if (
      modalName === GeneralActionId.GOVT_LOGO &&
      value.GOVT_LOGO &&
      value.COUNTRY_LOGO_FILE_NAME
    ) {
      if (this.isWithinFileLength(value.GOVT_LOGO as string) === false) {
        this.setState({
          errorOccured: true,
          errorMessages: this.props.intl.formatMessage(
            messages.govtLogoFileLimitError
          ),
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
        this.callUpdateGovtLogoMutation(
          value.GOVT_LOGO,
          value.COUNTRY_LOGO_FILE_NAME
        )
          .then(() => {
            valueChanged(
              NOTIFICATION_TYPE.SUCCESS,
              this.props.intl.formatMessage(messages.govtLogoChangeNotification)
            )
          })
          .catch(() => {
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
          })
      }
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

  async callUpdateGovtLogoMutation(govtLogo: string, logoFileName: string) {
    try {
      this.setState({ updatingValue: true })
      const res = await configApplicationMutations.updateApplicationLogo(
        govtLogo,
        logoFileName
      )
      if (res && res.data) {
        this.setState({ updatingValue: false })
        const COUNTRY_LOGO_FILE =
          res.data.updateApplicationConfig.COUNTRY_LOGO.file
        const COUNTRY_LOGO_FILE_NAME =
          res.data.updateApplicationConfig.COUNTRY_LOGO.fileName
        const updatedOfflineConfig = {
          config: {
            ...this.props.offlineCountryConfiguration.config,
            COUNTRY_LOGO: {
              file: COUNTRY_LOGO_FILE,
              fileName: COUNTRY_LOGO_FILE_NAME
            }
          }
        }
        this.props.updateConfig(updatedOfflineConfig)
      }
    } catch (err) {
      this.setState({
        errorOccured: true,
        errorMessages: this.props.intl.formatMessage(
          messages.govtLogoChangeError
        )
      })
    }
  }

  getTitle(props: IFullProps) {
    const { intl, changeModalName } = props
    if (changeModalName === GeneralActionId.APPLICATION_NAME)
      return intl.formatMessage(messages.applicationNameLabel)
    else if (changeModalName === GeneralActionId.GOVT_LOGO)
      return intl.formatMessage(messages.govermentLogoLabel)
    return EMPTY_STRING
  }

  isApplyButtonDisabled(props: IFullProps) {
    const { changeModalName } = props
    if (changeModalName === GeneralActionId.APPLICATION_NAME) {
      return !Boolean(this.state.applicationName.length)
    } else if (changeModalName === GeneralActionId.GOVT_LOGO) {
      return !Boolean(this.state.govtLogo) || this.state.isFileUploading
    } else return true
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
    const { intl, changeModalName, toggleConfigModal, valueChanged } =
      this.props
    return (
      <ResponsiveModal
        id={`${changeModalName}Modal`}
        title={this.getTitle(this.props)}
        autoHeight={true}
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
            disabled={this.isApplyButtonDisabled(this.props)}
            onClick={() => {
              this.mutationHandler(
                changeModalName,
                {
                  APPLICATION_NAME: this.state.applicationName,
                  GOVT_LOGO: this.state.govtLogo,
                  COUNTRY_LOGO_FILE_NAME: this.state.logoFileName
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
          {changeModalName === GeneralActionId.APPLICATION_NAME &&
            intl.formatMessage(messages.applicationNameChangeMessage)}
          {changeModalName === GeneralActionId.GOVT_LOGO &&
            intl.formatMessage(messages.govtLogoChangeMessage)}
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
        {changeModalName === GeneralActionId.GOVT_LOGO && (
          <Content>
            <Field>
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
