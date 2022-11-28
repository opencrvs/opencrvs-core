import * as React from 'react'
import { useParams } from 'react-router'
import { client } from '@client/utils/apolloClient'

export function DuplicateComparisonView() {
  const { given, existing } = useParams()
  const loading = React.useState(true)
  const left = React.useState(null)
  const right = React.useState(null)

  React.useEffect(() => {}, [])

  return null
}
