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
import {
  clearUserFormData,
  fetchAndStoreUserData
} from '@client/user/userReducer'
import { ApolloClient } from '@apollo/client'
import { withApollo, WithApolloClient } from '@apollo/client/react/hoc'
import { messages as sysAdminMessages } from '@client/i18n/messages/views/sysAdmin'
import { messages as userFormMessages } from '@client/i18n/messages/views/userForm'
import React, { useEffect } from 'react'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { connect } from 'react-redux'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { UserFormPage } from '../commons/UserFormPage'

interface IDispatchProps {
  clearUserFormData: typeof clearUserFormData
  fetchAndStoreUserData: typeof fetchAndStoreUserData
}

type Props = RouteComponentProps & IDispatchProps & IntlShapeProps

const UpdateUserComponent = (props: WithApolloClient<Props>) => {
  const { clearUserFormData, fetchAndStoreUserData, client, router, intl } =
    props

  const { userId } = router.params

  if (!userId) {
    throw new Error('userId not found')
  }

  useEffect(() => {
    const initialize = async () => {
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      fetchAndStoreUserData(client as ApolloClient<any>, {
        userId
      })
    }

    initialize()

    return () => {
      clearUserFormData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <UserFormPage
      title={intl.formatMessage(sysAdminMessages.editUserDetailsTitle)}
      loadingMessage={intl.formatMessage(userFormMessages.updatingUser)}
    />
  )
}

export const UpdateUser = withRouter(
  connect(null, {
    clearUserFormData,
    fetchAndStoreUserData
  })(injectIntl(withApollo<Props>(UpdateUserComponent)))
)
