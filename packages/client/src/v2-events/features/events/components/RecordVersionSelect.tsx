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

import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { RecordForm, RecordVersion, UUID } from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components/lib/Button'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import { CaretDown } from '@opencrvs/components/lib/Icon/all-icons'

const messages = defineMessages({
  triggerLabel: {
    id: 'v2.event.record.version.trigger',
    defaultMessage: 'Version:',
    description:
      'Prefix on the record version selector, before the selected version'
  },
  formNotification: {
    id: 'v2.event.record.version.form.notification',
    defaultMessage: 'Notification',
    description: 'Name of the notification form in the record version selector'
  },
  formDeclaration: {
    id: 'v2.event.record.version.form.declaration',
    defaultMessage: 'Declaration',
    description: 'Name of the declaration form in the record version selector'
  },
  formRegistration: {
    id: 'v2.event.record.version.form.registration',
    defaultMessage: 'Registration',
    description: 'Name of the registration form in the record version selector'
  },
  onlyVersion: {
    id: 'v2.event.record.version.only',
    defaultMessage: 'Only version',
    description: 'Label for a form that has exactly one version'
  },
  latestVersion: {
    id: 'v2.event.record.version.latest',
    defaultMessage: 'Latest',
    description: 'Label for the newest of several versions of a form'
  },
  originalVersion: {
    id: 'v2.event.record.version.original',
    defaultMessage: 'Original',
    description: 'Label for the oldest of several versions of a form'
  },
  numberedVersion: {
    id: 'v2.event.record.version.numbered',
    defaultMessage: 'Version {number}',
    description:
      'Label for a version that is neither the oldest nor the newest of its form'
  },
  /*
   * The form name and the position are joined here rather than concatenated at
   * the call site, so a locale that needs a different separator, a different
   * order, or a declined form name can express it.
   */
  versionLabel: {
    id: 'v2.event.record.version.label',
    defaultMessage: '{form} • {position}',
    description:
      'How the form name and the version position are joined in the record version selector'
  }
})

const FORM_MESSAGES = {
  [RecordForm.NOTIFICATION]: messages.formNotification,
  [RecordForm.DECLARATION]: messages.formDeclaration,
  [RecordForm.REGISTRATION]: messages.formRegistration
} as const

const Prefix = styled.span`
  ${({ theme }) => theme.fonts.reg14}
  margin-right: 4px;
`

const SelectedLabel = styled.span`
  ${({ theme }) => theme.fonts.bold14}
  margin-right: 4px;
`

/**
 * Builds the label for one version. The position wording depends on how many
 * versions its form has: a form with a single version reads "Only version",
 * because "Latest" would imply others exist.
 */
function useVersionLabel(versions: RecordVersion[]) {
  const intl = useIntl()

  const countByForm = versions.reduce<Partial<Record<RecordForm, number>>>(
    (counts, version) => ({
      ...counts,
      [version.form]: (counts[version.form] ?? 0) + 1
    }),
    {}
  )

  return (version: RecordVersion) => {
    const total = countByForm[version.form] ?? 1
    const form = intl.formatMessage(FORM_MESSAGES[version.form])

    const position = (() => {
      if (total === 1) {
        return intl.formatMessage(messages.onlyVersion)
      }
      if (version.isLatestOfForm) {
        return intl.formatMessage(messages.latestVersion)
      }
      if (version.indexInForm === 0) {
        return intl.formatMessage(messages.originalVersion)
      }
      return intl.formatMessage(messages.numberedVersion, {
        number: version.indexInForm + 1
      })
    })()

    return intl.formatMessage(messages.versionLabel, { form, position })
  }
}

/**
 * Chooses which version of the record the Record tab shows.
 *
 * Rendered whenever the record has any version at all, including when it has
 * exactly one, so the control does not shift position as a record progresses.
 */
export function RecordVersionSelect({
  versions,
  selected,
  onSelect
}: {
  versions: RecordVersion[]
  selected: RecordVersion
  onSelect: (actionId: UUID) => void
}) {
  const intl = useIntl()
  const labelFor = useVersionLabel(versions)

  return (
    <DropdownMenu id="record-version">
      <DropdownMenu.Trigger asChild>
        <Button
          data-testid="record-version-select"
          size="medium"
          type="tertiary"
        >
          <Prefix>{intl.formatMessage(messages.triggerLabel)}</Prefix>
          <SelectedLabel>{labelFor(selected)}</SelectedLabel>
          <CaretDown />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {[...versions].reverse().map((version) => (
          <DropdownMenu.Item
            key={version.actionId}
            onClick={() => onSelect(version.actionId)}
          >
            <span data-testid={`record-version-option-${version.actionId}`}>
              {labelFor(version)}
            </span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
