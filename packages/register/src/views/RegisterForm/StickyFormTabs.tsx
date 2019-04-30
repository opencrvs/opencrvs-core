import * as React from 'react'
import Sticky from 'react-stickynode'
import { IFormSection } from '../../forms'
import styled from 'styledComponents'
import { FormTabs } from '../../components/form'
import { injectIntl, InjectedIntlProps } from 'react-intl'

const StickyFormTabsContainer = styled.div`
  div.sticky-inner-wrapper {
    background: linear-gradient(
      270deg,
      ${({ theme }) => theme.colors.headerGradientLight} 0%,
      ${({ theme }) => theme.colors.headerGradientDark} 100%
    );
  }
`

interface IStickyFormTabProps {
  sections: IFormSection[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

function StickyFormTabsComponent({
  sections,
  activeTabId,
  onTabClick
}: IStickyFormTabProps & InjectedIntlProps) {
  return (
    <StickyFormTabsContainer id="form_tabs_container">
      <Sticky enabled={true} innerZ={2}>
        <FormTabs
          sections={sections}
          activeTabId={activeTabId}
          onTabClick={onTabClick}
        />
      </Sticky>
    </StickyFormTabsContainer>
  )
}

export const StickyFormTabs = injectIntl(StickyFormTabsComponent)
