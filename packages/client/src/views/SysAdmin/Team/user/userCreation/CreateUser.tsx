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

import { clearUserFormData } from '@client/user/userReducer'
import { withApollo, WithApolloClient } from '@apollo/client/react/hoc'
import { formMessages } from '@client/i18n/messages'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import React, { useEffect } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import { CREATE_USER_ON_LOCATION } from '@client/navigation/routes'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { UserFormPage } from '../commons/UserFormPage'

interface IDispatchProps {
  clearUserFormData: typeof clearUserFormData
}

type Props = RouteComponentProps & IDispatchProps & IntlShapeProps

const CreateNewUserComponent = (props: WithApolloClient<Props>) => {
  const { router, clearUserFormData, intl } = props

  useEffect(() => {
    const initialize = async () => {
      if (
        router.location.pathname.includes(
          CREATE_USER_ON_LOCATION.split('/:')[0]
        )
      ) {
        clearUserFormData()
      }
    }

    initialize()

    return () => {
      clearUserFormData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UserFormPage
      title={intl.formatMessage(formMessages.userFormTitle)}
      loadingMessage={intl.formatMessage(userFormMessages.creatingNewUser)}
    />
  )
}

export const CreateUser = withRouter(
  connect(null, {
    clearUserFormData
  })(injectIntl(withApollo<Props>(CreateNewUserComponent)))
)
