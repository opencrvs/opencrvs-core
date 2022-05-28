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
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IStoreState } from '@client/store'
import { useIntl } from 'react-intl'
import {
  ActionStatus,
  REDIRECT_DELAY
} from '@client/views/SysAdmin/Config/Forms/utils'
import { CREATE_FORM_DRAFT } from '@client/views/SysAdmin/Config/Forms/mutations'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import { Event } from '@client/forms'
import { Mutation } from 'react-apollo'
import {
  GQLMutation,
  GQLFormDraftInput
} from '@opencrvs/gateway/src/graphql/schema'
import { IFormDraft } from '@client/forms/configuration/formDrafts/utils'
import {
  SecondaryButton,
  PrimaryButton
} from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { ResponsiveModal } from '@opencrvs/components/lib/interface'
import { messages } from '@client/i18n/messages/views/formConfig'
import { InputField, TextArea } from '@opencrvs/components/lib/forms'
import { useParams } from 'react-router'
import { goToFormConfigHome } from '@client/navigation'
import { updateFormConfig } from '@client/forms/configuration/formConfig/actions'
import { generateModifiedQuestionConfigs } from '@client/forms/configuration/formConfig/utils'
import { populateRegisterFormsWithAddresses } from '@client/forms/configuration/administrative/addresses'
import { registerForms } from '@client/forms/configuration/default'

export const SaveActionContext = React.createContext({
  status: ActionStatus.IDLE,
  setStatus: (_: ActionStatus) => {}
})

function useModifiedQuestionConfig(event: Event) {
  const configFields = useSelector((store: IStoreState) =>
    selectConfigFields(store, event)
  )
  return React.useMemo(() => {
    return generateModifiedQuestionConfigs(
      configFields,
      populateRegisterFormsWithAddresses(registerForms[event], event)
    )
  }, [configFields, event])
}

function SaveActionButton({ comment }: { comment: string }) {
  const intl = useIntl()
  const { event } = useParams<{ event: Event }>()
  const questions = useModifiedQuestionConfig(event)
  const { setStatus } = React.useContext(SaveActionContext)
  const dispatch = useDispatch()

  return (
    <Mutation<GQLMutation, GQLFormDraftInput>
      mutation={CREATE_FORM_DRAFT}
      onError={() => setStatus(ActionStatus.ERROR)}
      onCompleted={({ createFormDraft: formDraft }) => {
        if (formDraft) {
          dispatch(
            updateFormConfig(formDraft as unknown as IFormDraft, questions)
          )
          setStatus(ActionStatus.COMPLETED)
          setTimeout(() => dispatch(goToFormConfigHome()), REDIRECT_DELAY)
        }
      }}
    >
      {(createFormDraft) => (
        <PrimaryButton
          id="save-btn"
          disabled={!comment}
          onClick={() => {
            setStatus(ActionStatus.PROCESSING)
            createFormDraft({
              variables: {
                event: event as any,
                comment,
                questions: questions as any
              }
            })
          }}
        >
          {intl.formatMessage(buttonMessages.save)}
        </PrimaryButton>
      )}
    </Mutation>
  )
}

export function SaveActionModal() {
  const intl = useIntl()
  const { status, setStatus } = React.useContext(SaveActionContext)
  const [comment, setComment] = React.useState('')
  const [touched, setTouched] = React.useState(false)

  const closeModal = () => setStatus(ActionStatus.IDLE)

  return (
    <ResponsiveModal
      autoHeight
      title={intl.formatMessage(messages.saveDraftTitle)}
      show={status === ActionStatus.MODAL}
      handleClose={closeModal}
      actions={[
        <SecondaryButton onClick={closeModal}>
          {intl.formatMessage(buttonMessages.cancel)}
        </SecondaryButton>,
        <SaveActionButton comment={comment} />
      ]}
    >
      {intl.formatMessage(messages.saveDraftDescription)}
      <InputField
        id="comment"
        label={intl.formatMessage(messages.saveDraftCommentLabel)}
        touched={touched}
        error={
          !comment
            ? intl.formatMessage(messages.saveDraftCommentError)
            : undefined
        }
        required
      >
        <TextArea
          key="save-comment"
          /* Text Area currently doesn't accept basic input props */
          {...{
            id: 'save-comment',
            onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setComment(event.target.value),
            onBlur: () => !touched && setTouched(true)
          }}
        />
      </InputField>
    </ResponsiveModal>
  )
}
