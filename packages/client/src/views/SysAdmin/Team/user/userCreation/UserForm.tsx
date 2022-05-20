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
import { FormFieldGenerator } from '@client/components/form'
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import {
  getSectionFields,
  getVisibleGroupFields,
  hasFormError
} from '@client/forms/utils'
import {
  buttonMessages,
  validationMessages as messages
} from '@client/i18n/messages'
import {
  goBack,
  goToCreateUserSection,
  goToUserReviewForm
} from '@client/navigation'
import { IStoreState } from '@client/store'
import styled from '@client/styledComponents'
import { clearUserFormData, modifyUserFormData } from '@client/user/userReducer'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormikTouched, FormikValues } from 'formik'
import * as React from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { Content } from '@opencrvs/components/lib/interface/Content'

export const FormTitle = styled.div`
  ${({ theme }) => theme.fonts.h1};
  height: 72px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

type IProps = {
  userId?: string
  section: IFormSection
  formData: IFormSectionData
  activeGroup: IFormSectionGroup
  nextSectionId: string
  nextGroupId: string
  offlineCountryConfig: IOfflineData
}

type IState = {
  disableContinueOnLocation: boolean
  fileUploading: boolean
}

type IDispatchProps = {
  goBack: typeof goBack
  modifyUserFormData: typeof modifyUserFormData
  goToCreateUserSection: typeof goToCreateUserSection
  goToUserReviewForm: typeof goToUserReviewForm
  clearUserFormData: typeof clearUserFormData
}
type IFullProps = IntlShapeProps & IProps & IDispatchProps

class UserFormComponent extends React.Component<IFullProps, IState> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void
  constructor(props: IFullProps) {
    super(props)
    this.state = {
      disableContinueOnLocation: false,
      fileUploading: false
    }
  }

  handleFormAction = () => {
    const { formData, activeGroup, offlineCountryConfig } = this.props
    if (hasFormError(activeGroup.fields, formData, offlineCountryConfig)) {
      this.showAllValidationErrors()
    } else {
      this.props.userId
        ? this.props.goToUserReviewForm(
            this.props.userId,
            this.props.nextSectionId,
            this.props.nextGroupId
          )
        : this.props.goToCreateUserSection(
            this.props.nextSectionId,
            this.props.nextGroupId
          )
    }
  }

  onUploadingStateChanged = (isUploading: boolean) => {
    this.setState({
      ...this.state,
      fileUploading: isUploading
    })
  }

  showAllValidationErrors = () => {
    const touched = getSectionFields(
      this.props.section,
      this.props.formData
    ).reduce((memo, { name }) => ({ ...memo, [name]: true }), {})
    this.setAllFormFieldsTouched(touched)
  }

  handleBackAction = () => {
    this.props.goBack()
  }

  modifyData = (values: any) => {
    const { formData } = this.props
    if (
      values['registrationOffice'] !== '0' &&
      values['registrationOffice'] !== ''
    ) {
      this.props.modifyUserFormData({ ...formData, ...values })
      this.setState({
        disableContinueOnLocation: false
      })
    } else {
      this.setState({
        disableContinueOnLocation: true
      })
    }
  }

  render = () => {
    const { section, intl, activeGroup, userId } = this.props

    return (
      <>
        <ActionPageLight
          hideBackground
          title={
            userId
              ? intl.formatMessage(sysAdminMessages.editUserDetailsTitle)
              : intl.formatMessage(section.title)
          }
          goBack={this.handleBackAction}
        >
          <Content
            title={
              userId
                ? intl.formatMessage(sysAdminMessages.editUserCommonTitle)
                : intl.formatMessage(activeGroup.title || section.title)
            }
            bottomActionButtons={[
              <PrimaryButton
                id="confirm_form"
                onClick={this.handleFormAction}
                disabled={
                  this.state.disableContinueOnLocation ||
                  this.state.fileUploading
                }
              >
                {intl.formatMessage(buttonMessages.continueButton)}
              </PrimaryButton>
            ]}
          >
            <FormFieldGenerator
              key={activeGroup.id}
              id={section.id}
              onChange={(values) => this.modifyData(values)}
              setAllFieldsDirty={false}
              fields={getVisibleGroupFields(activeGroup)}
              onSetTouched={(setTouchedFunc) => {
                this.setAllFormFieldsTouched = setTouchedFunc
              }}
              requiredErrorMessage={messages.requiredForNewUser}
              onUploadingStateChanged={this.onUploadingStateChanged}
            />
          </Content>
        </ActionPageLight>
      </>
    )
  }
}

const mapStateToProps = (
  state: IStoreState
): { offlineCountryConfig: IOfflineData } => {
  return {
    offlineCountryConfig: getOfflineData(state)
  }
}

export const UserForm = connect(mapStateToProps, {
  modifyUserFormData,
  goToCreateUserSection,
  goToUserReviewForm,
  goBack,
  clearUserFormData
})(injectIntl(UserFormComponent))
