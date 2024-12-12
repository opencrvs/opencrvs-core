import React from 'react'
import { Box } from '../Box'
import styled from 'styled-components'
import { Stack } from '../Stack'
import { Text } from '../Text'
import { Icon, IconProps } from '../Icon'

interface InfoBoxProps {
  iconName: IconProps['name']
  label: string
}

const Container = styled(Box)`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
`
const IconContainer = styled.div`
  height: 44px;
  width: 44px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    height: 37px;
    width: 37px;
  }
`
const InfoBox = (props: InfoBoxProps) => {
  return (
    <Container>
      <Stack alignItems="center">
        <IconContainer>
          <Icon name={props.iconName} size="large" />
        </IconContainer>
        <Text variant="reg14" element="p">
          {props.label}
        </Text>
      </Stack>
    </Container>
  )
}

export default InfoBox
