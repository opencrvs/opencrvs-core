import React from 'react'
import styled from 'styled-components'
import { Spinner } from '@opencrvs/components'
import { connect, useDispatch } from 'react-redux'
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
  offlineData: any
}) => {
  const { offlineData, ...rest } = props
  const dispatch = useDispatch()

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { config } = await referenceApi.loadConfigAnonymousUser()
        document.title = config?.APPLICATION_NAME as string

        // @ts-ignore
        dispatch(configAnonymousUserLoaded({ config }))
      } catch (e) {}
    }
    fetchData()
  }, [dispatch])

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

export const UnprotectedRoute = connect(mapStateToProps)(
  UnprotectedRouteWrapper
)
