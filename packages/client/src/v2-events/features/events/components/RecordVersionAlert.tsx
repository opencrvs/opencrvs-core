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
import { defineMessages, MessageDescriptor, useIntl } from 'react-intl'
import styled from 'styled-components'
import { uniq } from 'lodash'
import { ActionType, RecordForm, RecordVersion } from '@opencrvs/commons/client'
import { Alert } from '@opencrvs/components/lib/Alert'
import { Checkbox } from '@opencrvs/components/lib/Checkbox'
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'

/*
 * Each key is one whole sentence, never half of one: a translator cannot
 * control word order or case across a join they cannot see.
 */
const messages = defineMessages({
  titlePattern: {
    id: 'v2.event.record.alert.title',
    defaultMessage: '{formName} — {statement}',
    description:
      'How the form name and the position statement are joined in the record alert title'
  },
  onlyVersion: {
    id: 'v2.event.record.alert.title.only',
    defaultMessage: 'This is the only version',
    description: 'Record alert title when the form has a single version'
  },
  latestVersion: {
    id: 'v2.event.record.alert.title.latest',
    defaultMessage: 'You are viewing the latest version',
    description: 'Record alert title on the newest of several versions'
  },
  originalVersion: {
    id: 'v2.event.record.alert.title.original',
    defaultMessage: 'You are viewing the original version',
    description: 'Record alert title on the oldest of several versions'
  },
  earlierVersion: {
    id: 'v2.event.record.alert.title.earlier',
    defaultMessage: 'You are viewing an earlier version',
    description:
      'Record alert title on a version that is neither the oldest nor the newest'
  },
  formNotification: {
    id: 'v2.event.record.version.form.notification',
    defaultMessage: 'Notification',
    description: 'Name of the notification form'
  },
  formDeclaration: {
    id: 'v2.event.record.version.form.declaration',
    defaultMessage: 'Declaration',
    description: 'Name of the declaration form'
  },
  formRegistration: {
    id: 'v2.event.record.version.form.registration',
    defaultMessage: 'Registration',
    description: 'Name of the registration form'
  },
  bySent: {
    id: 'v2.event.record.alert.by.sent',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Sent on {date}.} other {Sent by {name} on {date}.}}',
    description: 'Provenance of a notification version'
  },
  byDeclared: {
    id: 'v2.event.record.alert.by.declared',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Declared on {date}.} other {Declared by {name} on {date}.}}',
    description: 'Provenance of a declaration version'
  },
  byRegistered: {
    id: 'v2.event.record.alert.by.registered',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Registered on {date}.} other {Registered by {name} on {date}.}}',
    description: 'Provenance of a registration version'
  },
  byRedeclared: {
    id: 'v2.event.record.alert.by.redeclared',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Re-declared with edits on {date}.} other {Re-declared with edits by {name} on {date}.}}',
    description:
      'Provenance of a declaration that replaced an earlier one through an edit'
  },
  byCorrected: {
    id: 'v2.event.record.alert.by.corrected',
    defaultMessage:
      '{name, select, __UNKNOWN__ {Corrected on {date}.} other {Corrected by {name} on {date}.}}',
    description: 'Provenance of a corrected registration version'
  },
  sinceDeclared: {
    id: 'v2.event.record.alert.since.declared',
    defaultMessage: 'This record has since been declared.',
    description:
      'Shown on a notification of a record that has been declared but not registered'
  },
  sinceDeclaredAndRegistered: {
    id: 'v2.event.record.alert.since.declaredAndRegistered',
    defaultMessage: 'This record has since been declared and registered.',
    description: 'Shown on a notification of a record that has been registered'
  },
  sinceRegistered: {
    id: 'v2.event.record.alert.since.registered',
    defaultMessage: 'This record has since been registered.',
    description: 'Shown on a declaration of a record that has been registered'
  },
  isLegalRecord: {
    id: 'v2.event.record.alert.isLegalRecord',
    defaultMessage: 'This is the legal record of the event.',
    description: 'Shown on the current registration'
  },
  showEdits: {
    id: 'v2.event.record.alert.changes.showEdits',
    defaultMessage: 'Show edits',
    description:
      'Labels the control that marks up what changed from the previous notification or declaration'
  },
  showCorrection: {
    id: 'v2.event.record.alert.changes.showCorrection',
    defaultMessage: 'Show correction',
    description:
      'Labels the control that marks up what changed from the previous registration'
  }
})

const FORM_NAME: Record<RecordForm, MessageDescriptor> = {
  [RecordForm.NOTIFICATION]: messages.formNotification,
  [RecordForm.DECLARATION]: messages.formDeclaration,
  [RecordForm.REGISTRATION]: messages.formRegistration
}

