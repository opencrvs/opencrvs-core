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
import {
  Container,
  FormTitle,
  Action
} from '@register/views/SysAdmin/views/UserForm'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'

interface IUserReviewFormProps {
  section: IFormSection
  goToCreateUserSection: typeof goToCreateUserSection
  goBack: typeof goBack
  formData: IFormSectionData
}

interface ISectionData {
  title: string
  items: IDataProps[]
}

type IFullProps = IUserReviewFormProps & InjectedIntlProps

const messages = defineMessages({
  actionChange: {
    id: 'action.change',
    defaultMessage: 'Change',
    description: 'Change action'
  },
  submit: {
    id: 'createUser.buttons.submit',
    defaultMessage: 'Create user',
    description: 'Label for submit button of user creation form'
  }
})

class UserReviewFormComponent extends React.Component<IFullProps> {
  transformSectionData = () => {
    const { intl, formData } = this.props
    const dataEntries = Object.entries(formData)
    const sections: ISectionData[] = []
    dataEntries.forEach(([key, value]: [string, unknown]) => {
      const field = this.getField(key)
      if (field && field.type === FIELD_GROUP_TITLE) {
        sections.push({ title: intl.formatMessage(field.label), items: [] })
      } else if (field && sections.length > 0) {
        sections[sections.length - 1].items.push({
          label: intl.formatMessage(field.label),
          value: value as string,
          action: {
            id: `btn${field.name}`,
            label: intl.formatMessage(messages.actionChange),
            handler: () =>
              this.props.goToCreateUserSection('userForm', field.name)
          }
        })
      }
    })

    return sections
  }

  getField = (fieldName: string) => {
    const { section } = this.props
    const foundField = section.fields.find(
      (field: IFormField) => field.name === fieldName
    )
    return foundField
  }

  handleSubmit = () => {
    console.log('TO DO')
  }

  render() {
    const { intl, section } = this.props

    return (
      <ActionPageLight
        title={intl.formatMessage(section.title)}
        goBack={this.props.goBack}
      >
        <Container>
          <FormTitle>{intl.formatMessage(section.name)}</FormTitle>
          {this.transformSectionData().map((sec, index) => (
            <DataSection key={index} {...sec} />
          ))}
          <Action>
            <PrimaryButton onClick={this.handleSubmit}>
              {intl.formatMessage(messages.submit)}
            </PrimaryButton>
          </Action>
        </Container>
      </ActionPageLight>
    )
  }
}

export const UserReviewForm = connect(
  null,
  { goToCreateUserSection, goBack }
)(injectIntl(UserReviewFormComponent))
