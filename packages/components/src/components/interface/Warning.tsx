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
import styled from 'styled-components'
import { Alert } from '../icons'
import { colors } from '../colors'

const Conatiner = styled.div`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  /* stylelint-disable-next-line color-no-hex */
  background-color: #fff3f3;
  border-radius: 4px;
  border: 1px solid ${colors.red};
  color: ${colors.red};
`

export function Warning({ label }: { label: string }) {
  return (
    <Conatiner>
      <Alert color="invert" />
      {label}
    </Conatiner>
  )
}
