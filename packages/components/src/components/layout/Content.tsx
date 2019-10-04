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
  margin: 64px auto 0;
  padding: 16px 32px;
  position: relative;
`

export const HomeContent = styled.div`
  max-width: 1021px;
  margin: 0 auto 64px auto;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.sm}px) {
    margin: 24px auto 64px auto;
  }
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    margin: 24px auto 64px auto;
    max-width: 100%;
  }
  @media (max-width: 1050px) and (min-width: ${({ theme }) =>
      theme.grid.breakpoints.lg}px) {
    max-width: calc(100% - 48px);
  }
  position: relative;
`

export const Container = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  position: absolute;
  min-height: 100vh;
  width: 100%;
`
export const FullBodyContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 24px;
  margin-top: 68px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`
