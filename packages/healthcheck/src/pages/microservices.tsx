import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SearchTool } from '@opencrvs/components/lib/SearchTool'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Button } from '@opencrvs/components/lib/Button'
import { Table } from '@opencrvs/components/lib/Table'
import { Pill } from '@opencrvs/components/lib/Pill'
import { Offline, Success, TrackingID } from '@opencrvs/components/lib/icons'
import { useRouter } from 'next/router'
import DynamicModal from '@/components/DynamicModal'
import { Service, Status } from '@/lib/check-health'
import { LoadingGrey, Spinner } from '@opencrvs/components'

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

export default function Microservices() {
  type ButtonType = 'primary' | 'secondary'

  const router = useRouter()
  const columns = [
    { label: 'Service', width: 25, key: 'service' },
    { label: 'Port', width: 20, key: 'port' },
    { label: 'Status', width: 20, key: 'status' },
    { label: 'Timespan', width: 20, key: 'span' },
    { label: 'Action', width: 15, key: 'action' }
  ]
  const pingUrl = 'http://localhost:7070/ping?service'
  const [services, setServices] = useState({
    auth: {
      name: 'auth',
      port: 4040,
      label: 'Auth',
      url: `${pingUrl}=auth`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    user: {
      name: 'user',
      port: 3030,
      label: 'User',
      url: `${pingUrl}=user-mgnt`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    webhooks: {
      name: 'webhooks',
      port: 2525,
      label: 'Webhooks',
      url: `${pingUrl}=webhooks`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    documents: {
      name: 'documents',
      port: 9050,
      label: 'Documents',
      url: `${pingUrl}=documents`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    notification: {
      name: 'notification',
      port: 2020,
      label: 'Notification',
      url: `${pingUrl}=notification`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    gateway: {
      name: 'gateway',
      port: 7070,
      label: 'Gateway',
      url: `${pingUrl}=gateway`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    workflow: {
      name: 'workflow',
      port: 5050,
      label: 'Workflow',
      url: `${pingUrl}=workflow`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    search: {
      name: 'search',
      port: 9090,
      label: 'Search',
      url: `${pingUrl}=search`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    countryconfig: {
      name: 'countryconfig',
      port: 3040,
      label: 'Countryconfig',
      url: `${pingUrl}=countryconfig`,
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    metrics: {
      name: 'metrics',
      port: 1050,
      label: 'Metrics',
      url: `${pingUrl}=metrics`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    client: {
      name: 'client',
      port: 3000,
      label: 'Client',
      url: `${pingUrl}=client`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    login: {
      name: 'login',
      port: 304,
      label: 'Login',
      url: `${pingUrl}=login`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    config: {
      name: 'config',
      port: 304,
      label: 'Config',
      url: `${pingUrl}=config`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    }
  })
  const [modalState, setModalState] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [Running, setRunning] = useState<ButtonType>('secondary')

  const handleView = () => {
    setModalState(true)
  }
  const handleClose = () => {
    setModalState(false)
  }

  useEffect(() => {
    function setHealthy(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: {
          ...service,
          status: 'OK',
          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Pill label="Running" type="active" size="small" />
              <Success />
            </div>
          )
        }
      }))
    }
    function setFailing(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: {
          ...service,
          status: 'FAIL',
          icon: (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Pill label="Down" type="inactive" size="small" />
              <div style={{ marginLeft: 10, marginTop: 15 }}>
                <Offline />
              </div>
            </div>
          )
        }
      }))
    }
    // console.log(services)
    Object.values(services).forEach((service) => {
      fetch(service.url)
        .then(async (res) => {
          const responseBody = await res.json()

          if (responseBody.status === 'ok') {
            return setHealthy(service)
          }

          setFailing(service)
        })
        .catch((err) => {
          setFailing(service)
        })
    })
  }, [])

  return (
    <ServiceContent size={ContentSize.LARGE} title="Microservices">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
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
          <Button
            type={Running}
            size="small"
            style={{ marginRight: 5 }}
            onClick={() => setRunning('primary')}
          >
            {' '}
            Running{' '}
          </Button>
          <Button type="secondary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Down{' '}
          </Button>
        </div>

        <div
          style={{
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search
            language="english"
            onClearText={() => {}}
            searchHandler={function noRefCheck() {}}
            searchTypeList={[
              {
                icon: <TrackingID />,
                invertIcon: <TrackingID />,
                label: '',
                placeHolderText: 'Search for a service',
                value: 'Tracking ID'
              }
            ]}
          />

          <Button type="primary" size="small" style={{ marginRight: 5 }}>
            {' '}
            Search{' '}
          </Button>
        </div>
      </div>

      <Table
        totalItems={Object.keys(services).length}
        pageSize={5}
        columns={columns}
        currentPage={currentPage}
        isFullPage={true}
        onPageChange={(page) => setCurrentPage(page)}
        content={Object.values(services)
          .filter((s) => s.type === 'service')
          .map((service) => ({
            service: service.label,
            port: service.port,
            status: service.icon,
            span: '3 min',
            action:
              service.status === 'OK' ? (
                <Button
                  type="primary"
                  size="small"
                  onClick={handleView}
                  disabled
                >
                  view
                </Button>
              ) : (
                <Button type="primary" size="small" onClick={handleView}>
                  view
                </Button>
              )
          }))}
      />

      {modalState && (
        <DynamicModal
          title="Notification Checks"
          show={modalState}
          closeModal={handleClose}
        />
      )}
    </ServiceContent>
  )
}
