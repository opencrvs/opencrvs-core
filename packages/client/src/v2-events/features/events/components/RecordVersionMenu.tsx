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

import React, { useState } from 'react'
import { defineMessages, useIntl, MessageDescriptor } from 'react-intl'
import styled from 'styled-components'
import { uniq } from 'lodash'
import {
  ActionType,
  RecordForm,
  RecordVersion,
  UUID
} from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components/lib/Button'
import { DropdownMenu } from '@opencrvs/components/lib/Dropdown'
import {
  CaretDown,
  CaretUp,
  Check,
  FileDotted,
  FileText,
  Stamp
} from '@opencrvs/components/lib/Icon/all-icons'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'

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
    description: 'Name of the notification form in the record version menu'
  },
  formDeclaration: {
    id: 'v2.event.record.version.form.declaration',
    defaultMessage: 'Declaration',
    description: 'Name of the declaration form in the record version menu'
  },
  formRegistration: {
    id: 'v2.event.record.version.form.registration',
    defaultMessage: 'Registration',
    description: 'Name of the registration form in the record version menu'
  },
  aboutNotification: {
    id: 'v2.event.record.version.about.notification',
    defaultMessage: 'The first report of the event, from a health facility',
    description: 'What the notification form is, in the record version menu'
  },
  aboutDeclaration: {
    id: 'v2.event.record.version.about.declaration',
    defaultMessage:
      "The informant's signed statement, with supporting documents",
    description: 'What the declaration form is, in the record version menu'
  },
  aboutRegistration: {
    id: 'v2.event.record.version.about.registration',
    defaultMessage: 'The legal record of the event',
    description: 'What the registration form is, in the record version menu'
  },
  versionCount: {
    id: 'v2.event.record.version.count',
    defaultMessage:
      '{count, plural, one {# version} other {# versions}} · {opened}',
    description:
      'Summary line on a collapsed form: how many versions it holds and when it opened'
  },
  openedNotified: {
    id: 'v2.event.record.version.opened.notified',
    defaultMessage: 'sent {date}',
    description: 'When a notification form opened, for the summary line'
  },
  openedDeclared: {
    id: 'v2.event.record.version.opened.declared',
    defaultMessage: 'declared {date}',
    description: 'When a declaration form opened, for the summary line'
  },
  openedRegistered: {
    id: 'v2.event.record.version.opened.registered',
    defaultMessage: 'registered {date}',
    description: 'When a registration form opened, for the summary line'
  },
  labelLatest: {
    id: 'v2.event.record.version.label.latest',
    defaultMessage: 'Latest',
    description: 'The newest version of a form, in the record version menu'
  },
  labelFirstNotified: {
    id: 'v2.event.record.version.label.firstNotified',
    defaultMessage: 'As first notified',
    description: 'The oldest version of the notification form'
  },
  labelFirstDeclared: {
    id: 'v2.event.record.version.label.firstDeclared',
    defaultMessage: 'As first declared',
    description: 'The oldest version of the declaration form'
  },
  labelFirstRegistered: {
    id: 'v2.event.record.version.label.firstRegistered',
    defaultMessage: 'As first registered',
    description: 'The oldest version of the registration form'
  },
  labelAfterCorrection: {
    id: 'v2.event.record.version.label.afterCorrection',
    defaultMessage: 'After correction {number}',
    description: 'A registration version between the first and the latest'
  },
  labelAfterEdit: {
    id: 'v2.event.record.version.label.afterEdit',
    defaultMessage: 'After edit {number}',
    description: 'A declaration version between the first and the latest'
  },
  bySent: {
    id: 'v2.event.record.version.by.sent',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Sent {date}} other {Sent {date} · {name}}}',
    description: 'Provenance of a notification version'
  },
  byDeclared: {
    id: 'v2.event.record.version.by.declared',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Declared {date}} other {Declared {date} · {name}}}',
    description: 'Provenance of a declaration version'
  },
  byEdited: {
    id: 'v2.event.record.version.by.edited',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Edited {date}} other {Edited {date} · {name}}}',
    description: 'Provenance of an edited declaration version'
  },
  byRegistered: {
    id: 'v2.event.record.version.by.registered',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Registered {date}} other {Registered {date} · {name}}}',
    description: 'Provenance of a registration version'
  },
  byCorrected: {
    id: 'v2.event.record.version.by.corrected',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Corrected {date}} other {Corrected {date} · {name}}}',
    description: 'Provenance of a corrected registration version'
  }
})

