import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { ActionPageLight } from '@opencrvs/components/lib/interface'
import { FormFieldGenerator } from '@register/components/form'
import {
  IFormSection,
  IFormSectionData,
  IFormSectionGroup
} from '@register/forms'
import {
  getSectionFields,
  hasFormError,
  getVisibleGroupFields
} from '@register/forms/utils'
import { goToCreateUserSection, goBack } from '@register/navigation'
import styled from '@register/styledComponents'
import {
  modifyUserFormData,
  clearUserFormData
} from '@register/views/SysAdmin/forms/userReducer'
import { FormikTouched, FormikValues } from 'formik'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { buttonMessages } from '@register/i18n/messages'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'

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
