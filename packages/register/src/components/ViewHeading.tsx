import * as React from 'react'
import styled from '../styled-components'

export interface IViewHeadingProps {
  title: string
  description: string
  breadcrump?: string
}

const ViewHeadingContainer = styled.div`
  padding: ${({ theme }) => theme.grid.margin}px;
`

const Breadcrumb = styled.div`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  letter-spacing: 2.14;
  font-size: 15px;
  text-transform: uppercase;
  margin-bottom: 20px;
`

const ViewTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  margin: 0;
`

const ViewDescription = styled.p`
  font-family: ${({ theme }) => theme.fonts.lightFont};
  margin: 0;
  margin-top: 5px;
`

export function ViewHeading({
  title,
  description,
  breadcrump
}: IViewHeadingProps) {
  return (
    <ViewHeadingContainer>
      {breadcrump && <Breadcrumb>{breadcrump}</Breadcrumb>}
      <ViewTitle>{title}</ViewTitle>
      <ViewDescription>{description}</ViewDescription>
    </ViewHeadingContainer>
  )
}
