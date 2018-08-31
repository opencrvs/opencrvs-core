import { Tabs } from '@opencrvs/components/lib/interface'
import styled from '../../styled-components'
import { ViewHeader } from '../ViewHeader'

export const ViewHeaderWithTabs = styled(ViewHeader)`
  padding-bottom: 0;

  /* stylelint-disable */
  ${Tabs} {
    /* stylelint-enable */
    overflow-x: auto;
    width: 100%;
  }
`