const FORM_NAME: Record<RecordForm, MessageDescriptor> = {
  [RecordForm.NOTIFICATION]: messages.formNotification,
  [RecordForm.DECLARATION]: messages.formDeclaration,
  [RecordForm.REGISTRATION]: messages.formRegistration
}

const FORM_ABOUT: Record<RecordForm, MessageDescriptor> = {
  [RecordForm.NOTIFICATION]: messages.aboutNotification,
  [RecordForm.DECLARATION]: messages.aboutDeclaration,
  [RecordForm.REGISTRATION]: messages.aboutRegistration
}

const FORM_OPENED: Record<RecordForm, MessageDescriptor> = {
  [RecordForm.NOTIFICATION]: messages.openedNotified,
  [RecordForm.DECLARATION]: messages.openedDeclared,
  [RecordForm.REGISTRATION]: messages.openedRegistered
}

const FORM_FIRST: Record<RecordForm, MessageDescriptor> = {
  [RecordForm.NOTIFICATION]: messages.labelFirstNotified,
  [RecordForm.DECLARATION]: messages.labelFirstDeclared,
  [RecordForm.REGISTRATION]: messages.labelFirstRegistered
}

const BY_ACTION: Partial<Record<ActionType, MessageDescriptor>> = {
  [ActionType.NOTIFY]: messages.bySent,
  [ActionType.DECLARE]: messages.byDeclared,
  [ActionType.EDIT]: messages.byEdited,
  [ActionType.REGISTER]: messages.byRegistered,
  [ActionType.APPROVE_CORRECTION]: messages.byCorrected
}

const FORM_ICON = {
  [RecordForm.NOTIFICATION]: FileDotted,
  [RecordForm.DECLARATION]: FileText,
  [RecordForm.REGISTRATION]: Stamp
}

/** Newest form first. A record shows only the forms it actually holds. */
const FORM_ORDER: RecordForm[] = [
  RecordForm.REGISTRATION,
  RecordForm.DECLARATION,
  RecordForm.NOTIFICATION
]

const Menu = styled.div`
  width: 520px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
`

const Card = styled.div<{ $holdsSelection?: boolean }>`
  border: 1px solid
    ${({ theme, $holdsSelection }) =>
      $holdsSelection ? theme.colors.primary : theme.colors.grey200};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;
`

const Line = styled.div<{ $selected?: boolean; $indent?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: ${({ $indent }) => ($indent ? 'center' : 'flex-start')};
  gap: 12px;
  width: 100%;
  padding: ${({ $indent }) => ($indent ? '10px 16px 10px 56px' : '14px 16px')};
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primaryLighter : 'transparent'};
  border: 0;
  text-align: left;
  cursor: pointer;
  &:hover {
    background: ${({ theme, $selected }) =>
      $selected ? theme.colors.primaryLighter : theme.colors.grey100};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }
`

const Badge = styled.div`
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.grey100};
  display: flex;
  align-items: center;
  justify-content: center;
`

const Texts = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const Title = styled.span`
  ${({ theme }) => theme.fonts.h4}
  color: ${({ theme }) => theme.colors.copy};
`

const RowTitle = styled.span`
  ${({ theme }) => theme.fonts.bold14}
  color: ${({ theme }) => theme.colors.copy};
`

const Sub = styled.span`
  ${({ theme }) => theme.fonts.reg14}
  color: ${({ theme }) => theme.colors.supportingCopy};
`

const Meta = styled.span`
  ${({ theme }) => theme.fonts.reg14}
  color: ${({ theme }) => theme.colors.grey500};
`

const Versions = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 8px;
`

interface VersionMenuProps {
  versions: RecordVersion[]
  selected: RecordVersion
  onSelect: (actionId: UUID) => void
}

