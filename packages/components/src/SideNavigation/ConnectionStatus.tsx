import React from 'react'
import styled from 'styled-components'

interface ConnectionStatusProps {
  isOnline?: boolean
  className?: string
}

const Dot = styled.span<{ isOnline: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ isOnline, theme }) =>
    isOnline ? theme.colors.green : theme.colors.red};
  display: inline-block;
  margin-right: 8px;
`

const Label = styled.span`
  ${({ theme }) => theme.fonts.reg14};
  color: ${({ theme }) => theme.colors.grey500};
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isOnline = false,
  className
}) => {
  return (
    <Container className={className}>
      <Dot isOnline={isOnline} />
      <Label>{isOnline ? 'Online' : 'Offline'}</Label>
    </Container>
  )
}
