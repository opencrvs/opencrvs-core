import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled, { withTheme, ITheme } from '@register/styledComponents'
import { Spinner } from '@opencrvs/components/lib/interface'
import {
  RegisterForm,
  FullProps
} from '@opencrvs/register/src/views/RegisterForm/RegisterForm'

import { IStoreState } from '@opencrvs/register/src/store'
import { connect } from 'react-redux'
import { getReviewForm } from '@opencrvs/register/src/forms/register/review-selectors'
import {
  storeApplication,
  IApplication,
  createReviewApplication
} from '@opencrvs/register/src/applications'
import { Dispatch } from 'redux'
import { getScope } from '@register/profile/profileSelectors'
import { Scope } from '@opencrvs/register/src/utils/authUtils'
import { gqlToDraftTransformer } from '@register/transformer'
import { IFormData, Event, Action } from '@register/forms'
import {
  QueryProvider,
  QueryContext
} from '@register/views/DataProvider/QueryProvider'
import * as Sentry from '@sentry/browser'
import { REVIEW_EVENT_PARENT_FORM_PAGE } from '@register/navigation/routes'

const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
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
  scope: Scope | null
  event: Event
}
interface IApplicationProp {
  application: IApplication | undefined
  applicationId: string
}

type IProps = IReviewProps &
  IApplicationProp &
  FullProps &
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
  ${({ theme }) => theme.fonts.bodyStyle};
  text-align: center;
  margin-top: 100px;
`

export class ReviewFormView extends React.Component<IProps> {
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }
  render() {
    const { intl, theme, application, applicationId, dispatch } = this.props
    if (!this.userHasRegisterScope()) {
      return (
        <ErrorText id="review-unauthorized-error-text">
          {intl.formatMessage(messages.unauthorized)}
        </ErrorText>
      )
    }
    if (!application) {
      return (
        <QueryProvider
          event={this.props.event}
          action={Action.LOAD_REVIEW_APPLICATION}
          payload={{ id: this.props.applicationId }}
        >
          <QueryContext.Consumer>
            {({ loading, error, data, dataKey }) => {
              if (loading) {
                return (
                  <StyledSpinner
                    id="review-spinner"
                    baseColor={theme.colors.background}
                  />
                )
              }
              if (error) {
                Sentry.captureException(error)

                return (
                  <ErrorText id="review-error-text">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }
              // @ts-ignore
              const eventData = data && data[dataKey]
              const transData: IFormData = gqlToDraftTransformer(
                this.props.registerForm,
                eventData
              )
              const status: string =
                (eventData &&
                  eventData.registration &&
                  eventData.registration.status &&
                  eventData.registration.status[0].type) ||
                ''
              const reviewDraft = createReviewApplication(
                applicationId,
                transData,
                this.props.event,
                status
              )
              dispatch(storeApplication(reviewDraft))

              return <RegisterForm {...this.props} application={reviewDraft} />
            }}
          </QueryContext.Consumer>
        </QueryProvider>
      )
    } else {
      return <RegisterForm {...this.props} />
    }
  }
}
function getEvent(eventType: string) {
  switch (eventType && eventType.toLocaleLowerCase()) {
    case 'birth':
      return Event.BIRTH
    case 'death':
      return Event.DEATH
    default:
      return Event.BIRTH
  }
}

interface IReviewFormState {
  [key: string]: any
}

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{
    pageRoute: string
    pageId: string
    applicationId: string
    event: string
  }>
) {
  const { match, history } = props
  if (!match.params.event) {
    throw new Error('Event is not provided as path param')
  }
  const reviewFormState: IReviewFormState = getReviewForm(
    state
  ) as IReviewFormState
  const form = reviewFormState[match.params.event.toLowerCase()]

  const application = state.applicationsState.applications.find(
    ({ id, review }) => id === match.params.applicationId && review === true
  )
  return {
    application,
    scope: getScope(state),
    applicationId: match.params.applicationId,
    event: getEvent(match.params.event),
    registerForm: form,
    pageRoute: REVIEW_EVENT_PARENT_FORM_PAGE,
    duplicate: history.location.state && history.location.state.duplicate
  }
}

export const ReviewForm = connect<any, {}, any, IStoreState>(mapStatetoProps)(
  injectIntl(withTheme(ReviewFormView))
)
