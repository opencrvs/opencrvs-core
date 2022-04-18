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
import { constantsMessages, buttonMessages } from '@client/i18n/messages'
import { LinkButton } from '@opencrvs/components/lib/buttons'
import { ToggleMenu } from '@opencrvs/components/lib/interface'
import { VerticalThreeDots } from '@opencrvs/components/lib/icons'
import styled from '@client/styledComponents'
import { goToFormConfigWizard } from '@client/navigation'

const Label = styled.span`
  ${({ theme }) => theme.fonts.bold16};
`

const Value = styled.span`
  color: ${({ theme }) => theme.colors.grey500};
`

type IVersion = { version: number }

function ActionButton({ event, version }: { event: Event } & IVersion) {
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
        version > 0 ? buttonMessages.edit : buttonMessages.configure
      )}
    </LinkButton>
  )
}

function OptionsMenu() {
  const intl = useIntl()
  return (
    <ToggleMenu
      id="toggleMenu"
      toggleButton={<VerticalThreeDots />}
      menuItems={[
        {
          label: intl.formatMessage(buttonMessages.preview),
          handler: () => {}
        },
        {
          label: intl.formatMessage(buttonMessages.delete),
          handler: () => {}
        }
      ]}
    />
  )
}

function EventDrafts({ event }: { event: Event }) {
  const intl = useIntl()
  const { comment, history, version } = useSelector((store: IStoreState) =>
    selectFormDraft(store, event)
  )

  const actions = (
    <>
      <ActionButton event={event} version={version} />
      {version > 0 && <OptionsMenu key="toggleButton" />}
    </>
  )

  const VersionLabel = ({ version }: IVersion) => (
    <Label>
      {`${intl.formatMessage(constantsMessages[event])} v${version}`}
    </Label>
  )

  return (
    <>
      <ListViewItemSimplified
        key={version}
        label={<VersionLabel version={version} />}
        value={<Value>{comment}</Value>}
        actions={actions}
      />
      {history?.map(({ comment, version }) => (
        <ListViewItemSimplified
          key={version}
          label={<VersionLabel version={version} />}
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
