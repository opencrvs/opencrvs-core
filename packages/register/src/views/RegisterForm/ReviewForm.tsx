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
  getEvent() {
    const eventType = (this.props.draft && this.props.draft.event) || 'BIRTH'
    switch (eventType.toLocaleLowerCase()) {
      case 'birth':
        return Event.BIRTH
      case 'death':
        return Event.DEATH
      default:
        return Event.BIRTH
    }
  }

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
          event={this.getEvent()}
          action={Action.LOAD_APPLICATION}
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
                return (
                  <ErrorText id="review-error-text">
                    {intl.formatMessage(messages.queryError)}
                  </ErrorText>
                )
              }

              const transData: IFormData = gqlToDraftTransformer(
                this.props.registerForm,
                // @ts-ignore
                data && data[dataKey]
              )
              const reviewDraft = createReviewDraft(
                draftId,
                transData,
                Event.BIRTH
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
