import * as React from 'react'
import { defineMessages } from 'react-intl'
import { Tab, Tabs } from '@opencrvs/components/lib/interface'
import { IFormSection } from '../../forms'

export const messages = defineMessages({})

interface IFormTabProps {
  sections: IFormSection[]
  activeTabId: string
  onTabClick: (tabId: string) => void
}

export function FormTabs({ sections, activeTabId, onTabClick }: IFormTabProps) {
  return (
    <Tabs>
      {sections.map(({ name, id }) => (
        <Tab
          id={`tab_${id}`}
          onClick={() => onTabClick(id)}
          key={id}
          active={activeTabId === id}
        >
          {name}
        </Tab>
      ))}
    </Tabs>
  )
}
