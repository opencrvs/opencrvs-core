/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as React from 'react'
import { Redirect, RouteComponentProps } from 'react-router'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import styled, { withTheme } from 'styled-components'
import { ITheme } from '@opencrvs/components/lib/theme'
import {
  RegisterForm,
  FullProps
} from '@opencrvs/client/src/views/RegisterForm/RegisterForm'

import { IStoreState } from '@opencrvs/client/src/store'
import { connect } from 'react-redux'
import { getReviewForm } from '@opencrvs/client/src/forms/register/review-selectors'
import { IDeclaration } from '@opencrvs/client/src/declarations'
import { getScope } from '@client/profile/profileSelectors'
import { Scope } from '@opencrvs/client/src/utils/authUtils'
import { Event } from '@client/utils/gateway'

import {
  REGISTRAR_HOME_TAB,
  REVIEW_EVENT_PARENT_FORM_PAGE_GROUP
} from '@client/navigation/routes'
import { errorMessages } from '@client/i18n/messages'
import { formatUrl } from '@client/navigation'
import { WORKQUEUE_TABS } from '@client/components/interface/Navigation'

interface IReviewProps {
  theme: ITheme
  scope: Scope | null
  event: Event
}
interface IDeclarationProp {
  declaration: IDeclaration | undefined
  declarationId: string
}

type IProps = IReviewProps &
  IDeclarationProp &
  FullProps &
  IntlShapeProps &
  RouteComponentProps<{}>

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.negative};
  ${({ theme }) => theme.fonts.reg16};
  text-align: center;
  margin-top: 100px;
`

class ReviewFormView extends React.Component<IProps> {
  userHasRegisterScope() {
    return this.props.scope && this.props.scope.includes('register')
  }

  userHasValidateScope() {
    return this.props.scope && this.props.scope.includes('validate')
  }

  render() {
    const { intl, declaration } = this.props
    if (!this.userHasRegisterScope() && !this.userHasValidateScope()) {
      return (
        <ErrorText id="review-unauthorized-error-text">
          {intl.formatMessage(errorMessages.unauthorized)}
        </ErrorText>
      )
    }
    if (!declaration) {
      return (
        <Redirect
          to={formatUrl(REGISTRAR_HOME_TAB, {
            tabId: WORKQUEUE_TABS.readyForReview,
            selectorId: ''
          })}
        />
      )
    } else {
      return <RegisterForm {...this.props} />
    }
  }
}
function getEvent(eventType: string) {
  switch (eventType && eventType.toLocaleLowerCase()) {
    case 'birth':
      return Event.Birth
    case 'death':
      return Event.Death
    default:
      return Event.Birth
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
    groupId: string
    declarationId: string
    event: string
  }>
) {
  const { match } = props
  if (!match.params.event) {
    throw new Error('Event is not provided as path param')
  }
  const reviewFormState: IReviewFormState = getReviewForm(
    state
  ) as IReviewFormState
  const form = reviewFormState[match.params.event.toLowerCase()]

  const declaration = state.declarationsState.declarations.find(
    ({ id, review }) => id === match.params.declarationId && review === true
  )
  return {
    declaration,
    scope: getScope(state),
    declarationId: match.params.declarationId,
    event: getEvent(match.params.event),
    registerForm: form,
    pageRoute: REVIEW_EVENT_PARENT_FORM_PAGE_GROUP,
    duplicate: Boolean(declaration?.duplicates?.length)
  }
}

export const ReviewForm = connect<any, {}, any, IStoreState>(mapStatetoProps)(
  injectIntl(withTheme(ReviewFormView))
)
