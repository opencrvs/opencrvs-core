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
import { buttonMessages } from '@client/i18n/messages'
import { draftStatusMessages } from '@client/i18n/messages/views/formConfig'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ToggleMenu, Pill } from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import { goToFormConfigWizard } from '@client/navigation'
import {
  DraftStatus,
  IDraft
} from '@client/forms/configuration/formDrafts/reducer'
import { Value, DraftVersion } from './components'
import {
  ActionStatus,
  isDefaultDraft
} from '@client/views/SysAdmin/Config/Forms/utils'
import { ActionContext, Actions } from './ActionsModal'
import { FormConfigMobileViewModal } from './FormConfigMobileViewModal'
import { isMobileDevice } from '@client/utils/commonUtils'

function ActionButton({ event, status, version }: IDraft) {
  const intl = useIntl()
  const dispatch = useDispatch()
  const [showMobileModal, setMobileModal] = React.useState(false)
  const toggleModal = () => setMobileModal((prev) => !prev)
  return (
    <>
      <LinkButton
        onClick={() => {
          if (isMobileDevice()) {
            toggleModal()
          } else {
            dispatch(
              goToFormConfigWizard(
                event,
                event === Event.BIRTH
                  ? BirthSection.Registration
                  : DeathSection.Registration
              )
            )
          }
        }}
      >
        {intl.formatMessage(
          isDefaultDraft({ version }) || status === DraftStatus.DELETED
            ? buttonMessages.configure
            : buttonMessages.edit
        )}
      </LinkButton>
      <FormConfigMobileViewModal
        showModal={showMobileModal}
        toggleModal={toggleModal}
      />
    </>
  )
}

function OptionsMenu({ event }: { event: Event }) {
  const intl = useIntl()
  const { setAction } = React.useContext(ActionContext)

  return (
    <ToggleMenu
      id="toggleMenu"
      toggleButton={<VerticalThreeDots />}
      menuItems={[
        {
          label: intl.formatMessage(buttonMessages.preview),
          handler: () => {
            setAction({
              action: Actions.PREVIEW,
              event: event,
              status: ActionStatus.MODAL
            })
          }
        },
        {
          label: intl.formatMessage(buttonMessages.delete),
          handler: () => {
            setAction({
              action: Actions.DELETE,
              event: event,
              status: ActionStatus.MODAL
            })
          }
        }
      ]}
    />
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
        <OptionsMenu event={event} />
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
