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
import { useUsers } from '@client/v2-events/hooks/useUsers'
import { getUsersFullName } from '@client/v2-events/utils'

/*
 * Each key is one whole sentence. Guards decide which sentences appear, never
 * parts of one — a translator handed half a sentence cannot control the
 * conjunction, the word order or the case of the other half, and cannot see
 * what that half will be.
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

/** Sentences are joined at their boundaries, which every language tolerates. */
const Sentences = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

interface RecordVersionAlertProps {
  versions: RecordVersion[]
  selected: RecordVersion
}

/**
 * Says which of the record's forms is on screen, which version of it, where
 * that version came from, and what has happened to the record since.
 *
 * The tone turns on one fact: whether this is the newest version of its form.
 * Being an older version of a form is what warrants a warning — reading the
 * declaration of a registered record does not, because the declaration is
 * still the latest declaration.
 */
export function RecordVersionAlert({
  versions,
  selected
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

  // 1. Where this version came from. Always — it is the one thing neither the
  //    title nor the version selector says.
  const provenance = BY_ACTION[selected.actionType]
  if (provenance) {
    sentences.push(
      intl.formatMessage(provenance, {
        date: formatDate(selected.createdAt),
        name: actorName(selected.createdBy)
      })
    )
  }

  /*
   * 2. What follows from being on this form — and only when it changes what
   *    the reader would conclude. Dates are deliberately absent: the selector
   *    carries them, and repeating them here made the alert read as a log.
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
