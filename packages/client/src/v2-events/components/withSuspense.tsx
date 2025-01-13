import React from 'react'
import { Spinner } from '@opencrvs/components'
import { getUUID } from '@opencrvs/commons'

/**
 * HOC to wrap a component in a suspense boundary with a spinner fallback.
 */
export function withSuspense<
  ComponentProps extends React.JSX.IntrinsicAttributes
>(Component: React.ComponentType<ComponentProps>) {
  // eslint-disable-next-line react/display-name
  return (props: ComponentProps) => (
    <React.Suspense fallback={<Spinner id={`page-spinner-${getUUID()}`} />}>
      <Component {...props} />
    </React.Suspense>
  )
}
