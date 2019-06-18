import * as React from 'react'
import styled from '@register/styledComponents'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { FormFieldGenerator } from '@register/components/form'
import { IFormSection, IFormSectionData } from '@register/forms'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { goToHome, goToUserReview } from '@register/navigation'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { modifyUserFormData } from '@register/views/SysAdmin/forms/userReducer'
import { replaceInitialValues } from '@register/views/RegisterForm/RegisterForm'
import { FormikTouched, FormikValues } from 'formik'
import { hasFormError } from '@register/forms/utils'

const messages = defineMessages({
  continue: {
    id: 'button.continue',
    defaultMessage: 'Continue',
    description: 'Continue button label'
  }
})
export const Container = styled.div`
  ${({ theme }) => theme.fonts.regularFont};
  ${({ theme }) => theme.shadows.mistyShadow};
  color: ${({ theme }) => theme.colors.copy};
  background: ${({ theme }) => theme.colors.white};
  padding: 24px 32px;
  margin: 36px auto 0;
  max-width: 940px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin: 0;
    padding: 24px;
    width: 100%;
    min-height: 100vh;
    margin-top: 0;
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
`

export const FormTitle = styled.div`
  ${({ theme }) => theme.fonts.h1Style};
  height: 72px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    display: none;
  }
`

const Action = styled.div`
  margin-top: 32px;
`
type IProps = {
  userForm: IFormSection
  data: IFormSectionData
  goToUserReview: typeof goToUserReview
  goToHome: typeof goToHome
  modifyUserFormData: typeof modifyUserFormData
}

type IFullProps = InjectedIntlProps & IProps & { dispatch: Dispatch }

class UserFormComponent extends React.Component<IFullProps> {
  setAllFormFieldsTouched!: (touched: FormikTouched<FormikValues>) => void

  handleFormAction = () => {
    const { userForm, data } = this.props
    if (hasFormError(userForm.fields, data)) {
      this.showAllValidationErrors()
    } else {
      this.props.goToUserReview()
    }
  }

  showAllValidationErrors = () => {
    const touched = this.props.userForm.fields.reduce(
      (memo, { name }) => ({ ...memo, [name]: true }),
      {}
    )
    this.setAllFormFieldsTouched(touched)
  }

  render = () => {
    const { userForm, intl } = this.props

    return (
      <>
        <ActionPageLight
          title={intl.formatMessage(userForm.title)}
          goBack={this.props.goToHome}
        >
          <Container>
            <FormTitle>{intl.formatMessage(userForm.title)}</FormTitle>
            <FormFieldGenerator
              id={userForm.id}
              onChange={this.props.modifyUserFormData}
              setAllFieldsDirty={false}
              fields={userForm.fields}
              onSetTouched={setTouchedFunc => {
                this.setAllFormFieldsTouched = setTouchedFunc
              }}
            />
            <Action>
              <PrimaryButton onClick={this.handleFormAction}>
                {intl.formatMessage(messages.continue)}
              </PrimaryButton>
            </Action>
          </Container>
        </ActionPageLight>
      </>
    )
  }
}

function mapStatetoProps(state: IStoreState) {
  const { userForm, userFormData } = state.userForm

  const fields = replaceInitialValues(userForm.fields, userFormData)

  return {
    language: state.i18n.language,
    userForm: {
      ...userForm,
      fields
    },
    data: userFormData
  }
}

export const UserForm = connect(
  mapStatetoProps,
  { goToUserReview, goToHome, modifyUserFormData }
)(injectIntl<IFullProps>(UserFormComponent))
