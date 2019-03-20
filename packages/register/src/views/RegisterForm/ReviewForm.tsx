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
import {
  storeDraft,
  IDraft,
  createReviewDraft
} from '@opencrvs/register/src/drafts'
import { Dispatch } from 'redux'
import { getScope } from 'src/profile/profileSelectors'
import { Scope } from '@opencrvs/register/src/utils/authUtils'
import { gqlToDraftTransformer } from 'src/transformer'
import { IFormData, Event, Action } from 'src/forms'
import {
  QueryProvider,
  QueryContext
} from 'src/views/DataProvider/QueryProvider'
import * as Sentry from '@sentry/browser'
import { REVIEW_EVENT_PARENT_FORM_TAB } from 'src/navigation/routes'

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
  event: Event
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
        <QueryProvider
          event={this.props.event}
          action={Action.LOAD_REVIEW_APPLICATION}
          payload={{ id: this.props.draftId }}
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
              const reviewDraft = createReviewDraft(
                draftId,
                transData,
                this.props.event,
                status
              )
              dispatch(storeDraft(reviewDraft))

              return <RegisterForm {...this.props} draft={reviewDraft} />
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

function mapStatetoProps(
  state: IStoreState,
  props: RouteComponentProps<{
    tabRoute: string
    tabId: string
    draftId: string
    event: string
  }>
) {
  const { match, history } = props
  if (!match.params.event) {
    throw new Error('Event is not provided as path param')
  }
  const form = getReviewForm(state)[match.params.event.toLowerCase()]

  const draft = state.drafts.drafts.find(
    ({ id, review }) => id === match.params.draftId && review === true
  )
  return {
    draft,
    scope: getScope(state),
    draftId: match.params.draftId,
    event: getEvent(match.params.event),
    registerForm: form,
    tabRoute: REVIEW_EVENT_PARENT_FORM_TAB,
    duplicate: history.location.state && history.location.state.duplicate
  }
}

export const ReviewForm = connect<IFormProps | IDraftProp>(mapStatetoProps)(
  injectIntl(withTheme(ReviewFormView))
)
