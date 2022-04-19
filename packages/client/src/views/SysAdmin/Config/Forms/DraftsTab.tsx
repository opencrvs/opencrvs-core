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
import { Event, BirthSection, DeathSection } from '@client/forms'
import { useIntl } from 'react-intl'
import { buttonMessages, constantsMessages } from '@client/i18n/messages'
import {
  messages,
  draftStatusMessages
} from '@client/i18n/messages/views/formConfig'
import {
  LinkButton,
  TertiaryButton,
  SuccessButton,
  DangerButton
} from '@opencrvs/components/lib/buttons'
import {
  ToggleMenu,
  Pill,
  ResponsiveModal
} from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { goToFormConfigWizard } from '@client/navigation'
import {
  DraftStatus,
  IDraft
} from '@client/forms/configuration/formDrafts/reducer'
import { Value, DraftVersion } from './components'
import { isDefaultDraft } from './utils'

function ActionButton({ event, status, version }: IDraft) {
  const intl = useIntl()
  const dispatch = useDispatch()
  return (
    <LinkButton
      onClick={() =>
        dispatch(
          goToFormConfigWizard(
            event,
            event === Event.BIRTH
              ? BirthSection.Registration
              : DeathSection.Registration
          )
        )
      }
    >
      {intl.formatMessage(
        isDefaultDraft({ version }) || status === DraftStatus.DELETED
          ? buttonMessages.configure
          : buttonMessages.edit
      )}
    </LinkButton>
  )
}

function OptionsMenu({ event }: { event: Event }) {
  enum Option {
    PREVIEW,
    DELETE
  }
  const intl = useIntl()
  const [show, setShow] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState<Option>(
    Option.PREVIEW
  )
  const toggleShow = () => setShow((prev) => !prev)
  return (
    <>
      <ToggleMenu
        id="toggleMenu"
        toggleButton={<VerticalThreeDots />}
        menuItems={[
          {
            label: intl.formatMessage(buttonMessages.preview),
            handler: () => {
              toggleShow()
              setSelectedOption(Option.PREVIEW)
            }
          },
          {
            label: intl.formatMessage(buttonMessages.delete),
            handler: () => {
              toggleShow()
              setSelectedOption(Option.DELETE)
            }
          }
        ]}
      />
      <ResponsiveModal
        autoHeight
        show={show}
        title={intl.formatMessage(
          selectedOption === Option.PREVIEW
            ? messages.previewConfirmationTitle
            : messages.publishedConfirmationTitle,
          {
            event: intl.formatMessage(constantsMessages[event])
          }
        )}
        handleClose={toggleShow}
        actions={[
          <TertiaryButton id="cancel-btn" key="cancel" onClick={toggleShow}>
            {intl.formatMessage(buttonMessages.cancel)}
          </TertiaryButton>,
          selectedOption === Option.PREVIEW ? (
            <SuccessButton id="preview-btn" key="preview" onClick={toggleShow}>
              {intl.formatMessage(buttonMessages.preview)}
            </SuccessButton>
          ) : (
            <DangerButton id="delete-btn" key="delete" onClick={toggleShow}>
              {intl.formatMessage(buttonMessages.delete)}
            </DangerButton>
          )
        ]}
      >
        {intl.formatMessage(
          selectedOption === Option.PREVIEW
            ? messages.previewConfirmationDescription
            : messages.publishedConfirmationDescription
        )}
      </ResponsiveModal>
    </>
  )
}

function EventDrafts({ event }: { event: Event }) {
  const intl = useIntl()
  const formDraft = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )
  const { comment, history, status, version } = formDraft
  const actions = (
    <>
      <ActionButton {...formDraft} />
      {!isDefaultDraft(formDraft) && status !== DraftStatus.DELETED && (
        <OptionsMenu key="toggleButton" event={event} />
      )}
    </>
  )

  return (
    <>
      <ListViewItemSimplified
        key={version}
        label={<DraftVersion event={event} version={version} />}
        value={<Value>{comment}</Value>}
        actions={
          status === DraftStatus.DRAFT || status === DraftStatus.DELETED ? (
            actions
          ) : status === DraftStatus.PREVIEW ? (
            <Pill
              label={intl.formatMessage(draftStatusMessages.PREVIEW)}
              type="active"
            />
          ) : (
            <Pill
              label={intl.formatMessage(draftStatusMessages.PUBLISHED)}
              type="active"
            />
          )
        }
      />
      {history
        ?.filter((draftHistory) => !isDefaultDraft(draftHistory))
        .map(({ comment, version }) => (
          <ListViewItemSimplified
            key={version}
            label={<DraftVersion event={event} version={version} />}
            value={<Value>{comment}</Value>}
          />
        ))}
    </>
  )
}

export function DraftsTab() {
  return (
    <ListViewSimplified>
      <EventDrafts event={Event.BIRTH} />
      <EventDrafts event={Event.DEATH} />
    </ListViewSimplified>
  )
}
