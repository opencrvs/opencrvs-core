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
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@client/components/form'
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@client/forms'
import {
  getSectionFields,
  hasFormError,
  getVisibleGroupFields
} from '@client/forms/utils'
import { goToCreateUserSection, goBack } from '@client/navigation'
import styled from '@client/styledComponents'
import {
  modifyUserFormData,
  clearUserFormData
} from '@client/views/SysAdmin/forms/userReducer'
import { FormikTouched, FormikValues } from 'formik'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import {
  buttonMessages,
  validationMessages as messages
} from '@client/i18n/messages'
import { userSection } from '@client/views/SysAdmin/forms/fieldDefinitions/user-section'

export const FormTitle = styled.div`
  ${({ theme }) => theme.fonts.h2Style};
  height: 72px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`
export const Action = styled.div`
  margin-top: 32px;
`

type IProps = {
  section: IFormSection
  formData: IFormSectionData
  activeGroup: IFormSectionGroup
  nextSectionId: string
  nextGroupId: string
}

type IDispatchProps = {
  goBack: typeof goBack
  modifyUserFormData: typeof modifyUserFormData
  goToCreateUserSection: typeof goToCreateUserSection
  clearUserFormData: typeof clearUserFormData
}
type IFullProps = IntlShapeProps & IProps & IDispatchProps

class UserFormComponent extends React.Component<IFullProps> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  handleFormAction = () => {
    const { formData, activeGroup } = this.props
    if (hasFormError(activeGroup.fields, formData)) {
      this.showAllValidationErrors()
    } else {
      this.props.goToCreateUserSection(
        this.props.nextSectionId,
        this.props.nextGroupId
      )
    }
  }

  showAllValidationErrors = () => {
    const touched = getSectionFields(this.props.section).reduce(
      (memo, { name }) => ({ ...memo, [name]: true }),
      {}
    )
    this.setAllFormFieldsTouched(touched)
  }

  handleBackAction = () => {
    this.props.goBack()
    if (this.props.activeGroup.id === userSection.groups[0].id) {
      this.props.clearUserFormData()
    }
  }

  modifyData = (values: any) => {
    const { formData } = this.props
    this.props.modifyUserFormData({ ...formData, ...values })
  }

  render = () => {
    const { section, intl, activeGroup } = this.props

    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(section.title)}
          goBack={this.handleBackAction}
        >
          <FormTitle id="form-title">
            {intl.formatMessage(activeGroup.title || section.title)}
          </FormTitle>
          <FormFieldGenerator
            key={activeGroup.id}
            id={section.id}
            onChange={values => this.modifyData(values)}
            setAllFieldsDirty={false}
            fields={getVisibleGroupFields(activeGroup)}
            onSetTouched={setTouchedFunc => {
              this.setAllFormFieldsTouched = setTouchedFunc
            }}
            requiredErrorMessage={messages.requiredForNewUser}
          />
          <Action>
            <PrimaryButton id="confirm_form" onClick={this.handleFormAction}>
              {intl.formatMessage(buttonMessages.continueButton)}
            </PrimaryButton>
          </Action>
        </ActionPageLight>
      </>
    )
  }
}

export const UserForm = connect(
  undefined,
  { modifyUserFormData, goToCreateUserSection, goBack, clearUserFormData }
)(injectIntl(UserFormComponent))
