import React from 'react'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
// import { FormTabs } from '@opencrvs/components/lib/forms'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { BodyContent, Content } from '@opencrvs/components/lib/layout'
// import { Content } from '@opencrvs/components/lib/interface/Content'
import { messages } from '@client/i18n/messages/views/config'
// import { ListViewSimplified } from '@opencrvs/components/lib/interface/ListViewSimplified/ListViewSimplified'
import {
  BirthDelayedRegistrationTarget,
  BirthLateRegistrationPeriod,
  BirthRegistrationTarget
} from '@client/views/SysAdmin/Config/Application/Tabs/BirthProperties'
import {
  DeathDelayedRegistrationTarget,
  DeathRegistrationTarget
} from '@client/views/SysAdmin/Config/Application/Tabs/DeathProperties'
import { TopAlignedListViewItemSimplified } from '@client/views/Settings/items/components'
import { StickyFormTabs } from '@client/views/RegisterForm/StickyFormTabs'

const UserTable = styled(BodyContent)`
  padding: 0px;
  margin: 8px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`

export enum TabId {
  BIRTH = 'birth',
  DEATH = 'death'
}

function BirthTabContent() {
  return (
    <>
      <TopAlignedListViewItemSimplified>
        <BirthRegistrationTarget />
        <BirthLateRegistrationPeriod />
        <BirthDelayedRegistrationTarget />
      </TopAlignedListViewItemSimplified>
    </>
  )
}

function DeathTabContent() {
  return (
    <>
      <TopAlignedListViewItemSimplified>
        <DeathRegistrationTarget />
        <DeathDelayedRegistrationTarget />
      </TopAlignedListViewItemSimplified>
    </>
  )
}
const VSExport = () => {
  const intl = useIntl()

  const [activeTabId, setActiveTabId] = React.useState(TabId.BIRTH)
  const tabSections = [
    {
      id: TabId.BIRTH,
      title: intl.formatMessage(messages.birthTabTitleExport)
    },
    {
      id: TabId.DEATH,
      title: intl.formatMessage(messages.deathTabTitleExport)
    }
  ]

  // TODO: Reflace with Frame component */
  return (
    <>
      <SysAdminContentWrapper
        id="vsexport-wrapper"
        hideBackground={true}
        isCertificatesConfigPage={true}
      >
        <UserTable id="vsexport_list">
          <Content
            title={intl.formatMessage(messages.vsexport)}
            titleColor={'copy'}
            tabBarContent={
              <StickyFormTabs
                sections={tabSections}
                activeTabId={activeTabId}
                onTabClick={(id: TabId) => setActiveTabId(id)}
              />
            }
          >
            {activeTabId === TabId.BIRTH && <BirthTabContent />}
            {activeTabId === TabId.DEATH && <DeathTabContent />}
          </Content>
        </UserTable>
      </SysAdminContentWrapper>
    </>
  )
}

export default VSExport
