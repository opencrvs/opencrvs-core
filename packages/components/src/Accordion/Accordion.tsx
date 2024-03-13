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
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  &:hover {
    background: ${({ theme }) => theme.colors.grey100};
    cursor: pointer;
  }
`

const AccordionHeaderTitle = styled.div`
  h2 {
    margin-top: 0;
    margin-bottom: 6px;
  }
`

const AccordionHeaderAction = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding-right: 6px;
`

const Content = styled.div`
  margin-bottom: 32px;
`

export interface IAccordionProps {
  name: string
  label: string
  labelForShowAction: string
  labelForHideAction: string
  action?: React.ReactNode
  status?: React.ReactNode
  children: React.ReactNode
  expand?: boolean
}

export const Accordion = ({
  name,
  label,
  action,
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
        <AccordionHeaderTitle>
          <Text element={'h2'} variant={'h3'}>
            {label}
          </Text>
          {!isActive && (
            <Stack gap={4}>
              <Icon name={'CaretRight'} color={'primary'} size={'small'} />
              <Link font="bold14">{labelForShowAction}</Link>
            </Stack>
          )}
          {isActive && (
            <Stack gap={4}>
              <Icon name={'CaretDown'} color={'primary'} size={'small'} />
              <Link font="bold14">{labelForHideAction}</Link>
            </Stack>
          )}
        </AccordionHeaderTitle>
        <AccordionHeaderAction>{action}</AccordionHeaderAction>
      </AccordionHeader>

      {isActive && <Content id={`${name}-content`}>{children}</Content>}
    </Container>
  )
}
