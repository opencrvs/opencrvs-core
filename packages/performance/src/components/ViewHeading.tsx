import * as React from 'react'
import styled from '../styled-components'

export interface IViewHeadingProps {
  id: string
  title?: string
  description?: string
  breadcrumb?: string
  hideBackButton?: boolean
}

const ViewHeadingContainer = styled.div`
  padding: ${({ theme }: any) => theme.grid.margin}px 50px;
`

const Breadcrumb = styled.div`
  font-family: ${({ theme }: any) => theme.fonts.lightFont};
  letter-spacing: 2.14px;
  font-size: 15px;
  text-transform: uppercase;
  margin-bottom: 20px;
`

const ViewTitle = styled.h2`
  font-size: 32px;
  font-family: ${({ theme }: any) => theme.fonts.lightFont};
  margin: 0;
  font-weight: 100;
`

const ViewDescription = styled.p`
  font-family: ${({ theme }: any) => theme.fonts.lightFont};
  margin: 0;
  margin-top: 5px;
  font-size: 18px;
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
