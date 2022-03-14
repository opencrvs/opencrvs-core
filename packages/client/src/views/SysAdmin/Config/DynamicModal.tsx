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
import { IOfflineData } from '@client/offline/reducer'
import { SimpleDocumentUploader } from '@client/components/form/DocumentUploadfield/SimpleDocumentUploader'
import { IAttachmentValue } from '@client/forms'
import {
  getTitle,
  getMessage,
  isApplyButtonDisabled,
  callUpdateApplicationNameMutation,
  callUpdateGovtLogoMutation
} from '@client/views/SysAdmin/Config/utils'

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
const Field = styled.div`
  width: 100%;
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
export type IApplicationConfigName = {
  APPLICATION_NAME?: string
  COUNTRY_LOGO?: {
    fileName: string
    file: string
  }
}
export type State = {
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

export type IFullProps = IProps & IntlShapeProps & DispatchProps

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
      await callUpdateApplicationNameMutation(
        value.APPLICATION_NAME,
        this.props,
        this.setUpdatingValue,
        this.setError
      )
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
        await callUpdateGovtLogoMutation(
          value.COUNTRY_LOGO.file,
          value.COUNTRY_LOGO.fileName,
          this.props,
          this.setUpdatingValue,
          this.setError
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
        title={getTitle(intl, changeModalName)}
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
            disabled={isApplyButtonDisabled(this.state, changeModalName)}
            onClick={() => {
              this.mutationHandler(
                changeModalName,
                {
                  APPLICATION_NAME: this.state.applicationName,
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
