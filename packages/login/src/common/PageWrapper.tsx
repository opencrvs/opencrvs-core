import * as React from 'react'
import { Content } from '@opencrvs/components/lib/layout/Content'
import { Wrapper } from '@opencrvs/components/lib/layout/Wrapper'

export const pageWrapper = (WrappedComponent: any) => {
  return class extends React.Component {
    render() {
      return (
        <Wrapper>
          <Content>
            <WrappedComponent {...this.props} />
          </Content>
        </Wrapper>
      )
    }
  }
}
