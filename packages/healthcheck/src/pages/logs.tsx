import { Content, Frame, Spinner } from '@opencrvs/components'
import { Icon } from '@opencrvs/components/lib/Icon'
// import { Check } from '@opencrvs/components/lib/icons';
import React, { useEffect, useState } from 'react'
import { generateOpenHIMCredentials, getChannels } from '../components/Openhim'
import { login } from '../components/Checks'

type Status = 'LOADING' | 'OK' | 'FAIL'
type Service = {
  name: string
  url: string
  status: Status
  type?: 'dependency' | 'service'
  acceptedStatusCodes?: number[]
}

function loginToOpenHIM(username: string, password: string) {
  return generateOpenHIMCredentials({
    username,
    password,
    apiURL: 'https://localhost:8080'
  })
}

function tryOpenHIMPassword(password: string) {
  return loginToOpenHIM('root@openhim.org', password).then(getChannels)
}

async function getCountryConfig(): Promise<{ COUNTRY: string }> {
  const res = await fetch(
    new URL('/client-config.js', 'http://localhost:3040').href
  )
  if (!res.ok) {
    throw new Error(`Could not fetch config, ${res.statusText} ${res.status}`)
  }
  return Function(`let window={}; ${await res.text()} ; return window.config`)()
}

const loginPromise = login()

function Check<T = any>({
  check,
  ok,
  fail,
  instructions
}: {
  check: () => Promise<T>
  ok: (result: T) => React.ReactNode
  fail: (result: Error) => React.ReactNode
  instructions?: React.ReactNode
}) {
  const [status, setStatus] = useState<Status>('LOADING')
  const [result, setResult] = useState<T | null>(null)
  useEffect(() => {
    check()
      .then((result) => {
        setResult(result as T)
        setStatus('OK')
      })
      .catch((err) => {
        setResult(err)
        setStatus('FAIL')
      })
  }, [])

  if (status === 'LOADING') {
    return <Spinner size={20} id="spin" />
  }
  return (
    <div className="check">
      {status === 'OK' ? (
        <Icon name="CheckCircle" color="green" />
      ) : (
        <Icon name="AlertTriangle" color="red" />
      )}
      <div>
        {status === 'OK' ? ok(result as T) : fail(result as Error)}
        {status === 'FAIL' && instructions && (
          <div className="instructions">{instructions}</div>
        )}
      </div>
    </div>
  )
}

async function getHearthLocations() {
  const { token } = await loginPromise
  return await fetch('http://localhost:5001/fhir/Location', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res) => res.json())
}

