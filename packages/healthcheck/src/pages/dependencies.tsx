import React, { useEffect } from 'react'
import styled from 'styled-components'
import { SearchTool } from '@opencrvs/components/lib/SearchTool'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Table } from '@opencrvs/components/lib/Table'
import { Pill } from '@opencrvs/components/lib/Pill'
import { TrackingID } from '@opencrvs/components/lib/icons'
import { useRouter } from 'next/router'

const columns = [
  { label: 'Service', width: 25, key: 'service' },
  { label: 'Port', width: 20, key: 'port' },
  { label: 'Status', width: 20, key: 'status' },
  { label: 'Timespan', width: 20, key: 'span' },
  { label: 'Action', width: 15, key: 'action' }
]

const content = [
  {
    service: 'Auth',
    port: '4030',
    status: <Pill label="Down" type="inactive" size="small" />,
    span: '3 min ago',
    action: (
      <Button type="primary" size="small">
        {' '}
        view{' '}
      </Button>
    )
  },
  {
    service: 'User',
    port: '8090',
    status: <Pill label="Running" type="active" size="small" />,
    span: '3 min ago',
    action: (
      <Button type="primary" size="small">
        {' '}
        view{' '}
      </Button>
    )
  },
  {
    service: 'Notification',
    port: '7070',
    status: <Pill label="Running" type="active" size="small" />,
    span: '3 min ago',
    action: (
      <Button type="primary" size="small">
        {' '}
        view{' '}
      </Button>
    )
  },
  {
    service: 'Webhooks',
    port: '5060',
    status: <Pill label="Running" type="active" size="small" />,
    span: '3 min ago',
    action: (
      <Button type="primary" size="small">
        {' '}
        view{' '}
      </Button>
    )
  },
  {
    service: 'Gateway',
    port: '8080',
    status: <Pill label="Down" type="inactive" size="small" />,
    span: '3 min ago',
    action: (
      <Button type="primary" size="small">
        {' '}
        view{' '}
      </Button>
    )
  }
]

const Search = styled(SearchTool)`
  margin-right: 10px;
  width: 70%;
  border: 2px solid #93acd7;
  background-color: white;
`
const ServiceContent = styled(Content)`
  size: 'large';
  width: 200%;
`

export default function dependencies() {
  const router = useRouter()
  return (
    <ServiceContent size={ContentSize.LARGE} title="Dependencies">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div
          style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}
        >
          <h4>Filter: </h4>
          <Button
            type="primary"
            size="small"
            style={{ marginRight: 5, marginLeft: 5 }}
          >
            {' '}
            All{' '}
          </Button>
          <Button type="secondary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Running{' '}
          </Button>
          <Button type="secondary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Down{' '}
          </Button>
        </div>

        <div
          style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}
        >
          <Search
            language="english"
            onClearText={() => {}}
            searchHandler={function noRefCheck() {}}
            // searchParam="String"
            searchTypeList={[
              {
                icon: <TrackingID />,
                invertIcon: <TrackingID />,
                label: '',
                placeHolderText: 'Search for a service',
                value: 'Tracking ID'
              }
              // {
              //   icon: <BRN />,
              //   invertIcon: <BRN />,
              //   label: 'BRN/DRN',
              //   placeHolderText: '',
              //   value: ''
              // }
            ]}
          />

          <Button type="primary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Search{' '}
          </Button>
        </div>
      </div>

      <Table pageSize={5} columns={columns} content={content} />
    </ServiceContent>
  )
}
