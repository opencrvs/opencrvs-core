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
import React, { useState } from 'react'
import styled from 'styled-components'
import { Link, Stack, Text } from '../'
import { Icon } from '../Icon'

const Container = styled.div`
  box-sizing: border-box;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
  padding: 0;
  width: 100%;
`
const AccordionHeader = styled.div`
  padding: 16px 0;

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    cursor: pointer;
  }

  h3 {
    margin-top: 0;
    margin-bottom: 5px;
  }
`
const Content = styled.div`
  margin-top: 15px;
  padding-top: 0px !important;
  padding-bottom: 15px;
`

export interface IAccordionProps {
  name: string
  label: string
  labelForShowAction: string
  labelForHideAction: string
  children: React.ReactNode
  expand?: boolean
}

export const Accordion = ({
  name,
  label,
  labelForShowAction,
  labelForHideAction,
  children,
  expand
}: IAccordionProps) => {
  const [isActive, setIsActive] = useState<boolean>(expand || false)

  return (
    <Container id={`${name}-accordion`}>
      <AccordionHeader
        id={`${name}-accordion-header`}
        onClick={() => setIsActive(!isActive)}
      >
        <Text element={'h3'} variant={'h3'}>
          {label}
        </Text>
        {!isActive && (
          <Stack>
            <Icon name={'CaretRight'} color={'primary'} size={'large'} />
            <Link>{labelForShowAction}</Link>
          </Stack>
        )}
        {isActive && (
          <Stack>
            <Icon name={'CaretDown'} color={'primary'} size={'large'} />
            <Link>{labelForHideAction}</Link>
          </Stack>
        )}
      </AccordionHeader>

      {isActive && <Content id={`${name}-content`}>{children}</Content>}
    </Container>
  )
}
