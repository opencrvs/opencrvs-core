import React from 'react'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import * as Sentry from '@sentry/react'
import { resolve } from 'url'
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components'

export interface ICountryLogo {
  fileName: string
  file: string
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
}

export interface IApplicationConfigResponse {
  config: IApplicationConfig
}

export function request<T>(options: AxiosRequestConfig) {
  const client = axios.create()

  const onSuccess = (response: AxiosResponse<T>) => {
    return response.data
  }

  const onError = (error: AxiosError) => {
    if (error.response) {
      // Request was made but server responded with something
      // other than 2xx
    } else {
      // Something else happened while setting up the request
      console.error('Error Message:', error.message)
      Sentry.captureException(error)
    }

    throw error
  }

  return client(options).then(onSuccess).catch(onError)
}

const getApplicationConfig = () => {
  return request<IApplicationConfigResponse>({
    url: resolve(window.config.CONFIG_API_URL, '/loginConfig'),
    method: 'GET'
  })
}

const StyledSpinner = styled(Spinner)`
  position: absolute;
  margin-left: -24px;
  margin-top: -24px;
  top: calc(50% - 20px);
  left: 50%;
  width: 40px;
  height: 40px;
`

const UnProtectedPage = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined
}) => {
  const [configData, setConfigData] = React.useState<IApplicationConfig>()

  React.useEffect(() => {
    const fetchData = async () => {
      const { config } = await getApplicationConfig()
      document.title = config.APPLICATION_NAME
      setConfigData(config)
    }
    fetchData()
  }, [])

  if (!configData) {
    return (
      <>
        <StyledSpinner id="appSpinner" />
      </>
    )
  }

  return <>{props.children}</>
}

export default UnProtectedPage