export default function Logs() {
  const [state, setState] = useState({
    someDevServerRunning: false,
    loggedIn: false
  })

  useEffect(() => {
    const img = new Image()
    img.src = 'http://localhost:3000/assets/sample-signature.png'
    img.onload = () => {
      setState((s) => ({ ...s, someDevServerRunning: true }))
    }
    loginPromise.then(() => {
      setState((s) => ({ ...s, loggedIn: true }))
    })
  }, [])

  const [services, setServices] = useState<{
    [name: string]: Service
  }>({
    auth: {
      name: 'auth',
      url: 'http://localhost:4040/ping',
      status: 'LOADING',
      type: 'service'
    },
    user: {
      name: 'user',
      url: 'http://localhost:3030/ping',
      status: 'LOADING',
      type: 'service'
    },
    webhooks: {
      name: 'webhooks',
      url: 'http://localhost:2525/ping',
      status: 'LOADING',
      type: 'service'
    },
    notification: {
      name: 'notification',
      url: 'http://localhost:2020/ping',
      status: 'LOADING',
      type: 'service'
    },
    gateway: {
      name: 'gateway',
      url: 'http://localhost:7070/ping?service=gateway',
      status: 'LOADING',
      type: 'service'
    },
    workflow: {
      name: 'workflow',
      url: 'http://localhost:5050/ping',
      status: 'LOADING',
      type: 'service'
    },
    search: {
      name: 'search',
      url: 'http://localhost:9090/ping',
      status: 'LOADING',
      type: 'service'
    },
    countryconfig: {
      name: 'countryconfig',
      url: 'http://localhost:3040/ping',
      status: 'LOADING',
      type: 'dependency'
    },
    metrics: {
      name: 'metrics',
      url: 'http://localhost:1050/ping',
      status: 'LOADING',
      type: 'service'
    },
    client: {
      name: 'client',
      url: 'http://localhost:3000/ping',
      status: 'LOADING',
      type: 'service'
    },
    login: {
      name: 'login',
      url: 'http://localhost:3020/ping',
      status: 'LOADING',
      type: 'service'
    },
    config: {
      name: 'config',
      url: 'http://localhost:2021/ping',
      status: 'LOADING',
      type: 'service'
    },
    openhim: {
      name: 'openhim',
      acceptedStatusCodes: [200, 404],
      url: 'http://localhost:5001/ping',
      status: 'LOADING',
      type: 'dependency'
    }
  })

  const composedState = {
    developmentEnvironment:
      services['client'].status === 'FAIL' && state.someDevServerRunning
        ? 'cra'
        : 'vite'
  }

  useEffect(() => {
    function setHealthy(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: { ...service, status: 'OK' }
      }))
    }
    function setFailing(service: Service) {
      setServices((services) => ({
        ...services,
        [service.name]: { ...service, status: 'FAIL' }
      }))
    }

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

  return (
    <Frame header={null} skipToContentText={''}>
      <Frame.Layout>
        <Frame.Section>
          <Content title="Checks">
            <div className="check">
              <Icon name="AlertCircle" color="blue" />
              Development environment is running&nbsp;
              <strong>
                {composedState.developmentEnvironment === 'cra'
                  ? 'Create React App'
                  : 'Vite'}
              </strong>
            </div>
            <Check<{ token: string }>
              check={() => loginPromise}
              ok={(conf) => {
                return (
                  <span>
                    Login OK as <strong>kennedy.mweene</strong>
                  </span>
                )
              }}
              fail={() => (
                <span>
                  Failed to login as <strong>kennedy.mweene</strong>
                </span>
              )}
              instructions={
                <span>
                  Try running `yarn db:backup:restore` in your country config
                  repository. This command loads a previous backup of the
                  database.
                </span>
              }
            />
            {state.loggedIn && (
              <>
                <Check
                  check={async () => {
                    const data = await getHearthLocations()

                    if (!data.total || data.total === 0) {
                      throw new Error('No locations found')
                    }
                  }}
                  ok={(conf) => {
                    return <span>There are locations in Hearth</span>
                  }}
                  fail={() => (
                    <span>No locations in Hearth's Locations collection.</span>
                  )}
                  instructions={
                    <span>
                      Try running <strong>yarn db:backup:restore</strong> in
                      your country config repository.
                    </span>
                  }
                />
                <Check
                  check={getHearthLocations}
                  ok={(conf) => {
                    return (
                      <span>
                        <a target="_blank" href="http://localhost:8888">
                          OpenHIM
                        </a>{' '}
                        channels set up and functional
                      </span>
                    )
                  }}
                  fail={() => (
                    <span>
                      Your{' '}
                      <a target="_blank" href="http://localhost:8888">
                        OpenHIM
                      </a>{' '}
                      doesn't have any channels.
                    </span>
                  )}
                  instructions={
                    <span>
                      Try running <strong>yarn db:backup:restore</strong> in
                      your country config repository.
                    </span>
                  }
                />
              </>
            )}
            <Check
              check={() =>
                tryOpenHIMPassword('password')
                  .then(() => 'password')
                  .catch(() =>
                    tryOpenHIMPassword('wXV8xSW2Ju5X3EPn').then(
                      () => 'wXV8xSW2Ju5X3EPn'
                    )
                  )
              }
              ok={(password) => {
                return (
                  <span>
                    OpenHIM login successful with user{' '}
                    <strong>root@openhim.org</strong> and password{' '}
                    <strong>{password}</strong>
                  </span>
                )
              }}
              fail={() => <span>Cannot log in to OpenHIM.</span>}
              instructions={
                <span>
                  <strong>Note</strong>, this is non-critical and your
                  environment might still work fine.
                  <br />
                  Make sure you have allowed your browser use OpenHIM's
                  self-signed certificate{' '}
                  <a target="_blank" href="https://localhost:8080/heartbeat">
                    here
                  </a>
                  .<br /> Then make sure your OpenHIM username is{' '}
                  <strong>root@openhim.org</strong> and password is{' '}
                  <strong>password</strong> or <strong>wXV8xSW2Ju5X3EPn</strong>
                </span>
              }
            />
          </Content>
          <Content title="Country config">
            <Check<{ COUNTRY: string }>
              check={getCountryConfig}
              ok={(conf) => {
                return (
                  <span>
                    Country config configured with code{' '}
                    <strong>{conf.COUNTRY}</strong>
                  </span>
                )
              }}
              fail={() => <span>Country config not running</span>}
              instructions={
                <span>
                  Go to your country config repository (opencrvs-farajaland or
                  opencrvs-your-country) and run <strong>yarn dev</strong>.
                </span>
              }
            />
          </Content>
        </Frame.Section>
      </Frame.Layout>
    </Frame>
  )
}
