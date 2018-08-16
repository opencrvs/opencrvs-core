import * as React from 'react'
import styled from '../styled-components'

interface IViewHeadingProps {
  title: string
  description: string
}

const ViewHeadingContainer = styled.div`
  padding: ${({ theme }) => theme.grid.margin}px;
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

export function ViewHeading({ title, description }: IViewHeadingProps) {
  return (
    <ViewHeadingContainer>
      <ViewTitle>{title}</ViewTitle>
      <ViewDescription>{description}</ViewDescription>
    </ViewHeadingContainer>
  )
}
