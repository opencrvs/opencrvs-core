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
import React, { useContext } from 'react'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { useIntl, MessageDescriptor } from 'react-intl'
import {
  actionsModalTitleMessages,
  actionsModalDescriptionMessages
} from '@client/i18n/messages/views/formConfig'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import {
  TertiaryButton,
  SuccessButton,
  DangerButton,
  PrimaryButton
} from '@opencrvs/components/lib/buttons'
import { useDispatch } from 'react-redux'
import { Mutation } from 'react-apollo'
import { GQLMutation } from '@opencrvs/gateway/src/graphql/schema'
import { CHANGE_FORM_DRAFT_STATUS } from './mutations'
import { fetchFormDraftSuccessAction } from '@client/forms/configuration/formDrafts/actions'
import { DraftStatus } from '@client/forms/configuration/formDrafts/reducer'
import { Event } from '@client/forms'

export enum Actions {
  PUBLISH = 'PUBLISH',
  PREVIEW = 'PREVIEW',
  EDIT = 'EDIT',
  DELETE = 'DELETE'
}

export enum ActionStatus {
  IDLE = 'IDLE',
  MODAL = 'MODAL',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export const defaultActionState = {
  action: Actions.EDIT,
  event: Event.BIRTH,
  status: ActionStatus.IDLE
}

export const ActionContext = React.createContext({
  actionState: defaultActionState,
  setAction: (_: Partial<ActionState>) => {}
})

export type ActionState = {
  action: Actions
  event: Event
  status: ActionStatus
}

const STATUS_CHANGE_MAP: Record<Actions, DraftStatus> = {
  [Actions.PUBLISH]: DraftStatus.PUBLISHED,
  [Actions.PREVIEW]: DraftStatus.PREVIEW,
  [Actions.EDIT]: DraftStatus.DELETED,
  [Actions.DELETE]: DraftStatus.DELETED
}

const ACTION_BUTTON_MESSAGE: Record<Actions, MessageDescriptor> = {
  [Actions.PUBLISH]: buttonMessages.publish,
  [Actions.PREVIEW]: buttonMessages.preview,
  [Actions.EDIT]: buttonMessages.edit,
  [Actions.DELETE]: buttonMessages.delete
}

const BUTTON_MAP: Record<Actions, typeof PrimaryButton> = {
  [Actions.PREVIEW]: SuccessButton,
  [Actions.PUBLISH]: SuccessButton,
  [Actions.EDIT]: PrimaryButton,
  [Actions.DELETE]: DangerButton
}

function ActionButton() {
  const intl = useIntl()
  const dispatch = useDispatch()
  const {
    actionState: { action, event },
    setAction
  } = useContext(ActionContext)

  return (
    <Mutation<
      GQLMutation,
      {
        status: DraftStatus
        event: Event
      }
    >
      mutation={CHANGE_FORM_DRAFT_STATUS}
      onCompleted={({ createOrUpdateFormDraft: formDrafts }) => {
        if (formDrafts) {
          dispatch(fetchFormDraftSuccessAction({ formDrafts }))
          setAction({ status: ActionStatus.COMPLETED })
        }
      }}
      onError={() => setAction({ status: ActionStatus.ERROR })}
    >
      {(changeStatus) => {
        const buttonProps = {
          id: 'status-change-btn',
          onClick: () => {
            changeStatus({
              variables: {
                status: STATUS_CHANGE_MAP[action],
                event: event
              }
            })
            setAction({ status: ActionStatus.PROCESSING })
          }
        }

        const Button = BUTTON_MAP[action]

        return (
          <Button {...buttonProps}>
            {intl.formatMessage(ACTION_BUTTON_MESSAGE[action])}
          </Button>
        )
      }}
    </Mutation>
  )
}

export function ActionsModal() {
  const {
    actionState: { action, event, status },
    setAction
  } = React.useContext(ActionContext)
  const intl = useIntl()
  const closeModal = () => setAction({ status: ActionStatus.IDLE })

  return (
    <ResponsiveModal
      autoHeight
      show={status === ActionStatus.MODAL}
      title={intl.formatMessage(actionsModalTitleMessages[action], {
        event: intl.formatMessage(constantsMessages[event])
      })}
      handleClose={closeModal}
      actions={[
        <TertiaryButton id="cancel-btn" key="cancel" onClick={closeModal}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <ActionButton />
      ]}
    >
      {intl.formatMessage(actionsModalDescriptionMessages[action])}
    </ResponsiveModal>
  )
}
