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
import styled from 'styled-components'
import React from 'react'
import { Square } from '@opencrvs/components/lib/icons'

const SliderContainer = styled.div`
  width: min(600px, 90%);
  display: flex;
  align-self: center;
  align-items: center;
  margin: 30px 0;
  padding: 0 16px;
  gap: 8px;
`

const StyledInput = styled.input`
  flex-grow: 1;
`

export function Slider(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <SliderContainer>
      <Square color="grey400" height={12} width={12} />
      <StyledInput {...props} />
      <Square color="grey400" height={18} width={18} />
    </SliderContainer>
  )
}
