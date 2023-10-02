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
import {
  IDeclarationData,
  getCaptitalizedWord,
  removeUnderscore
} from './utils'
import { IntlShape } from 'react-intl'
import styled from 'styled-components'
import { recordAuditMessages } from '@client/i18n/messages/views/recordAudit'
import format from '@client/utils/date-formatting'
import { REGISTERED, CERTIFIED, ISSUED } from '@client/utils/constants'
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
    gap: 8px;
    margin-left: auto;
    margin-bottom: 32px;
    margin-top: 32px;
  }
`
const StyledSummaryRow = styled(Summary.Row)`
  th {
    vertical-align: baseline;
  }
`
const StyledDiv = styled.div`
  padding-bottom: 4px;
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
  const informantPhone = declaration?.informant?.registrationPhone
  const informantEmail = declaration?.informant?.registrationEmail
  const mainContact =
    [informantPhone, informantEmail].filter(Boolean).length > 0
      ? [informantPhone, informantEmail].filter(Boolean)
      : undefined

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
      : finalStatus === 'Draft'
      ? intl.formatMessage(dynamicConstantsMessages.draft)
      : finalStatus

  let info: ILabel = {
    status: declaration?.status && displayStatus,
    type: getCaptitalizedWord(declaration?.type),
    trackingId: declaration?.trackingId
  }

  /* TODO: This component needs refactor on how the data is being shown */
  if (info.type === 'Birth') {
    if (
      info.status &&
      [REGISTERED, CERTIFIED, ISSUED].includes(finalStatus.toLowerCase())
    ) {
      if (declaration?.registrationNo) {
        info.registrationNo = declaration.registrationNo
      } else if (!isDownloaded) {
        info.registrationNo = ''
      }
    }
    info = {
      ...info,
      type: intl.formatMessage(constantsMessages.birth),
      dateOfBirth: declaration?.dateOfBirth,
      placeOfBirth: declaration?.placeOfBirth
    }
  } else if (info.type === 'Death') {
    if (
      info.status &&
      [REGISTERED, CERTIFIED, ISSUED].includes(finalStatus.toLowerCase())
    ) {
      if (declaration?.registrationNo) {
        info.registrationNo = declaration.registrationNo
      } else if (!isDownloaded) {
        info.registrationNo = ''
      }
    }
    info = {
      ...info,
      type: intl.formatMessage(constantsMessages.death),
      dateOfDeath: declaration?.dateOfDeath,
      placeOfDeath: declaration?.placeOfDeath
    }
  } else if (info.type === 'Marriage') {
    if (
      info.status &&
      [REGISTERED, CERTIFIED, ISSUED].includes(finalStatus.toLowerCase())
    ) {
      if (declaration?.registrationNo) {
        info.registrationNo = declaration.registrationNo
      } else if (!isDownloaded) {
        info.registrationNo = ''
      }
    }
    info = {
      ...info,
      type: intl.formatMessage(constantsMessages.marriage),
      dateOfMarriage: declaration?.dateOfMarriage,
      placeOfMarriage: declaration?.placeOfMarriage
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
            (key === 'dateOfBirth' ||
            key === 'dateOfDeath' ||
            key === 'dateOfMarriage'
              ? format(new Date(value), 'MMMM dd, yyyy')
              : value)

          const message =
            recordAuditMessages[`no${key[0].toUpperCase()}${key.slice(1)}`]
          const placeholder = message && intl.formatMessage(message)

          return (
            <Summary.Row
              key={key}
              data-testid={key}
              label={intl.formatMessage(recordAuditMessages[key])}
              placeholder={placeholder}
              value={rowValue}
              locked={!value && !isDownloaded}
            />
          )
        })}
        <StyledSummaryRow
          key="contact-summary"
          data-testid="contact"
          label={intl.formatMessage(recordAuditMessages.contact)}
          placeholder={intl.formatMessage(recordAuditMessages.noContact)}
          value={mainContact?.map((contact, index) => (
            <StyledDiv key={'contact_' + index}>{contact}</StyledDiv>
          ))}
          locked={!isDownloaded}
        />
      </Summary>

      <ShowOnMobile>{mobileActions.map((action) => action)}</ShowOnMobile>
    </>
  )
}
