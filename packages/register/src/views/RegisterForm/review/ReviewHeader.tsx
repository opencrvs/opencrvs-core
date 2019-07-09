import * as React from 'react'
import styled from '@register/styledComponents'

interface IReviewHeaderProps {
  id?: string
  logoSource: string
  title: string
  subject: string
}

const HeaderContainer = styled.div`
  min-height: 288px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.copy};
  background-color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dividerDark};
`
const ContentContainer = styled.div`
  flex-direction: column;
  align-items: center;
`
const IconContainer = styled.div`
  margin: 16px auto 16px auto;
`
const TitleContainer = styled.div`
  ${({ theme }) => theme.fonts.captionStyle}
  text-transform: uppercase;
`
const SubjectContainer = styled.div`
  ${({ theme }) => theme.fonts.h4Style}
`
const Image = styled.img`
  height: 104px;
  width: 104px;
`

export const ReviewHeader = (props: IReviewHeaderProps) => {
  const { id, logoSource, title, subject } = props

  return (
    <HeaderContainer id={id}>
      <ContentContainer>
        <IconContainer>
          <Image src={logoSource} />
        </IconContainer>
        <TitleContainer id={`${id}_title`}>{title}</TitleContainer>
        <SubjectContainer id={`${id}_subject`}>{subject}</SubjectContainer>
      </ContentContainer>
    </HeaderContainer>
  )
}
