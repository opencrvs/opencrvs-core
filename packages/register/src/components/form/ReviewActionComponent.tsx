import * as React from 'react'
import styled from '@register/styledComponents'
import { PrimaryButton, IButtonProps } from '@opencrvs/components/lib/buttons'

interface IReviewActionProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  isComplete: boolean
  title: string
  description: string
  confirmAction: IButtonProps
  rejectAction?: IButtonProps
}

const Container = styled.div`
  position: relative;
`
const Content = styled.div`
  z-index: 1;
  padding: 24px 32px;
  position: relative;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.copy};
`
const UnderLayBackground = styled.div.attrs<{ isComplete: boolean }>({})`
  background-color: ${({ isComplete, theme }) =>
    isComplete ? theme.colors.success : theme.colors.error};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.16;
`

const Title = styled.div`
  ${({ theme }) => theme.fonts.bigBodyBoldStyle}
  margin-bottom: 8px;
`
const Description = styled.div`
  ${({ theme }) => theme.fonts.bigBodyStyle};
  margin-bottom: 16px;
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  button:first-child {
    margin-right: 16px;
  }
`

const RejectApplication = styled(PrimaryButton)`
  background-color: ${({ theme }) => theme.colors.error};
  &:hover:enabled {
    background: ${({ theme }) => theme.colors.error};
  }
`
export const ReviewAction = (props: IReviewActionProps) => {
  const {
    id,
    isComplete,
    title,
    description,
    confirmAction,
    rejectAction
  } = props

  return (
    <Container id={id}>
      <UnderLayBackground isComplete={isComplete} />
      <Content>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <ActionContainer>
          {confirmAction && <PrimaryButton {...confirmAction} />}
          {rejectAction && <RejectApplication {...rejectAction} />}
        </ActionContainer>
      </Content>
    </Container>
  )
}
