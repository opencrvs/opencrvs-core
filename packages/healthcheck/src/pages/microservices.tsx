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
import { Icon } from '@opencrvs/components/lib/Icon'
import { ok } from 'assert'

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

export default function microservices() {
  const router = useRouter()
  const [modalState, setModalState] = useState(false)

  function handleView() {
    setModalState(true)
  }
  function handleClose() {
    setModalState(false)
  }

  const pingUrl = 'http://localhost:7070/ping?service='
  const [services, setServices] = useState({
    auth: {
      name: 'auth',
      port: 304,
      label: 'Auth',
      url: `${pingUrl}auth`,
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    user: {
      name: 'user',
      port: 304,
      label: 'User',
      url: 'http://localhost:7070/ping?service=user-mgnt',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    webhooks: {
      name: 'webhooks',
      port: 304,
      label: 'Webhooks',
      url: 'http://localhost:7070/ping?service=webhooks',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    documents: {
      name: 'documents',
      port: 304,
      label: 'Documents',
      url: 'http://localhost:7070/ping?service=documents',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    notification: {
      name: 'notification',
      port: 304,
      label: 'Notification',
      url: 'http://localhost:7070/ping?service=notification',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    gateway: {
      name: 'gateway',
      port: 304,
      label: 'Gateway',
      url: 'http://localhost:7070/ping?service=gateway',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    workflow: {
      name: 'workflow',
      port: 304,
      label: 'Workflow',
      url: 'http://localhost:7070/ping?service=workflow',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    search: {
      name: 'search',
      port: 304,
      label: 'Search',
      url: 'http://localhost:7070/ping?service=search',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    countryconfig: {
      name: 'countryconfig',
      port: 304,
      label: 'Countryconfig',
      url: 'http://localhost:7070/ping?service=countryconfig',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    metrics: {
      name: 'metrics',
      port: 304,
      label: 'Webhooks',
      url: 'http://localhost:7070/ping?service=metrics',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    client: {
      name: 'client',
      port: 304,
      label: 'Client',
      url: 'http://localhost:7070/ping?service=client',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    login: {
      name: 'login',
      port: 304,
      label: 'Login',
      url: 'http://localhost:7070/ping?service=login',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    },
    config: {
      name: 'config',
      port: 304,
      label: 'Config',
      url: 'http://localhost:7070/ping?service=config',
      status: 'LOADING',
      type: 'service',
      icon: <LoadingGrey />
    }
    // openhim: {
    //   name: 'openhim',
    //   acceptedStatusCodes: [200, 404],
    //   url: 'http://localhost:7070/ping?service=openhim',
    //   status: 'LOADING',
    //   type: 'dependency',
    //   icon: <LoadingGrey />
    // },
    // MongoDB: {
    //   name: 'MOngoDB',
    //   url: 'https://stackoverflow.com/questions/37839365/simple-http-tcp-health-check-for-mongodb/37852368#37852368',
    //   status: 'LOADING',
    //   type: 'dependency',
    //   icon: <LoadingGrey />
    // },
    // Influx: {
    //   name: 'Influx',
    //   url: 'http://localhost:7070/ping?service=influx',
    //   status: 'LOADING',
    //   type: 'dependency',
    //   icon: <LoadingGrey />
    // },
    // Minio: {
    //   name: 'Minio',
    //   url: 'https://docs.min.io/minio/baremetal/monitoring/healthcheck-probe.html',
    //   status: 'LOADING',
    //   type: 'dependency',
    //   icon: <LoadingGrey />
    // },
    // Kibana: {
    //   name: 'Kibana',
    //   url: 'https://docs.min.io/minio/baremetal/monitoring/healthcheck-probe.html',
    //   status: 'LOADING',
    //   type: 'dependency',
    //   icon: <LoadingGrey />
    // },
    // Elasticsearch: {
    //   name: 'Elasticsearch',
    //   url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-health.html#cat-health-api-request',
    //   status: 'LOADING',
    //   type: 'dependency',
    //   icon: <LoadingGrey />
    // }
  })

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
    console.log(services)
    Object.values(services).forEach((service) => {
      fetch(service.url)
        .then((res) => {
          if (
            (service.acceptedStatusCodes &&
              service.acceptedStatusCodes.includes(res.status)) ||
            res.status === 200
          ) {
            return setHealthy(service)
          }

          setFailing(service)
        })
        .catch((err) => {
          setFailing(service)
        })
    })
  }, [])

  const columns = [
    { label: 'Service', width: 25, key: 'service' },
    { label: 'Port', width: 20, key: 'port' },
    { label: 'Status', width: 20, key: 'status' },
    { label: 'Timespan', width: 20, key: 'span' },
    { label: 'Action', width: 15, key: 'action' }
  ]

  const [currentPage, setCurrentPage] = useState(1)
  const [Running, setRunning] = useState('secondary')

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
        totalItems={15}
        pageSize={5}
        columns={columns}
        currentPage={currentPage}
        isFullPage={true}
        onPageChange={(page) => setCurrentPage(page)}
        content={Object.values(services)
          .filter((s) => s.type === 'service')
          .map((service) => ({
            service: service.label,
            port: '3002',
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
