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
import { Link } from '../Link'
import { Stack } from '../Stack'
import { Text } from '../Text'
import styled from 'styled-components'

export interface IBreadCrumbData {
  paramId: string | null | undefined
  label: string | null
}

const BreadcrumbLink = styled(Link)`
  &::after {
    display: inline-block;
    content: '/';
    padding-left: 4px;
    color: ${({ theme }) => theme.colors.copy};
  }
`

export interface IBreadCrumbProps {
  items: IBreadCrumbData[]
  onSelect: (x: IBreadCrumbData) => void
}

export const BreadCrumb = ({ items = [], onSelect }: IBreadCrumbProps) => {
  const isLast = (index: number): boolean => {
    return index === items.length - 1
  }

  return (
    <Stack gap={4} direction="row" wrap>
      {items.map((item, i) =>
        !isLast(i) ? (
          <BreadcrumbLink
            key={item.label}
            color={'primary'}
            font={'bold14'}
            onClick={(e) => {
              e.preventDefault()
              if (onSelect) onSelect(item)
            }}
          >
            {item.label}
          </BreadcrumbLink>
        ) : (
          <Text key={item.label} variant={'bold14'} element={'span'}>
            {item.label}
          </Text>
        )
      )}
    </Stack>
  )
}
