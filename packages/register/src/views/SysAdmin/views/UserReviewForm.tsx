import * as React from 'react'
import {
  IFormSectionData,
  IFormSection,
  IFormField,
  FIELD_GROUP_TITLE
} from '@register/forms'

import { connect } from 'react-redux'
import { IStoreState } from '@register/store'
import {
  DataSection,
  ActionPageLight,
  IDataProps
} from '@opencrvs/components/lib/interface'
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl'
import { RouteComponentProps } from 'react-router'
import { goBack } from '@register/navigation'
import { Container, FormTitle } from './UserForm'

interface IUserReviewFormProps {
  section: IFormSection
  data: IFormSectionData
  goBack: typeof goBack
}

interface IMatchParams {
  data: string
}

interface ISectionData {
  title: string
  items: IDataProps[]
}

type IFullProps = IUserReviewFormProps &
  InjectedIntlProps &
  RouteComponentProps<IMatchParams>

const messages = defineMessages({
  actionChange: {
    id: 'action.change',
    defaultMessage: 'Change',
    description: 'Change action'
  }
})

class UserReviewFormComponent extends React.Component<IFullProps> {
  transformSectionData = () => {
    const { intl, data } = this.props
    const dataEntries = Object.entries(data)
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
            handler: () => console.log(field.name, 'change action clicked')
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

  render() {
    const { intl, section } = this.props

    return (
      <ActionPageLight
        title={intl.formatMessage(section.title)}
        goBack={this.props.goBack}
      >
        <Container>
          <FormTitle>Please review new user details</FormTitle>
          {this.transformSectionData().map((sec, index) => (
            <DataSection key={index} {...sec} />
          ))}
        </Container>
      </ActionPageLight>
    )
  }
}

export const UserReviewForm = connect(
  (state: IStoreState) => {
    return {
      section: state.userForm.userForm,
      data: state.userForm.userFormData
    }
  },
  { goBack }
)(injectIntl(UserReviewFormComponent))