const BY_ACTION: Partial<Record<ActionType, MessageDescriptor>> = {
  [ActionType.NOTIFY]: messages.bySent,
  [ActionType.DECLARE]: messages.byDeclared,
  [ActionType.REGISTER]: messages.byRegistered,
  [ActionType.APPROVE_CORRECTION]: messages.byCorrected
}

/* The design-system checkbox labels at 17px, which is page copy, not alert copy. */
const ChangeControl = styled.div`
  margin-top: 12px;

  label {
    ${({ theme }) => theme.fonts.reg14};
    gap: 8px;
  }
`

/** Sentences are joined at their boundaries, which every language tolerates. */
const Sentences = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

interface RecordVersionAlertProps {
  versions: RecordVersion[]
  selected: RecordVersion
  /** Fields that differ from the previous version. Zero hides the action. */
  changeCount?: number
  showChanges?: boolean
  onToggleChanges?: () => void
}

/**
 * Says which form and version is on screen, where it came from, and what has
 * happened to the record since.
 *
 * The tone turns on whether this is the newest version of its form. A
 * declaration on a registered record is not a warning — it is still the latest
 * declaration.
 */
export function RecordVersionAlert({
  versions,
  selected,
  changeCount = 0,
  showChanges = false,
  onToggleChanges
}: RecordVersionAlertProps) {
  const intl = useIntl()
  const { getUsers } = useUsers()
  const users = getUsers.useQuery(uniq(versions.map((v) => v.createdBy)))

  const formatDate = (iso: string) =>
    intl.formatDate(new Date(iso), {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

  const actorName = (userId: string) => {
    const user = users.data?.find((u) => u.id === userId)
    return user ? getUsersFullName(user.name) : '__UNKNOWN__'
  }

  const ofSameForm = versions.filter((v) => v.form === selected.form)

  const statement = (() => {
    if (ofSameForm.length === 1) {
      return messages.onlyVersion
    }
    if (selected.isLatestOfForm) {
      return messages.latestVersion
    }
    if (selected.indexInForm === 0) {
      return messages.originalVersion
    }
    return messages.earlierVersion
  })()

  const title = intl.formatMessage(messages.titlePattern, {
    formName: intl.formatMessage(FORM_NAME[selected.form]),
    statement: intl.formatMessage(statement)
  })

  const sentences: string[] = []

  /*
   * Where this version came from — neither the title nor the selector says it.
   * Every declaration after the first came from an edit, and says so rather
   * than reading as a second, independent declaration.
   */
  const isRedeclaration =
    selected.actionType === ActionType.DECLARE && selected.indexInForm > 0

  const provenance = isRedeclaration
    ? messages.byRedeclared
    : BY_ACTION[selected.actionType]
  if (provenance) {
    sentences.push(
      intl.formatMessage(provenance, {
        date: formatDate(selected.createdAt),
        name: actorName(selected.createdBy)
      })
    )
  }

  /*
   * What follows from being on this form, and only when it changes what the
   * reader would conclude. No dates — the selector carries them.
   */
  const hasDeclaration = versions.some((v) => v.form === RecordForm.DECLARATION)
  const hasRegistration = versions.some(
    (v) => v.form === RecordForm.REGISTRATION
  )

  const consequence = (() => {
    if (selected.form === RecordForm.NOTIFICATION) {
      if (hasRegistration) {
        return messages.sinceDeclaredAndRegistered
      }
      return hasDeclaration ? messages.sinceDeclared : undefined
    }

    if (selected.form === RecordForm.DECLARATION) {
      return hasRegistration ? messages.sinceRegistered : undefined
    }

    // Only the newest registration is the legal record; an earlier one is not.
    return selected.isLatestOfForm ? messages.isLegalRecord : undefined
  })()

  if (consequence) {
    sentences.push(intl.formatMessage(consequence))
  }

  /*
   * A registration only ever changes by correction, and a notification or
   * declaration only by edit, so the action names what happened rather than
   * describing the mechanism.
   */
  const isRegistration = selected.form === RecordForm.REGISTRATION

  /*
   * No count. Between two consecutive versions there is exactly one edit or
   * one correction, so a number here would count changed fields while the
   * words name events — "2 corrections" for one correction touching two
   * fields would read as two correction requests.
   *
   * A checkbox rather than a button: the comparison is a state you leave on
   * or off, not something you do once. The label stays put and the check
   * carries whether it is on.
   */
  const changeLabel = intl.formatMessage(
    isRegistration ? messages.showCorrection : messages.showEdits
  )

  return (
    <Alert
      data-testid="record-version-alert"
      title={title}
      type={selected.isLatestOfForm ? 'info' : 'warning'}
    >
      <Sentences>
        {sentences.map((sentence, index) => (
          // Sentences are generated in a fixed order and never reordered.

          <span key={index}>{sentence}</span>
        ))}
      </Sentences>
    </Alert>
  )
}
