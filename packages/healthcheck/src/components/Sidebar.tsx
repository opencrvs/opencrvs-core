import React from 'react'
import { Text } from '@opencrvs/components/lib/Text'
import {
  LeftNavigation,
  NavigationGroup,
  NavigationItem
} from '@opencrvs/components/lib/SideNavigation'
import styled from 'styled-components'
import { SearchTool } from '@opencrvs/components/lib/SearchTool'
import { Content } from '@opencrvs/components/lib/Content'
import { useRouter } from 'next/router'

const Search = styled(SearchTool)`
  margin-right: 10px;
  width: 250px;
  border: 2px solid #93acd7;
  background-color: white;
`
const ServiceContent = styled(Content)`
  size: 'large';
  width: 200%;
`

export default function Sidebar() {
  const router = useRouter()
  return (
    <LeftNavigation
      applicationName="OpenCRVS"
      applicationVersion="1.1.0"
      buildVersion="Development"
    >
      <NavigationGroup>
        <Text
          variant="bold14"
          element="span"
          style={{
            display: 'flex',
            marginLeft: 25,
            marginTop: 10,
            marginBottom: 10
          }}
        >
          OpenCRVS Services
        </Text>
        <NavigationItem
          // count={6}
          // icon={() => {}}
          label="Microservices"
          // style={{ backgroundColor: '#edebeb' }}
          onClick={() => router.push('/microservices')}
        />

        <NavigationItem
          // count={23}
          // icon={function noRefCheck() {}}
          label="Dependencies"
          onClick={() => router.push('/dependencies')}
        >
          {/* <Link href="/logs">Dependency</Link> */}
        </NavigationItem>
        <NavigationItem
          // icon={function noRefCheck() {}}
          label="Country Config"
          onClick={() => router.push('/country-config')}
        />
        <NavigationItem
          count={23}
          // icon={function noRefCheck() {}}
          label="Logs"
          onClick={() => router.push('/logs')}
        />
      </NavigationGroup>
      {/* <Span> */}
      <Text
        variant="bold14"
        element="span"
        style={{ display: 'flex', marginLeft: 25, marginTop: 20 }}
      >
        Server Resources
      </Text>
      {/* </Span> */}

      <NavigationGroup>
        <NavigationItem
          // icon={function noRefCheck() {}}
          label="Performance"
          onClick={() => router.push('/performance')}
        />
        <NavigationItem
          // count={23}
          // icon={function noRefCheck() {}}
          label="Report"
          onClick={() => router.push('/report')}
        />
      </NavigationGroup>

      <Text
        variant="bold14"
        element="span"
        style={{ display: 'flex', marginLeft: 25, marginTop: 20 }}
      >
        Backup Server
      </Text>
      {/* </Span> */}

      <NavigationGroup>
        <NavigationItem
          // icon={function noRefCheck() {}}
          label="Backups"
          onClick={() => router.push('/backups')}
        />
        <NavigationItem
          // count={23}
          // icon={function noRefCheck() {}}
          label="Backup Health"
          onClick={() => router.push('/report')}
        />
      </NavigationGroup>
    </LeftNavigation>
  )
}
