import styled from 'styled-components'

export const Content = styled.section`
  flex: 1;
  width: 100%;
  height: 100%;
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme }) => theme.fonts.bodyStyle};
`

export const BodyContent = styled.div`
  max-width: 940px;
  margin: auto;
  padding: 16px 32px;
  position: relative;
`
export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  width: 100%;
  height: calc(100% - 40px);
`
