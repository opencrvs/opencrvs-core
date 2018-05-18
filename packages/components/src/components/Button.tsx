import * as React from 'react'
import { Text } from 'react-native'
import styled from 'styled-components/native'

const StyledButton = styled.TouchableHighlight`
  background-color: green;
`

export interface IButtonProps {
  onPress: () => void
  title: string
}

export const Button = (props: IButtonProps) => (
  <StyledButton accessibilityComponentType="button" onPress={props.onPress}>
    <Text>{props.title}</Text>
  </StyledButton>
)
