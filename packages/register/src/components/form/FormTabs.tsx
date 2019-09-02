import * as React from 'react'
import { Tab, Tabs } from '@opencrvs/components/lib/interface'
import { IFormSection } from '@register/forms'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'

interface IFormTabProps {
  sections: IFormSection[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

function FormTabsComponent({
  sections,
  activeTabId,
  onTabClick,
  intl
}: IFormTabProps & IntlShapeProps) {
  return (
    <Tabs>
      {sections.map(({ name, id, disabled }) => (
        <Tab
          id={`tab_${id}`}
          onClick={() => onTabClick(id)}
          key={id}
          active={activeTabId === id}
          disabled={disabled}
        >
          {intl.formatMessage(name)}
        </Tab>
      ))}
    </Tabs>
  )
}

export const FormTabs = injectIntl(FormTabsComponent)
