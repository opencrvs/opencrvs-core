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

const MobileDiv = styled.div`
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    display: inline;
  }
`

const InfoContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  flex-flow: row;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    flex-flow: column;
  }
`

const KeyContainer = styled.div`
  width: 190px;
  color: ${({ theme }) => theme.colors.grey600};
  ${({ theme }) => theme.fonts.bold16}
`

const ValueContainer = styled.div<{ value: undefined | string }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey600 : theme.colors.grey400};
  ${({ theme }) => theme.fonts.reg16};
`

const GreyedInfo = styled.div`
  height: 26px;
  background-color: ${({ theme }) => theme.colors.grey200};
  max-width: 330px;
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

  if (declaration?.informantContact && informant) {
    informant = informant + ' · ' + declaration.informantContact
  }

  let info: ILabel = {
    status: declaration?.status && finalStatus,
    type: getCaptitalizedWord(declaration?.type),
    trackingId: declaration?.trackingId
  }

  if (info.type === 'Birth') {
    if (declaration?.brnDrn) {
      info.brn = declaration.brnDrn
    } else if (!isDownloaded) {
      info.brn = ''
    }
    info = {
      ...info,
      dateOfBirth: declaration?.dateOfBirth,
      placeOfBirth: declaration?.placeOfBirth,
      informant: removeUnderscore(informant)
    }
  } else if (info.type === 'Death') {
    if (declaration?.brnDrn) {
      info.drn = declaration.brnDrn
    } else if (!isDownloaded) {
      info.drn = ''
    }
    info = {
      ...info,
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
      <div>
        {Object.entries(info).map(([key, value]) => {
          return (
            <InfoContainer id={'summary'} key={key}>
              <KeyContainer id={`${key}`}>
                <KeyContainer id={`${key}`}>
                  {intl.formatMessage(recordAuditMessages[key])}
                </KeyContainer>
              </KeyContainer>
              <ValueContainer id={`${key}_value`} value={value}>
                {value ? (
                  key === 'dateOfBirth' || key === 'dateOfDeath' ? (
                    format(new Date(value), 'MMMM dd, yyyy')
                  ) : (
                    value
                  )
                ) : isDownloaded ? (
                  intl.formatMessage(
                    recordAuditMessages[
                      `no${key[0].toUpperCase()}${key.slice(1)}`
                    ]
                  )
                ) : (
                  <GreyedInfo id={`${key}_grey`} />
                )}
              </ValueContainer>
            </InfoContainer>
          )
        })}
      </div>
      <ShowOnMobile>{mobileActions.map((action) => action)}</ShowOnMobile>
    </>
  )
}
