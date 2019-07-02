import { IFormSection, IFormSectionData } from '@register/forms'
import { IStoreState } from '@register/store'
import { replaceInitialValues } from '@register/views/RegisterForm/RegisterForm'
import { UserForm } from '@register/views/SysAdmin/views/UserForm'
import { UserReviewForm } from '@register/views/SysAdmin/views/UserReviewForm'
import * as React from 'react'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import { connect } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import ApolloClient from 'apollo-client'
import { withApollo } from 'react-apollo'
import { Spinner, ActionPageLight } from '@opencrvs/components/lib/interface'
import styled from '@register/styledComponents'
import { goBack } from '@register/navigation'
import { getRolesQuery } from '@register/views/SysAdmin/user/queries'
import { updateUserFormFieldDefinitions } from '@register/views/SysAdmin/forms/userReducer'
import * as Sentry from '@sentry/browser'

interface IMatchParams {
  sectionId: string
}

type INewUserProps = {
  section: IFormSection
  formData: IFormSectionData
  submitting: boolean
  client: ApolloClient<unknown>
}

interface IDispatchProps {
  goBack: typeof goBack
  updateUserFormFieldDefinitions: typeof updateUserFormFieldDefinitions
}

export type Props = RouteComponentProps<IMatchParams> &
  INewUserProps &
  InjectedIntlProps

const Container = styled.div`
  display: flex;
  min-height: 80vh;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
`

const messages = defineMessages({
  userTitle: {
    id: 'user.title.create',
    defaultMessage: 'Create new user',
    description: 'The title of user form'
  }
})

class CreateNewUserComponent extends React.Component<Props & IDispatchProps> {
  renderLoadingPage = () => {
    const { intl } = this.props
    return (
      <ActionPageLight
        title={intl.formatMessage(messages.userTitle)}
        goBack={this.props.goBack}
      >
        <Container>
          <Spinner id="user-form-submitting-spinner" />
        </Container>
      </ActionPageLight>
    )
  }

  componentDidMount() {
    this.props.client
      .query({ query: getRolesQuery, variables: {} })
      .then(this.props.updateUserFormFieldDefinitions)
      .catch(e => {
        Sentry.captureException(e)
      })
  }

  render() {
    const { section, submitting } = this.props

    if (submitting) {
      return this.renderLoadingPage()
    }

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
    formData: state.userForm.userFormData,
    submitting: state.userForm.submitting
  }
}

export const CreateNewUser = connect(
  mapStateToProps,
  { goBack, updateUserFormFieldDefinitions }
)(injectIntl(withApollo(CreateNewUserComponent)))
