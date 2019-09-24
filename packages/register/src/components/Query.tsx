import * as React from 'react'
import { ComponentProps } from '@register/utils/react'
// eslint-disable-next-line no-restricted-imports
import { Query as ApolloQuery } from 'react-apollo'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/browser'

type Props = ComponentProps<ApolloQuery>

export function Query(props: Props) {
  return (
    <ApolloQuery
      onError={(error: Error) => {
        Sentry.captureException(error)
      }}
      {...props}
    />
  )
}
