import * as React from 'react'
import { connect } from 'react-redux'
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl'
import styled from 'styled-components'
import { HomeViewHeader } from 'src/components/HomeViewHeader'
import { ViewHeading, IViewHeadingProps } from 'src/components/ViewHeading'
import { IconAction, ActionTitle } from '@opencrvs/components/lib/buttons'
import { Plus } from '@opencrvs/components/lib/icons'
import {
  Banner,
  SearchInput,
  ISearchInputProps
} from '@opencrvs/components/lib/interface'

const messages = defineMessages({
  searchInputPlaceholder: {
    id: 'register.workQueue.searchInput.placeholder',
    defaultMessage: 'Look for a record',
    description: 'The placeholder of search input'
  },
  searchInputButtonTitle: {
    id: 'register.workQueue.buttons.search',
    defaultMessage: 'Search',
    description: 'The title of search input submit button'
  },
  bannerTitle: {
    id: 'register.workQueue.applications.banner',
    defaultMessage: 'Applications to register in your area',
    description: 'The title of the banner'
  }
})

const Container = styled.div`
  z-index: 1;
  position: relative;
  margin-top: -30px;
  padding: 0 ${({ theme }) => theme.grid.margin}px;
`
const StyledPlusIcon = styled(Plus)`
  display: flex;
  margin-left: -23px;
`
const StyledIconAction = styled(IconAction)`
  display: flex;
  min-height: 96px;
  padding: 0 20px 0 0;
  box-shadow: 0 0 12px 1px rgba(0, 0, 0, 0.22);
  background-color: ${({ theme }) => theme.colors.accentLight};
  /* stylelint-disable */
  ${ActionTitle} {
    /* stylelint-enable */
    margin: -2px 0 -2px 130px;
    color: ${({ theme }) => theme.colors.white};
  }
`
type IWorkQueueProps = InjectedIntlProps & IViewHeadingProps & ISearchInputProps

class WorkQueueView extends React.Component<IWorkQueueProps> {
  render() {
    const { intl } = this.props
    return (
      <>
        <HomeViewHeader>
          <ViewHeading
            title="Hello Registrar"
            description="Review | Registration | Certification"
            {...this.props}
          />
        </HomeViewHeader>
        <Container>
          <StyledIconAction
            icon={() => <StyledPlusIcon />}
            title="New registration"
          />
          <Banner text={intl.formatMessage(messages.bannerTitle)} count={15} />
          <SearchInput
            placeholder={intl.formatMessage(messages.searchInputPlaceholder)}
            buttonLabel={intl.formatMessage(messages.searchInputButtonTitle)}
            {...this.props}
          />
        </Container>
      </>
    )
  }
}

export const WorkQueue = connect(null)(injectIntl(WorkQueueView))