export function RecordVersionMenu({
  versions,
  selected,
  onSelect
}: VersionMenuProps) {
  const intl = useIntl()
  const { getUsers } = useUsers()

  const actorIds = uniq(versions.map((v) => v.createdBy))
  const users = getUsers.useQuery(actorIds)

  const [expanded, setExpanded] = useState<RecordForm[]>([selected.form])

  const nameOf = (userId: string) => {
    const user = users.data?.find((u) => u.id === userId)
    return user ? getUsersFullName(user.name) : '__UNKNOWN__'
  }

  const formatDate = (iso: string) =>
    intl.formatDate(new Date(iso), {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

  const provenance = (version: RecordVersion) => {
    const descriptor = BY_ACTION[version.actionType]
    if (!descriptor) {
      return formatDate(version.createdAt)
    }
    return intl.formatMessage(descriptor, {
      date: formatDate(version.createdAt),
      name: nameOf(version.createdBy)
    })
  }

  const rowLabel = (version: RecordVersion, total: number) => {
    if (version.isLatestOfForm) {
      return intl.formatMessage(messages.labelLatest)
    }
    if (version.indexInForm === 0) {
      return intl.formatMessage(FORM_FIRST[version.form])
    }
    return intl.formatMessage(
      version.form === RecordForm.REGISTRATION
        ? messages.labelAfterCorrection
        : messages.labelAfterEdit,
      { number: version.indexInForm }
    )
  }

  const groups = FORM_ORDER.map((form) => ({
    form,
    items: versions
      .filter((v) => v.form === form)
      .sort((a, b) => b.indexInForm - a.indexInForm)
  })).filter(({ items }) => items.length > 0)

  const toggle = (form: RecordForm) =>
    setExpanded((open) =>
      open.includes(form) ? open.filter((f) => f !== form) : [...open, form]
    )

  return (
    <DropdownMenu id="record-version">
      <DropdownMenu.Trigger asChild>
        <Button
          data-testid="record-version-select"
          size="medium"
          type="tertiary"
        >
          {intl.formatMessage(messages.triggerLabel)}{' '}
          {intl.formatMessage(FORM_NAME[selected.form])} ·{' '}
          {rowLabel(
            selected,
            versions.filter((v) => v.form === selected.form).length
          )}
          <CaretDown />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <Menu data-testid="record-version-menu">
          {groups.map(({ form, items }) => {
            const holdsSelection = selected.form === form
            const single = items.length === 1
            const isOpen = expanded.includes(form)
            const oldest = items[items.length - 1]

            return (
              <Card key={form} $holdsSelection={holdsSelection}>
                <Line
                  $selected={single && holdsSelection}
                  as="button"
                  data-testid={`record-version-form-${form}`}
                  type="button"
                  onClick={() =>
                    single ? onSelect(items[0].actionId) : toggle(form)
                  }
                >
                  <Badge>{React.createElement(FORM_ICON[form], { size: 20 })}</Badge>
                  <Texts>
                    <Title>{intl.formatMessage(FORM_NAME[form])}</Title>
                    <Sub>{intl.formatMessage(FORM_ABOUT[form])}</Sub>
                    {/* The count repeats the rows, so it hides while open. */}
                    {!(isOpen && !single) && (
                      <Meta>
                        {single
                          ? provenance(items[0])
                          : intl.formatMessage(messages.versionCount, {
                              count: items.length,
                              opened: intl.formatMessage(FORM_OPENED[form], {
                                date: formatDate(oldest.createdAt)
                              })
                            })}
                      </Meta>
                    )}
                  </Texts>
                  {!single &&
                    (isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />)}
                  {single && holdsSelection && <Check size={20} />}
                </Line>

                {!single && isOpen && (
                  <Versions>
                    {items.map((version) => {
                      const isSelected = version.actionId === selected.actionId
                      return (
                        <Line
                          key={version.actionId}
                          $indent
                          $selected={isSelected}
                          as="button"
                          data-testid={`record-version-option-${version.actionId}`}
                          type="button"
                          onClick={() => onSelect(version.actionId)}
                        >
                          <Texts>
                            <RowTitle>{rowLabel(version, items.length)}</RowTitle>
                            <Sub>{provenance(version)}</Sub>
                          </Texts>
                          {isSelected && <Check size={20} />}
                        </Line>
                      )
                    })}
                  </Versions>
                )}
              </Card>
            )
          })}
        </Menu>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
