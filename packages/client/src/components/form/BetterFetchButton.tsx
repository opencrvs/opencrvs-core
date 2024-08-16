import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import React, { useCallback, useEffect, useState } from 'react'

function mockHTTPRequest() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if ((window as any).FAIL) {
        console.log('ERROR')

        return reject(new Error('Network error'))
      }
      resolve({
        exampleDataFromServer: '2342342342323'
      })
    }, 1000)
  })
}

export function BetterFetchButtonField(props: any) {
  const { label, onChange } = props
  const [state, setState] = useState<{
    loading: boolean
    success: boolean
    error?: Error
    data?: any
    networkError: boolean
  }>({
    loading: false,
    success: false,
    networkError: false
  })

  useEffect(() => {
    console.log('emit', state.data)

    onChange(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const onClick = useCallback(() => {
    setState({ ...state, loading: true, error: undefined, data: undefined })

    mockHTTPRequest()
      .then((data) => {
        console.log('data', data)

        setState({ ...state, data, loading: false, success: true })
      })
      .catch((error) => {
        setState({ ...state, loading: false, error })
      })
  }, [state])

  return (
    <PrimaryButton disabled={props.disabled} onClick={onClick}>
      {label}
    </PrimaryButton>
  )
}
