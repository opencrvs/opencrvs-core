import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components'
import { useDispatch } from 'react-redux'
import { configAnonymousUserLoaded } from '@client/offline/actions'
import { IApplicationConfig, referenceApi } from '@client/utils/referenceApi'

const StyledSpinner = styled(Spinner)`
  position: absolute;
  margin-left: -24px;
  margin-top: -24px;
  top: calc(50% - 20px);
  left: 50%;
  width: 40px;
  height: 40px;
`

const UnprotectedPage = (props: { children: ReactNode }) => {
  const [configData, setConfigData] =
    React.useState<Partial<IApplicationConfig>>()
  const dispatch = useDispatch()

  React.useEffect(() => {
    const fetchData = async () => {
      const { config } = await referenceApi.loadConfigAnonymousUser()
      document.title = config?.APPLICATION_NAME as string
      // @ts-ignore
      dispatch(configAnonymousUserLoaded({ config }))
      setConfigData(config)
    }
    fetchData()
  }, [dispatch])

  if (!configData) {
    return (
      <>
        <StyledSpinner id="appSpinner" />
      </>
    )
  }

  return <>{props.children}</>
}

export default UnprotectedPage
