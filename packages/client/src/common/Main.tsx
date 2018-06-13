import styled from 'styled-components'
import { Colors } from '@opencrvs/components/lib/Colors'
import { Fonts } from '@opencrvs/components/lib/Fonts'

export const Main = styled.section`
  flex: 1;
  width: 100%;
  margin-bottom: 30px;
  color: ${Colors.copy};
  ${Fonts.defaultFontStyle}
  letter-spacing: 0.5px;
`
