import * as React from 'react'
import styled from '@performance/styledComponents'

export interface IViewHeadingProps {
  id: string
  title?: string
  description?: string
  breadcrumb?: string
  hideBackButton?: boolean
}

const ViewHeadingContainer = styled.div`
  padding: ${({ theme }) => theme.grid.margin}px 50px;
`

const Breadcrumb = styled.div`
  ${({ theme }) => theme.fonts.subtitleStyle};
  text-transform: uppercase;
  margin-bottom: 20px;
`

const ViewTitle = styled.h2`
  ${({ theme }) => theme.fonts.h2Style};
  margin: 0;
`

const ViewDescription = styled.p`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin: 0;
  margin-top: 5px;
`

export function ViewHeading({
  title,
  description,
  breadcrumb,
  id
}: IViewHeadingProps) {
  return (
    <ViewHeadingContainer id={id}>
      {breadcrumb && <Breadcrumb>{breadcrumb}</Breadcrumb>}
      {title && <ViewTitle id="view_title">{title}</ViewTitle>}
      {description && <ViewDescription>{description}</ViewDescription>}
    </ViewHeadingContainer>
  )
}
