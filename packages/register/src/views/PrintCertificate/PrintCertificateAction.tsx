import * as React from 'react'
import styled from 'styled-components'
import { ActionPage } from '@opencrvs/components/lib/interface'

export const ActionPageWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  z-index: 4;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`

type State = {}

type IProps = {
  backLabel: string
  title: string
}

export default class PrintCertificateAction extends React.Component<
  IProps,
  State
> {
  constructor(props: IProps) {
    super(props)
    this.state = {}
  }

  render = () => {
    const { title, backLabel } = this.props
    return (
      <ActionPageWrapper>
        <ActionPage title={title} backLabel={backLabel} goBack={() => ({})}>
          <></>
        </ActionPage>
      </ActionPageWrapper>
    )
  }
}
