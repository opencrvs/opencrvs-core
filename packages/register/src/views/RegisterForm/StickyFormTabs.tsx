import * as React from 'react'
import * as Sticky from 'react-stickynode'
import { IFormSection } from '../../forms'
import styled from '../../styled-components'
import { FormTabs } from '../../components/form'
import { injectIntl, InjectedIntlProps } from 'react-intl'

const StickyFormTabsContainer = styled.div`
  z-index: 100;
  background-color: ${({ theme }) => theme.colors.headerGradientDark};
`

interface IFormTabProps {
  sections: IFormSection[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

function StickyFormTabsComponent({
  sections,
  activeTabId,
  onTabClick
}: IFormTabProps & InjectedIntlProps) {
  return (
    <Sticky enabled={true}>
      <StickyFormTabsContainer>
        <FormTabs
          sections={sections}
          activeTabId={activeTabId}
          onTabClick={onTabClick}
        />
      </StickyFormTabsContainer>
    </Sticky>
  )
}

export const StickyFormTabs = injectIntl(StickyFormTabsComponent)
