import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@register/components/form'
import { IFormSection, IFormSectionData } from '@register/forms'
import { hasFormError } from '@register/forms/utils'
import { goToCreateUserSection, goToHome } from '@register/navigation'
import styled from '@register/styledComponents'
import {
  modifyUserFormData,
  clearUserFormData
} from '@register/views/SysAdmin/forms/userReducer'
import { FormikTouched, FormikValues } from 'formik'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'

const messages = defineMessages({
  continue: {
    id: 'button.continue',
    defaultMessage: 'Continue',
    description: 'Continue button label'
  }
})

export const FormTitle = styled.div`
  ${({ theme }) => theme.fonts.h1Style};
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
  goToHome: typeof goToHome
  modifyUserFormData: typeof modifyUserFormData
  goToCreateUserSection: typeof goToCreateUserSection
  clearUserFormData: typeof clearUserFormData
  formData: IFormSectionData
}

type IFullProps = InjectedIntlProps & IProps

class UserFormComponent extends React.Component<IFullProps> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  handleFormAction = () => {
    const { section, formData } = this.props
    if (hasFormError(section.fields, formData)) {
      this.showAllValidationErrors()
    } else {
      this.props.goToCreateUserSection('preview')
    }
  }

  showAllValidationErrors = () => {
    const touched = this.props.section.fields.reduce(
      (memo, { name }) => ({ ...memo, [name]: true }),
      {}
    )
    this.setAllFormFieldsTouched(touched)
  }

  handleBackAction = () => {
    this.props.goToHome()
    this.props.clearUserFormData()
  }

  render = () => {
    const { section, intl } = this.props

    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(section.title)}
          goBack={this.handleBackAction}
        >
          <FormTitle>{intl.formatMessage(section.title)}</FormTitle>
          <FormFieldGenerator
            id={section.id}
            onChange={this.props.modifyUserFormData}
            setAllFieldsDirty={false}
            fields={section.fields}
            onSetTouched={setTouchedFunc => {
              this.setAllFormFieldsTouched = setTouchedFunc
            }}
          />
          <Action>
            <PrimaryButton onClick={this.handleFormAction}>
              {intl.formatMessage(messages.continue)}
            </PrimaryButton>
          </Action>
        </ActionPageLight>
      </>
    )
  }
}

export const UserForm = connect(
  null,
  { modifyUserFormData, goToCreateUserSection, goToHome, clearUserFormData }
)(injectIntl<IFullProps>(UserFormComponent))
