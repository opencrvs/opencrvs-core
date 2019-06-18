import styled from '@register/styledComponents'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Header } from '@opencrvs/components/lib/interface'

export const FooterAction = styled.div`
  display: flex;
  justify-content: center;
`

export const FooterPrimaryButton = styled(PrimaryButton)`
  box-shadow: 0 0 13px 0 rgba(0, 0, 0, 0.27);
`

export const ViewFooter = styled(Header)`
  flex-grow: 1;
  margin-top: -50px;
  padding-top: 100px;
  padding-bottom: 40px;
  /* stylelint-disable */
  ${FooterPrimaryButton} {
    /* stylelint-enable */
    width: 270px;
    justify-content: center;
  }
  /* stylelint-disable */
  ${FooterAction} {
    /* stylelint-enable */
    margin-bottom: 1em;
  }
  z-index: -1;
`
