import * as React from 'react'
import { DocumentNode } from 'graphql'
import { getPerformanceData } from '@client/performance/performanceDataSelectors'
import { useSelector, useDispatch } from 'react-redux'
import { IStoreState } from '@client/store'
import { isAvailable } from '@client/performance/performanceDataActions'

interface PersistentQueryDataWrapperProps {
  key?: number
  query: DocumentNode
  operationName: string
  variables: Record<string, any>
  children: (args: ReturnType<typeof getPerformanceData>) => React.ReactNode
}

export function PersistentQueryDataWrapper(
  props: PersistentQueryDataWrapperProps
) {
  const {
    loading = true,
    data,
    error
  } = useSelector<IStoreState, ReturnType<typeof getPerformanceData>>((state) =>
    getPerformanceData(state, {
      operationName: props.operationName,
      variables: props.variables
    })
  )
  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(isAvailable(props.operationName, props.variables, props.query))
  }, [props.query, props.operationName, props.variables, dispatch])
  return (
    <React.Fragment key={props.key}>
      {props.children({ loading, data, error })}
    </React.Fragment>
  )
}
