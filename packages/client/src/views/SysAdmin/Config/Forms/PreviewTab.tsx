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
import {
  ListViewSimplified,
  ListViewItemSimplified
} from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { selectFormDraft } from '@client/forms/configuration/formDrafts/selectors'
import { Event } from '@client/forms'
import { useIntl } from 'react-intl'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import {
  messages,
  draftStatusMessages
} from '@client/i18n/messages/views/formConfig'
import {
  LinkButton,
  TertiaryButton,
  PrimaryButton,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { DraftStatus } from '@client/forms/configuration/formDrafts/reducer'
import { Value, DraftVersion } from './components'
import formatDate from '@client/utils/date-formatting'
import { Pill, ResponsiveModal } from '@opencrvs/components/lib/interface'
import { isDefaultDraft } from './utils'
import { Mutation } from 'react-apollo'
import { GQLMutation } from '@opencrvs/gateway/src/graphql/schema'
import { CHANGE_FORM_DRAFT_STATUS } from './mutations'
import { fetchFormDraftSuccessAction } from '@client/forms/configuration/formDrafts/actions'

function PublishButton({
  event,
  toggleShow
}: {
  event: Event
  toggleShow: () => void
}) {
  const intl = useIntl()
  const dispatch = useDispatch()
  return (
    <Mutation<
      GQLMutation,
      {
        status: string
        event: string
      }
    >
      mutation={CHANGE_FORM_DRAFT_STATUS}
      onCompleted={({ createOrUpdateFormDraft: formDrafts }) => {
        formDrafts && dispatch(fetchFormDraftSuccessAction({ formDrafts }))
      }}
    >
      {(changeStatus) => (
        <SuccessButton
          id="publish-btn"
          key="publish"
          onClick={() => {
            changeStatus({
              variables: {
                status: DraftStatus.PUBLISHED,
                event: event
              }
            })
            toggleShow()
          }}
        >
          {intl.formatMessage(buttonMessages.publish)}
        </SuccessButton>
      )}
    </Mutation>
  )
}

function EventDrafts({ event }: { event: Event }) {
  enum Option {
    EDIT,
    PUBLISH
  }
  const intl = useIntl()
  const formDraft = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )
  const [show, setShow] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<Option>(
    Option.EDIT
  )
  const toggleShow = () => setShow((prev) => !prev)
  const { updatedAt, comment, status, version } = formDraft

  if (status === DraftStatus.DRAFT || status === DraftStatus.DELETED) {
    return <></>
  }

  const actions = (
    <>
      <LinkButton
        onClick={() => {
          setSelectedOption(Option.EDIT)
          toggleShow()
        }}
      >
        {intl.formatMessage(buttonMessages.edit)}
      </LinkButton>
      <LinkButton
        onClick={() => {
          setSelectedOption(Option.PUBLISH)
          toggleShow()
        }}
      >
        {intl.formatMessage(buttonMessages.publish)}
      </LinkButton>
    </>
  )

  return (
    <>
      <ListViewItemSimplified
        key={version}
        label={<DraftVersion event={event} version={version} />}
        value={
          <Value>
            {isDefaultDraft(formDraft)
              ? comment
              : `${intl.formatMessage(messages.created)} ${formatDate(
                  updatedAt,
                  'MMMM yyyy'
                )}`}
          </Value>
        }
        actions={
          status === DraftStatus.PREVIEW ? (
            actions
          ) : (
            <Pill
              label={intl.formatMessage(draftStatusMessages.PUBLISHED)}
              type="active"
            />
          )
        }
      />
      <ResponsiveModal
        autoHeight
        show={show}
        title={intl.formatMessage(
          selectedOption === Option.EDIT
            ? messages.editConfirmationTitle
            : messages.publishConfirmationTitle,
          {
            event: intl.formatMessage(constantsMessages[event])
          }
        )}
        handleClose={toggleShow}
        actions={[
          <TertiaryButton id="cancel-btn" key="cancel" onClick={toggleShow}>
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          selectedOption === Option.EDIT ? (
            <PrimaryButton id="delete-btn" key="delete" onClick={toggleShow}>
              {intl.formatMessage(buttonMessages.edit)}
            </PrimaryButton>
          ) : (
            <PublishButton event={event} toggleShow={toggleShow} />
          )
        ]}
      >
        {intl.formatMessage(
          selectedOption === Option.EDIT
            ? messages.editConfirmationDescription
            : messages.publishConfirmationDescription
        )}
      </ResponsiveModal>
    </>
  )
}

export function PreviewTab() {
  return (
    <ListViewSimplified>
      <EventDrafts event={Event.BIRTH} />
      <EventDrafts event={Event.DEATH} />
    </ListViewSimplified>
  )
}
