import {
  DataSection,
  IDataProps,
  ActionPageLight
} from '@opencrvs/components/lib/interface'
import {
  FIELD_GROUP_TITLE,
  IFormField,
  IFormSection,
  IFormSectionData
} from '@register/forms'
import { goToCreateUserSection, goBack } from '@register/navigation'
import * as React from 'react'
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { FormTitle, Action } from '@register/views/SysAdmin/views/UserForm'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Dispatch } from 'redux'
import { submitUserFormData } from '@register/views/SysAdmin/forms/userReducer'
import ApolloClient from 'apollo-client'
import { createUserMutation } from '@register/views/SysAdmin/user/mutations'
import { draftToGqlTransformer } from '@register/transformer'
import { userSection } from '@register/views/SysAdmin/forms/fieldDefinitions/user-section'
import { IDynamicValues } from '@opencrvs/components/lib/common-types'
import { roleMessages, typeMessages } from '@register/utils/roleTypeMessages'
import { getSectionFields } from '@register/forms/utils'

export interface IUserReviewFormProps {
  section: IFormSection
  formData: IFormSectionData
  client: ApolloClient<unknown>
}

interface IDispatchProps {
  goToCreateUserSection: (sec: string, fieldName: string) => void
  submitForm: () => void
  goBack: typeof goBack
}

interface ISectionData {
  title: string
  items: IDataProps[]
}

type IFullProps = IUserReviewFormProps & InjectedIntlProps

const messages = defineMessages({
  actionChange: {
    id: 'buttons.change',
    defaultMessage: 'Change',
    description: 'Change action'
  },
  submit: {
    id: 'user.form.buttons.submit',
    defaultMessage: 'Create user',
    description: 'Label for submit button of user creation form'
  }
})

class UserReviewFormComponent extends React.Component<
  IFullProps & IDispatchProps
> {
  transformSectionData = () => {
    const { intl, section } = this.props
    const sections: ISectionData[] = []
    getSectionFields(section).forEach((field: IFormField) => {
      if (field && field.type === FIELD_GROUP_TITLE) {
        sections.push({ title: intl.formatMessage(field.label), items: [] })
      } else if (field && sections.length > 0) {
        sections[sections.length - 1].items.push({
          label: intl.formatMessage(field.label),
          value: this.getValue(field),
          action: {
            id: `btn_change_${field.name}`,
            label: intl.formatMessage(messages.actionChange),
            handler: () => this.props.goToCreateUserSection('user', field.name)
          }
        })
      }
    })

    return sections
  }

  getValue = (field: IFormField) => {
    const { intl, formData } = this.props
    return formData[field.name]
      ? typeof formData[field.name] !== 'object'
        ? field.name === 'role'
          ? intl.formatMessage(roleMessages[formData.role as string])
          : field.name === 'type'
          ? intl.formatMessage(typeMessages[formData.type as string])
          : String(formData[field.name])
        : (formData[field.name] as IDynamicValues).label
      : ''
  }

  render() {
    const { intl, section } = this.props

    return (
      <ActionPageLight
        title={intl.formatMessage(section.title)}
        goBack={this.props.goBack}
      >
        <FormTitle id={`${section.id}_title`}>
          {intl.formatMessage(section.name)}
        </FormTitle>
        {this.transformSectionData().map((sec, index) => (
          <DataSection key={index} {...sec} />
        ))}
        <Action>
          <PrimaryButton id="submit_user_form" onClick={this.props.submitForm}>
            {intl.formatMessage(messages.submit)}
          </PrimaryButton>
        </Action>
      </ActionPageLight>
    )
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: IFullProps) => {
  return {
    goToCreateUserSection: (sec: string, fieldName: string) =>
      dispatch(goToCreateUserSection(sec, fieldName)),
    goBack: () => dispatch(goBack()),
    submitForm: () => {
      const variables = draftToGqlTransformer(
        { sections: [userSection] },
        { user: props.formData }
      )
      dispatch(submitUserFormData(props.client, createUserMutation, variables))
    }
  }
}
export const UserReviewForm = connect(
  null,
  mapDispatchToProps
)(injectIntl<IFullProps & IDispatchProps>(UserReviewFormComponent))
