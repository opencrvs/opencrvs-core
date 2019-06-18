import * as React from 'react'
import { Online, Offline } from '@opencrvs/components/lib/icons'
import styled from '@register/styledComponents'

const StyledOnline = styled.div`
  position: absolute;
  top: 32px;
  right: 245px;
`

const StyledOffline = styled.div`
  position: absolute;
  top: 32px;
  right: 245px;
`

const ConnectivityStatus = () => {
  return navigator.onLine ? (
    <StyledOnline>
      <Online />
    </StyledOnline>
  ) : (
    <StyledOffline>
      <Offline />
    </StyledOffline>
  )
}

export default ConnectivityStatus
