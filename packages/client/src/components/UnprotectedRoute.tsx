import React from 'react'
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components'
import { connect } from 'react-redux'
import { configAnonymousUserLoaded } from '@client/offline/actions'
import { referenceApi } from '@client/utils/referenceApi'
import { IStoreState } from '@client/store'
import { Route } from 'react-router'

const StyledSpinner = styled(Spinner)`
  position: absolute;
  margin-left: -24px;
  margin-top: -24px;
  top: calc(50% - 20px);
  left: 50%;
  width: 40px;
  height: 40px;
`

const UnprotectedRouteWrapper = (props: {
  [x: string]: any
  configAnonymousUserLoaded: any
}) => {
  const { offlineData, configAnonymousUserLoaded, ...rest } = props

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { config } = await referenceApi.loadConfigAnonymousUser()
        document.title = config?.APPLICATION_NAME as string
        // @ts-ignore
        configAnonymousUserLoaded({ config })
      } catch (e) {}
    }
    fetchData()
  }, [configAnonymousUserLoaded])

  if (!offlineData) {
    return (
      <>
        <StyledSpinner id="appSpinner" />
      </>
    )
  }
  return <Route {...rest} />
}

const mapStateToProps = (store: IStoreState) => {
  return {
    offlineData: store.offline.offlineData.config
  }
}

const mapDispatchToProps = {
  configAnonymousUserLoaded
}

export const UnprotectedRoute = connect(
  mapStateToProps,
  mapDispatchToProps
)(UnprotectedRouteWrapper)
