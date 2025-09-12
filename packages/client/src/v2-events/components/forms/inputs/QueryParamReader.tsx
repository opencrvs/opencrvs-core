import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  QueryParamReaderField,
  QueryParamReaderFieldValue
} from '@opencrvs/commons/client'

function deleteAllParams(params: URLSearchParams) {
  for (const key of params.keys()) {
    params.delete(key)
  }
  return params
}

function hasAllRequiredParams(
  params: URLSearchParams,
  requiredParams: string[]
) {
  for (const param of requiredParams) {
    if (!params.has(param)) {
      return false
    }
  }
  return true
}

function QueryParamReaderInput({
  configuration,
  onChange
}: {
  configuration: QueryParamReaderField['configuration']
  onChange: (params: QueryParamReaderFieldValue) => void
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { params: requiredParams } = configuration

  useEffect(() => {
    if (searchParams.size === 0) {
      return
    }
    if (hasAllRequiredParams(searchParams, requiredParams)) {
      onChange(Object.fromEntries(searchParams))
    }
    setSearchParams(deleteAllParams(searchParams), { replace: true })
  }, [onChange, requiredParams, searchParams, setSearchParams])
  return null
}

export const QueryParamReader = {
  Input: QueryParamReaderInput,
  Output: null
}
