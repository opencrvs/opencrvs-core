import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl } from 'react-intl'
import styled from 'styled-components'
import { Header } from '@opencrvs/components/lib/interface'
import { TopMenu } from 'src/components/TopMenu'
import Logo from 'src/components/Logo'

const StretchedHeader = styled(Header)`
  justify-content: flex-end;
  min-height: 280px;
`

const StyledLogo = styled(Logo)`
  margin: 12px auto auto 5%;
`

class Declarations extends React.Component<InjectedIntlProps> {
  render() {
    return (
      <>
        <StretchedHeader {...this.props}>
          <StyledLogo />
          <TopMenu hideBackButton={true} />
        </StretchedHeader>
      </>
    )
  }
}

export const DeclarationsPage = connect(null, null)(injectIntl(Declarations))
