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
import * as React from 'react'
import styled from 'styled-components'

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
  ${({ theme }) => theme.fonts.reg16}
`

const ValueContainer = styled.div<{ value: undefined | string }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey600 : theme.colors.grey400};
  ${({ theme }) => theme.fonts.bold16}
`

export const CertificateInfo = ({ data }: { data: Record<string, string> }) => {
  const renderDataItem = (key: string, value: string) => {
    return (
      <InfoContainer id={'summary'} key={key}>
        <KeyContainer id={`${key}`}>
          <KeyContainer id={`${key}`}>{key}</KeyContainer>
        </KeyContainer>
        <ValueContainer id={`${key}_value`} value={value}>
          {value}
        </ValueContainer>
      </InfoContainer>
    )
  }

  const renderedData: Record<string, string> = {
    'Registration Centre': data.registrationCentre,
    LGA: data.registrationLGA,
    State: data.registrationState,
    BRN: data.registrationNumber,
    'Full Name': `${data.childFamilyName}, ${data.childFirstName}`,
    Sex: data.informantGender,
    'Date of Birth': data.eventDate,
    'Place of Birth': `${data.placeOfBirthLocality}, ${data.placeOfBirthLGA}, ${data.placeOfBirthState}`
  }

  if (data.motherFamilyName || data.motherFirstName) {
    renderedData[
      'Full Name of Mother'
    ] = `${data.motherFamilyName}, ${data.motherFirstName}`
  }

  if (data.fatherFamilyName || data.fatherFirstName) {
    renderedData[
      'Full Name of Father'
    ] = `${data.fatherFamilyName}, ${data.fatherFirstName}`
  }

  renderedData['Name of Registrar'] = data.registrarName
  renderedData.Date = data.certificateDate

  return (
    <>
      {Object.entries(renderedData).map(([key, value]) =>
        renderDataItem(key, value)
      )}
    </>
  )
}
