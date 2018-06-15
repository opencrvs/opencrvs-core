import styled from 'styled-components'
import { colors } from '@opencrvs/components/lib/colors'
import { fonts } from '@opencrvs/components/lib/fonts'

export const Main = styled.section`
  flex: 1;
  width: 100%;
  margin-bottom: 30px;
  color: ${colors.copy};
  ${fonts.defaultFontStyle}
  letter-spacing: 0.5px;
`
