import * as React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';

const StyledButton = styled.TouchableHighlight`
  background-color: green;
`;

export const Button = (props: any) => (
  <StyledButton onPress={props.onPress}>
    <Text>{props.title}</Text>
  </StyledButton>
);
