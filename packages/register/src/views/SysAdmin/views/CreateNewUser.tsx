import { IFormSection, IFormSectionData } from '@register/forms'
import { IStoreState } from '@register/store'
import { replaceInitialValues } from '@register/views/RegisterForm/RegisterForm'
import { UserForm } from '@register/views/SysAdmin/views/UserForm'
import { UserReviewForm } from '@register/views/SysAdmin/views/UserReviewForm'
import * as React from 'react'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'

interface IMatchParams {
  sectionId: string
}

type INewUserProps = {
  section: IFormSection
  formData: IFormSectionData
}

type Props = RouteComponentProps<IMatchParams> &
  INewUserProps &
  InjectedIntlProps

class CreateNewUserComponent extends React.Component<Props> {
  render() {
    const { section } = this.props

    if (section.viewType === 'form') {
      return <UserForm {...this.props} />
    }

    if (section.viewType === 'preview') {
      return <UserReviewForm {...this.props} />
    }
  }
}

const mapStateToProps = (state: IStoreState, props: Props) => {
  const sectionId =
    (props.match.params.sectionId && props.match.params.sectionId) ||
    state.userForm.userForm.sections[0].id
  const section = state.userForm.userForm.sections.find(
    section => section.id === sectionId
  )

  if (!section) {
    throw new Error(`No section found ${sectionId}`)
  }

  const fields = replaceInitialValues(
    section.fields,
    state.userForm.userFormData
  )

  return {
    sectionId: sectionId,
    section: {
      ...section,
      fields
    },
    formData: state.userForm.userFormData
  }
}

export const CreateNewUser = connect(mapStateToProps)(
  injectIntl(CreateNewUserComponent)
)
