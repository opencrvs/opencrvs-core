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
  IDeclarationData,
  getCaptitalizedWord,
  removeUnderscore
} from './utils'
import { IntlShape } from 'react-intl'
import styled from 'styled-components'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import format from '@client/utils/date-formatting'
import { REGISTERED, CERTIFIED } from '@client/utils/constants'
import {
  constantsMessages,
  dynamicConstantsMessages
} from '@client/i18n/messages/constants'
import { Summary } from '@opencrvs/components/lib/Summary'

const MobileDiv = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: inline;
  }
`
const ShowOnMobile = styled.div`
  display: none;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: flex;
    margin-left: auto;
    margin-bottom: 32px;
    margin-top: 32px;
  }
`

interface ILabel {
  [key: string]: string | undefined
}

export const GetDeclarationInfo = ({
  declaration,
  isDownloaded,
  intl,
  actions
}: {
  declaration: IDeclarationData
  isDownloaded: boolean
  intl: IntlShape
  actions: React.ReactElement[]
}) => {
  let informant = getCaptitalizedWord(declaration?.informant)

  const finalStatus = removeUnderscore(getCaptitalizedWord(declaration?.status))
  const displayStatus =
    finalStatus === 'Declared' || finalStatus === 'Submitted'
      ? intl.formatMessage(constantsMessages.inReviewStatus)
      : finalStatus === 'In progress'
      ? intl.formatMessage(constantsMessages.incompleteStatus)
      : finalStatus === 'Rejected'
      ? intl.formatMessage(constantsMessages.requiresUpdatesStatus)
      : finalStatus === 'Registered'
      ? intl.formatMessage(constantsMessages.registeredStatus)
      : finalStatus === 'Archived'
      ? intl.formatMessage(dynamicConstantsMessages.archived_declaration)
      : finalStatus

  if (declaration?.informantContact && informant) {
    informant = informant + ' · ' + declaration.informantContact
  }

  let info: ILabel = {
    status: declaration?.status && displayStatus,
    type: getCaptitalizedWord(declaration?.type),
    trackingId: declaration?.trackingId
  }

  /* TODO: This component needs refactor on how the data is being shown */
  if (info.type === 'Birth') {
    if (
      info.status &&
      [REGISTERED, CERTIFIED].includes(info.status.toLowerCase())
    ) {
      if (declaration?.brnDrn) {
        info.brn = declaration.brnDrn
      } else if (!isDownloaded) {
        info.brn = ''
      }
    }
    info = {
      ...info,
      type: intl.formatMessage(constantsMessages.birth),
      dateOfBirth: declaration?.dateOfBirth,
      placeOfBirth: declaration?.placeOfBirth,
      informant: removeUnderscore(informant)
    }
  } else if (info.type === 'Death') {
    if (
      info.status &&
      [REGISTERED, CERTIFIED].includes(info.status.toLowerCase())
    ) {
      if (declaration?.brnDrn) {
        info.drn = declaration.brnDrn
      } else if (!isDownloaded) {
        info.drn = ''
      }
    }
    info = {
      ...info,
      type: intl.formatMessage(constantsMessages.death),
      dateOfDeath: declaration?.dateOfDeath,
      placeOfDeath: declaration?.placeOfDeath,
      informant: removeUnderscore(informant)
    }
  }
  const mobileActions = actions.map((action, index) => (
    <MobileDiv key={index}>{action}</MobileDiv>
  ))
  return (
    <>
      <Summary id="summary">
        {Object.entries(info).map(([key, value]) => {
          const rowValue =
            value &&
            (key === 'dateOfBirth' || key === 'dateOfDeath'
              ? format(new Date(value), 'MMMM dd, yyyy')
              : value)

          const placeholder = intl.formatMessage(
            recordAuditMessages[`no${key[0].toUpperCase()}${key.slice(1)}`]
          )

          return (
            <Summary.Row
              data-testid={`${key}-value`}
              label={intl.formatMessage(recordAuditMessages[key])}
              placeholder={placeholder}
              value={rowValue}
              locked={!value && !isDownloaded}
            />
          )
        })}
      </Summary>

      <ShowOnMobile>{mobileActions.map((action) => action)}</ShowOnMobile>
    </>
  )
}
