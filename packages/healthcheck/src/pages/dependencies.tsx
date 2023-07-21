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
  const [modalState, setModalState] = useState(false)

  function handleView() {
    setModalState(true)
  }
  function handleClose() {
    setModalState(false)
  }

  // function Check<T = any>({
  //   check,
  //   ok,
  //   fail,
  //   instructions
  // }: {
  //   check: () => Promise<T>
  //   ok: (result: T) => React.ReactNode
  //   fail: (result: Error) => React.ReactNode
  //   instructions?: React.ReactNode
  // }) {
  //   const [status, setStatus] = useState<Status>(Status.LOADING)
  //   const [result, setResult] = useState<T | null>(null)
  //   const [icon, setIcon] = useState<JSX.Element | null>(null)
  //   useEffect(() => {
  //     check()
  //       .then((result) => {
  //         setResult(result as T)
  //         setStatus('OK')
  //         setIcon(<Success />)
  //       })
  //       .catch((err) => {
  //         setResult(err)
  //         setStatus('FAIL')
  //         setIcon(<Offline />)
  //       })
  //   }, [])

  //   if (status == Status.LOADING) {
  //     return <Spinner size={20} id="spin" />
  //   }
  //   return (
  //     <div className="check">
  //       {status === Status.OK ? (
  //         <>
  //           <Pill label="Running" type="active" size="small" />
  //           <Icon name={'Activity'} color="green" />
  //         </>
  //       ) : (
  //         <Icon color="red" name={'Activity'} />
  //       )}
  //       <div>
  //         {status === Status.OK ? ok(result as T) : fail(result as Error)}
  //         {status === Status.ERROR && instructions && (
  //           <div className="instructions">{instructions}</div>
  //         )}
  //       </div>
  //     </div>
  //   )
  // }

  // const pingUrl = 'http://localhost:7070/ping?service='

  const [services, setServices] = useState({
    countryconfig: {
      name: 'countryconfig',
      url: 'http://localhost:7070/ping?service=countryconfig',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    openhim: {
      name: 'openhim',
      acceptedStatusCodes: [200, 404],
      url: 'http://localhost:7070/ping?service=openhim',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    MongoDB: {
      name: 'MOngoDB',
      url: 'https://stackoverflow.com/questions/37839365/simple-http-tcp-health-check-for-mongodb/37852368#37852368',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Influx: {
      name: 'Influx',
      url: 'http://localhost:7070/ping?service=influx',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Minio: {
      name: 'Minio',
      url: 'https://docs.min.io/minio/baremetal/monitoring/healthcheck-probe.html',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Kibana: {
      name: 'Kibana',
      url: 'https://docs.min.io/minio/baremetal/monitoring/healthcheck-probe.html',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    },
    Elasticsearch: {
      name: 'Elasticsearch',
      url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-health.html#cat-health-api-request',
      status: 'LOADING',
      type: 'dependency',
      icon: <LoadingGrey />
    }
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

  // const [contents, setContents] = useState([
  //   {
  //     // service: 'Auth',
  //     // port: '4030',
  //     // status: <Pill label="Down" type="inactive" size="small" />,
  //     // span: '3 min ago',
  //     // action: (
  //     //   <Button type="primary" size="small" onClick={handleView}>
  //     //     view
  //     //   </Button>
  //     // )
  //   }
  // ])

  // useEffect(() => {
  //   function serviceStatus(service: string) {
  //     return fetch(`http://localhost:7070/ping?service=${service}`)
  //       .then((res) => {
  //         if (res.status == 200) {
  //           return true
  //         } else {
  //           return false
  //         }
  //       })
  //       .catch(() => {
  //         return false
  //       })
  //   }

  //   serviceStatus('documents').then((result) => {
  //     // Do something with the result
  //     const updatedContents = [
  //       {
  //         service: 'Auth',
  //         port: '4030',
  //         status: result ? (
  //           <Pill label="Running" type="active" size="small" />
  //         ) : (
  //           <Pill label="Down" type="inactive" size="small" />
  //         ),
  //         span: '3 min ago',
  //         action: (
  //           <Button type="primary" size="small" onClick={handleView}>
  //             view
  //           </Button>
  //         )
  //       }
  //     ]

  //     setContents(updatedContents)
  //     // Update state or do something with the updated contents
  //   })
  // })

  const columns = [
    { label: 'Service', width: 25, key: 'service' },
    { label: 'Port', width: 20, key: 'port' },
    { label: 'Status', width: 20, key: 'status' },
    { label: 'Timespan', width: 20, key: 'span' },
    { label: 'Action', width: 15, key: 'action' }
  ]

  // const contents = [
  //   {
  //     service: 'Auth',
  //     port: '4030',
  //     status: serviceStatus() ? (
  //       <Pill label="Running" type="active" size="small" />
  //     ) : (
  //       <Pill label="Down" type="inactive" size="small" />
  //     ),
  //     span: '3 min ago',
  //     action: (
  //       <Button type="primary" size="small" onClick={handleView}>
  //         {' '}
  //         view{' '}
  //       </Button>
  //     )
  //   },
  //   {
  //     service: 'User',
  //     port: '8090',
  //     status: <Pill label="Running" type="active" size="small" />,
  //     span: '3 min ago',
  //     action: (
  //       <Button type="primary" size="small" onClick={handleView}>
  //         {' '}
  //         view{' '}
  //       </Button>
  //     )
  //   },
  //   {
  //     service: 'Notification',
  //     port: '7070',
  //     status: <Pill label="Running" type="active" size="small" />,
  //     span: '3 min ago',
  //     action: (
  //       <Button type="primary" size="small" onClick={handleView}>
  //         {' '}
  //         view{' '}
  //       </Button>
  //     )
  //   },
  //   {
  //     service: 'Webhooks',
  //     port: '5060',
  //     status: <Pill label="Running" type="active" size="small" />,
  //     span: '3 min ago',
  //     action: (
  //       <Button type="primary" size="small" onClick={handleView}>
  //         {' '}
  //         view{' '}
  //       </Button>
  //     )
  //   },
  //   {
  //     service: 'Gateway',
  //     port: '8080',
  //     status: <Pill label="Down" type="inactive" size="small" />,
  //     span: '3 min ago',
  //     action: (
  //       <Button type="primary" size="small" onClick={handleView}>
  //         {' '}
  //         view{' '}
  //       </Button>
  //     )
  //   }
  // ]

  return (
    <ServiceContent size={ContentSize.LARGE} title="Dependencies">
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
          {/* <ToggleMenu
              key="toggleMenu"
              id="toggleMenu"
              menuItems={[
                { handler: function noRefCheck() {}, label: 'Item 1' }
              ]}
              toggleButton={<VerticalThreeDots />}
            /> */}
        </div>
      </div>

      <Table
        pageSize={5}
        columns={columns}
        content={Object.values(services).map((service) => ({
          service: service.name,
          port: '3002',
          status: service.icon,
          span: '3 min',
          action: (
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
