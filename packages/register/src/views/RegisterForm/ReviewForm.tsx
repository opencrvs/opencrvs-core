import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { Spinner } from '@opencrvs/components/lib/interface'
import {
  RegisterForm,
  IFormProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'
import { ITheme } from '@opencrvs/components/lib/theme'
import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import { REVIEW_BIRTH_PARENT_FORM_TAB } from '@opencrvs/register/src/navigation/routes'

import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  storeDraft,
  IDraft,
  createReviewDraft
} from '@opencrvs/register/src/drafts'
import { Dispatch } from 'redux'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from '@opencrvs/register/src/utils/authUtils'
import { gqlToDraftTransformer } from 'src/transformer'
import { IFormData, Event } from 'src/forms'
export const FETCH_BIRTH_REGISTRATION_QUERY = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        multipleBirth
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        contact
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
        }
        type
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      eventLocation {
        type
        address {
          line
          district
          state
          postalCode
          country
        }
      }
      presentAtBirthRegistration
    }
  }
`

const messages = defineMessages({
  queryError: {
    id: 'review.birthRegistration.queryError',
    defaultMessage: 'An error occurred while fetching birth registration',
    description: 'The error message shown when a query fails'
  },

  unauthorized: {
    id: 'review.error.unauthorized',
    defaultMessage: 'We are unable to display this page to you',
    description: 'The error message shown when a query fails'
  }
})
interface IReviewProps {
  theme: ITheme
  dispatch: Dispatch
  scope: Scope
}
interface IDraftProp {
  draft: IDraft | undefined
  draftId: string
}

type IProps = IReviewProps &
  IDraftProp &
  IFormProps &
  InjectedIntlProps &
  RouteComponentProps<{}>

export interface IReviewSectionDetails {
  [key: string]: any
}

const StyledSpinner = styled(Spinner)`
  margin: 50% auto;
`

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-family: ${({ theme }) => theme.fonts.lightFont};
  text-align: center;
  margin-top: 100px;
`

export class ReviewFormView extends React.Component<IProps> {
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }
  render() {
    const { intl, theme, draft, draftId, dispatch } = this.props
    if (!this.userHasRegisterScope()) {
      return (
        <ErrorText id="review-unauthorized-error-text">
          {intl.formatMessage(messages.unauthorized)}
        </ErrorText>
      )
    }
    if (!draft) {
      return (
        <Query
          query={FETCH_BIRTH_REGISTRATION_QUERY}
          variables={{ id: this.props.draftId }}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <StyledSpinner
                  id="review-spinner"
                  baseColor={theme.colors.background}
                />
              )
            }
            if (error) {
              return (
                <ErrorText id="review-error-text">
                  {intl.formatMessage(messages.queryError)}
                </ErrorText>
              )
            }
            const transData: IFormData = gqlToDraftTransformer(
              this.props.registerForm,
              data.fetchBirthRegistration
            )
            const reviewDraft = createReviewDraft(
              draftId,
              transData,
              Event.BIRTH
            )
            dispatch(storeDraft(reviewDraft))

            return <RegisterForm {...this.props} draft={reviewDraft} />
          }}
        </Query>
      )
    } else {
      return <RegisterForm {...this.props} />
    }
  }
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{ tabId: string; draftId: string }>
) {
  const { match, history } = props
  const form = getReviewForm(state)

  const draft = state.drafts.drafts.find(
    ({ id, review }) => id === match.params.draftId && review === true
  )
  return {
    draft,
    scope: getScope(state),
    draftId: match.params.draftId,
    registerForm: form,
    duplicate: history.location.state && history.location.state.duplicate,
    tabRoute: REVIEW_BIRTH_PARENT_FORM_TAB
  }
}

export const ReviewForm = connect<IFormProps | IDraftProp>(mapStatetoProps)(
  injectIntl(withTheme(ReviewFormView))
)
