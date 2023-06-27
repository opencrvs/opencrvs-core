/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as React from 'react'
import { Dialog } from '@opencrvs/components/lib/Dialog'
import { Text } from '@opencrvs/components/lib/Text'
import { Button } from '@opencrvs/components/lib/Button'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import { createNamesMap } from '@client/utils/data-formatting'
import { LANG_EN } from '@client/utils/constants'
import { IUserAuditForm } from '@client/user/user-audit'
import { IStoreState } from '@client/store'
import { connect } from 'react-redux'
import { FormFieldGenerator } from '@client/components/form'
import { IFormSectionData } from '@client/forms'
import { hasFormError } from '@client/forms/utils'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { USER_AUDIT_ACTION } from '@client/user/queries'
import { Dispatch } from 'redux'
import {
  showUserAuditSuccessToast,
  showSubmitFormErrorToast
} from '@client/notification/actions'
import { TOAST_MESSAGES } from '@client/user/userReducer'
import { ApolloClient, InternalRefetchQueriesInclude } from '@apollo/client'
import { withApollo, WithApolloClient } from '@apollo/client/react/hoc'
import { UserDetails } from '@client/utils/userUtils'

const { useState, useEffect } = React

interface ConnectProps {
  form: IUserAuditForm
}

interface DispatchProps {
  showSuccessToast: typeof showUserAuditSuccessToast
  showErrorToast: () => void
}

interface ToggleUserActivationModalProps
  extends WrappedComponentProps,
    ConnectProps,
    DispatchProps {
  user: UserDetails | null
  show: boolean
  onConfirmRefetchQueries?: InternalRefetchQueriesInclude
  onClose: () => void
}

interface IUserAuditVariables {
  userId: string
  action: string
  reason: string
  comment: string
}

export enum AUDIT_ACTION {
  DEACTIVATE = 'DEACTIVATE',
  REACTIVATE = 'REACTIVATE'
}
const statusActionMap = {
  active: AUDIT_ACTION.DEACTIVATE,
  deactivated: AUDIT_ACTION.REACTIVATE
}

type AuditStatus = keyof typeof statusActionMap

function isValidAuditStatus(status: string): status is AuditStatus {
  return Object.keys(statusActionMap).includes(status)
}

let makeAllFieldsDirty: (touched: {}) => void

function UserAuditActionModalComponent(
  props: WithApolloClient<ToggleUserActivationModalProps>
) {
  const { intl, user, onClose, show, form } = props
  const [formValues, setFormValues] = useState<IFormSectionData>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isErrorVisible, makeErrorVisible] = useState<boolean>(false)

  let name = ''
  let modalTitle = ''
  let modalSubtitle = ''
  const actions = [
    <Button
      type="tertiary"
      key="modal-cancel"
      id="modal-cancel"
      onClick={onClose}
    >
      {intl.formatMessage(buttonMessages.cancel)}
    </Button>
  ]

  if (user) {
    name =
      (createNamesMap(user.name)[intl.locale] as string) ||
      (createNamesMap(user.name)[LANG_EN] as string)
  }

  useEffect(() => {
    if (
      hasFormError(props.form.fields, formValues, undefined, { formValues })
    ) {
      if (user && user.status === 'active') {
        const auditAction = 'deactivating'
        setFormError(intl.formatMessage(messages.formError, { auditAction }))
      } else if (user && user.status === 'deactivated') {
        const auditAction = 'reactivating'
        setFormError(intl.formatMessage(messages.formError, { auditAction }))
      }
    } else {
      setFormError(null)
    }
  }, [props.form.fields, formValues, intl, user])

  useEffect(() => {
    function cleanUpFormState() {
      makeErrorVisible(false)
      setFormValues({})
    }

    function injectAuditActionToFormValues() {
      const action =
        user && user.status && isValidAuditStatus(user.status)
          ? statusActionMap[user.status]
          : AUDIT_ACTION.DEACTIVATE
      setFormValues({ action })
    }

    if (!props.show) {
      cleanUpFormState()
    } else {
      injectAuditActionToFormValues()
    }
  }, [props.show, user])

  function handleConfirm() {
    if (makeAllFieldsDirty) {
      const touched = props.form.fields.reduce(
        (memo: any, field: { name: any }) => ({ ...memo, [field.name]: true }),
        {}
      )
      makeAllFieldsDirty(touched)
    }
    makeErrorVisible(true)
    if (!formError) {
      const userId = props?.user?.id ?? ''

      ;(props.client as ApolloClient<any>)
        .mutate({
          mutation: USER_AUDIT_ACTION,
          variables: {
            userId,
            ...(formValues as {
              reason: string
              comment: string
              action: AUDIT_ACTION
            })
          } as IUserAuditVariables,
          refetchQueries: props.onConfirmRefetchQueries
        })
        .then(() =>
          props.showSuccessToast(name, formValues.action as AUDIT_ACTION)
        )
        .catch(() => props.showErrorToast())
      onClose()
    }
  }

  if (user && user.status === 'active') {
    actions.push(
      <Button type="negative" id="deactivate-action" onClick={handleConfirm}>
        {intl.formatMessage(buttonMessages.deactivate)}
      </Button>
    )

    modalTitle = intl.formatMessage(messages.deactivateUserTitle, { name })
    modalSubtitle = intl.formatMessage(messages.deactivateUserSubtitle, {
      name
    })
  }

  if (user && user.status === 'deactivated') {
    actions.push(
      <Button type="positive" id="reactivate-action" onClick={handleConfirm}>
        {intl.formatMessage(buttonMessages.reactivate)}
      </Button>
    )

    modalTitle = intl.formatMessage(messages.reactivateUserTitle, { name })
    modalSubtitle = intl.formatMessage(messages.reactivateUserSubtitle, {
      name
    })
  }

  return (
    <Dialog
      id="user-audit-modal"
      title={modalTitle}
      supportingCopy={modalSubtitle}
      onOpen={show}
      onClose={onClose}
      actions={actions}
    >
      {formError && isErrorVisible && (
        <ErrorText id="form-error">{formError}</ErrorText>
      )}
      <FormFieldGenerator
        id="user-audit-form"
        fields={form.fields}
        onChange={(values) => setFormValues({ ...formValues, ...values })}
        setAllFieldsDirty={false}
        draftData={{ formValues }}
      />
    </Dialog>
  )
}

function mapStateToProps(state: IStoreState) {
  const { userAuditForm } = state.userForm
  return {
    form: userAuditForm
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    showSuccessToast: (userFullName: string, auditAction: AUDIT_ACTION) =>
      dispatch(showUserAuditSuccessToast(userFullName, auditAction)),
    showErrorToast: () =>
      dispatch(showSubmitFormErrorToast(TOAST_MESSAGES.FAIL))
  }
}

export const UserAuditActionModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  injectIntl(
    withApollo<ToggleUserActivationModalProps>(UserAuditActionModalComponent)
  )
)
